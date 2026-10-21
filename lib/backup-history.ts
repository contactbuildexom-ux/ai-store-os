import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

export type BackupHistoryRecord = {
  id: string;
  backup_type: "database" | "full_site";
  actor_email: string;
  created_at: string;
  file_name: string;
  file_size_bytes: number;
};

export async function recordBackup(
  supabase: AdminClient,
  entry: Omit<BackupHistoryRecord, "id" | "created_at">,
) {
  const { error } = await supabase.from("platform_backup_history").insert(entry);
  if (error) {
    throw new Error(`Backup was prepared but its audit record could not be saved. Apply the backup-history migration and try again: ${error.message}`);
  }
}

export async function getBackupHistory(supabase: AdminClient): Promise<BackupHistoryRecord[]> {
  const { data, error } = await supabase
    .from("platform_backup_history")
    .select("id, backup_type, actor_email, created_at, file_name, file_size_bytes")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw new Error(`Unable to load backup history. Apply the backup-history migration if it has not been run: ${error.message}`);
  return (data ?? []) as BackupHistoryRecord[];
}
