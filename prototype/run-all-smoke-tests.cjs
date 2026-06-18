const { spawnSync } = require("node:child_process");
const path = require("node:path");

const tests = [
  "app-state-persistence-smoke-test.cjs",
  "customer-csv-importer-smoke-test.cjs",
  "company-test-smoke-test.cjs",
  "company-test-final-readiness.cjs",
  "company-test-readiness-smoke-test.cjs",
  "publication-safety-scan.cjs",
  "deal-management-smoke-test.cjs",
  "interview-management-smoke-test.cjs",
  "local-store-smoke-test.cjs",
  "mail-ingest-smoke-test.cjs",
  "matching-smoke-test.cjs",
  "pipeline-edge-smoke-test.cjs",
  "pipeline-quality-report-smoke-test.cjs",
  "pipeline-smoke-test.cjs",
  "proposal-preview-smoke-test.cjs",
  "review-resolution-smoke-test.cjs",
  "reply-detection-smoke-test.cjs",
  "send-execution-smoke-test.cjs",
  "send-history-smoke-test.cjs",
  "send-queue-smoke-test.cjs",
  "shared-ledger-smoke-test.cjs",
  "test-console-smoke-test.cjs",
  "ui-copy-smoke-test.cjs"
];

for (const test of tests) {
  const filePath = path.join(__dirname, test);
  console.log(`\n> node prototype/${test}`);
  const result = spawnSync(process.execPath, [filePath], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8"
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status !== 0) {
    console.error(`FAILED: ${test}`);
    process.exit(result.status || 1);
  }
}

console.log("\nOK: all smoke tests passed");
