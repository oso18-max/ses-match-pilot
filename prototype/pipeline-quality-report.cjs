const fs = require("node:fs");
const path = require("node:path");
const { runPipeline } = require("./pipeline-runner.cjs");

const rawArgs = process.argv.slice(2);
const csvMode = rawArgs.includes("--csv");
const scenarioFiles = rawArgs.filter((arg) => arg !== "--csv");
const defaultScenarioFiles = [
  "sample-mail-inbox.json",
  "sample-mail-edge-cases.json"
];

const files = (scenarioFiles.length ? scenarioFiles : defaultScenarioFiles)
  .map((file) => path.resolve(__dirname, file));
const replies = JSON.parse(fs.readFileSync(path.join(__dirname, "sample-replies.json"), "utf8"));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function confirmationItems(result) {
  return [
    ...result.scenario.pending.map((item) => ({
      id: item.id,
      kind: "メール確認",
      status: item.type,
      reason: item.reason,
      category: item.type === "判定不能" ? "判定不能" : item.type === "抽出不足" ? "抽出不足" : "その他"
    })),
    ...result.drafts
      .filter((draft) => draft.status === "確認必要")
      .map((draft) => ({
        id: draft.talent,
        kind: "下書き確認",
        status: draft.status,
        reason: draft.reviewItems.join(" / "),
        category: "抽出不足"
      })),
    ...result.replyResults
      .filter((item) => !item.candidates.some((candidate) => candidate.status === "返信候補"))
      .map((item) => ({
        id: item.reply.id,
        kind: "返信確認",
        status: item.candidates[0]?.status || "未照合",
        reason: item.candidates[0]?.reasons || "一致なし",
        category: item.candidates[0]?.status === "要確認" ? "返信要確認" : "返信未照合"
      }))
  ];
}

function summarize(filePath) {
  const result = runPipeline(readJson(filePath), replies);
  const confirmations = confirmationItems(result);
  const reasonCounts = confirmations.reduce((acc, item) => {
    const key = `${item.kind}: ${item.status}: ${item.reason}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const categoryCounts = confirmations.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  return {
    file: path.basename(filePath),
    mails: result.scenario.classifications.length,
    requests: result.scenario.requests.length,
    talents: result.scenario.talents.length,
    customers: result.scenario.customers.length,
    pending: result.scenario.pending.length,
    sendable: result.sendableRows.length,
    drafts: result.drafts.length,
    queue: result.queue.length,
    resolvedQueue: result.resolvedQueue.length,
    executed: result.execution.executed.length,
    skipped: result.execution.skipped.length,
    history: result.history.length,
    replies: result.replyResults.length,
    replyCandidates: result.replyCandidates.length,
    confirmationNeeded: confirmations.length,
    categoryCounts,
    reasonCounts
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function confirmationCsvRows(filePath) {
  const result = runPipeline(readJson(filePath), replies);
  return confirmationItems(result).map((item) => ({
    file: path.basename(filePath),
    id: item.id,
    category: item.category,
    kind: item.kind,
    status: item.status,
    reason: item.reason
  }));
}

function toCsv(rows) {
  const headers = ["file", "id", "category", "kind", "status", "reason"];
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  ].join("\n");
}

function aggregateConfirmationRows(rows) {
  const grouped = rows.reduce((acc, row) => {
    const key = `${row.file}|${row.id}|${row.category}|${row.kind}|${row.status}|${row.reason}`;
    if (!acc[key]) acc[key] = { ...row, count: 0 };
    acc[key].count += 1;
    return acc;
  }, {});
  return Object.values(grouped);
}

function run() {
  if (csvMode) {
    const rows = files.flatMap(confirmationCsvRows);
    console.log(toCsv(rows));
    return;
  }

  const summaries = files.map(summarize);
  console.log("SES Auto Send quality report");
  console.log("mode: local only / no external send");
  console.table(summaries.map(({ categoryCounts, reasonCounts, ...summary }) => summary));

  console.log("確認カテゴリ");
  console.table(summaries.flatMap((summary) => (
    Object.entries(summary.categoryCounts).map(([category, count]) => ({
      file: summary.file,
      category,
      count
    }))
  )));

  console.log("確認理由");
  console.table(summaries.flatMap((summary) => (
    Object.entries(summary.reasonCounts).map(([reason, count]) => ({
      file: summary.file,
      count,
      reason
    }))
  )));

  console.log("確認対象 集約");
  console.table(aggregateConfirmationRows(files.flatMap(confirmationCsvRows)));
}

if (require.main === module) run();

module.exports = {
  confirmationItems,
  confirmationCsvRows,
  aggregateConfirmationRows,
  summarize
};
