import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { redirect } from "next/navigation";
import { CertificationForm } from "../components/certification-form";

const NewCertificationPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:write")) {
    redirect("/content/certifications");
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">
          New certification / award
        </h1>
      </div>
      <div className="max-w-2xl">
        <CertificationForm mode="create" />
      </div>
    </div>
  );
};

export default NewCertificationPage;
