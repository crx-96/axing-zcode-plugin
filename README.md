# 阿星的 ZCode 插件集合

一个可添加到 ZCode 的插件市场。各插件独立放在仓库根目录，市场清单位于 [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json)。

## 插件

| 插件 | 版本 | 平台 | 说明 |
| --- | --- | --- | --- |
| [zcode订阅代理](zcode-subscription-proxy/README.md) | 0.2.2 | Windows x64；macOS / Linux x64、ARM64 | 基于 CLIProxyAPI 的本地订阅授权、OpenAI 兼容 API 与图片生成；macOS/Linux 先准备 POSIX 本地市场 |

使用前请阅读 [免责声明](zcode-subscription-proxy/DISCLAIMER.md) 和 [第三方软件说明](zcode-subscription-proxy/THIRD_PARTY_NOTICES.md)。本仓库不是 ZCode、CLIProxyAPI 或模型服务商的官方项目。

## 添加市场与安装

### GitHub 方式

本仓库的变更发布到 GitHub 后，在 ZCode 的 **插件市场 → 添加 → 添加插件市场** 中填写：

```text
https://github.com/crx-96/axing-zcode-plugin
```

部分版本入口显示为 **设置 → 插件管理 → 发现 → +**。添加的是整个仓库，不是某个插件子目录，也不是 GitHub 的 `tree/main/...` 页面。

### 本地目录方式

下载并解压整个仓库，或克隆仓库；在相同的“添加插件市场”入口选择仓库根目录，即同时含有本 README、`.claude-plugin/` 和 `zcode-subscription-proxy/` 的目录。不要选择插件子目录。

### macOS / Linux 本地市场

当前 ZCode 第三方 MCP 清单不能按系统选择启动命令；仓库默认入口保留 Windows PowerShell。macOS / Linux **不要直接安装该默认入口**，先在已下载仓库的根目录运行：

```sh
sh zcode-subscription-proxy/scripts/prepare-posix-marketplace.sh "$HOME/zcode-subscription-marketplace"
```

脚本创建一个新的独立市场目录，用 POSIX 清单替换副本的启动入口，不修改原仓库、安装缓存或用户配置，也不下载程序。目标目录已存在时拒绝覆盖。将输出的目录添加到 ZCode 插件市场；后续升级使用新目标目录生成副本，再按宿主的市场源管理入口切换/添加对应本地源，不要与同名旧市场同时绑定。

### 安装及更新

1. 添加后进入 **个人 → axing-zcode-plugins**，找到 **zcode订阅代理**，确认版本 `0.2.2`，点击 **安装**。
2. 在 **设置 → 插件** 检查插件已启用，并在宿主 MCP 设置中连接/重连插件。宿主拉起 MCP 进程后会自动准备核心、启动代理，无需先配置聊天模型或让 AI 调用工具。
3. MCP 初始化成功后，继续等待后台核心准备和代理启动完成，再按 [插件使用指南](zcode-subscription-proxy/README.md) 打开本机管理网页、登录并配置模型；曾调用 `bridge_stop` 主动暂停的需显式恢复。
4. 更新时进入插件市场齿轮菜单的 **市场源**，刷新该市场，再进入插件详情点击 **更新**。仅刷新市场不会自动替换已安装插件。更新后新建任务或重连 MCP。

市场名称：`axing-zcode-plugins`。插件完整 ID：`zcode-subscription-proxy@axing-zcode-plugins`。

## 平台与启动边界

`0.2.2` 支持 Windows x64、macOS Intel / Apple Silicon、Linux x64 / ARM64，但分发包不再包含五平台 CLIProxyAPI 二进制。**宿主拉起插件 MCP 进程就会自动准备当前平台核心**：缺少有效缓存时只下载固定 `v8.0.38` 的当前平台核心，校验归档及二进制 SHA256 后缓存；平台清单、来源文档和许可证仍保留。Windows 保持原安装方式，macOS/Linux 使用上面的 POSIX 本地市场。具体运行依赖与实测边界见 [兼容性表](zcode-subscription-proxy/README.md#支持平台和版本)；当前开发机仅能实测 Windows，不能将静态架构校验和模拟测试视为 macOS/Linux 实机验收。Windows 32 位及原生 Windows ARM64 暂不支持。

MCP `initialize` 只等待本地配置加载，核心校验、下载和代理启动在后台进行，不阻塞握手，也不需要聊天模型、工具调用或已有账号。**MCP 已连接不等于代理已就绪**：下载期间 `bridge_status` 返回 `ready: false` 和 `core.state: "downloading"`；后台完成后自动启动代理，`ready: true` 时可打开管理页授权。下载失败仍保留 MCP，状态中显示原因，可通过 `bridge_start` 或宿主重连重试。`bridge_stop` 会取消本会话的在途准备并持久暂停，重连后也不自动下载或启动，需显式 `bridge_start` 恢复。watchdog 不下载或自动重试下载。

当前 ZCode 没有面向普通插件的桌面级 AppStart/AppExit 钩子，宿主何时连接 MCP 仍需官方证据。本插件只保证 **MCP 进程已被宿主启动后的行为**，不承诺打开 ZCode 空白窗口一定触发，也不注册开机任务或常驻系统服务。MCP 结束或宿主退出时清理其拥有的代理，准备期间的 EOF/取消也会中止准备并清理，详见 [生命周期说明](zcode-subscription-proxy/README.md#自动启动与退出清理)。

核心默认缓存位于 `~/.zcode/zcode-subscription-proxy/data/runtimes/v8.0.38/<platform-arch>/<basename(platforms.json.path)>`。下载使用 HTTPS `curl`，优先使用 `ZCODE_HTTP_PROXY`，否则沿用常见代理变量。后台核心准备保留独立的 **10 分钟（600 秒）**预算，超时只报告核心故障，失败不自动重试；不再使用覆盖下载与启动的 50 秒握手预算，也不依赖增大宿主握手超时。离线可通过 `BRIDGE_BIN` 指向自行准备且可信的当前平台核心，详见 [首次使用与下载说明](zcode-subscription-proxy/README.md#首次使用打开管理网页并授权)。

移除当前源码中的核心文件不会缩小旧 Git 历史：既有提交仍含大文件，完整克隆可能仍下载这些历史对象；本次不自动重写历史。

## 添加更多插件

1. 在仓库根目录新增插件目录，并在其中放置 `.zcode-plugin/plugin.json`。
2. 插件目录名与 manifest 的 `name` 一致，保持稳定英文 ID；中文展示名放在市场条目中。
3. 将插件添加到 `.claude-plugin/marketplace.json` 的 `plugins` 数组，`source` 相对于仓库根目录。
4. 同步条目的版本、描述与插件 manifest，提供独立使用文档和许可证说明。市场不会自动枚举未登记的目录。
5. 发布前检查不能包含授权 token、密钥、个人路径、运行日志或生成文件；本仓库 `.gitignore` 已排除常见运行数据。

## 许可证

仓库原创代码遵循 [MIT License](LICENSE)。按需下载的第三方程序、随附文档及其依赖遵循各自许可证，保留原版权声明。免责声明不替代或限制适用的第三方许可证，也不排除法律不允许排除的责任。
