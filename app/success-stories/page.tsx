import type { Metadata } from "next";
import { PageShell } from "@/components/landing/PageShell";
import SuccessStories from "@/components/pages/SuccessStories";

export const metadata: Metadata = {
  title: "Success Stories | Buildexom",
  description:
    "Real stories from business owners who built their online store with Buildexom.",
};

export default function SuccessStoriesPage() {
  return (
    <PageShell>
      <SuccessStories />
    </PageShell>
  );
}