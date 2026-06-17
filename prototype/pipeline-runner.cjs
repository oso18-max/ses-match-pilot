const fs = require("node:fs");
const path = require("node:path");
const { buildScenario } = require("./mail-ingest-runner.cjs");
const { collectSendableRows } = require("./matching-runner.cjs");
const { buildDrafts } = require("./proposal-preview-runner.cjs");
const { buildSendHistory } = require("./send-history-runner.cjs");
const { detectReplies } = require("./reply-detection-runner.cjs");

const inboxPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "sample-mail-inbox.json");
const repliesPath = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(__dirname, "sample-replies.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function runPipeline(inbox, replies) {
  const scenario = buildScenario(inbox);
  const matchRows = collectSendableRows(scenario.requests, scenario.talents, scenario.customers, scenario.settings);
  const sendableRows = matchRows.filter((row) => row.sendStatus === "未送信候補");
  const drafts = buildDrafts(inbox);
  const history = buildSendHistory(inbox);
  const replyResults = detectReplies(inbox, replies);
  const replyCandidates = replyResults.flatMap((result) => result.candidates);

  return {
    scenario,
    sendableRows,
    drafts,
    history,
    replyResults,
    replyCandidates
  };
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

  console.log("確認対象");
  console.table(confirmationNeeded);
}

function run() {
  printPipeline(runPipeline(readJson(inboxPath), readJson(repliesPath)));
}

if (require.main === module) run();

module.exports = {
  runPipeline
};
