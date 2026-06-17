const fs = require("node:fs");
const path = require("node:path");

const defaultCsvPath = path.join(__dirname, "sample-customers.csv");
const requiredHeaders = ["company", "person", "email", "sendable"];
const allowedStatuses = ["", "見込み", "商談中", "契約中", "停止", "失注"];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted && char === "\"" && next === "\"") {
      field += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (!quoted && char === ",") {
      row.push(field);
      field = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

function splitList(value) {
  return String(value || "")
    .split(/[|;、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toBoolean(value) {
  const text = String(value || "").trim().toLowerCase();
  return ["true", "1", "yes", "y", "送信可", "可", "on"].includes(text);
}

function normalizeCustomer(row, index) {
  return {
    id: row.id || `csv_customer_${String(index + 1).padStart(3, "0")}`,
    company: row.company || "",
    person: row.person || "",
    honorific: row.honorific || "様",
    email: row.email || "",
    phone: row.phone || "",
    status: row.status || "",
    owner: row.owner || "",
    sendable: toBoolean(row.sendable),
    ngSkills: splitList(row.ngSkills),
    ngConditions: splitList(row.ngConditions),
    templateGroup: row.templateGroup || "標準",
    memo: row.memo || ""
  };
}

function validateCustomer(customer) {
  const errors = [];
  if (!customer.company) errors.push("company required");
  if (!customer.person) errors.push("person required");
  if (!customer.email) errors.push("email required");
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) errors.push("email invalid");
  if (customer.phone && !/^[0-9+\-()\s]+$/.test(customer.phone)) errors.push("phone invalid");
  if (!allowedStatuses.includes(customer.status)) errors.push("status invalid");
  return errors;
}

function importCustomersFromCsv(text) {
  const rows = parseCsv(text);
  const headers = rows.shift()?.map((header) => header.trim()) || [];
  const normalizedCustomers = [];
  const errors = [];
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  if (missingHeaders.length) {
    errors.push({
      row: 1,
      id: "header",
      errors: missingHeaders.map((header) => `${header} header required`)
    });
  }
  const seenEmails = new Map();

  rows.forEach((values, index) => {
    const record = Object.fromEntries(headers.map((header, headerIndex) => [header, (values[headerIndex] || "").trim()]));
    const customer = normalizeCustomer(record, index);
    const rowErrors = validateCustomer(customer);
    const emailKey = customer.email.toLowerCase();
    if (emailKey && seenEmails.has(emailKey)) {
      rowErrors.push(`email duplicated with row ${seenEmails.get(emailKey)}`);
    } else if (emailKey) {
      seenEmails.set(emailKey, index + 2);
    }

    if (rowErrors.length) {
      errors.push({
        row: index + 2,
        id: customer.id,
        errors: rowErrors
      });
    } else {
      normalizedCustomers.push(customer);
    }
  });

  return {
    accepted: errors.length === 0,
    customers: errors.length === 0 ? normalizedCustomers : [],
    errors,
    previewCustomers: normalizedCustomers
  };
}

function loadCustomersFromCsv(filePath) {
  const result = importCustomersFromCsv(fs.readFileSync(filePath, "utf8"));
  if (!result.accepted) {
    const error = new Error(`Customer CSV rejected: ${path.basename(filePath)}`);
    error.errors = result.errors;
    throw error;
  }
  return result.customers;
}

function run() {
  const csvPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultCsvPath;
  const result = importCustomersFromCsv(fs.readFileSync(csvPath, "utf8"));
  console.log(`Customer CSV: ${path.basename(csvPath)}`);
  console.log(`accepted: ${result.accepted}`);
  console.table(result.customers.map((customer) => ({
    id: customer.id,
    company: customer.company,
    person: `${customer.person}${customer.honorific}`,
    email: customer.email,
    status: customer.status || "-",
    sendable: customer.sendable,
    ngSkills: customer.ngSkills.join(" / ") || "-",
    ngConditions: customer.ngConditions.join(" / ") || "-"
  })));
  if (result.errors.length) {
    console.log("Import errors");
    console.table(result.errors);
  }
}

if (require.main === module) run();

module.exports = {
  importCustomersFromCsv,
  loadCustomersFromCsv,
  parseCsv,
  splitList,
  toBoolean,
  validateCustomer
};
