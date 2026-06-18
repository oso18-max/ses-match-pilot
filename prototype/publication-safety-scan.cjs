const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const targetExtensions = new Set([".md", ".html", ".css", ".js", ".cjs", ".json", ".csv", ".txt"]);
const ignoredDirs = new Set([".git", "node_modules"]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) return [];
      return walk(fullPath);
    }
    return targetExtensions.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
  });
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

const files = walk(root);
const findings = [];
const selfFile = relative(__filename);
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const networkPatterns = [
  { label: "fetch", pattern: /\bfetch\s*\(/ },
  { label: "XMLHttpRequest", pattern: /\bXMLHttpRequest\b/ },
  { label: "sendBeacon", pattern: /\bsendBeacon\s*\(/ },
  { label: "axios", pattern: /\baxios\s*\./ },
  { label: "gmail api", pattern: /gmail\.googleapis|googleapis\.com/i }
];

files.forEach((filePath) => {
  const text = fs.readFileSync(filePath, "utf8");
  const file = relative(filePath);
  if (file === selfFile) return;
  const emails = text.match(emailPattern) || [];
  emails
    .filter((email) => !email.toLowerCase().endsWith(".invalid"))
    .forEach((email) => findings.push({ file, type: "non-test-email", value: email }));

  networkPatterns.forEach((network) => {
    if (network.pattern.test(text)) {
      findings.push({ file, type: "network-code", value: network.label });
    }
  });
});

console.log("SES Auto Send publication safety scan");
console.table([
  { item: "scanned files", count: files.length },
  { item: "findings", count: findings.length }
]);

if (findings.length) {
  console.error("FAILED publication safety scan");
  console.table(findings);
  process.exit(1);
}

console.log("OK: no non-test email addresses or network/API code found");
