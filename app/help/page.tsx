import type { Metadata } from "next";
import { PageShell } from "@/components/landing/PageShell";
import HelpCenter from "@/components/pages/HelpCenter";

export const metadata: Metadata = {
  title: "Help Center | Buildexom",
  description: "Guides to build and manage your Buildexom store.",
};

export default function HelpPage() {
  return (
    <PageShell>
      <HelpCenter />
    </PageShell>
  );
}