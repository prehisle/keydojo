# ⌨️ KeyDojo

**把快捷键练成肌肉记忆**：支持 VS Code、tmux、星际争霸 II，其他软件可以通过插件接入。

**[在线试用 →](https://prehisle.github.io/keydojo/)**

- **练你自己的键位**：导入 VS Code 的 `keybindings.json` 或 `tmux list-keys` 的输出，练你真正在用的键位。
- **间隔重复**：根据对错和反应速度安排复习，按得犹豫也算没掌握。
- **速度模式**：限时作答，适合练星际争霸热键。
- **场景练习**：多步骤计时练习，记录每步用时和个人最佳，比如星际争霸 II 三个种族的开局流程。
- **完整支持按键序列**：组合键 `Ctrl+Shift+P`、和弦 `Ctrl+K Ctrl+S`、前缀键 `Ctrl+B %`、连按 `B B` 都支持。
- **插件以数据为主**：接入一个新软件，通常只需要写一个快捷键数据文件。

## 快速开始

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test
pnpm build
```

## 浏览器限制

`Ctrl+W`、`Ctrl+T`、`Ctrl+N` 等快捷键会被浏览器截走，网页拿不到。KeyDojo 会自动识别这些快捷键，在列表中置灰并跳过。在 Chrome/Edge 中点右上角的「Fullscreen · capture all keys」，可以用 Keyboard Lock API 捕获它们。之后的桌面版（Tauri）会彻底去掉这个限制（`Alt+Tab` 这类系统级快捷键除外）。

练习时请切换到英文输入法，输入法会拦截按键事件。

## 贡献

欢迎提交新插件，或修正快捷键数据，见 [CONTRIBUTING.md](./CONTRIBUTING.md)。
