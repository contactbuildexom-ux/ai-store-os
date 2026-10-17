import type { Metadata } from "next";
import UserLoginForm from "@/components//auth/UserLoginForm";

export const metadata: Metadata = {
  title: "Login | Buildexom",
  description: "Log in to your Buildexom account to manage your store.",
};

export default function UserLoginPage() {
  return <UserLoginForm />;
}