"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

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
};

type PlatformBrandingContextValue = {
  settings: PlatformBrandingSettings;
  updateSettings: (settings: PlatformBrandingSettings) => void;
};

export const DEFAULT_PLATFORM_BRANDING: PlatformBrandingSettings = {
  title: "Buildexom AI",
  description: "Commerce, in clear view.",
  email: "",
  phone: "",
  whatsapp: "",
  website: "",
  instagram: "",
  facebook: "",
  logoName: "",
  logoUrl: "",
};

function isPlatformBrandingSettings(value: unknown): value is PlatformBrandingSettings {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.keys(DEFAULT_PLATFORM_BRANDING).every(
      (key) => typeof (value as Record<string, unknown>)[key] === "string",
    )
  );
}

const PlatformBrandingContext = createContext<PlatformBrandingContextValue | null>(null);
const DEFAULT_FAVICON = "/logo.jpeg";

export function PlatformBrandingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState(DEFAULT_PLATFORM_BRANDING);
  const updateVersion = useRef(0);
  const previousDocumentBrand = useRef(DEFAULT_PLATFORM_BRANDING.title);
  const updateSettings = useCallback((next: PlatformBrandingSettings) => {
    updateVersion.current += 1;
    setSettings(next);
  }, []);

  useEffect(() => {
    const currentTitle = document.title;
    let nextTitle = currentTitle.replaceAll(DEFAULT_PLATFORM_BRANDING.title, settings.title);
    if (nextTitle === currentTitle && previousDocumentBrand.current !== settings.title) {
      nextTitle = currentTitle.replaceAll(previousDocumentBrand.current, settings.title);
    }
    if (nextTitle === currentTitle && !currentTitle.includes(settings.title)) {
      nextTitle = `${currentTitle} | ${settings.title}`;
    }
    document.title = nextTitle;
    previousDocumentBrand.current = settings.title;
  }, [pathname, settings.title]);

  useEffect(() => {
    let active = true;

    fetch("/api/branding", { cache: "no-store" })
      .then(async (response) => {
        const result: unknown = await response.json();
        if (!response.ok) {
          const message =
            typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
              ? result.error
              : "Unable to load platform branding.";
          throw new Error(message);
        }
        if (typeof result !== "object" || result === null || !("settings" in result)) {
          throw new Error("The branding service returned an invalid response.");
        }
        if (!isPlatformBrandingSettings(result.settings)) {
          throw new Error("The branding service returned invalid settings.");
        }
        return result.settings;
      })
      .then((loadedSettings) => {
        if (active && updateVersion.current === 0) setSettings(loadedSettings);
      })
      .catch((error: unknown) => {
        if (active) console.error(error instanceof Error ? error.message : "Unable to load platform branding.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const source = settings.logoUrl || DEFAULT_FAVICON;
    const favicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]') ?? document.createElement("link");
    favicon.rel = "icon";
    favicon.href = source;
    favicon.sizes = "32x32";
    if (!favicon.isConnected) document.head.append(favicon);

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
  }, [pathname, settings.logoUrl]);

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
