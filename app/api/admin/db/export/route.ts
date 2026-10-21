import { NextResponse } from "next/server";
import { getAdminRequestActor, isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createDatabaseBackup } from "@/lib/database-backup-export";
import { recordBackup } from "@/lib/backup-history";

export const maxDuration = 60;

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
    const [json, actorEmail] = await Promise.all([createDatabaseBackup(supabase), getAdminRequestActor()]);
    const date = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `buildexom-backup-${date}.json`;
    await recordBackup(supabase, {
      backup_type: "database",
      actor_email: actorEmail,
      file_name: fileName,
      file_size_bytes: Buffer.byteLength(json, "utf8"),
    });
    return new Response(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to export database backup.";
    const status = message.startsWith("Backup exceeds") ? 413 : 500;
    return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
