const { execSync } = require("node:child_process");

const branch = process.env.VERCEL_GIT_COMMIT_REF || "";

if (branch.startsWith("dependabot/")) {
  console.log(`Skipping build for Dependabot branch "${branch}" — its lockfile isn't updated, so this would fail pnpm install anyway. Review/merge the PR (updating the lockfile) to get a real build.`);
  process.exit(0); // this causes Vercel to skip the build
}

const commitMessage = execSync("git log -1 --pretty=%B").toString().trim();

if (commitMessage.includes("[skip ci]")) {
  console.log("Skipping build due to [skip ci] in commit message.");
  process.exit(0); // this causes Vercel to skip the build
}

process.exit(1); // continue with build
