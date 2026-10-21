import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DATABASE_BACKUP_FORMAT,
  DATABASE_BACKUP_TABLES,
  DATABASE_BACKUP_VERSION,
  MAX_DATABASE_BACKUP_SIZE,
  MAX_ROWS_PER_BACKUP_TABLE,
  type DatabaseBackupTable,
  type DatabaseBackupTables,
} from "@/lib/database-backup";

async function exportTable(supabase: SupabaseClient, table: DatabaseBackupTable): Promise<unknown[]> {
  const records: unknown[] = [];
  const batchSize = 1000;
  while (records.length < MAX_ROWS_PER_BACKUP_TABLE) {
    const end = Math.min(records.length + batchSize, MAX_ROWS_PER_BACKUP_TABLE) - 1;
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("id", { ascending: true })
      .range(records.length, end);
    if (error) throw new Error(`Unable to export "${table}": ${error.message}`);

    const batch = data ?? [];
    records.push(...batch);
    if (batch.length < batchSize) return records;
  }

  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw new Error(`Unable to verify the size of "${table}": ${error.message}`);
  if ((count ?? 0) > MAX_ROWS_PER_BACKUP_TABLE) {
    throw new Error(`The "${table}" table exceeds the ${MAX_ROWS_PER_BACKUP_TABLE.toLocaleString()} row export limit.`);
  }
  return records;
}

export async function createDatabaseBackup(supabase: SupabaseClient) {
  const tableRecords = await Promise.all(
    DATABASE_BACKUP_TABLES.map(async (table) => [table, await exportTable(supabase, table)] as const),
  );
  const tables = Object.fromEntries(tableRecords) as DatabaseBackupTables;
  const backup = {
    format: DATABASE_BACKUP_FORMAT,
    version: DATABASE_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: { name: "Buildexom", version: "1.0.0" },
    tables,
  };
  const json = JSON.stringify(backup, null, 2);
  if (Buffer.byteLength(json, "utf8") > MAX_DATABASE_BACKUP_SIZE) {
    throw new Error("Backup exceeds the 50 MB download limit. Reduce the database size before exporting.");
  }
  return json;
}
