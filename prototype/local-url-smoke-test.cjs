const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

const port = 4184;
const host = "127.0.0.1";
const serverPath = path.join(__dirname, "local-static-server.cjs");

function request(pathname) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host, port, path: pathname, timeout: 3000 }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });
    req.on("timeout", () => {
      req.destroy(new Error("request timed out"));
    });
    req.on("error", reject);
  });
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 5000) {
    try {
      const result = await request("/prototype/index.html");
      if (result.statusCode === 200) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error("local server did not start");
}

async function run() {
  const server = spawn(process.execPath, [serverPath], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stderr = "";
  server.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();
    const index = await request("/prototype/index.html");
    const companyTest = await request("/prototype/company-test.html");
    const appJs = await request("/prototype/app.js");
    const css = await request("/prototype/styles.css");

    assert.equal(index.statusCode, 200);
    assert.match(index.body, /SES Auto Send/);
    assert.equal(companyTest.statusCode, 200);
    assert.match(companyTest.body, /data-default-view="companyTest"/);
    assert.equal(appJs.statusCode, 200);
    assert.match(appJs.body, /function renderCompanyTest/);
    assert.equal(css.statusCode, 200);
    assert.match(css.body, /\.app-shell/);

    console.log("OK: local URL smoke test passed");
    console.table([
      { url: `http://${host}:${port}/prototype/index.html`, status: index.statusCode },
      { url: `http://${host}:${port}/prototype/company-test.html`, status: companyTest.statusCode }
    ]);
  } finally {
    server.kill();
  }

  if (stderr.trim()) {
    console.error(stderr);
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
