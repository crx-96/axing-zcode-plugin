# 第三方软件与许可证

## CLIProxyAPI

本插件使用并随附 **CLIProxyAPI**，提供 OpenAI 兼容 API、服务商适配、模型列表、OAuth 管理及图片生成接口。插件自己的代码负责 ZCode MCP 接入、本机进程托管、本地配置和授权辅助，不应被理解为这些上游能力的原创实现。

| 项目 | 值 |
| --- | --- |
| 上游仓库 | https://github.com/router-for-me/CLIProxyAPI |
| 随附版本 | 固定 `v8.0.38`；Windows x64、macOS x64/arm64、Linux x64/arm64 |
| 对应源码 | https://github.com/router-for-me/CLIProxyAPI/tree/v8.0.38 |
| 发布页 | https://github.com/router-for-me/CLIProxyAPI/releases/tag/v8.0.38 |
| 许可证 | MIT，原文保存在 [`bridge/bin/LICENSE`](bridge/bin/LICENSE) |
| 原程序名 | Windows：`cli-proxy-api.exe`；macOS/Linux：`cli-proxy-api` |
| 修改情况 | 仅重命名文件，不修改二进制内容，不隐藏上游身份 |
| 平台与来源清单 | [`bridge/bin/platforms.json`](bridge/bin/platforms.json)，路径相对 `bridge/bin/` |

随附二进制的路径与 SHA256（上游 `amd64` 对应 Node `x64`，`aarch64` 对应 `arm64`）：

| 平台/架构 | 插件内路径 | 二进制 SHA256 |
| --- | --- | --- |
| Windows x64 | `bridge/bin/zcode-plugin-subscription-proxy.exe` | `9a97f1338c11502ba7ccf6f8643f1ae88a4398bc436fe0551a522c3d9c3cc48d` |
| macOS x64 | `bridge/bin/darwin-x64/zcode-plugin-subscription-proxy` | `c4f3b72d19a24d05b55a75db9423741650c2348a790cf4e7b24cab99a09be813` |
| macOS arm64 | `bridge/bin/darwin-arm64/zcode-plugin-subscription-proxy` | `496e32ce87c07464803f3afec03bccf3fb522385829deb385c8274783debac84` |
| Linux x64 | `bridge/bin/linux-x64/zcode-plugin-subscription-proxy` | `6f82ae9900708679560aeb6a83902bac8f88dc22e5d834a260fd43deee75a917` |
| Linux arm64 | `bridge/bin/linux-arm64/zcode-plugin-subscription-proxy` | `523e383a8f23c7af9c71f328b5453f347e4d355b3208c00914539ea77c380687` |

官方归档与 GitHub Release API `digest` 中的 SHA256：

| 官方发布资产 | 归档 SHA256 |
| --- | --- |
| [CLIProxyAPI_8.0.38_windows_amd64.zip](https://github.com/router-for-me/CLIProxyAPI/releases/download/v8.0.38/CLIProxyAPI_8.0.38_windows_amd64.zip) | `4b54808ee28174dca5ac10f711d33958043609ed3dc0c92bbcef63329f3a59f3` |
| [CLIProxyAPI_8.0.38_darwin_amd64.tar.gz](https://github.com/router-for-me/CLIProxyAPI/releases/download/v8.0.38/CLIProxyAPI_8.0.38_darwin_amd64.tar.gz) | `e7e36545d5badc8d16cccc2e27d776cfe10ae5c2d220274fce22681ec9770ff3` |
| [CLIProxyAPI_8.0.38_darwin_aarch64.tar.gz](https://github.com/router-for-me/CLIProxyAPI/releases/download/v8.0.38/CLIProxyAPI_8.0.38_darwin_aarch64.tar.gz) | `58899af288fc25bf5b9c8a59dc936ca375c331addfa7b4e4ecc1f13fba00d5d3` |
| [CLIProxyAPI_8.0.38_linux_amd64.tar.gz](https://github.com/router-for-me/CLIProxyAPI/releases/download/v8.0.38/CLIProxyAPI_8.0.38_linux_amd64.tar.gz) | `05690c53245a149230a8b7d64085ed96036275a72414d0097f88bb6314acb39b` |
| [CLIProxyAPI_8.0.38_linux_aarch64.tar.gz](https://github.com/router-for-me/CLIProxyAPI/releases/download/v8.0.38/CLIProxyAPI_8.0.38_linux_aarch64.tar.gz) | `a1282bbbaa3a9ca9e5c36865d1a840e2902b783bbda4894935c04befdb623c29` |

新增四个 macOS/Linux 核心均来自上述官方非 `no-plugin` 归档：下载后先将完整归档 SHA256 与 `gh api repos/router-for-me/CLIProxyAPI/releases/tags/v8.0.38` 返回的 digest 比对，再拒绝不安全路径、符号/硬链接及特殊条目，仅提取唯一普通文件 `cli-proxy-api` 到固定目标路径。提取后独立记录二进制 SHA256，临时归档不随插件分发。Windows 核心沿用原文件及路径，重新核对二进制哈希，本次未重新下载 Windows 归档；表中的 Windows 归档哈希来自同一 Release API。

POSIX 核心分发权限要求为 `0755`（清单中的 `mode`）。Windows 文件系统不保证保留 POSIX 执行位，跨平台打包或检出时须保留/恢复此权限；配置解析本身不修改核心权限。不提供 Windows ARM64 或其他平台/架构核心，`BRIDGE_BIN` 高级覆盖不扩展平台支持。

这些哈希用于核对本仓库随附文件和固定版本来源，不等于数字签名或对未来上游下载的背书。更新二进制时，应重新核对来源、版本、许可和兼容性，同步清单、本说明与测试。

上游版权行按原许可保留（包括原文中的日期格式）：

```text
Copyright (c) 2025-2005.9 Luis Pater
Copyright (c) 2025.9-present Router-For.ME
```

随附上游 [`README.md`](bridge/bin/README.md)、[`README_CN.md`](bridge/bin/README_CN.md) 和 [`config.example.yaml`](bridge/bin/config.example.yaml) 保留作为来源与维护参考。其中的赞助、推广、其他产品及示例配置属于上游内容，不代表本插件推荐或保证；普通用户应以本插件 [README](README.md) 的本机安全配置为准。上游示例里的空主机或远程管理配置不适用于本插件。

CLIProxyAPI 及其依赖仍受各自许可约束；MIT 不表示所有第三方依赖、商标或远程服务也由本仓库重新许可。本修订管理网页按下节固定分发，不再依赖核心的周期自动下载。

## CLI Proxy API Management Center

- 来源：https://github.com/router-for-me/Cli-Proxy-API-Management-Center ，固定发布 `v1.26.7`。
- 原资产：[management.html](https://github.com/router-for-me/Cli-Proxy-API-Management-Center/releases/download/v1.26.7/management.html)，随包原样保存在 `bridge/panel/management.upstream.html`。
- SHA256：`8c9c6b7d3fb311e6aad5d06e1993e53a2d28389e640448a1bc6304ed20b057b5`，已与该 release 提供的资产 digest 核对。
- MIT 许可和 `Copyright (c) 2026 Router-For.ME` 声明全文见 [`bridge/panel/LICENSE`](bridge/panel/LICENSE)。
- 修改由 [`bridge/management-panel.mjs`](bridge/management-panel.mjs) 可复现生成：仅 Antigravity 使用 `is_webui=false`、校验回调地址与当前 state、补充中英文手动回填说明。上游原资产和代理二进制不直接修改。
- 生成页位于插件专属数据目录 `management-panel/<SHA256>/`，核心通过进程级 `MANAGEMENT_STATIC_PATH` 读取；周期自动更新被禁用，后续上游更新需同步来源、哈希、补丁和验证。

## 操作系统、ZCode 与 Node.js

插件使用 Windows PowerShell、.NET Framework/Win32 API、macOS/Linux 系统能力和当前 ZCode Desktop 的 Node 运行时，不在仓库中重新分发操作系统、ZCode 或 Node。相关产品和运行时遵循各自许可及使用条款。本仓库不是其官方扩展目录或授权发行方。

## 本仓库许可与免责声明

插件原创代码的 MIT 许可随插件保留在 [`LICENSE`](LICENSE)，与仓库根目录的许可证一致。打包、转发或修改本插件时须保留适用版权及许可声明；本说明不替代完整许可证。使用风险与责任边界见 [`DISCLAIMER.md`](DISCLAIMER.md)。
