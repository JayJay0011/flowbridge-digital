import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In or Create an Account",
  description:
    "Sign in to your Flowbridge Digital client account or create an account to order and track services.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
