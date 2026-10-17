export const DATABASE_BACKUP_FORMAT = "buildexom-database-backup";
export const DATABASE_BACKUP_VERSION = 1;
export const MAX_DATABASE_BACKUP_SIZE = 50 * 1024 * 1024;
export const MAX_ROWS_PER_BACKUP_TABLE = 100_000;

export const DATABASE_BACKUP_TABLES = [
  "stores",
  "store_categories",
  "store_products",
  "products",
  "store_settings",
  "delivery_settings",
  "orders",
  "store_orders",
  "store_payments",
  "platform_settings",
  "blog_posts",
  "pricing_plans",
] as const;

export type DatabaseBackupTable = (typeof DATABASE_BACKUP_TABLES)[number];
export type DatabaseBackupTables = Record<DatabaseBackupTable, unknown[]>;

export type DatabaseBackupDocument = {
  format: typeof DATABASE_BACKUP_FORMAT;
  version: typeof DATABASE_BACKUP_VERSION;
  exportedAt: string;
  app: { name: string; version: string };
  tables: DatabaseBackupTables;
};

export type BackupValidation = {
  valid: boolean;
  error?: string;
  backup?: DatabaseBackupDocument;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUuid(value: unknown) {
  return typeof value === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function validateDatabaseBackup(value: unknown): BackupValidation {
  if (!isRecord(value)) return { valid: false, error: "Backup must be a JSON object." };
  if (value.format !== DATABASE_BACKUP_FORMAT) return { valid: false, error: "This file is not a Buildexom database backup." };
  if (value.version !== DATABASE_BACKUP_VERSION) return { valid: false, error: `Unsupported backup version. Expected version ${DATABASE_BACKUP_VERSION}.` };
  if (typeof value.exportedAt !== "string" || !Number.isFinite(Date.parse(value.exportedAt))) {
    return { valid: false, error: "Backup timestamp is missing or invalid." };
  }
  if (!isRecord(value.app) || typeof value.app.name !== "string" || typeof value.app.version !== "string") {
    return { valid: false, error: "Backup application metadata is missing or invalid." };
  }
  if (!isRecord(value.tables)) return { valid: false, error: "Backup table data is missing or invalid." };

  const tableKeys = Object.keys(value.tables);
  if (tableKeys.some((key) => !(DATABASE_BACKUP_TABLES as readonly string[]).includes(key))) {
    return { valid: false, error: "Backup contains unsupported tables." };
  }

  const tables = {} as DatabaseBackupTables;
  for (const table of DATABASE_BACKUP_TABLES) {
    const rows = value.tables[table];
    if (!Array.isArray(rows)) return { valid: false, error: `Backup is missing the "${table}" table data.` };
    if (rows.length > MAX_ROWS_PER_BACKUP_TABLE) {
      return { valid: false, error: `The "${table}" table exceeds the ${MAX_ROWS_PER_BACKUP_TABLE.toLocaleString()} row limit.` };
    }

    const ids = new Set<string>();
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      if (!isRecord(row) || typeof row.id !== "string" || (table !== "platform_settings" && !isUuid(row.id))) {
        return { valid: false, error: `Invalid record identifier in "${table}" at record ${index + 1}.` };
      }
      if (ids.has(row.id)) return { valid: false, error: `Duplicate record identifier in "${table}" at record ${index + 1}.` };
      ids.add(row.id);
    }
    tables[table] = rows;
  }

  return {
    valid: true,
    backup: {
      format: DATABASE_BACKUP_FORMAT,
      version: DATABASE_BACKUP_VERSION,
      exportedAt: value.exportedAt,
      app: { name: value.app.name, version: value.app.version },
      tables,
    },
  };
}
