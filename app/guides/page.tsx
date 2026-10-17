import type { Metadata } from "next";
import { PageShell } from "@/components/landing/PageShell";
import GuidesList from "@/components/pages/GuidesList";

export const metadata: Metadata = {
  title: "E-commerce Guides",
  description:
    "Products, orders, WhatsApp selling, marketing and growth: practical guides for your online store.",
};

export default function GuidesPage() {
  return (
    <PageShell>
      <GuidesList />
    </PageShell>
  );
}