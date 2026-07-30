import { analytics } from "@repo/analytics/server";
import type {
  DeletedObjectJSON,
  UserJSON,
  WebhookEvent,
} from "@repo/auth/server";
import { database } from "@repo/database";
import { log } from "@repo/observability/log";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { env } from "@/env";

const DEFAULT_ROLE_NAME = "Staff";

const getDefaultRoleId = async () => {
  const role = await database.role.findFirst({
    where: { name: DEFAULT_ROLE_NAME },
  });
  if (role) {
    return role.id;
  }
  const created = await database.role.create({
    data: {
      name: DEFAULT_ROLE_NAME,
      description:
        "Default role for new staff accounts — grant permissions from the CRM's user management screen.",
      permissions: [],
    },
  });
  return created.id;
};

const handleUserCreated = async (data: UserJSON) => {
  const email = data.email_addresses.at(0)?.email_address;
  if (!email) {
    return new Response("User has no email", { status: 400 });
  }

  const roleId = await getDefaultRoleId();

  await database.user.upsert({
    where: { clerkId: data.id },
    update: {},
    create: {
      clerkId: data.id,
      email,
      firstName: data.first_name ?? "",
      lastName: data.last_name ?? "",
      avatarUrl: data.image_url,
      phone: data.phone_numbers.at(0)?.phone_number,
      roleId,
    },
  });

  analytics?.identify({
    distinctId: data.id,
    properties: {
      email,
      firstName: data.first_name,
      lastName: data.last_name,
      createdAt: new Date(data.created_at),
      avatar: data.image_url,
    },
  });
  analytics?.capture({ event: "User Created", distinctId: data.id });

  return new Response("User created", { status: 201 });
};

const handleUserUpdated = async (data: UserJSON) => {
  const email = data.email_addresses.at(0)?.email_address;

  await database.user.updateMany({
    where: { clerkId: data.id },
    data: {
      ...(email ? { email } : {}),
      firstName: data.first_name ?? "",
      lastName: data.last_name ?? "",
      avatarUrl: data.image_url,
      phone: data.phone_numbers.at(0)?.phone_number,
    },
  });

  analytics?.identify({
    distinctId: data.id,
    properties: {
      email,
      firstName: data.first_name,
      lastName: data.last_name,
      avatar: data.image_url,
    },
  });
  analytics?.capture({ event: "User Updated", distinctId: data.id });

  return new Response("User updated", { status: 201 });
};

const handleUserDeleted = async (data: DeletedObjectJSON) => {
  if (data.id) {
    // Soft-delete: staff accounts are referenced by leads, quotations, projects,
    // and the activity log, so we deactivate rather than remove the row.
    await database.user.updateMany({
      where: { clerkId: data.id },
      data: { status: "INACTIVE" },
    });

    analytics?.identify({
      distinctId: data.id,
      properties: { deleted: new Date() },
    });
    analytics?.capture({ event: "User Deleted", distinctId: data.id });
  }

  return new Response("User deleted", { status: 201 });
};

export const POST = async (request: Request): Promise<Response> => {
  if (!env.CLERK_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Not configured", ok: false });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!(svixId && svixTimestamp && svixSignature)) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = (await request.json()) as object;
  const body = JSON.stringify(payload);

  const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let event: WebhookEvent | undefined;

  try {
    event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    log.error("Error verifying webhook:", { error });
    return new Response("Error occured", {
      status: 400,
    });
  }

  const { id } = event.data;
  const eventType = event.type;

  log.info("Webhook", { id, eventType, body });

  let response: Response = new Response("", { status: 201 });

  switch (eventType) {
    case "user.created": {
      response = await handleUserCreated(event.data);
      break;
    }
    case "user.updated": {
      response = await handleUserUpdated(event.data);
      break;
    }
    case "user.deleted": {
      response = await handleUserDeleted(event.data);
      break;
    }
    default: {
      break;
    }
  }

  await analytics?.shutdown();

  return response;
};
