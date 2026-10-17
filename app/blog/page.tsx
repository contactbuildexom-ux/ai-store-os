import type { Metadata } from "next";
import { PageShell } from "@/components/landing/PageShell";
import BlogList from "@/components/pages/BlogList";

export const metadata: Metadata = {
  title: "Blog",
  description: "E-commerce, online selling, and business tips from Buildexom.",
};

export default function BlogPage() {
  return (
    <PageShell>
      <BlogList />
    </PageShell>
  );
}