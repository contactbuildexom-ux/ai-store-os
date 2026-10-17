import type { Metadata } from "next";
import { PageShell } from "@/components/landing/PageShell";
import TutorialsList from "@/components/pages/TutorialsList";

export const metadata: Metadata = {
  title: "Tutorials",
  description:
    "Short how-to guides and videos to build and grow your Buildexom store.",
};

export default function TutorialsPage() {
  return (
    <PageShell>
      <TutorialsList />
    </PageShell>
  );
}