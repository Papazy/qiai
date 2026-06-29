# QIAI — Terminal Command Assistant

Ask any terminal command question in plain language, get instant answers with a safety rating. Supports **OpenAI**, **Google Gemini**, and **OpenRouter** (free models available).

![demo](demo.gif)

## Install

```bash
npm install -g qiai
```

## Setup API Key

Pick at least one provider. The last key you set becomes the default.

```bash
qiai --set-openrouter-api-key YOUR_KEY   # Recommended — free models available
qiai --set-gemini-api-key YOUR_KEY
qiai --set-openai-api-key YOUR_KEY
```

Where to get keys:
- **OpenRouter** → https://openrouter.ai/keys
- **Gemini** → https://makersuite.google.com/app/apikey
- **OpenAI** → https://platform.openai.com/api-keys

---

## Two Ways to Use QIAI

### 1. One-line command

Fire a single question and get an answer immediately.

```bash
qiai -q "how to list all running processes"
qiai -q "compress a folder to tar.gz"
qiai -q "find files larger than 100MB"
```

Force a specific provider:

```bash
qiai -q "kill process by port" --openrouter
qiai -q "kill process by port" --gemini
qiai -q "kill process by port" --openai
```

Use a specific model on the fly:

```bash
qiai -q "check disk usage" -m meta-llama/llama-3-8b-instruct:free
```

### 2. Interactive mode

Run `qiai` with no arguments to enter an interactive session. Keep asking questions without retyping the command each time.

```bash
qiai
```

You'll see a prompt like `> `. Type your question and press Enter.

**Interactive commands:**

| Command | Description |
|---|---|
| `/help` | Show available commands |
| `/status` | Show current provider & model |
| `/provider openai\|gemini\|openrouter` | Switch provider for this session |
| `/model <model-id>` | Switch model for this session |
| `/list-models` | Browse & select a model interactively |
| `/clear` | Clear the terminal |
| `/exit` | Quit |

Example session:

```
> how to check open ports
> /provider gemini
> how to monitor network traffic
> /list-models
> how to backup a directory
> /exit
```

---

## Model & Provider Management

```bash
# List all available models
qiai --list-models

# Set a default model (auto-switches provider to match)
qiai --set-model google/gemini-2.5-flash:free   # → switches to OpenRouter
qiai --set-model gemini-2.5-flash               # → switches to Gemini
qiai --set-model gpt-4o-mini                    # → switches to OpenAI

# Manually set default provider
qiai --set-default-provider openrouter
qiai --set-default-provider gemini
qiai --set-default-provider openai
```

---

## Response Format

Answers come as a table with three columns:

| Column | Description |
|---|---|
| **Command** | The actual terminal command |
| **Description** | What the command does |
| **Danger Level** | Safety rating: Level 1 (safe) → Level 3 (destructive) |

Example:

```
┌─────────────────────────────────┬──────────────────────┬──────────────┐
│ COMMAND                         │ DESCRIPTION          │ DANGER_LEVEL │
├─────────────────────────────────┼──────────────────────┼──────────────┤
│ docker stop $(docker ps -q)     │ Stop all containers  │ Level 2      │
└─────────────────────────────────┴──────────────────────┴──────────────┘
```

---

## Troubleshooting

**Command not found after install**
```bash
npm install -g qiai
which qiai
```

**API errors** — check your key is valid and has quota. Test with:
```bash
qiai -q "list files" --openai
```

**No response** — rephrase your question to be more command-focused, e.g. *"how to restart nginx"* instead of *"nginx problem"*.
