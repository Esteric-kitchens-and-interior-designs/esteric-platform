import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { notFound, redirect } from "next/navigation";
import { CertificationForm } from "../components/certification-form";

interface EditCertificationPageProps {
  params: Promise<{ id: string }>;
}

const EditCertificationPage = async ({
  params,
}: EditCertificationPageProps) => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const { id } = await params;

  const record = await database.certificationAward.findUnique({
    where: { id },
  });

  if (!record) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">{record.title}</h1>
      </div>
      <div className="max-w-2xl">
        <CertificationForm
          certificationId={record.id}
          initialValue={{
            title: record.title,
            issuer: record.issuer,
            type: record.type,
            dateAwarded: record.dateAwarded
              ? record.dateAwarded.toISOString().slice(0, 10)
              : null,
            imageUrl: record.imageUrl,
            description: record.description,
            isPublished: record.isPublished,
          }}
          mode="edit"
        />
      </div>
    </div>
  );
};

export default EditCertificationPage;
