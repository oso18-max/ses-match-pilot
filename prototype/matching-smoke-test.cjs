const assert = require("node:assert/strict");
const {
  state,
  skillSheets,
  incomingRequests,
  customers,
  rankedMatches,
  matchBatches,
  sendTargets,
  unsentProposals,
  proposalId
} = require("./app.js");

function run() {
  state.sendThreshold = 80;
  state.maxSendPerTalent = 3;
  state.sentProposalIds = [];

  const javaMatches = rankedMatches(incomingRequests[0]);
  assert.equal(javaMatches[0].talentId, "talent_001");
  assert.equal(javaMatches[0].score, 100);
  assert.equal(javaMatches[0].rank, "1位");

  const reactMatches = rankedMatches(incomingRequests[1]);
  assert.equal(reactMatches[0].talentId, "talent_002");
  assert.equal(reactMatches[0].score, 100);
  assert.equal(reactMatches[0].rank, "1位");

  const pythonMatches = rankedMatches(incomingRequests[2]);
  assert.equal(pythonMatches[0].rank, "除外");

  const batches = matchBatches();
  assert.equal(batches.length, 3);
  assert.equal(batches[0].sendable.length, 1);
  assert.equal(batches[1].sendable.length, 1);
  assert.equal(batches[2].sendable.length, 0);

  const beforeSend = unsentProposals(batches);
  assert.equal(beforeSend.length, 5);

  const first = beforeSend[0];
  assert.equal(first.match.score, 100);
  assert.equal(first.customer.canSend, true);

  state.sentProposalIds.push(proposalId(first.request, first.talent, first.customer));
  const afterSend = unsentProposals(batches);
  assert.equal(afterSend.length, 4);

  const excludedCustomers = customers.filter((customer) => !customer.sendable);
  assert.equal(excludedCustomers.length, 1);

  const reactTalent = skillSheets.find((talent) => talent.id === "talent_002");
  const reactTargets = sendTargets(incomingRequests[1], reactTalent);
  const betaTarget = reactTargets.find((target) => target.id === "customer_002");
  const gammaTarget = reactTargets.find((target) => target.id === "customer_003");
  assert.equal(betaTarget.canSend, false);
  assert.deepEqual(betaTarget.blocked, ["単価NG"]);
  assert.equal(gammaTarget.canSend, false);
  assert.deepEqual(gammaTarget.blocked, ["送信停止"]);

  console.log("OK: matching smoke test passed");
  console.table(beforeSend.map((proposal) => ({
    request: proposal.request.id,
    talent: proposal.talent.code,
    customer: proposal.customer.company,
    score: proposal.match.score,
    rank: proposal.match.rank
  })));
}

run();
