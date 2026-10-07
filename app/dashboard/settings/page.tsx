import type { Metadata } from "next";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings | Buildexom AI" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-blue-700">Workspace administration</p>
        <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-slate-900">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Manage platform identity, contact information, and social profiles.</p>
      </div>
      <SettingsForm />
      <p className="text-xs text-slate-500">These preferences are saved in this browser. Logo selection is currently a placeholder and does not upload a file to storage.</p>
    </div>
  );
}
