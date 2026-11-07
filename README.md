# opencode-warp-v2

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/Clevers-Dev/opencode-warp-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/Clevers-Dev/opencode-warp-v2/actions)
[![Warp Compatible](https://img.shields.io/badge/Warp-Terminal-00C7B7.svg)](https://warp.dev)
[![OpenCode v2 Compatible](https://img.shields.io/badge/OpenCode-v2.0%2B-green.svg)](https://opencode.ai)

Native **[Warp Terminal](https://warp.dev)** integration plugin specifically designed for **OpenCode 2.0+**.

Bridges OpenCode 2.0's event engine directly to Warp, giving you real-time visual status, native tab progress bars (`OSC 9;4`), animated spinners, multi-tab awareness, audio chimes, and native notifications.

---

## 💡 Why This Plugin?

The legacy `@warp-dot-dev/opencode-warp` plugin was written for OpenCode v1 and is broken in OpenCode 2.0+:
- **Plugin API Incompatibility**: OpenCode 2.0 completely overhauled its plugin loader. The legacy plugin fails with `Plugin must export a default definition with an id and an effect or setup function`.
- **Windows Buffer Issue**: The legacy plugin writes escape sequences to `process.stdout` when `/dev/tty` is missing. In OpenCode 2.0, stdout is captured by the Ink TUI/RPC layer, so escape sequences never reach Warp.
- **Multi-Tab Blindness**: While tools like `opencode-notifier` notify on finish, they don't show real-time progress while working, making it impossible to tell which Warp tab is thinking and which is ready.

**`opencode-warp-v2` fixes all of these issues.**

---

## ✨ Features

- ⏳ **Real-Time Multi-Tab Status**:
  - Thinking: `⏳ [OpenCode] Pensando...`
  - Tool execution: `⚡ [OpenCode] <tool>...`
  - Completed: `✅ [OpenCode] Listo`
  - Waiting for permissions: `⚠️ [OpenCode] Esperando permiso...`
- 📊 **Native Tab Progress Bar (`OSC 9;4`)**: Puts a progress pulse directly on the Warp tab while processing, and clears it cleanly upon completion.
- 🚀 **Warp CLI Agent Protocol (`warp://cli-agent`)**: Sends native `prompt_submit` and `stop` signals so Warp spins the tab spinner while OpenCode works and stops it when done.
- 🔔 **Native Warp Notifications & Chime**: In-app and desktop notifications (OSC 777 / OSC 9) plus terminal bell upon completion.
- 🪟 **True Windows & POSIX Console Support**: Writes directly to `//./CONOUT$` on Windows and `/dev/tty` on Unix/macOS, completely bypassing the TUI render pipe.
- 🤝 **Coexists with `opencode-notifier`**: Runs seamlessly alongside `@mohak34/opencode-notifier` without conflicts.

---

## 📦 Installation

### Option 1: Automatic Global Discovery (Recommended)

Clone this repository directly into your OpenCode global plugins folder:

```bash
# On Windows (PowerShell)
git clone https://github.com/Clevers-Dev/opencode-warp-v2.git "$env:USERPROFILE\.config\opencode\plugins\opencode-warp-v2"

# On macOS / Linux
git clone https://github.com/Clevers-Dev/opencode-warp-v2.git ~/.config/opencode/plugins/opencode-warp-v2
```

OpenCode 2.0 will automatically discover the plugin on its next launch! You can verify with:

```bash
opencode plugin list
```

You should see:
```text
ID                 VERSION  SOURCE
opencode-warp-v2   local    ...
```

---

## 📄 License

MIT © [Clevers Dev](https://github.com/Clevers-Dev) / Leo Araya Svensson
