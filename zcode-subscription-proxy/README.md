# zcode订阅代理 · 0.2.5

基于 **[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)** 的 ZCode 第三方插件，将本人合法授权的订阅接入本机 OpenAI 兼容 API，并提供状态、启停和图片生成 MCP 工具。它不是 ZCode、CLIProxyAPI、OpenAI 或 Google 官方产品，也不赠送订阅、额度或账号权限。

> 使用前阅读 [免责声明](DISCLAIMER.md) 和 [第三方软件与许可证](THIRD_PARTY_NOTICES.md)。管理密码固定为 **`123456`**，只能用于可信个人电脑上的回环服务，不能暴露到局域网或公网。

## 支持平台和版本

| 项目 | 0.2.5 的范围 |
| --- | --- |
| Windows | Windows 10 **22H2 x64** / Windows 11 **x64**；保留 PowerShell 5.1、.NET Framework 和 Job Object 托管。Windows 10 是兼容目标，尚未单独验收 |
| macOS | Intel x64 / Apple Silicon ARM64；使用 POSIX 本地市场、系统 `/bin/sh`、ZCode 内置运行时或已有 Node 22+。具体最低系统版本取决于 ZCode 与上游核心，尚未实机确定 |
| Linux | x64 / ARM64；使用 POSIX 本地市场、`/bin/sh`、`ps`、`readlink`、`/proc` 和 ZCode 内置运行时或已有 Node 22+。不保证所有发行版及 musl/Alpine 兼容 |
| 实测系统 | 本次开发机为 Windows x64，系统构建号 `10.0.26340`；macOS/Linux 原生测试已提供，但本机无法执行，不冒充实机通过 |
| ZCode | 按 ZCode Desktop `3.16.2.8769` 的第三方插件接口检查；没有跨平台 MCP 命令条件字段，故分别提供 Windows 与 POSIX 清单 |
| 已确认内置运行时 | Windows ZCode `3.16.2.8769` 内置 Node `24.14.0` / Electron `41.0.3`；POSIX 启动器会探测候选运行时，不静默安装 Node |
| 开发环境 | Node.js 22+；本机回归使用 Node `26.4.0`，CI 配置为 Node 22 |
| 代理核心 | 固定 CLIProxyAPI `v8.0.47`；包内只保留五平台清单、文档与许可证，宿主启动 MCP 进程时自动准备当前系统/架构核心，校验归档与二进制 SHA256 后缓存 |
| 首次核心下载依赖 | 系统可用的 `curl`（HTTPS）；归档校验与安全解压由插件的 Node 实现完成，不另装解压工具。核心后台准备独立预算 10 分钟（600 秒），不阻塞 MCP 握手，无自动重试；离线可用 `BRIDGE_BIN` 覆盖 |
| 不支持 | Windows 32 位、原生 Windows ARM64、其他操作系统和架构；ARM64 x64 仿真未验证 |

企业设备若禁止 PowerShell、`Add-Type` 或创建 Job Object，插件会失败并报告，不会要求关闭系统安全策略。启动参数中的 `-ExecutionPolicy Bypass` 仅限当前脚本进程，不更改全局执行策略；组织策略仍优先。

## 安装

**Windows**：按 [仓库市场安装说明](../README.md#添加市场与安装) 添加整个仓库，再安装 **zcode订阅代理 0.2.5**。

**macOS / Linux**：当前宿主不能在同一 MCP 清单内按平台选择命令，默认清单仍为 Windows 入口。先下载完整仓库，在仓库根目录执行：

```sh
sh zcode-subscription-proxy/scripts/prepare-posix-marketplace.sh "$HOME/zcode-subscription-marketplace"
```

将输出的新目录（不是插件子目录）添加到插件市场，再安装 `0.2.5`。脚本不需要 Node/npm，不修改原始源码、安装缓存或用户设置；只创建新的本地分发副本，已存在的目标不会覆盖。更新时从新源码生成新目标，再在市场源管理中使用该副本；同名市场不应同时绑定不同来源。默认 GitHub 市场入口目前只适用于 Windows。

POSIX 启动器优先从当前 ZCode 祖先进程发现可用内置运行时，随后尝试已有 Node 和常见 ZCode 安装位置；每个候选均验证 Node 22+ 后再运行 MCP。缺失时明确报错，不安装全局工具。管理网页授权、API 和图片保存不依赖 PowerShell；`.cmd` 授权助手仅为 Windows 的可选备用方式。

插件 ID：`zcode-subscription-proxy@axing-zcode-plugins`。安装后在 **设置 → 插件** 确认已启用，并在宿主 MCP 设置中连接/重连插件。**宿主拉起 MCP 进程即可自动准备，不需要先有聊天模型、账号或工具调用**。宿主何时自动连接 MCP 尚需官方证据，不能把“打开空白窗口”视为必然触发；新任务可能刷新旧工具列表，但不是本插件开始准备的内部条件。

本插件和旧 `subscription-bridge` 是不同插件，不是其 `0.0.2` 的自动降级更新。本插件不复制旧账号、密码、日志和运行配置，默认端口也不同。若不再需要旧插件，请在 ZCode 中手动禁用它，并按旧插件的停止方式结束旧代理；新版不会杀掉旧代理或用户自行运行的 CLIProxyAPI。

## 首次使用：打开管理网页并授权

1. 在宿主 MCP 设置中连接插件。MCP 读取本地配置后即完成握手，当前平台核心在后台准备并自动启动本地代理，**无需先向 AI 发消息或调用 `bridge_start`**。MCP 显示已连接时核心可能仍在下载；等待代理就绪后浏览器访问 **<http://127.0.0.1:18787/management.html>**，没有账号或聊天模型也可进入管理页。
2. 管理页面如要求服务地址，填 `http://127.0.0.1:18787`；管理密码填 **`123456`**。这不是模型 API Key。
3. 在管理页面的 **OAuth / 账号授权** 区域选择服务商。授权页面由 CLIProxyAPI 提供，菜单文字可能随上游页面更新变化。
4. 在服务商自己的页面登录本人账号并明确同意授权。完成后回到管理页检查账号和授权状态，再按下节配置聊天模型。
5. 已有可用聊天模型后，可选发送：**“检查 zcode订阅代理的 bridge_status，只检查状态，不生成图片。”** 应返回 `ready: true`、管理地址和模型列表。`ready` 只表示本机代理与模型列表接口可用，不保证账号具有付费模型权限；没有账号时模型列表可为空，这不阻止初始化成功。

**主动暂停**：`bridge_stop` 持久暂停代理，并取消本会话的在途核心下载/启动。重连后仍可完成 MCP 握手和查询状态，但不会自动下载或启动；显式 `bridge_start` 才解除暂停。缺失或不可执行的自定义 `BRIDGE_BIN` 会在尝试启动时报告工具或后台故障，不会阻止管理 MCP 连接。

缺少有效缓存时，后台准备使用系统 `curl` 访问平台清单中固定的 HTTPS 官方发布地址，先验证归档 SHA256，再安全提取并验证核心 SHA256，成功后才发布缓存并自动启动代理。`initialize` 成功只代表管理 MCP 可用；下载期间可使用 `tools/list`、`ping` 和 `bridge_status`，状态为 `ready: false`、`core.state: "downloading"`，图片请求会立即返回未就绪。准备失败保留连接，`bridge_status` 显示 `startupError` 或 `core.reason`，stderr 只写安全摘要；修复原因后调用 `bridge_start` 或在 **宿主 MCP 设置中重连**即可重试。并发启动复用同一次准备，不重复下载；失败、超时或取消不自动重试，也不静默换版本或平台。`bridge_status` 和后台 watchdog 不下载核心。本地配置不可用仍会导致初始化失败并非零退出。

后台核心准备使用独立的 **10 分钟（600 秒）**预算，覆盖等待下载锁、下载、校验和解压；curl 建立连接最多等待 **60 秒**，单次传输最多 **9 分钟（540 秒）**，为校验和解压预留余量，所有阶段仍受剩余总预算约束。代理启动沿用生命周期模块的有界超时。已移除覆盖网络下载的 50 秒初始化预算，无需依赖提高宿主握手超时。EOF、断管或进程退出信号会取消在途准备，待本次临时文件和子进程清理完成后退出。`ZCODE_HTTP_PROXY` 优先于常见代理环境变量（HTTPS 下载使用 `https_proxy`/`HTTPS_PROXY`，并保留 curl 的 `ALL_PROXY`/`all_proxy`、`NO_PROXY`/`no_proxy` 规则；仅设置 `HTTP_PROXY` 不保证用于 HTTPS）；不要把含密码的代理地址发到聊天或日志。

默认 `dataDir` 为 `~/.zcode/zcode-subscription-proxy/data`（Windows 对应 `%USERPROFILE%\.zcode\zcode-subscription-proxy\data`）。缓存路径为 `dataDir/runtimes/v8.0.47/<platform-arch>/<basename(platforms.json.path)>`，例如 Linux x64 的 `runtimes/v8.0.47/linux-x64/zcode-plugin-subscription-proxy`，Windows x64 的 `runtimes/v8.0.47/win32-x64/zcode-plugin-subscription-proxy.exe`。升级插件沿用同一版本核心缓存，不复制其他平台文件。离线使用时，设置 `BRIDGE_BIN` 指向自行准备的可信当前平台 CLIProxyAPI v8 可执行文件；该覆盖不触发下载，也不自动替换文件或修改其权限。

管理页随插件固定提供（上游管理中心 `v1.26.7`），启动前校验原资产 SHA256 并生成带 Antigravity 兼容补丁的独立副本。首次打开无需下载页面；Google 授权及模型请求仍需要正常网络。为避免补丁被覆盖，启动时将 `management.disable-auto-update-panel` 设为 `true`，其他配置和原 `static/management.html` 不变。管理页后续更新随插件维护，不再自动追踪上游页面发布。

### 在 ZCode 中配置聊天模型

在 ZCode 的模型/供应商设置中添加兼容 OpenAI 的供应商：

- **Base URL**：`http://127.0.0.1:18787/v1`
- **API Key**：在本机数据目录的 `launcher-secrets.json` 中查看 `apiKey`，复制到供应商设置。Windows 为 `%USERPROFILE%\.zcode\zcode-subscription-proxy\data`，macOS/Linux 为 `~/.zcode/zcode-subscription-proxy/data`。不要发给 AI、截图公开或提交到仓库。
- **协议**：按目标模型选择 Chat Completions 或 Responses。
- **模型**：使用管理页面或 `bridge_status` 实际列出的聊天模型。不要把 `gpt-image-*` 设置成聊天主模型。

API Key 首次随机生成并持久保留，**不是 `123456`**。插件升级不会自动轮换 API Key 或清空授权。首次接入不要求先配置其他聊天模型：由宿主启动/重连插件 MCP，自动准备成功后即可打开管理页授权，再配置本地供应商。若宿主尚未启动 MCP 进程，插件无法自行触发宿主连接；不要把打开空白窗口等同于代理已经就绪。

### 自主模式与审批模型

根据 **2026-10-25 本机 ZCode 静态实现核对**，Autonomous mode 对应 `guarded`：对识别出的危险命令请求一次人工确认，不发起独立模型审批请求；`auto` 模式仍保留为未实现分支。这不是 Qoder 的 AI 审批机制。

本插件不接管宿主权限决定，也不把普通 GPT 聊天重定向到 `codex-auto-review`。模型目录中出现该模型，不意味着自主模式会使用它。以上边界仅针对本次核对的宿主实现；后续宿主若提供独立审批请求或接口，需重新核对后再评估接入。

## Antigravity 授权失败的处理

### 已确认的问题

CLIProxyAPI v8.0.38 的网页授权流程固定使用 `http://localhost:51121/oauth-callback`。Windows 可能将 `51121` 纳入 TCP 保留范围，导致管理页授权返回 500，日志包含：

```text
failed to start antigravity callback forwarder
listen ...:51121: bind: An attempt was made to access a socket in a way forbidden by its access permissions
```

这是**本地回调监听失败**，不能据此认定 Google 账号失效、订阅不支持或出站代理错误。网页流程不会读取 CLI 的 `--oauth-callback-port` 覆盖参数。参考 [上游问题 #499](https://github.com/router-for-me/CLIProxyAPI/issues/499)。

### 网页授权：不再依赖回调端口

**0.2.5** 沿用已有的 Antigravity 网页修复：授权请求使用 `is_webui=false`；Codex、Claude 等其他服务商流程不变。三种系统均使用同一管理页与手动回填流程。仍使用原管理页按钮和回调表单，不需要命令行，也不会监听 `51121`。

1. 打开管理页，进入 **OAuth 登录 → Antigravity**，开始授权并点击 **打开链接**。
2. 在 Google 页面由本人完成登录和同意授权。
3. 跳回 `http://localhost:51121/oauth-callback?...` 后显示无法访问是预期现象。复制浏览器地址栏的**完整 URL**。
4. 回到管理页的 Antigravity 弹窗，粘贴到回调输入框并提交。页面会核对固定回调地址和本次 `state`，不接受其他授权流程的链接。
5. 等待页面显示 **认证成功**；“回调已提交”本身不等于登录成功。请在 5 分钟内完成，不要将回调地址发到聊天或日志。

这解决了生成授权链接时的回调服务启动失败，但不是全自动回跳；账号授权仍需手动复制一次 URL。Google 网络、地区和账号权限错误不会被该补丁绕过。

**已有 0.0.1 / 0.1.0 / 0.1.1 / 0.2.0 / 0.2.1 / 0.2.2 / 0.2.3 / 0.2.4 安装的更新方式**：先在没有进行中请求时调用 `bridge_stop`，刷新指向新源码的市场，再进入插件详情点击 **更新**，确认版本 `0.2.5`。关闭旧任务或断开旧 MCP，更新后新建任务并调用 `bridge_start` 解除暂停。不要删除数据目录，已有 API Key 与授权会保留。没有发布到 GitHub 的源码变更，应使用本地目录市场，不会自动出现在 GitHub 市场。

### 不改系统端口的命令行授权助手（备用）

本插件附带 [Antigravity授权.cmd](Antigravity授权.cmd)，使用上游已有的手动回填接口，**不监听 51121**。

1. 保持 ZCode 任务与本插件 MCP 运行，确认 `bridge_status` 为就绪。
2. 在本地插件目录双击 `Antigravity授权.cmd`。可以使用下载的本仓库中的该文件；无须修改安装缓存，也不需要 Node。
3. 助手打开 Google 授权页面，由你本人登录并确认。
4. 浏览器最后跳到 `http://localhost:51121/oauth-callback?...`。由于此方案刻意没有监听该端口，浏览器显示“无法访问”是预期情况。
5. **复制浏览器地址栏的完整地址，粘贴到本机助手窗口并回车**。助手以隐藏输入读取，不要把该地址发到聊天、issue 或日志；它包含短期授权码。
6. 助手只向 `127.0.0.1` 提交回调，再查询上游授权状态。只有出现明确成功提示才算授权完成，最后在管理页检查账号。

请在发起流程后的 **5 分钟内**完成。过期、取消或失败后先检查错误原因，重新发起是一个新的授权流程，不复用旧 URL。若出站网络不可达，仍需修复正常网络或管理配置中的 `requests.proxy-url`；本助手解决的是本地回调端口冲突，不保证 Google token 交换、地区或账号权限一定成功。

默认端口是 `18787`。高级用户修改了端口时，在本插件目录执行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\antigravity-login.ps1 -Port 你的端口
```

助手固定使用回环地址和管理密码 `123456`，不会读取旧插件的随机管理密钥。无需删除 Windows 端口保留范围、禁用 Hyper-V/WSL、关闭防火墙或以管理员身份登录。

## 自动启动与退出清理

**当前支持的是 MCP 生命周期，不是桌面全局 AppStart/AppExit。**

- 宿主拉起 MCP 进程后，握手只等待本地配置。核心校验/按需下载及自动启动或复用代理在后台进行，不等待模型或工具调用；`bridge_status.ready` 表示代理实际就绪。没有账号时模型列表可为空。
- 核心后台准备预算为 10 分钟（600 秒），失败或超时保留 MCP 连接并显示安全原因；显式 `bridge_start` 或宿主重连可重试。watchdog 不下载或自动重试失败下载。`bridge_stop` 取消本会话在途准备并持久暂停；EOF、断管和退出信号会取消准备并清理本次拥有的资源。
- 插件只保证 MCP 进程已被宿主启动后的行为；宿主自动连接时机仍需官方证据，不能承诺打开空白 ZCode 一定启动代理。握手与后台准备分离，不依赖延长宿主握手时限。Windows/POSIX 清单均声明 `timeoutMs: 660000`（11 分钟），为显式 `bridge_start` 等待核心准备后的启动留出余量；宿主是否采纳该字段仍取决于其实现，不能据此保证宿主的实际请求时限。
- Windows 代理文件名为 `zcode-plugin-subscription-proxy.exe`，macOS/Linux 为 `zcode-plugin-subscription-proxy`，均位于数据目录的固定版本/平台缓存中。默认使用独立端口 `18787` 和数据目录，不使用旧版 `8787` 或普通 CLIProxyAPI 默认 `8317`。POSIX 默认缓存核心若丢失执行位，仅在 SHA256 校验通过后恢复 `0755`；自定义 `BRIDGE_BIN` 不会被改权限。
- Windows 继续使用 Job Object：正常 EOF、MCP 退出及托管器异常终止时回收其拥有的代理。
- macOS/Linux 使用独立 Node 托管器和 stdin 存活租约：MCP 正常结束或被强杀后，租约关闭，托管器先发 TERM，超时再发 KILL 并确认子进程退出。跨会话停止通过带随机令牌的回环控制端点完成，不依据记录 PID 直接杀进程。托管器自身被 `SIGKILL` 时无法执行清理，不具备 Windows Job 的内核级保证；若控制端点失联但记录的 PID 仍存在，会拒绝接管和重复启动，应人工核实该实例后处理。
- 生命周期锁在 Windows 使用命名管道，在 POSIX 使用数据目录真实路径哈希对应的回环端口；持锁进程退出由系统释放。锁端口碰撞时只等待并报错，不抢占其他服务。所有平台均不创建系统服务、计划任务或开机自启项。
- 多任务可复用同一代理，但代理有明确的创建者。非创建者任务结束不会主动杀掉共享代理；创建者 MCP 被回收时，其代理会关闭，其他仍连接的任务可在健康检查后重新启动。此时正在进行的请求可能中断，**不自动重放**。
- 当前宿主可能延迟约 30 秒回收空闲 MCP。关闭某个任务、关闭窗口与真正退出 ZCode 不是完全相同的事件。是否最小化到托盘按 ZCode 设置决定。
- `bridge_stop` 明确停止并持久暂停自动恢复，也取消本会话的在途核心准备；重新连接 MCP 仍遵守暂停，不自动下载或启动。MCP 连接可用，需显式 `bridge_start` 解除暂停。
- Windows 启停校验 PID、程序路径、命令行及创建时间；POSIX 校验持有子进程的托管器、随机实例 ID、控制令牌与程序/配置路径。无法确认归属就拒绝接管/终止，不会按进程名称批量结束进程。

在无法使用现有插件契约的情况下，本版不修改 ZCode 安装目录或系统设置来伪造桌面级启动支持。

## MCP 工具与图片

| 工具 | 用途 |
| --- | --- |
| `bridge_status` | 查看本机就绪状态、核心后台准备状态及失败原因、管理网页、凭据数量与模型；不返回账号 token 和 API Key |
| `bridge_start` | 解除暂停；必要时下载并校验当前平台核心，然后启动或复用本插件代理 |
| `bridge_stop` | 停止可确认归属的代理，取消本会话在途准备，并持久暂停自动恢复 |
| `bridge_generate_image` | 用已授权订阅生成一张图片；可能消耗额度或产生费用 |

`0.2.5` 在 MCP 初始化说明和工具描述中同步声明：当前聊天主模型为 GPT（包括 Codex 订阅），且用户未指定生图工具或通道时，优先使用本插件的 `bridge_generate_image`；用户明确指定的工具优先。非 GPT 会话不按此规则改道，不按图片模型倒推聊天模型；仅适用于文生图，不支持参考图编辑。工具不可用或生成失败时说明原因，不擅自换通道、换模型或重试。此处是工具选择指引，实际选择仍受宿主指令、工具权限和聊天模型行为影响。

图片示例：**“调用 zcode订阅代理的 bridge_generate_image，用 gpt-image-2.5 生成一张白底绿色三角形。”**

支持 `prompt`、`model`、`size`、`quality`、`background`、`output_format`。默认图片模型 `gpt-image-2.5`，可指定账号实际支持的模型；本 MCP 不自动换模型或重新提交请求，也不改变聊天主模型。**CLIProxyAPI 核心仍可能按配置轮换凭据、刷新授权并重试；单次 MCP 调用不保证上游只执行一次或只消耗一次额度。**仅文生图，每次一张，不接收参考图路径或 URL。原图保存在数据目录 `generated/`，小图可直接预览；Windows 的较大 PNG/JPEG 附带小预览，macOS/Linux 的大图和大 WebP 返回原图本地链接，不依赖额外图像工具。原图不会被压缩替换。保存前检查 PNG、常见 Huffman DCT JPEG（含渐进式）和静态 WebP 的结构及尺寸，像素上限为 4000 万；不支持动画 WebP，也不将结构检查等同于完整像素解码。上游不一定严格遵守请求尺寸和质量参数。

## 数据、配置与安全

默认数据目录：Windows 为 `%USERPROFILE%\.zcode\zcode-subscription-proxy\data`；macOS/Linux 为 `~/.zcode/zcode-subscription-proxy/data`。不在安装缓存内，不带插件版本号，升级保留账号，不自动跨机器迁移凭据。

- `runtimes/v8.0.47/<platform-arch>/<basename(platforms.json.path)>`：经 SHA256 校验的当前平台核心缓存，不含授权数据，不放进插件分发包。
- `launcher-secrets.json`：随机模型 API Key。
- `config.yaml`：CLIProxyAPI v8 运行配置；管理密码可能被上游改写成哈希。
- `auths/`：授权凭据，包括敏感 token；禁止共享。
- `bridge.log`：诊断日志，可能包含上游账号/请求信息，提交问题前必须自行脱敏。
- `bridge.pid`、`bridge.paused`：归属记录、主动暂停状态；POSIX 的 PID 记录包含本地控制令牌，也应作为敏感文件保护。退出后的陈旧 PID 记录不代表进程仍在运行。
- `management-panel/<SHA256>/management.html`：启动时生成的受控管理页；原 `static/` 保持不变。页面资产不包含账号凭据。
- `generated/`：原始图片。卸载插件不会自动删除授权、密钥、日志或图片。

管理密码 `123456` 是公开固定值，**不构成对本机其他用户或恶意软件的安全隔离**。仅允许服务监听 `127.0.0.1`，并强制 `management.allow-remote: false`；不要使用端口转发、反向代理、共享隧道或容器映射公开该端口。其他服务商网页 OAuth 的临时回调监听仍由上游实现，可能绑定 `0.0.0.0`；本修订的 Antigravity 网页和命令行助手均不创建回调监听。

Windows 文件实际访问权限由用户目录 ACL 决定；POSIX 新建私有目录使用 `0700`，密钥、运行配置、控制记录与图片使用 `0600`，既有自定义目录仍须由用户保证私密性。不要把数据目录放在共享盘或代码仓库。撤销访问请在服务商账号安全页面撤销授权，再按需要从管理页删除本地凭据；仅卸载插件不等于服务商撤销授权。

### 高级环境变量

| 变量 | 说明 |
| --- | --- |
| `BRIDGE_DATA_DIR` | 自定义独立数据目录，不会自动迁移旧数据 |
| `BRIDGE_PORT` | `1–65535` 十进制端口，默认 `18787`；变更后需同步既有 YAML 与客户端地址 |
| `BRIDGE_HOST` | 只允许 `127.0.0.1` |
| `BRIDGE_API_KEY` | 覆盖运行时 API Key，必须与已有 YAML 一致；不能等于公共管理密码 |
| `BRIDGE_MGMT_KEY` | 不设置或精确为 `123456`，其他值拒绝，避免文档与实际密码不一致 |
| `BRIDGE_BIN` | 离线/高级覆盖：兼容当前系统和架构的可信 CLIProxyAPI v8 可执行文件路径；不下载或自动替换该程序，自定义 POSIX 程序需已具有执行权限；不会绕过平台支持范围 |
| `ZCODE_HTTP_PROXY` | 首次核心 HTTPS 下载的优先代理；未设置时使用 curl 支持的常见代理环境变量 |

不要修改安装缓存中的 `.mcp.json` 作为长期配置。若需要高级覆盖，应通过宿主支持的 MCP 环境配置管理，并保持所有任务输入一致。配置核对器支持标准 v8 单行标量、块映射、标量列表及映射列表（包括管理页保存的模型别名和供应商条目），不支持任意 YAML 锚点、多行或复杂流式集合。

## 故障排查

- **打不开管理页**：先在宿主 MCP 设置中确认插件已连接；MCP 初始化成功时核心可能仍在后台下载，需等待代理就绪。已有可用模型时可调用 `bridge_status` 查看下载状态及失败原因；准备失败可检查原因后重连重试，无需先有模型。曾主动 `bridge_stop` 的需显式 `bridge_start` 解除暂停。若仍看到旧授权提示，确认已重装此修订、停止旧进程并强制刷新网页。
- **端口冲突**：插件不会抢端口或杀别的代理。停止你确认不再需要的程序，或使用同步配置的独立端口。
- **网页提示密码错误**：确认访问的是 `18787` 新插件而非旧 `8787`；固定密码是 `123456`。不要在管理页把密码改成其他值。
- **模型 API 401**：API Key 不是管理密码，检查本地 `launcher-secrets.json` 中的 `apiKey` 与供应商设置。
- **上游 403/429/5xx**：分别可能涉及账号权限、配额/速率或网络/服务异常。先查看管理页，不把它当作本地进程异常反复重启。
- **MCP 已断连**：在 ZCode 的 MCP 设置中重连或新建任务；插件不能自行重建宿主管道。
- **macOS/Linux 报找不到 PowerShell**：安装的是默认 Windows 清单；按安装章节生成 POSIX 本地市场并使用该来源，不要编辑安装缓存。
- **POSIX 运行时缺失/太旧**：启动器只接受验证成功的 Node 22+ 或 ZCode Node 模式；确认当前 ZCode 安装可用。不会自动安装工具或修改 PATH。
- **核心下载失败或超时**：检查系统 `curl`、HTTPS 连通性、代理配置、临时目录和缓存目录权限；后台核心准备预算为 10 分钟（600 秒），失败保留 MCP 连接并报告原因，不自动重试。修复后显式 `bridge_start` 或在宿主设置中重连即可。哈希不匹配时不要跳过校验，应先核实来源；离线可使用可信 `BRIDGE_BIN`。如果 MCP 本身初始化失败，优先检查本地配置和运行时错误，而不是等待后台下载。
- **核心拒绝执行**：检查数据缓存目录或 `BRIDGE_BIN` 所在目录是否只读/noexec、系统架构及文件权限。macOS 的下载隔离/企业安全限制由系统执行；不自动移除隔离属性、关闭 Gatekeeper 或使用 sudo 绕过策略。

## 开发与验证

在仓库根目录执行（开发者需要 Node）：

```bash
node --test zcode-subscription-proxy/tests/*.test.mjs
```

`0.2.5` 在 Windows 使用 CLIProxyAPI `v8.0.47` 完成 253 项测试中的 238 项，15 项按平台条件跳过，0 失败，包含实际 ZCode 内置运行时与原生核心。真实账号生图及聊天模型的工具选择行为未作端到端验证。

普通 `node --test` **不会自动联网下载核心**。通用配置、协议、固定平台来源/哈希、打包白名单及托管器模拟测试离线运行。原生核心测试必须显式设置 `BRIDGE_TEST_BIN` 为预先准备且匹配当前平台固定 SHA256 的核心绝对路径；未设置时输出明确 skip。各原生 fixture 校验后复制到自身临时目录和随机端口，绝不直接运行或修改源测试核心，不读取正式授权，不进行付费生成或真实 OAuth。

例如 POSIX 开发者已准备好核心后执行 `BRIDGE_TEST_BIN=/absolute/path/to/zcode-plugin-subscription-proxy node --test --test-concurrency=1 zcode-subscription-proxy/tests/*.test.mjs`；Windows PowerShell 先设置 `$env:BRIDGE_TEST_BIN='C:\absolute\path\zcode-plugin-subscription-proxy.exe'`，再运行同一测试命令。Windows 原生 Job 测试只在 Windows 运行，POSIX 核心生命周期测试只在 macOS/Linux 运行。

仓库保留 Windows、Linux x64/ARM64、macOS Intel/Apple Silicon 的 GitHub Actions 测试矩阵（Node 22）。CI 在独立的显式下载步骤运行 `scripts/prepare-test-core.mjs`，通过生产 `loadConfig` 与 `ensureCore` 在 `RUNNER_TEMP` 下以隔离 data 和固定测试 API Key 准备当前平台核心，将路径写入 `GITHUB_ENV` 的 `BRIDGE_TEST_BIN`，后续测试继续复制隔离。脚本不读取用户 `BRIDGE_*` 配置，不启动代理，不包装自动重试；临时 runner 结束后回收源缓存。本地新增该配置不代表已经推送或云端通过。当前 Windows 开发机没有可运行的 Linux 容器/发行版，也没有 macOS 环境，原生 POSIX 用例在此跳过。自动化覆盖不等于真实账号端到端验收；安装、Google 登录、订阅权限和外网可用性仍取决于用户环境。

按需下载的二进制版本与哈希、源码链接和原始 MIT 许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。当前源码和 POSIX 分发副本不再含五平台核心，但旧 Git 提交仍保留大文件；本次不自动重写历史，完整克隆的历史对象大小不会因此自动缩小。不包含用于让 AI 复刻插件的 PROMPT.md 或开发指令文档。
