"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_PLATFORM_SETTINGS } from "@/lib/platform-settings-defaults";

export type PlatformBrandingSettings = {
  title: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  instagram: string;
  facebook: string;
  logoName: string;
  logoUrl: string;
  faviconName: string;
  faviconUrl: string;
  seoTitle: string;
  seoDescription: string;
  defaultSocialImage: string;
  keywords: string;
};

type PlatformBrandingContextValue = {
  settings: PlatformBrandingSettings;
  updateSettings: (settings: PlatformBrandingSettings) => void;
};

export const DEFAULT_PLATFORM_BRANDING: PlatformBrandingSettings = DEFAULT_PLATFORM_SETTINGS;

const PlatformBrandingContext = createContext<PlatformBrandingContextValue | null>(null);
const DEFAULT_FAVICON = "/logo.jpeg";

export function PlatformBrandingProvider({
  children,
  initialSettings = DEFAULT_PLATFORM_BRANDING,
}: {
  children: ReactNode;
  initialSettings?: PlatformBrandingSettings;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const updateSettings = useCallback((next: PlatformBrandingSettings) => {
    setSettings(next);
  }, []);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    const source = settings.faviconUrl || settings.logoUrl || DEFAULT_FAVICON;
    const favicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]') ?? document.createElement("link");
    favicon.rel = "icon";
    favicon.href = source;
    if (settings.faviconUrl) {
      favicon.removeAttribute("sizes");
      const extension = settings.faviconName.split(".").pop()?.toLowerCase();
      favicon.type = extension === "svg" ? "image/svg+xml" : extension === "ico" ? "image/x-icon" : "image/png";
    } else {
      favicon.removeAttribute("type");
      favicon.sizes = "32x32";
    }
    if (!favicon.isConnected) document.head.append(favicon);

    if (settings.faviconUrl) return;

    let active = true;
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (!active) return;
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const context = canvas.getContext("2d");
      if (!context || !image.naturalWidth || !image.naturalHeight) return;
      const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      try {
        favicon.href = canvas.toDataURL("image/png");
        favicon.type = "image/png";
      } catch {
        favicon.href = source;
      }
    };
    image.src = source;

    return () => {
      active = false;
      image.onload = null;
    };
  }, [settings.faviconUrl, settings.logoUrl]);

  const value = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings]);

  return <PlatformBrandingContext.Provider value={value}>{children}</PlatformBrandingContext.Provider>;
}

export function PlatformLogo({ fallback, className }: { fallback: ReactNode; className: string }) {
  const branding = useContext(PlatformBrandingContext);
  if (!branding) throw new Error("PlatformLogo must be rendered inside PlatformBrandingProvider.");

  return branding.settings.logoUrl ? (
    <Image
      unoptimized
      src={branding.settings.logoUrl}
      alt={`${branding.settings.title} logo`}
      width={200}
      height={48}
      className={className}
    />
  ) : (
    <>{fallback}</>
  );
}

export function usePlatformBranding() {
  const branding = useContext(PlatformBrandingContext);
  if (!branding) throw new Error("usePlatformBranding must be used inside PlatformBrandingProvider.");
  return branding;
}
