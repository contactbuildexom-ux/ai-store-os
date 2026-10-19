import type { Metadata } from "next";
import { Suspense } from "react";
import UserLoginForm from "@/components/auth/UserLoginForm";

export const metadata: Metadata = {
  title: "Login | Buildexom",
  description: "Log in to your Buildexom account to manage your store.",
};

export default function UserLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#e6f4ff] flex items-center justify-center font-bold text-slate-600">Loading Buildexom login...</div>}>
      <UserLoginForm />
    </Suspense>
  );
}