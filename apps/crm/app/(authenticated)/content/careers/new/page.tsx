import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { redirect } from "next/navigation";
import { Header } from "../../../components/header";
import { JobPostingForm } from "../components/job-posting-form";

const NewJobPostingPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:write")) {
    redirect("/content/careers");
  }

  return (
    <>
      <Header page="New posting" pages={["Content", "Careers"]} />
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="font-display font-semibold text-2xl">
            New job posting
          </h1>
        </div>
        <div className="max-w-3xl">
          <JobPostingForm mode="create" />
        </div>
      </div>
    </>
  );
};

export default NewJobPostingPage;
