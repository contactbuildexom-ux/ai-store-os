import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-api-auth";
import {
  DATABASE_BACKUP_FORMAT,
  DATABASE_BACKUP_TABLES,
  DATABASE_BACKUP_VERSION,
  MAX_DATABASE_BACKUP_SIZE,
  MAX_ROWS_PER_BACKUP_TABLE,
  type DatabaseBackupTable,
  type DatabaseBackupTables,
} from "@/lib/database-backup";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export const maxDuration = 60;

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

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
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
    if (new TextEncoder().encode(json).byteLength > MAX_DATABASE_BACKUP_SIZE) {
      return NextResponse.json({ error: "Backup exceeds the 50 MB download limit. Reduce the database size before exporting." }, { status: 413 });
    }

    const date = new Date().toISOString().replace(/[:.]/g, "-");
    return new Response(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="buildexom-backup-${date}.json"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to export database backup.";
    return NextResponse.json({ error: message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
