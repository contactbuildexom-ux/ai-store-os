import type { Metadata } from "next";
import { PlatformBrandingProvider } from "@/components/platform-branding";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buildexom AI | Admin",
  description: "Buildexom platform administration dashboard.",
  icons: { icon: "/logo.jpeg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <PlatformBrandingProvider>{children}</PlatformBrandingProvider>
      </body>
    </html>
  );
}