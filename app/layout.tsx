import type { Metadata } from "next";
import { PlatformBrandingProvider } from "@/components/platform-branding";
import { getPlatformSettings } from "@/lib/platform-settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPlatformSettings();
  const title = settings.seoTitle || settings.title;
  const description = settings.seoDescription || settings.description;
  const keywords = settings.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean);
  const images = settings.defaultSocialImage ? [settings.defaultSocialImage] : undefined;

  return {
    title: { default: title, template: `%s | ${title}` },
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    openGraph: { title, description, type: "website", images },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, images },
    icons: { icon: settings.logoUrl || "/icon.png" },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getPlatformSettings();
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <PlatformBrandingProvider initialSettings={settings}>{children}</PlatformBrandingProvider>
      </body>
    </html>
  );
}