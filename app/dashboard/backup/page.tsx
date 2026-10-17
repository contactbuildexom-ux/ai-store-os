import type { Metadata } from "next";
import { DatabaseBackupManager } from "@/components/database-backup-manager";

export const metadata: Metadata = { title: "Database Backup" };

export default function DatabaseBackupPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-blue-700">Workspace administration</p>
        <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-slate-900">Database backup</h2>
        <p className="mt-1 text-sm text-slate-500">Export, protect, and restore your platform data.</p>
      </div>
      <DatabaseBackupManager />
    </div>
  );
}
