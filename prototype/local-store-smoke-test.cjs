const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function validateLocalStore(store) {
  const errors = [];
  if (!store || typeof store !== "object") errors.push("store is not object");
  if (store.version !== 1) errors.push("unsupported version");
  if (!store.updatedAt) errors.push("updatedAt is required");
  if (!store.records || typeof store.records !== "object") errors.push("records is required");

  const requiredCollections = [
    "customers",
    "requests",
    "talents",
    "matches",
    "proposal_targets",
    "send_histories",
    "replies",
    "interviews",
    "deals",
    "audit_events"
  ];

  requiredCollections.forEach((key) => {
    if (!Array.isArray(store.records?.[key])) errors.push(`${key} must be array`);
  });

  return errors;
}

const store = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-local-store.json"), "utf8"));

assert.deepEqual(validateLocalStore(store), []);
assert.equal(store.records.customers[0].email.endsWith(".invalid"), true);
assert.equal(validateLocalStore({ version: 2, records: {} }).includes("unsupported version"), true);
assert.equal(validateLocalStore({ version: 1, updatedAt: "now", records: { customers: {} } }).includes("customers must be array"), true);

console.log("OK: local store smoke test passed");
console.table(Object.keys(store.records).map((key) => ({
  collection: key,
  records: store.records[key].length
})));
