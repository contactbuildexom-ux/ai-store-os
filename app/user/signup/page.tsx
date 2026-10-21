import type { Metadata } from "next";
import UserSignupForm from "@/components/auth/UserSignupForm";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your free Buildexom account and let AI build your online store.",
};

export default async function UserSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const safePlan = plan === "pro" || plan === "business" ? plan : "basic";
  return <UserSignupForm plan={safePlan} />;
}