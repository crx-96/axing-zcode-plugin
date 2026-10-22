import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { resolveBundledBinaryPath } from "../bridge/config.mjs";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const binRoot = join(pluginRoot, "bridge", "bin");
const metadata = JSON.parse(await readFile(join(binRoot, "platforms.json"), "utf-8"));
const notices = await readFile(join(pluginRoot, "THIRD_PARTY_NOTICES.md"), "utf-8");
const expected = {
  "win32-x64": {
    path: "zcode-plugin-subscription-proxy.exe",
    archive: "CLIProxyAPI_8.0.38_windows_amd64.zip",
    binarySha256: "9a97f1338c11502ba7ccf6f8643f1ae88a4398bc436fe0551a522c3d9c3cc48d",
    archiveSha256: "4b54808ee28174dca5ac10f711d33958043609ed3dc0c92bbcef63329f3a59f3",
  },
  "darwin-x64": {
    path: "darwin-x64/zcode-plugin-subscription-proxy",
    archive: "CLIProxyAPI_8.0.38_darwin_amd64.tar.gz",
    binarySha256: "c4f3b72d19a24d05b55a75db9423741650c2348a790cf4e7b24cab99a09be813",
    archiveSha256: "e7e36545d5badc8d16cccc2e27d776cfe10ae5c2d220274fce22681ec9770ff3",
  },
  "darwin-arm64": {
    path: "darwin-arm64/zcode-plugin-subscription-proxy",
    archive: "CLIProxyAPI_8.0.38_darwin_aarch64.tar.gz",
    binarySha256: "496e32ce87c07464803f3afec03bccf3fb522385829deb385c8274783debac84",
    archiveSha256: "58899af288fc25bf5b9c8a59dc936ca375c331addfa7b4e4ecc1f13fba00d5d3",
  },
  "linux-x64": {
    path: "linux-x64/zcode-plugin-subscription-proxy",
    archive: "CLIProxyAPI_8.0.38_linux_amd64.tar.gz",
    binarySha256: "6f82ae9900708679560aeb6a83902bac8f88dc22e5d834a260fd43deee75a917",
    archiveSha256: "05690c53245a149230a8b7d64085ed96036275a72414d0097f88bb6314acb39b",
  },
  "linux-arm64": {
    path: "linux-arm64/zcode-plugin-subscription-proxy",
    archive: "CLIProxyAPI_8.0.38_linux_aarch64.tar.gz",
    binarySha256: "523e383a8f23c7af9c71f328b5453f347e4d355b3208c00914539ea77c380687",
    archiveSha256: "a1282bbbaa3a9ca9e5c36865d1a840e2902b783bbda4894935c04befdb623c29",
  },
};

test("分发清单固定上游 v8.0.38 和五种平台，不包含 no-plugin 或 Windows ARM64", async () => {
  assert.equal(metadata.upstream, "router-for-me/CLIProxyAPI");
  assert.equal(metadata.version, "v8.0.38");
  assert.deepEqual(Object.keys(metadata.platforms).sort(), Object.keys(expected).sort());
  const entries = await readdir(binRoot, { withFileTypes: true });
  assert.deepEqual(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort(), [
    "darwin-arm64", "darwin-x64", "linux-arm64", "linux-x64",
  ]);
  assert.equal(entries.some((entry) => /\.(?:zip|gz|tmp)$/.test(entry.name)), false);
});

for (const [key, pinned] of Object.entries(expected)) {
  test(`${key} 核心路径、官方来源、SHA256 和文件架构一致，验证不执行核心`, async () => {
    const entry = metadata.platforms[key];
    const [platform, arch] = key.split("-");
    for (const field of ["path", "archive", "binarySha256", "archiveSha256"]) {
      assert.equal(entry[field], pinned[field], `${key}.${field}`);
      assert.ok(notices.includes(pinned[field]), `第三方声明缺少 ${key}.${field}`);
    }
    assert.equal(entry.url, `https://github.com/router-for-me/CLIProxyAPI/releases/download/v8.0.38/${pinned.archive}`);
    assert.doesNotMatch(entry.archive, /no-plugin/);
    const path = resolveBundledBinaryPath({ pluginRoot, platform, arch });
    assert.equal(path, join(binRoot, pinned.path));
    const file = await lstat(path);
    assert.equal(file.isFile(), true);
    const binary = await readFile(path);
    assert.equal(createHash("sha256").update(binary).digest("hex"), pinned.binarySha256);
    if (platform === "win32") {
      assert.equal(binary.subarray(0, 2).toString("ascii"), "MZ");
      const peOffset = binary.readUInt32LE(0x3c);
      assert.equal(binary.readUInt32LE(peOffset), 0x00004550);
      assert.equal(binary.readUInt16LE(peOffset + 4), 0x8664);
    } else {
      assert.equal(entry.mode, "0755");
      assert.deepEqual(await readdir(dirname(path)), ["zcode-plugin-subscription-proxy"]);
      if (platform === "darwin") {
        assert.equal(binary.readUInt32LE(0), 0xfeedfacf);
        assert.equal(binary.readUInt32LE(4), arch === "x64" ? 0x01000007 : 0x0100000c);
      } else {
        assert.equal(binary.subarray(0, 4).toString("hex"), "7f454c46");
        assert.equal(binary[4], 2);
        assert.equal(binary[5], 1);
        assert.equal(binary.readUInt16LE(18), arch === "x64" ? 62 : 183);
      }
    }
  });
}
