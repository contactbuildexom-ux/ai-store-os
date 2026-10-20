import type { Metadata } from "next";
import { PlatformBrandingProvider } from "@/components/platform-branding";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd, softwareJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { getPlatformSettings } from "@/lib/platform-settings";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPlatformSettings();
  const title = settings.seoTitle || settings.title;
  const description = settings.seoDescription || settings.description;
  const keywords = settings.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean);
  const images = [settings.defaultSocialImage || DEFAULT_OG_IMAGE];
  const googleVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

  return {
    // Relative canonical/OG URLs ko absolute banane ke liye zaroori
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${SITE_NAME}` },
    description,
    applicationName: SITE_NAME,
    ...(keywords.length > 0 ? { keywords } : {}),
    // "./" har page ka apna canonical URL ban jata hai (duplicate URLs se bachata hai)
    alternates: { canonical: "./" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
    icons: { icon: settings.logoUrl || "/icon.png" },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getPlatformSettings();
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <JsonLd data={[organizationJsonLd, websiteJsonLd, softwareJsonLd]} />
        <PlatformBrandingProvider initialSettings={settings}>{children}</PlatformBrandingProvider>
      </body>
    </html>
  );
}