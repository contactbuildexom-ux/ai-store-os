import type { Metadata } from "next";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.buildexom.com"
).replace(/\/$/, "");

export const SITE_NAME = "Buildexom";

export const DEFAULT_OG_IMAGE = "/og-image.png"; // 1200x630 image public/ folder me rakhein

type PageSeo = {
  title: string; // 50-60 characters
  description: string; // 140-160 characters
  path: string;
};

// Har important page ka unique title + description
export const PAGE_SEO: Record<string, PageSeo> = {
  home: {
    title: "AI-Powered Online Store Builder | Buildexom",
    description:
      "Buildexom is an AI-powered online store builder for small businesses. Create an online store with AI in minutes, with no code needed, at an affordable price.",
    path: "/",
  },
  features: {
    title: "AI Ecommerce Website Builder Features | Buildexom",
    description:
      "Explore Buildexom features: AI store generation, ready templates, a no-code eCommerce platform and an instant online store builder made for small businesses.",
    path: "/features",
  },
  pricing: {
    title: "Affordable Online Store Builder Pricing | Buildexom",
    description:
      "Simple, affordable pricing to build an online store in minutes. Compare Buildexom plans and pick the right AI store builder for your business.",
    path: "/pricing",
  },
  aiGuide: {
    title: "AI Store Builder Guide: Launch Your Store | Buildexom",
    description:
      "Learn how the Buildexom AI store builder works, from writing your first prompt to launching your online store, step by step and without coding.",
    path: "/ai-guide",
  },
  successStories: {
    title: "Success Stories from Online Store Owners | Buildexom",
    description:
      "See how small businesses use Buildexom, an AI-powered eCommerce platform, to launch and grow their online stores quickly.",
    path: "/success-stories",
  },
  faqs: {
    title: "FAQs: AI Online Store Builder | Buildexom",
    description:
      "Answers to common questions about Buildexom: how to create an online store with AI, pricing, templates, domains and the no-code eCommerce platform.",
    path: "/faqs",
  },
};

export const ROUTES_FOR_SITEMAP: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/features", priority: 0.8 },
  { path: "/pricing", priority: 0.8 },
  { path: "/ai-guide", priority: 0.7 },
  { path: "/success-stories", priority: 0.6 },
  { path: "/faqs", priority: 0.7 },
];

export function buildMetadata(page: PageSeo): Metadata {
  const url = `${SITE_URL}${page.path}`;
  return {
    // absolute: layout ka "%s | ..." template won't apply again
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: page.title,
      description: page.description,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Buildexom AI store builder" }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}