const fs = require("node:fs");
const path = require("node:path");
const { buildScenario } = require("./mail-ingest-runner.cjs");
const { collectSendableRows } = require("./matching-runner.cjs");
const { buildDrafts } = require("./proposal-preview-runner.cjs");
const { buildSendQueue } = require("./send-queue-runner.cjs");
const { executeQueue } = require("./send-execution-runner.cjs");
const { buildSendHistory } = require("./send-history-runner.cjs");
const { detectReplies } = require("./reply-detection-runner.cjs");
const { loadCustomersFromCsv } = require("./customer-csv-importer.cjs");

const inboxPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "sample-mail-inbox.json");
const repliesPath = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(__dirname, "sample-replies.json");
const customerCsvPath = process.argv[4] ? path.resolve(process.argv[4]) : null;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function runPipeline(inbox, replies, options = {}) {
  const scenario = buildScenario(inbox, options);
  const matchRows = collectSendableRows(scenario.requests, scenario.talents, scenario.customers, scenario.settings);
  const sendableRows = matchRows.filter((row) => row.sendStatus === "未送信候補");
  const drafts = buildDrafts(inbox, options);
  const queue = buildSendQueue(inbox, options);
  const execution = executeQueue(queue, options.execution || {});
  const history = buildSendHistory(inbox, options);
  const replyResults = detectReplies(inbox, replies, options);
  const replyCandidates = replyResults.flatMap((result) => result.candidates);

  return {
    scenario,
    sendableRows,
    drafts,
    queue,
    execution,
    history,
    replyResults,
    replyCandidates
  };
}

function aggregateConfirmationNeeded(rows) {
  const grouped = rows.reduce((acc, row) => {
    const key = `${row.kind}|${row.id}|${row.status}|${row.reason}`;
    if (!acc[key]) acc[key] = { ...row, count: 0 };
    acc[key].count += 1;
    return acc;
  }, {});
  return Object.values(grouped);
}

function printPipeline(result) {
  const confirmationNeeded = [
    ...result.scenario.pending.map((item) => ({
      kind: "メール確認",
      id: item.id,
      status: item.type,
      reason: item.reason
    })),
    ...result.drafts
      .filter((draft) => draft.status === "確認必要")
      .map((draft) => ({
        kind: "下書き確認",
        id: draft.talent,
        status: draft.status,
        reason: draft.reviewItems.join(" / ")
      })),
    ...result.replyResults
      .filter((item) => !item.candidates.some((candidate) => candidate.status === "返信候補"))
      .map((item) => ({
        kind: "返信確認",
        id: item.reply.id,
        status: item.candidates[0]?.status || "未照合",
        reason: item.candidates[0]?.reasons || "一致なし"
      }))
  ];

  console.log("SES Auto Send pipeline");
  console.log("mode: local only / no external send");
  console.table([{
    mails: result.scenario.classifications.length,
    requests: result.scenario.requests.length,
    talents: result.scenario.talents.length,
    pending: result.scenario.pending.length,
    sendable: result.sendableRows.length,
    drafts: result.drafts.length,
    queue: result.queue.length,
    executed: result.execution.executed.length,
    skipped: result.execution.skipped.length,
    history: result.history.length,
    replies: result.replyResults.length,
    replyCandidates: result.replyCandidates.length,
    confirmationNeeded: confirmationNeeded.length
  }]);

  console.log("未送信候補");
  console.table(result.sendableRows.map((row) => ({
    request: row.request,
    talent: row.talent,
    company: row.company,
    score: row.score,
    rank: row.rank
  })));

  console.log("確認対象 集約");
  console.table(aggregateConfirmationNeeded(confirmationNeeded));
}

function run() {
  const options = customerCsvPath ? { customers: loadCustomersFromCsv(customerCsvPath) } : {};
  printPipeline(runPipeline(readJson(inboxPath), readJson(repliesPath), options));
}

if (require.main === module) run();

module.exports = {
  aggregateConfirmationNeeded,
  runPipeline
};
