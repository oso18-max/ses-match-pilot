const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { importCustomersFromCsv, parseCsv, splitList, toBoolean } = require("./customer-csv-importer.cjs");

const sample = fs.readFileSync(path.join(__dirname, "sample-customers.csv"), "utf8");
const result = importCustomersFromCsv(sample);

assert.equal(result.accepted, true);
assert.equal(result.customers.length, 3);
assert.equal(result.customers[0].company, "株式会社アルファ");
assert.equal(result.customers[1].ngSkills[0], "常駐のみ");
assert.equal(result.customers[1].ngConditions[0], "単価70万円超NG");
assert.equal(result.customers[2].sendable, false);
assert.equal(toBoolean("送信可"), true);
assert.deepEqual(splitList("Java|Python;React、AWS"), ["Java", "Python", "React", "AWS"]);
assert.deepEqual(parseCsv("company,email\n\"A,B\",a@example.invalid\n")[1], ["A,B", "a@example.invalid"]);

const missingRequired = importCustomersFromCsv("company,person,email,sendable\n,田中,tanaka@example.invalid,送信可\n");
assert.equal(missingRequired.accepted, false);
assert.equal(missingRequired.customers.length, 0);
assert.match(missingRequired.errors[0].errors.join(","), /company required/);

const duplicated = importCustomersFromCsv("company,person,email,sendable\nA,田中,a@example.invalid,送信可\nB,佐藤,a@example.invalid,送信可\n");
assert.equal(duplicated.accepted, false);
assert.equal(duplicated.customers.length, 0);
assert.match(duplicated.errors[0].errors.join(","), /duplicated/);

const invalidStatus = importCustomersFromCsv("company,person,email,sendable,status\nA,田中,a@example.invalid,送信可,不明\n");
assert.equal(invalidStatus.accepted, false);
assert.match(invalidStatus.errors[0].errors.join(","), /status invalid/);

console.log("OK: customer CSV importer smoke test passed");
console.table(result.customers.map((customer) => ({
  company: customer.company,
  email: customer.email,
  sendable: customer.sendable,
  ngSkills: customer.ngSkills.join(" / ") || "-"
})));
