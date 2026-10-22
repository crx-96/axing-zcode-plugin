# 阿星的 ZCode 插件集合

一个可添加到 ZCode 的插件市场。各插件独立放在仓库根目录，市场清单位于 [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json)。

## 插件

| 插件 | 版本 | 平台 | 说明 |
| --- | --- | --- | --- |
| [zcode订阅代理](zcode-subscription-proxy/README.md) | 0.1.1 | Windows x64；macOS / Linux x64、ARM64 | 基于 CLIProxyAPI 的本地订阅授权、OpenAI 兼容 API 与图片生成；macOS/Linux 先准备 POSIX 本地市场 |

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

1. 添加后进入 **个人 → axing-zcode-plugins**，找到 **zcode订阅代理**，确认版本 `0.1.1`，点击 **安装**。
2. 在 **设置 → 插件** 检查插件已启用；然后新建任务，让 ZCode 连接插件 MCP。
3. 按 [插件使用指南](zcode-subscription-proxy/README.md) 打开本机管理网页、登录并配置模型。
4. 更新时进入插件市场齿轮菜单的 **市场源**，刷新该市场，再进入插件详情点击 **更新**。仅刷新市场不会自动替换已安装插件。更新后新建任务或重连 MCP。

市场名称：`axing-zcode-plugins`。插件完整 ID：`zcode-subscription-proxy@axing-zcode-plugins`。

## 平台与启动边界

`0.1.1` 提供 Windows x64、macOS Intel / Apple Silicon、Linux x64 / ARM64 的核心与对应启动实现。Windows 保持原安装方式，macOS/Linux 使用上面的 POSIX 本地市场。具体运行依赖与实测边界见 [兼容性表](zcode-subscription-proxy/README.md#支持平台和版本)；当前开发机仅能实测 Windows，不能将静态架构校验和模拟测试视为 macOS/Linux 实机验收。Windows 32 位及原生 Windows ARM64 暂不支持。

当前 ZCode 没有面向普通插件的桌面级 AppStart/AppExit 钩子。本插件在 **会话连接 MCP 时** 自动启动代理；不是注册 Windows 开机任务或常驻系统服务，也不承诺只打开 ZCode 空白窗口就启动。MCP 结束或宿主退出时清理其拥有的代理，详见 [生命周期说明](zcode-subscription-proxy/README.md#自动启动与退出清理)。

## 添加更多插件

1. 在仓库根目录新增插件目录，并在其中放置 `.zcode-plugin/plugin.json`。
2. 插件目录名与 manifest 的 `name` 一致，保持稳定英文 ID；中文展示名放在市场条目中。
3. 将插件添加到 `.claude-plugin/marketplace.json` 的 `plugins` 数组，`source` 相对于仓库根目录。
4. 同步条目的版本、描述与插件 manifest，提供独立使用文档和许可证说明。市场不会自动枚举未登记的目录。
5. 发布前检查不能包含授权 token、密钥、个人路径、运行日志或生成文件；本仓库 `.gitignore` 已排除常见运行数据。

## 许可证

仓库原创代码遵循 [MIT License](LICENSE)。随附第三方程序、文档及其依赖按各自许可证分发，保留原版权声明。免责声明不替代或限制适用的第三方许可证，也不排除法律不允许排除的责任。
