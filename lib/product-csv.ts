export type CsvRecord = {
  line: number;
  values: string[];
};

export type ProductImportRow = {
  name: string;
  price: number;
  description: string | null;
  sku: string | null;
  stock: number | null;
  category_id: string | null;
  image_url: string | null;
};

export type ProductImportIssue = {
  row: number;
  field: string;
  message: string;
};

export type ProductImportParseResult = {
  rows: Array<{ row: number; product: ProductImportRow }>;
  errors: ProductImportIssue[];
};

export function parseCsvRecords(input: string): CsvRecord[] {
  const records: CsvRecord[] = [];
  let values: string[] = [];
  let value = "";
  let quoted = false;
  let afterQuote = false;
  let line = 1;
  let recordLine = 1;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          value += '"';
          index += 1;
        } else {
          quoted = false;
          afterQuote = true;
        }
      } else {
        value += character;
        if (character === "\n") line += 1;
        else if (character === "\r") {
          if (input[index + 1] === "\n") index += 1;
          line += 1;
          value += "\n";
        }
      }
      continue;
    }

    if (afterQuote && (character === " " || character === "\t")) {
      continue;
    } else if (afterQuote && character !== "," && character !== "\n" && character !== "\r") {
      throw new Error(`CSV has unexpected content after a quoted field on row ${line}.`);
    } else if (character === '"' && value.trim().length === 0) {
      value = "";
      quoted = true;
    } else if (character === ",") {
      values.push(value);
      value = "";
      afterQuote = false;
    } else if (character === "\n" || character === "\r") {
      values.push(value);
      value = "";
      if (values.some((cell) => cell.trim() !== "")) records.push({ line: recordLine, values });
      values = [];
      afterQuote = false;
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      line += 1;
      recordLine = line;
    } else if (character === '"') {
      if (value.trim()) throw new Error(`CSV has an invalid quote in an unquoted field on row ${line}.`);
      value = "";
      quoted = true;
    } else {
      value += character;
    }
  }

  if (quoted) throw new Error(`CSV has an unclosed quoted field starting before row ${recordLine}.`);
  values.push(value);
  if (values.some((cell) => cell.trim() !== "")) records.push({ line: recordLine, values });
  return records;
}

const aliases: Record<string, keyof ProductImportRow> = {
  name: "name",
  product: "name",
  product_name: "name",
  price: "price",
  description: "description",
  sku: "sku",
  stock: "stock",
  quantity: "stock",
  stock_quantity: "stock",
  category_id: "category_id",
  image_url: "image_url",
  image: "image_url",
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function validHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function parseProductCsv(input: string): ProductImportParseResult {
  const records = parseCsvRecords(input.replace(/^\uFEFF/, ""));
  if (records.length === 0) {
    return { rows: [], errors: [{ row: 1, field: "header", message: "CSV file is empty." }] };
  }

  const headers = records[0].values.map(normalizeHeader);
  if (records.length - 1 > 1000) {
    return { rows: [], errors: [{ row: records[1001].line, field: "row", message: "A maximum of 1,000 products can be imported at a time." }] };
  }
  const mappedHeaders = headers.map((header) => aliases[header] ?? null);
  const errors: ProductImportIssue[] = [];
  const nameIndex = mappedHeaders.indexOf("name");
  const priceIndex = mappedHeaders.indexOf("price");
  if (nameIndex < 0) errors.push({ row: records[0].line, field: "name", message: "Required header is missing." });
  if (priceIndex < 0) errors.push({ row: records[0].line, field: "price", message: "Required header is missing." });

  const seenHeaders = new Set<string>();
  for (let index = 0; index < mappedHeaders.length; index += 1) {
    const header = mappedHeaders[index];
    if (!header) {
      errors.push({ row: records[0].line, field: headers[index] || "header", message: "Unsupported CSV header." });
    } else if (seenHeaders.has(header)) {
      errors.push({ row: records[0].line, field: header, message: "Duplicate column." });
    } else {
      seenHeaders.add(header);
    }
  }
  if (errors.length > 0) return { rows: [], errors };

  const rows: ProductImportParseResult["rows"] = [];
  const skuRows = new Map<string, number>();
  for (const record of records.slice(1)) {
    if (record.values.length !== headers.length) {
      errors.push({ row: record.line, field: "row", message: `Expected ${headers.length} columns but found ${record.values.length}.` });
      continue;
    }
    const raw = new Map<keyof ProductImportRow, string>();
    mappedHeaders.forEach((header, index) => {
      if (header) raw.set(header, record.values[index].trim());
    });

    const name = raw.get("name") ?? "";
    const priceText = raw.get("price") ?? "";
    const price = Number(priceText);
    const description = raw.get("description") ?? "";
    const sku = raw.get("sku") ?? "";
    const stockText = raw.get("stock") ?? "";
    const categoryId = raw.get("category_id") ?? "";
    const imageUrl = raw.get("image_url") ?? "";
    let invalid = false;

    if (!name) {
      errors.push({ row: record.line, field: "name", message: "Product name is required." });
      invalid = true;
    } else if (name.length > 200) {
      errors.push({ row: record.line, field: "name", message: "Product name must be 200 characters or fewer." });
      invalid = true;
    }
    if (!/^(?:\d+\.?\d*|\.\d+)$/.test(priceText) || !Number.isFinite(price) || price < 0 || price > 99999999.99) {
      errors.push({ row: record.line, field: "price", message: "Enter a valid non-negative price with at most two decimal places." });
      invalid = true;
    } else if ((priceText.split(".")[1] ?? "").length > 2) {
      errors.push({ row: record.line, field: "price", message: "Price can have at most two decimal places." });
      invalid = true;
    }
    if (description.length > 10000) {
      errors.push({ row: record.line, field: "description", message: "Description must be 10,000 characters or fewer." });
      invalid = true;
    }
    if (sku.length > 100) {
      errors.push({ row: record.line, field: "sku", message: "SKU must be 100 characters or fewer." });
      invalid = true;
    } else if (sku) {
      const key = sku.toLowerCase();
      const previous = skuRows.get(key);
      if (previous !== undefined) {
        errors.push({ row: record.line, field: "sku", message: `Duplicate SKU (first used on row ${previous}).` });
        invalid = true;
      } else {
        skuRows.set(key, record.line);
      }
    }
    let stock: number | null = null;
    if (stockText) {
      if (!/^\d+$/.test(stockText) || !Number.isSafeInteger(Number(stockText)) || Number(stockText) > 2147483647) {
        errors.push({ row: record.line, field: "stock", message: "Stock must be a non-negative whole number." });
        invalid = true;
      } else {
        stock = Number(stockText);
      }
    }
    if (categoryId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(categoryId)) {
      errors.push({ row: record.line, field: "category_id", message: "Category ID must be a valid UUID." });
      invalid = true;
    }
    if (imageUrl && (imageUrl.length > 2048 || !validHttpUrl(imageUrl))) {
      errors.push({ row: record.line, field: "image_url", message: "Image URL must be a valid HTTP or HTTPS URL." });
      invalid = true;
    }

    if (!invalid) {
      rows.push({
        row: record.line,
        product: {
          name,
          price,
          description: description || null,
          sku: sku || null,
          stock,
          category_id: categoryId || null,
          image_url: imageUrl || null,
        },
      });
    }
  }

  if (records.length === 1) errors.push({ row: 1, field: "row", message: "CSV contains headers but no product rows." });
  return { rows, errors };
}
