const fs = require("node:fs");
const path = require("node:path");

const inboxPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "sample-mail-inbox.json");

const requestSignals = [
  "案件",
  "必須",
  "尚可",
  "単価",
  "勤務地",
  "開始",
  "リモート",
  "常駐",
  "急募",
  "募集"
];

const talentSignals = [
  "スキルシート",
  "要員",
  "人材",
  "技術者",
  "経験",
  "経験年",
  "稼働",
  "希望単価",
  "最寄",
  "職務経歴"
];

const otherSignals = [
  "日程",
  "打ち合わせ",
  "お願いいたします",
  "ありがとうございます"
];

function readInbox(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function includesAny(text, signals) {
  return signals.filter((signal) => text.includes(signal));
}

function textParts(mail) {
  const attachmentTexts = (mail.attachments || []).map((attachment) => attachment.text || "").filter(Boolean);
  const attachmentNames = (mail.attachments || []).map((attachment) => attachment.filename || "").filter(Boolean);
  return {
    subject: mail.subject || "",
    body: mail.body || "",
    attachmentText: attachmentTexts.join("\n"),
    attachmentName: attachmentNames.join(" ")
  };
}

function detectLocation(parts) {
  const bodyHasInfo = includesAny(`${parts.subject}\n${parts.body}`, [...requestSignals, ...talentSignals]).length > 0;
  const attachmentHasInfo = includesAny(`${parts.attachmentName}\n${parts.attachmentText}`, [...requestSignals, ...talentSignals]).length > 0;

  if (bodyHasInfo && attachmentHasInfo) return "本文＋添付";
  if (bodyHasInfo) return "本文";
  if (attachmentHasInfo) return "添付";
  return "情報なし";
}

function classifyMail(mail) {
  const parts = textParts(mail);
  const bodyText = `${parts.subject}\n${parts.body}`;
  const attachmentText = `${parts.attachmentName}\n${parts.attachmentText}`;
  const allText = `${bodyText}\n${attachmentText}`;

  const requestHits = includesAny(allText, requestSignals);
  const talentHits = includesAny(allText, talentSignals);
  const otherHits = includesAny(allText, otherSignals);
  const location = detectLocation(parts);

  let type = "判定不能";
  if (requestHits.length >= 3 && talentHits.length >= 3) type = "複合";
  else if (requestHits.length >= 3) type = "案件";
  else if (talentHits.length >= 3) type = "人材";
  else if (/^Re:/i.test(parts.subject) && otherHits.length > 0) type = "その他";
  else if (location === "情報なし" && otherHits.length > 0) type = "その他";

  const reasons = [];
  if (requestHits.length) reasons.push(`案件語: ${requestHits.join(" / ")}`);
  if (talentHits.length) reasons.push(`人材語: ${talentHits.join(" / ")}`);
  if (otherHits.length) reasons.push(`その他語: ${otherHits.join(" / ")}`);
  if (!reasons.length) reasons.push("分類できる語句が不足");

  return {
    id: mail.id,
    subject: mail.subject,
    type,
    location,
    reasons: reasons.join(" | ")
  };
}

function run() {
  const mails = readInbox(inboxPath);
  const rows = mails.map(classifyMail);
  console.log(`Inbox: ${path.basename(inboxPath)}`);
  console.table(rows);
}

if (require.main === module) run();

module.exports = {
  classifyMail,
  detectLocation,
  textParts
};
