import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Sign in | Buildexom AI" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ access?: string; setup?: string }> }) {
	const { access, setup } = await searchParams;
	const mockAuthEnabled = process.env.NODE_ENV === "development"
		&& (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
	const notice = access === "denied"
		? "This account does not have Buildexom Super Admin access. Contact your platform owner."
		: mockAuthEnabled
			? "Local testing credentials: admin@buildexom.com / 123456"
			: setup === "required"
				? "Add your Supabase URL and anon key to .env.local to enable authentication."
				: undefined;
	return <LoginForm notice={notice} />;
}