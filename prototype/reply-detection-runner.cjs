const fs = require("node:fs");
const path = require("node:path");
const { buildSendHistory } = require("./send-history-runner.cjs");
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

function keywords(text) {
  return String(text || "")
    .replace(/[【】]/g, " ")
    .split(/[\/\s、。・:：]+/)
    .filter((word) => word.length >= 2);
}

function detectReply(reply, history) {
  const replyWords = keywords(`${reply.subject} ${reply.body}`);
  const candidates = history.map((item) => {
    const reasons = [];
    if (reply.from === item.to) reasons.push("送信先メール一致");
    if (reply.subject.includes(item.subject) || item.subject.includes(reply.subject.replace(/^Re:\s*/, ""))) {
      reasons.push("件名一致");
    }
    const requestWords = keywords(item.request);
    const matchedWords = requestWords.filter((word) => replyWords.includes(word));
    if (matchedWords.length) reasons.push(`案件語句一致:${matchedWords.join("/")}`);

    return {
      replyId: reply.id,
      historyId: item.id,
      company: item.company,
      talent: item.talent,
      confidence: reasons.length,
      status: reasons.length >= 2 ? "返信候補" : reasons.length === 1 ? "要確認" : "未照合",
      reasons: reasons.join(" / ") || "一致なし"
    };
  });

  return candidates
    .filter((candidate) => candidate.status !== "未照合")
    .sort((a, b) => b.confidence - a.confidence);
}

function detectReplies(inbox, replies, options = {}) {
  const history = buildSendHistory(inbox, options);
  return replies.map((reply) => ({
    reply,
    candidates: detectReply(reply, history)
  }));
}

function run() {
  const inbox = readJson(inboxPath);
  const replies = readJson(repliesPath);
  const options = customerCsvPath ? { customers: loadCustomersFromCsv(customerCsvPath) } : {};
  const results = detectReplies(inbox, replies, options);
  console.log(`返信検知: ${results.length}件`);
  console.table(results.flatMap((result) => (
    result.candidates.length
      ? result.candidates.map((candidate) => ({
        reply: result.reply.id,
        from: result.reply.from,
        history: candidate.historyId,
        company: candidate.company,
        status: candidate.status,
        reasons: candidate.reasons
      }))
      : [{
        reply: result.reply.id,
        from: result.reply.from,
        history: "",
        company: "",
        status: "未照合",
        reasons: "一致なし"
      }]
  )));
}

if (require.main === module) run();

module.exports = {
  detectReply,
  detectReplies
};
