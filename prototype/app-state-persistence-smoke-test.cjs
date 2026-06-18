const assert = require("node:assert/strict");
const app = require("./app.js");

function memoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

global.localStorage = memoryStorage();

app.state.autoSend = true;
app.state.sendThreshold = 70;
app.state.maxSendPerTalent = 1;
app.state.sentProposalIds = ["proposal_test_001"];
app.state.reviewedMailIds = ["mail_review_001"];
app.state.mailReviewHistory = [{
  id: "mail_review_001",
  reviewedAt: "2026-06-18 09:00",
  subject: "資料送付",
  action: "確認済みにする"
}];

app.saveAppState();

app.state.autoSend = false;
app.state.sendThreshold = 80;
app.state.maxSendPerTalent = 3;
app.state.sentProposalIds = [];
app.state.reviewedMailIds = [];
app.state.mailReviewHistory = [];

app.loadAppState();

assert.equal(app.state.autoSend, true);
assert.equal(app.state.sendThreshold, 70);
assert.equal(app.state.maxSendPerTalent, 1);
assert.deepEqual(app.state.sentProposalIds, ["proposal_test_001"]);
assert.deepEqual(app.state.reviewedMailIds, ["mail_review_001"]);
assert.equal(app.state.mailReviewHistory[0].subject, "資料送付");

app.updateSendSetting("sendThreshold", "60");
assert.equal(app.state.sendThreshold, 60);
assert.equal(JSON.parse(localStorage.getItem("sesAutoSendAppState")).sendThreshold, 60);

console.log("OK: app state persistence smoke test passed");
