import { SITE_NAME, SITE_URL } from "./seo";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Buildexom is an AI-powered eCommerce platform that helps small businesses create an online store in minutes.",
  areaServed: "PK",
  sameAs: [
    // Yahan apne asli social profile links daalein, jaise Instagram, LinkedIn, Facebook
  ],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "AI store builder and no-code eCommerce platform to create and launch an online store in minutes.",
  // "offers" tab add karein jab pricing final ho, galat price schema me nahi dalni
};

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}
