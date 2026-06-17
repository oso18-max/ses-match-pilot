const fs = require("node:fs");
const path = require("node:path");
const { score } = require("./app.js");

const scenarioPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "sample-matching-scenario.json");

function readScenario(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sendTargetsFor(request, talent, customers) {
  return customers.map((customer) => {
    const blocked = [];
    if (!customer.sendable) blocked.push("送信停止");
    if ((customer.ngSkills || []).some((ng) => talent.skills.includes(ng) || request.extracted.workStyle.includes(ng))) {
      blocked.push("NG条件");
    }
    if ((customer.ngConditions || []).includes("単価70万円超NG") && talent.unit > 70) {
      blocked.push("単価NG");
    }
    return {
      ...customer,
      blocked,
      canSend: blocked.length === 0
    };
  });
}

function rankMatches(request, talents) {
  return talents
    .map((talent) => ({ talent, match: score(request, talent) }))
    .sort((a, b) => b.match.score - a.match.score);
}

function collectSendableRows(requests, talents, customers, settings) {
  const rows = [];
  const threshold = settings.sendThreshold || 80;
  const maxSendPerTalent = settings.maxSendPerTalent || 3;
  const countsByTalent = {};

  requests.forEach((request) => {
    rankMatches(request, talents).forEach(({ talent, match }) => {
      const matchOk = match.rank !== "除外" && match.score >= threshold;
      const targets = sendTargetsFor(request, talent, customers);

      targets.forEach((target) => {
        const canQueue = matchOk && target.canSend;
        if (canQueue) countsByTalent[talent.id] = (countsByTalent[talent.id] || 0) + 1;
        rows.push({
          request: request.id,
          subject: request.subject,
          talent: talent.code,
          company: target.company,
          score: match.score,
          rank: match.rank,
          sendStatus: canQueue && countsByTalent[talent.id] <= maxSendPerTalent ? "未送信候補" : "除外",
          reason: canQueue
            ? match.reasons.join(" / ")
            : [...match.reasons, match.warning, ...target.blocked].filter(Boolean).join(" / ")
        });
      });
    });
  });

  return rows.sort((a, b) => b.score - a.score);
}

function printScenarioResult(scenario) {
  const rows = collectSendableRows(
    scenario.requests || [],
    scenario.talents || [],
    scenario.customers || [],
    scenario.settings || {}
  );
  const sendableRows = rows.filter((row) => row.sendStatus === "未送信候補");
  const excludedRows = rows.filter((row) => row.sendStatus === "除外");

  console.log(`Scenario: ${path.basename(scenarioPath)}`);
  console.log(`未送信候補: ${sendableRows.length}件`);
  console.table(sendableRows.map((row) => ({
    request: row.request,
    talent: row.talent,
    company: row.company,
    score: row.score,
    rank: row.rank
  })));

  console.log(`除外: ${excludedRows.length}件`);
  console.table(excludedRows.slice(0, 10).map((row) => ({
    request: row.request,
    talent: row.talent,
    company: row.company,
    score: row.score,
    rank: row.rank,
    reason: row.reason
  })));
}

if (require.main === module) {
  printScenarioResult(readScenario(scenarioPath));
}

module.exports = {
  collectSendableRows,
  printScenarioResult,
  rankMatches,
  sendTargetsFor
};
