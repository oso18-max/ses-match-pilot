const fs = require("node:fs");
const path = require("node:path");
const { loadCustomersFromCsv } = require("./customer-csv-importer.cjs");
const { aggregateConfirmationNeeded, runPipeline } = require("./pipeline-runner.cjs");

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

function confirmationItems(result) {
  return [
    ...result.scenario.pending.map((item) => ({
      kind: "mail_review",
      id: item.id,
      status: item.type,
      reason: item.reason
    })),
    ...result.drafts
      .filter((draft) => draft.reviewItems.length > 0)
      .map((draft) => ({
        kind: "draft_review",
        id: draft.talent,
        status: draft.status,
        reason: draft.reviewItems.join(" / ")
      })),
    ...result.replyResults
      .filter((item) => !item.candidates.some((candidate) => candidate.reasons.length >= 2))
      .map((item) => ({
        kind: "reply_review",
        id: item.reply.id,
        status: item.candidates[0]?.status || "unmatched",
        reason: item.candidates[0]?.reasons || "no match"
      }))
  ];
}

function createSharedLedger(result, meta = {}) {
  const confirmations = aggregateConfirmationNeeded(confirmationItems(result));
  return {
    meta: {
      name: "SES Auto Send shared ledger",
      mode: "local only / no external send",
      generatedAt: meta.generatedAt || "2026-06-17 13:10",
      source: meta.source || "sample"
    },
    summary: {
      mails: result.scenario.classifications.length,
      requests: result.scenario.requests.length,
      talents: result.scenario.talents.length,
      customers: result.scenario.customers.length,
      sendable: result.sendableRows.length,
      drafts: result.drafts.length,
      queue: result.queue.length,
      executed: result.execution.executed.length,
      skipped: result.execution.skipped.length,
      confirmations: confirmations.length,
      replies: result.replyResults.length
    },
    confirmations,
    queue: result.resolvedQueue.map((item) => ({
      id: item.id,
      status: item.status,
      company: item.company,
      talent: item.talent,
      score: item.score,
      reviewItems: item.reviewItems
    })),
    executed: result.execution.executed.map((item) => ({
      id: item.id,
      queueId: item.queueId,
      status: item.status,
      company: item.company,
      talent: item.talent,
      sentAt: item.sentAt
    })),
    skipped: result.execution.skipped,
    replies: result.replyResults.map((item) => ({
      replyId: item.reply.id,
      status: item.candidates[0]?.status || "unmatched",
      candidates: item.candidates.length
    }))
  };
}

function run() {
  const options = customerCsvPath ? { customers: loadCustomersFromCsv(customerCsvPath) } : {};
  const ledger = createSharedLedger(runPipeline(readJson(inboxPath), readJson(repliesPath), options));
  console.log("Shared ledger");
  console.table([ledger.summary]);
  console.log("Confirmation items");
  console.table(ledger.confirmations);
  console.log("Send queue");
  console.table(ledger.queue);
}

if (require.main === module) run();

module.exports = {
  confirmationItems,
  createSharedLedger
};
