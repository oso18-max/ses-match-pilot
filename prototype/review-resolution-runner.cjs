const fs = require("node:fs");
const path = require("node:path");
const { loadCustomersFromCsv } = require("./customer-csv-importer.cjs");
const { buildSendQueue, queueStatus } = require("./send-queue-runner.cjs");

const inboxPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "sample-mail-inbox.json");
const customerCsvPath = process.argv[3] ? path.resolve(process.argv[3]) : null;

function readInbox(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeResolutions(resolutions) {
  return resolutions.reduce((acc, resolution) => {
    const key = `${resolution.queueId}|${resolution.item}`;
    acc[key] = resolution;
    return acc;
  }, {});
}

function resolveQueueReviews(queue, resolutions) {
  const resolutionMap = normalizeResolutions(resolutions);

  return queue.map((item) => {
    const remainingReviewItems = item.reviewItems.filter((reviewItem) => !resolutionMap[`${item.id}|${reviewItem}`]);
    const resolvedItems = item.reviewItems
      .filter((reviewItem) => resolutionMap[`${item.id}|${reviewItem}`])
      .map((reviewItem) => ({
        item: reviewItem,
        note: resolutionMap[`${item.id}|${reviewItem}`].note || "確認済み"
      }));

    return {
      ...item,
      reviewItems: remainingReviewItems,
      resolvedItems,
      status: queueStatus({ reviewItems: remainingReviewItems }, { autoSend: item.mode === "auto" })
    };
  });
}

function run() {
  const options = customerCsvPath ? { customers: loadCustomersFromCsv(customerCsvPath) } : {};
  const queue = buildSendQueue(readInbox(inboxPath), options);
  const firstReview = queue[0]?.reviewItems[0];
  const resolutions = firstReview
    ? [{ queueId: queue[0].id, item: firstReview, note: "テスト確認済み" }]
    : [];
  const resolvedQueue = resolveQueueReviews(queue, resolutions);

  console.log(`確認解消シミュレーション: ${resolutions.length}件`);
  console.table(resolvedQueue.map((item) => ({
    id: item.id,
    status: item.status,
    company: item.company,
    remaining: item.reviewItems.join(" / ") || "-",
    resolved: item.resolvedItems.map((resolved) => resolved.item).join(" / ") || "-"
  })));
}

if (require.main === module) run();

module.exports = {
  normalizeResolutions,
  resolveQueueReviews
};
