import type { Metadata } from "next";
import { PageShell } from "@/components/landing/PageShell";
import AiGuide from "@/components/pages/AiGuide";

export const metadata: Metadata = {
  title: "AI Tools Guide | Buildexom",
  description:
    "Learn how to use the Buildexom AI store builder and AI chatbot to get better results.",
};

export default function AiGuidePage() {
  return (
    <PageShell>
      <AiGuide />
    </PageShell>
  );
}