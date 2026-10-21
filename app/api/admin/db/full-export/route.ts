import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminRequestActor, isAdminRequest } from "@/lib/admin-api-auth";
import { recordBackup } from "@/lib/backup-history";
import { createDatabaseBackup } from "@/lib/database-backup-export";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_ARCHIVE_CONTENT_SIZE = 100 * 1024 * 1024;
const MAX_ARCHIVE_FILES = 20_000;
const SOURCE_ROOTS = ["app", "components", "lib", "public", "supabase/migrations"] as const;
const SOURCE_FILES = [
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "postcss.config.js",
  "tsconfig.json",
  "eslint.config.mjs",
  "next-env.d.ts",
  "proxy.ts",
  "vercel.json",
] as const;
const OMITTED_DIRECTORY_NAMES = new Set([".git", ".next", ".turbo", "build", "coverage", "dist", "node_modules"]);
const SENSITIVE_FILE_NAME = /(^|\/)\.env(?:$|\.)|(?:^|\/)[^/]*(?:secret|credential)[^/]*$|\.(?:key|pem|p12|pfx)$/i;

type ArchiveEntry = { name: string; content: Buffer };

function addTarEntry(entry: ArchiveEntry) {
  const header = Buffer.alloc(512);
  const parts = entry.name.split("/");
  let name = entry.name;
  let prefix = "";
  if (Buffer.byteLength(name) > 100) {
    const splitAt = entry.name.lastIndexOf("/");
    if (splitAt < 1) throw new Error(`A backup file path is too long to archive: ${entry.name}`);
    prefix = entry.name.slice(0, splitAt);
    name = entry.name.slice(splitAt + 1);
  }
  if (Buffer.byteLength(name) > 100 || Buffer.byteLength(prefix) > 155 || parts.some((part) => part === "..")) {
    throw new Error(`A backup file path cannot be safely archived: ${entry.name}`);
  }

  header.write(name, 0, 100, "utf8");
  header.write("0000644\0", 100, 8, "ascii");
  header.write("0000000\0", 108, 8, "ascii");
  header.write("0000000\0", 116, 8, "ascii");
  header.write(`${entry.content.length.toString(8).padStart(11, "0")}\0`, 124, 12, "ascii");
  header.write(`${Math.floor(Date.now() / 1000).toString(8).padStart(11, "0")}\0`, 136, 12, "ascii");
  header.fill(0x20, 148, 156);
  header[156] = "0".charCodeAt(0);
  header.write("ustar\0", 257, 6, "ascii");
  header.write("00", 263, 2, "ascii");
  if (prefix) header.write(prefix, 345, 155, "utf8");
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  header.write(`${checksum.toString(8).padStart(6, "0")}\0 `, 148, 8, "ascii");
  const paddingSize = (512 - (entry.content.length % 512)) % 512;
  return Buffer.concat([header, entry.content, Buffer.alloc(paddingSize)]);
}

async function collectLocalFiles(root: string, relativePath: string, entries: ArchiveEntry[], totalBytes: { value: number }) {
  const fullPath = path.join(/*turbopackIgnore: true*/ root, relativePath);
  const stat = await lstat(fullPath);
  if (stat.isSymbolicLink()) return;
  if (stat.isDirectory()) {
    const children = await readdir(fullPath, { withFileTypes: true });
    for (const child of children) {
      if (child.isSymbolicLink() || OMITTED_DIRECTORY_NAMES.has(child.name)) continue;
      await collectLocalFiles(root, path.join(relativePath, child.name), entries, totalBytes);
    }
    return;
  }
  if (!stat.isFile()) return;

  const archiveName = relativePath.split(path.sep).join("/");
  if (SENSITIVE_FILE_NAME.test(archiveName)) return;
  const content = await readFile(fullPath);
  totalBytes.value += content.length;
  if (totalBytes.value > MAX_ARCHIVE_CONTENT_SIZE) throw new Error("Full-site backup exceeds the 100 MB uncompressed content limit.");
  entries.push({ name: `site/${archiveName}`, content });
  if (entries.length > MAX_ARCHIVE_FILES) throw new Error("Full-site backup exceeds the 20,000 file limit.");
}

async function collectStorageFiles(
  supabase: SupabaseClient,
  bucket: string,
  directory: string,
  entries: ArchiveEntry[],
  totalBytes: { value: number },
) {
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.storage.from(bucket).list(directory, {
      limit: pageSize,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(`Unable to list "${bucket}" storage files: ${error.message}`);
    const files = data ?? [];
    for (const file of files) {
      if (
        !file.name
        || file.name.includes("/")
        || file.name.includes("\\")
        || file.name.includes(":")
        || file.name === "."
        || file.name === ".."
      ) {
        throw new Error(`Storage returned an invalid file path in "${bucket}".`);
      }
      const objectPath = directory ? `${directory}/${file.name}` : file.name;
      if (file.id === null || !file.metadata) {
        await collectStorageFiles(supabase, bucket, objectPath, entries, totalBytes);
        continue;
      }
      if (SENSITIVE_FILE_NAME.test(objectPath)) continue;
      const declaredSize = Number(file.metadata.size);
      if (!Number.isFinite(declaredSize) || declaredSize < 0) {
        throw new Error(`Unable to verify the size of storage object "${bucket}/${objectPath}".`);
      }
      if (declaredSize > MAX_ARCHIVE_CONTENT_SIZE - totalBytes.value) {
        throw new Error(`Storage object "${bucket}/${objectPath}" exceeds the full-site backup size limit.`);
      }
      const { data: blob, error: downloadError } = await supabase.storage.from(bucket).download(objectPath);
      if (downloadError) throw new Error(`Unable to download "${bucket}/${objectPath}": ${downloadError.message}`);
      const content = Buffer.from(await blob.arrayBuffer());
      totalBytes.value += content.length;
      if (totalBytes.value > MAX_ARCHIVE_CONTENT_SIZE) {
        throw new Error("Full-site backup exceeds the 100 MB uncompressed content limit.");
      }
      entries.push({ name: `storage/${bucket}/${objectPath}`, content });
      if (entries.length > MAX_ARCHIVE_FILES) throw new Error("Full-site backup exceeds the 20,000 file limit.");
    }
    if (files.length < pageSize) return;
  }
}

async function createFullSiteArchive(supabase: SupabaseClient) {
  const entries: ArchiveEntry[] = [];
  const totalBytes = { value: 0 };
  const root = process.cwd();
  for (const sourcePath of SOURCE_ROOTS) {
    const sourceRoot = path.join(/*turbopackIgnore: true*/ root, sourcePath);
    try {
      await lstat(sourceRoot);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(`Full-site backup source "${sourcePath}" is not available in this deployment.`);
      }
      throw error;
    }
    await collectLocalFiles(root, sourcePath, entries, totalBytes);
  }
  for (const sourcePath of SOURCE_FILES) {
    try {
      await collectLocalFiles(root, sourcePath, entries, totalBytes);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) throw new Error(`Unable to list site asset storage: ${bucketError.message}`);
  for (const bucket of buckets ?? []) {
    await collectStorageFiles(supabase, bucket.name, "", entries, totalBytes);
  }

  const databaseJson = await createDatabaseBackup(supabase);
  const databaseContent = Buffer.from(databaseJson, "utf8");
  totalBytes.value += databaseContent.length;
  if (totalBytes.value > MAX_ARCHIVE_CONTENT_SIZE) {
    throw new Error("Full-site backup exceeds the 100 MB uncompressed content limit.");
  }
  entries.push({ name: "database/buildexom-database-backup.json", content: databaseContent });
  entries.push({
    name: "BACKUP-SCOPE.txt",
    content: Buffer.from(
      "Buildexom full-site backup: application source, selected configuration, public assets, Supabase Storage bucket contents, and a database JSON backup.\nExcluded: environment files and secrets, .git, node_modules, .next, build/cache output, and symlinks.\nRestore the database JSON through the dashboard database restore tool. Restore application files and storage assets using your deployment and Supabase administration workflows.\n",
      "utf8",
    ),
  });
  totalBytes.value += entries[entries.length - 1].content.length;
  if (totalBytes.value > MAX_ARCHIVE_CONTENT_SIZE) {
    throw new Error("Full-site backup exceeds the 100 MB uncompressed content limit.");
  }
  if (entries.length > MAX_ARCHIVE_FILES) throw new Error("Full-site backup exceeds the 20,000 file limit.");

  const tar = Buffer.concat([...entries.map(addTarEntry), Buffer.alloc(1024)]);
  const compressed = gzipSync(tar, { level: 6 });
  if (compressed.length > MAX_ARCHIVE_CONTENT_SIZE) {
    throw new Error("Compressed full-site backup exceeds the 100 MB download limit.");
  }
  return compressed;
}

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
    const [archive, actorEmail] = await Promise.all([
      createFullSiteArchive(supabase),
      getAdminRequestActor(),
    ]);
    const date = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `buildexom-full-site-${date}.tar.gz`;
    await recordBackup(supabase, {
      backup_type: "full_site",
      actor_email: actorEmail,
      file_name: fileName,
      file_size_bytes: archive.length,
    });
    return new Response(archive, {
      status: 200,
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to export full-site backup.";
    const status = /exceeds the (?:100 MB|20,000 file)|exceeds the full-site backup size limit/i.test(message) ? 413 : 500;
    return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
