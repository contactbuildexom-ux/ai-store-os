import type { Metadata } from "next";
import { Suspense } from "react";
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
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#e6f4ff] flex items-center justify-center font-bold text-slate-600">Loading Buildexom signup...</div>}>
      <UserSignupForm plan={safePlan} />
    </Suspense>
  );
}
