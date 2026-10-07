"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Save, Upload } from "lucide-react";

type PlatformSettings = {
  title: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  instagram: string;
  facebook: string;
  logoName: string;
};

const storageKey = "buildexom-platform-settings";
const defaults: PlatformSettings = {
  title: "Buildexom AI",
  description: "Commerce, in clear view.",
  email: "",
  phone: "",
  whatsapp: "",
  website: "",
  instagram: "",
  facebook: "",
  logoName: "",
};

export function SettingsForm() {
  const [settings, setSettings] = useState(defaults);
  const [saved, setSaved] = useState(false);
  const [logoName, setLogoName] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        setSettings({ ...defaults, ...JSON.parse(stored) as Partial<PlatformSettings> });
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
  }, []);

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const next: PlatformSettings = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
      website: String(formData.get("website") ?? ""),
      instagram: String(formData.get("instagram") ?? ""),
      facebook: String(formData.get("facebook") ?? ""),
      logoName: logoName || settings.logoName,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setSettings(next);
    setSaved(true);
  }

  const field = (name: keyof PlatformSettings, label: string, type = "text") => (
    <label className="block text-xs font-medium text-slate-700">{label}
      <input name={name} type={type} defaultValue={settings[name]} key={`${name}-${settings[name]}`} onChange={() => setSaved(false)} maxLength={name === "description" ? 300 : 254} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
    </label>
  );

  return (
    <form onSubmit={saveSettings} className="space-y-5">
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
          <label className="block text-xs font-medium text-slate-700 sm:col-span-2">Logo file
            <span className="mt-1.5 flex min-h-10 items-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-2 text-slate-500">
              <Upload size={15} />
              <input type="file" accept="image/*" onChange={(event) => { setLogoName(event.target.files?.[0]?.name ?? ""); setSaved(false); }} className="min-w-0 flex-1 text-xs file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-blue-700" />
              {logoName || settings.logoName || "Logo upload placeholder"}
            </span>
          </label>
          {field("website", "Website URL", "url")}
          {field("instagram", "Instagram URL", "url")}
          <div className="sm:col-span-2">{field("facebook", "Facebook URL", "url")}</div>
        </div>
      </section>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {saved && <p role="status" className="text-xs font-medium text-emerald-700">Settings saved in this browser.</p>}
        <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700">
          <Save size={15} /> Save settings
        </button>
      </div>
    </form>
  );
}
