"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { Save, Trash2, Upload } from "lucide-react";
import { DEFAULT_PLATFORM_BRANDING, usePlatformBranding, type PlatformBrandingSettings } from "@/components/platform-branding";

type PlatformSettings = PlatformBrandingSettings;

const defaults: PlatformSettings = DEFAULT_PLATFORM_BRANDING;

function isPlatformSettings(value: unknown): value is PlatformSettings {
  if (typeof value !== "object" || value === null) return false;
  return Object.keys(defaults).every((key) => typeof (value as Record<string, unknown>)[key] === "string");
}

async function readSettingsResponse(response: Response) {
  const result: unknown = await response.json();
  if (typeof result !== "object" || result === null) throw new Error("The settings service returned an invalid response.");
  const payload = result as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Unable to complete the settings request.");
  if (!isPlatformSettings(payload.settings)) throw new Error("The settings service returned invalid settings.");
  return payload.settings;
}

export function SettingsForm() {
  const [settings, setSettings] = useState(defaults);
  const [saved, setSaved] = useState(false);
  const [logoName, setLogoName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateSettings } = usePlatformBranding();

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/settings", { cache: "no-store" })
      .then(readSettingsResponse)
      .then((next) => {
        if (active) {
          setSettings(next);
          setLogoName(next.logoName);
          updateSettings(next);
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load platform settings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [updateSettings]);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const next = { ...settings, logoName: logoName || settings.logoName };
    try {
      let body: BodyInit;
      let headers: HeadersInit | undefined;
      if (logoFile) {
        const formData = new FormData();
        for (const [key, value] of Object.entries(next)) formData.append(key, value);
        formData.append("logoFile", logoFile);
        body = formData;
      } else {
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify(next);
      }
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers,
        body,
      });
      const savedSettings = await readSettingsResponse(response);
      setSettings(savedSettings);
      setLogoName(savedSettings.logoName);
      setLogoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      updateSettings(savedSettings);
      setSaved(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save platform settings.");
    } finally {
      setSaving(false);
    }
  }

  async function removeLogo() {
    const previousSettings = settings;
    const previousLogoFile = logoFile;
    setError(null);
    setSaved(false);
    setSaving(true);
    setSettings((current) => ({ ...current, logoName: "", logoUrl: "" }));
    setLogoName("");
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    updateSettings({ ...previousSettings, logoName: "", logoUrl: "" });

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...previousSettings, logoName: "", logoUrl: "" }),
      });
      const savedSettings = await readSettingsResponse(response);
      setSettings(savedSettings);
      setLogoName("");
      updateSettings(savedSettings);
      setSaved(true);
    } catch (reason) {
      setSettings(previousSettings);
      setLogoName(previousLogoFile?.name ?? previousSettings.logoName);
      setLogoFile(previousLogoFile);
      updateSettings(previousSettings);
      setError(reason instanceof Error ? reason.message : "Unable to remove the platform logo.");
    } finally {
      setSaving(false);
    }
  }

  const field = (name: keyof PlatformSettings, label: string, type = "text") => (
    <label className="block text-xs font-medium text-slate-700">{label}
      <input
        name={name}
        type={type}
        value={settings[name]}
        onChange={(event) => {
          setSettings((current) => ({ ...current, [name]: event.target.value }));
          setSaved(false);
        }}
        maxLength={name === "description" ? 300 : 254}
        className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );

  return (
    <form onSubmit={saveSettings} className="space-y-5">
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {loading && <p role="status" className="text-xs text-slate-500">Loading saved settings…</p>}
      <fieldset disabled={loading || saving} className="space-y-5 disabled:opacity-70">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-sm font-semibold text-slate-800">Platform details</h3>
          <p className="mt-1 text-xs text-slate-500">Configure the name and public-facing contact details.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {field("title", "Site title")}
            {field("email", "Contact email", "email")}
            <div className="sm:col-span-2">{field("description", "Site description")}</div>
            {field("phone", "Contact phone", "tel")}
            {field("whatsapp", "WhatsApp number", "tel")}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-sm font-semibold text-slate-800">Branding and social links</h3>
          <p className="mt-1 text-xs text-slate-500">Choose a logo file and update platform profiles.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700">Logo file
                <span className="mt-1.5 flex min-h-10 items-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-2 text-slate-500">
                  <Upload size={15} />
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0] ?? null; setLogoFile(file); setLogoName(file?.name ?? settings.logoName); setSaved(false); }} className="min-w-0 flex-1 text-xs file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-blue-700" />
                  {logoName || settings.logoName || "Logo upload placeholder"}
                </span>
              </label>
              {(logoPreviewUrl || settings.logoUrl) && (
                <div className="mt-3 flex items-center gap-3">
                  <Image
                    unoptimized
                    src={logoPreviewUrl || settings.logoUrl}
                    alt="Platform logo preview"
                    width={96}
                    height={56}
                    className="h-14 w-24 rounded-md border border-slate-200 bg-white object-contain p-1"
                  />
                  <div className="flex flex-col items-start gap-1">
                    {settings.logoUrl && <a href={settings.logoUrl} target="_blank" rel="noreferrer" className="text-[11px] text-blue-700 hover:underline">View current logo</a>}
                    <button type="button" onClick={() => void removeLogo()} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50">
                      <Trash2 size={13} /> Remove logo
                    </button>
                  </div>
                </div>
              )}
            </div>
            {field("website", "Website URL", "url")}
            {field("instagram", "Instagram URL", "url")}
            <div className="sm:col-span-2">{field("facebook", "Facebook URL", "url")}</div>
          </div>
        </section>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {saved && <p role="status" className="text-xs font-medium text-emerald-700">Settings saved successfully.</p>}
          <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">
            <Save size={15} /> {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
