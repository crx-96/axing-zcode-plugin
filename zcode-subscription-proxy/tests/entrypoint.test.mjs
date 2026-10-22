import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { mkdtemp, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const entry = fileURLToPath(new URL("../scripts/mcp-server.mjs", import.meta.url));

test("配置失败仍可握手和 ping，不向宿主泄露密钥", { timeout: 10000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), "bridge-entry-test-"));
  const dataDir = join(directory, "data");
  const child = spawn(process.execPath, [entry], {
    env: { ...process.env, BRIDGE_DATA_DIR: dataDir, BRIDGE_PORT: "invalid", BRIDGE_API_KEY: "test-secret-do-not-return" },
    stdio: ["pipe", "pipe", "pipe"], windowsHide: true,
  });
  let output = "";
  let errors = "";
  const responses = new Map();
  const waiting = new Map();
  child.stdout.on("data", (chunk) => {
    output += chunk;
    let newline;
    while ((newline = output.indexOf("\n")) >= 0) {
      const line = output.slice(0, newline); output = output.slice(newline + 1);
      const response = JSON.parse(line);
      responses.set(response.id, response);
      waiting.get(response.id)?.(response);
    }
  });
  child.stderr.on("data", (chunk) => { errors += chunk; });
  const exited = new Promise((resolve) => child.once("exit", (code) => resolve(code)));
  async function request(id, method, params) {
    const response = new Promise((resolve) => waiting.set(id, resolve));
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    return response;
  }
  try {
    assert.equal((await request(1, "initialize", { protocolVersion: "2025-06-18" })).result.serverInfo.version, "0.1.1");
    assert.equal((await request(2, "tools/list")).result.tools.length, 4);
    const status = await request(3, "tools/call", { name: "bridge_status", arguments: {} });
    assert.match(status.result.content[0].text, /configuration-or-status-error/);
    assert.equal((await request(4, "tools/call", { name: "bridge_start", arguments: {} })).result.isError, true);
    assert.deepEqual((await request(5, "ping")).result, {});
    assert.doesNotMatch(JSON.stringify([...responses.values()]) + errors, /test-secret-do-not-return/);
    child.stdin.end();
    assert.equal(await exited, 0);
    await assert.rejects(access(dataDir), { code: "ENOENT" });
  } finally {
    if (child.exitCode === null) { child.kill(); await exited; }
    await rm(directory, { recursive: true, force: true });
  }
});
