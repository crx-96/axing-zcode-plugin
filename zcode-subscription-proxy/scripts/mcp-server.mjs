import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadConfig } from "../bridge/config.mjs";
import { ensureRunning, getStatus, stopBridge, startWatchdog, shutdownOwnedBridges } from "../bridge/bridge-process.mjs";
import { generateImage } from "../bridge/image-generation.mjs";
import { runMcp } from "../bridge/mcp-protocol.mjs";

const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const ctx = { config: {}, startupError: null };
let loading;
let stopWatchdog;
let closing = false;

/** 配置错误不终止 MCP；修正配置后可直接重试 start，而不必重连工具服务。 */
async function runtimeConfig() {
  if (ctx.config.dataDir) return ctx.config;
  if (!loading) {
    loading = loadConfig({ pluginRoot }).then((config) => {
      ctx.config = config;
      if (!closing) stopWatchdog = startWatchdog(config, (error) => {
        if (error) ctx.startupError = { code: "BRIDGE_RECOVERY_FAILED", safeMessage: "桥自动恢复未成功，请检查端口和配置" };
      });
      return config;
    }).catch(() => {
      throw Object.assign(new Error("配置不可用"), {
        code: "BRIDGE_NOT_READY",
        safeMessage: "配置不可用；请检查 BRIDGE_* 环境变量、本版本 config.yaml 与 launcher-secrets.json，再调用 bridge_start",
      });
    }).finally(() => { loading = null; });
  }
  return loading;
}

const handlers = {
  async getStatus() {
    try {
      const status = await getStatus(await runtimeConfig());
      if (status.ready) ctx.startupError = null;
      return status;
    }
    catch (error) {
      ctx.startupError = error;
      return { alive: false, ready: false, state: "configuration-or-status-error" };
    }
  },
  async ensureRunning() {
    const result = await ensureRunning(await runtimeConfig());
    if (result.ready) ctx.startupError = null;
    return result;
  },
  async stopBridge() { return stopBridge(await runtimeConfig()); },
  async generateImage(_config, args, options) {
    const config = await runtimeConfig();
    const status = await getStatus(config);
    if (!status.ready) throw Object.assign(new Error("代理未就绪"), {
      code: "BRIDGE_NOT_READY", safeMessage: "本插件代理未就绪，未发送图片请求；请先检查 bridge_status",
    });
    return generateImage(config, args, options);
  },
};

// 配置、桥启动和外网都不能阻塞 MCP initialize；stdout 只由协议层写入。
const startup = runtimeConfig().then((config) => {
  if (!closing) return ensureRunning(config, { automatic: true });
}).catch((error) => {
  ctx.startupError = error.safeMessage ? error : {
    code: "BRIDGE_START_FAILED", safeMessage: "桥启动失败；请检查端口、配置和本版本 data/bridge.log",
  };
});

const stopInput = () => process.stdin.destroy();
process.once("SIGINT", stopInput);
process.once("SIGTERM", stopInput);
try { await runMcp(ctx, { handlers }); }
finally {
  closing = true;
  const shutdown = shutdownOwnedBridges();
  if (stopWatchdog) await stopWatchdog();
  await startup;
  await shutdown;
  process.off("SIGINT", stopInput);
  process.off("SIGTERM", stopInput);
}
