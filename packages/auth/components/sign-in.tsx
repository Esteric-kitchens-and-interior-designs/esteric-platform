import { SignIn as ClerkSignIn } from "@clerk/nextjs";

export const SignIn = () => (
  <ClerkSignIn
    appearance={{
      elements: {
        header: { display: "none" },
        headerTitle: { display: "none" },
        headerSubtitle: { display: "none" },
        footerAction: { display: "none" },
      },
    }}
  />
);
