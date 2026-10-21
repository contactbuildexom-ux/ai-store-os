import type { Metadata } from "next";
import { DatabaseBackupManager } from "@/components/database-backup-manager";

export const metadata: Metadata = { title: "Backups & Restore" };

export default function DatabaseBackupPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-blue-700">Workspace administration</p>
        <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-slate-900">Backups &amp; restore</h2>
        <p className="mt-1 text-sm text-slate-500">Create database and full-site backups, then restore platform data when needed.</p>
      </div>
      <DatabaseBackupManager />
    </div>
  );
}
