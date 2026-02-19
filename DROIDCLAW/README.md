# DROIDCLAW Project

**Created:** 2026-02-18
**Purpose:** AI-powered Android phone automation using DroidClaw

---

## 📱 Device Connection

**Connected Device:** ✅
- **ID:** emulator-5554
- **Model:** sdk_gphone64_arm64 (Android Emulator - Pixel)
- **Transport:** emulator

---

## 🔧 Setup

### Installation Location
```
/Users/northsea/clawd-dmitry/DROIDCLAW/droidclaw
```

### Prerequisites Installed
- ✅ **Bun** v1.3.8 - JavaScript runtime
- ✅ **ADB** - Android Debug Bridge
- ✅ **DroidClaw** - Cloned from GitHub

### Dependencies
```bash
cd /Users/northsea/clawd-dmitry/DROIDCLAW/droidclaw
bun install  # ✅ Completed
```

---

## 🤖 DroidClaw Overview

**What it does:**
- Reads Android screen via ADB (accessibility tree)
- Uses AI to reason about what to do
- Executes actions: tap, type, swipe, launch apps, etc.
- Loops until goal is complete

**Three modes:**
1. **Interactive** - Type goal in plain English
2. **Workflows** - Multi-app AI-powered sequences (JSON)
3. **Flows** - Deterministic tap/type sequences (YAML, no AI)

---

## ⚙️ Configuration

**File:** `.env`

**Current Setup:**
- **LLM Provider:** Groq (free tier available)
- **Max Steps:** 30
- **Vision Mode:** fallback (screenshot when accessibility tree empty)
- **Step Delay:** 2 seconds

**To get Groq API key:**
1. Visit: https://console.groq.com
2. Create account (free tier available)
3. Get API key
4. Update `GROQ_API_KEY` in `.env`

---

## 🚀 Usage

### Interactive Mode
```bash
cd /Users/northsea/clawd-dmitry/DROIDCLAW/droidclaw
bun run src/kernel.ts

# Then type your goal, e.g.:
# "open youtube and search for lofi hip hop"
```

### Run Workflow
```bash
bun run src/kernel.ts --workflow examples/workflows/research/weather-to-whatsapp.json
```

### Run Flow
```bash
bun run src/kernel.ts --flow examples/flows/send-whatsapp.yaml
```

---

## 📚 Available Workflows

35 pre-built workflows organized by category:

- **Messaging:** WhatsApp, Telegram, Slack, Email
- **Social:** Instagram, YouTube, cross-posting
- **Productivity:** Calendar, notes, GitHub, notifications
- **Research:** Search, compare, monitor
- **Lifestyle:** Food, transport, music, fitness

Location: `examples/workflows/`

---

## 🎯 Capabilities

**Actions (28 total):**
- Basic: tap, type, enter, longpress, clear, paste, swipe, scroll
- Navigation: home, back, launch, switch_app, open_url, settings
- Clipboard: clipboard_get, clipboard_set
- Skills: read_screen, submit_message, copy_visible_text, find_and_tap
- System: screenshot, shell, keyevent, pull_file, push_file, wait, done

---

## 🔌 Remote Control (Optional)

**With Tailscale:**
1. Install Tailscale on Mac mini and Android device
2. Enable wireless debugging on Android
3. Connect ADB over network:
   ```bash
   adb connect <phone-tailscale-ip>:<port>
   ```
4. Control from anywhere in the world

---

## 📊 Project Structure

```
DROIDCLAW/droidclaw/
├── src/
│   ├── kernel.ts       # Main perception → reasoning → action loop
│   ├── actions.ts      # 28 action implementations
│   ├── skills.ts       # Multi-step compound actions
│   ├── workflow.ts     # Workflow orchestration
│   ├── flow.ts         # YAML flow runner
│   └── llm-providers.ts # LLM integrations
├── examples/
│   ├── workflows/      # 35 AI-powered workflows (JSON)
│   └── flows/          # 5 deterministic flows (YAML)
├── .env               # Configuration
├── .env.example       # Configuration template
└── package.json       # Dependencies
```

---

## 🧪 Testing

### Verify ADB Connection
```bash
adb devices
# Should show: emulator-5554
```

### Test Simple Command
```bash
adb shell pm list packages | head -10
```

### Test DroidClaw (requires API key first)
```bash
cd /Users/northsea/clawd-dmitry/DROIDCLAW/droidclaw
bun run src/kernel.ts
# Goal: open settings
```

---

## 📝 Next Steps

1. **Get API Key:**
   - Groq (free tier): https://console.groq.com
   - Or use Ollama (local, no key): https://ollama.com

2. **Update .env:**
   ```bash
   # For Groq:
   GROQ_API_KEY=your_actual_key_here
   
   # For Ollama:
   LLM_PROVIDER=ollama
   OLLAMA_MODEL=llama3.2
   ```

3. **Test with simple goal:**
   ```bash
   bun run src/kernel.ts
   # Try: "open settings and show battery info"
   ```

4. **Explore workflows:**
   ```bash
   ls examples/workflows/
   bun run src/kernel.ts --workflow examples/workflows/messaging/send-whatsapp-vi.json
   ```

---

## 🔗 Resources

- **GitHub:** https://github.com/unitedbyai/droidclaw
- **Docs:** https://github.com/unitedbyai/droidclaw/blob/main/README.md
- **Troubleshooting:** https://github.com/unitedbyai/droidclaw#troubleshooting

---

## ✅ Status

- ✅ Project cloned
- ✅ Dependencies installed
- ✅ Device connected (emulator-5554)
- ✅ Configuration file created
- ⏳ Awaiting API key to start automation

---

**Ready to automate your Android device!** 🤖
