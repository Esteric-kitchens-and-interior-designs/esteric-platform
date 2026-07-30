import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { redirect } from "next/navigation";
import { BlogForm } from "../components/blog-form";

const NewBlogPostPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:write")) {
    redirect("/content/blog");
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">New blog post</h1>
      </div>
      <div className="max-w-3xl">
        <BlogForm mode="create" />
      </div>
    </div>
  );
};

export default NewBlogPostPage;
