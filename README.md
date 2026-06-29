# QIAI - Terminal Command Assistant

QIAI (Quick Assistant) is a CLI tool that helps you get relevant terminal commands quickly using AI (OpenAI GPT, Google Gemini, and OpenRouter).

## Installation

```bash
npm install -g qiai
```

## Quick Start

### 1. Set up API Keys
You need at least one API key to use QIAI:

```bash
# Set OpenRouter API key (Recommended, supports free models!)
qiai --set-openrouter-api-key your-openrouter-api-key

# Or set Gemini API key (becomes default)
qiai --set-gemini-api-key your-gemini-api-key

# Or set OpenAI API key (becomes default)
qiai --set-openai-api-key your-openai-api-key
```

### 2. Ask Questions
```bash
# Auto-select available provider
qiai -q "how to list files in directory"

# Force specific provider
qiai -q "how to install docker" --openrouter
qiai -q "how to install docker" --gemini
qiai -q "how to install docker" --openai

# Use a specific model on-the-fly
qiai -q "how to install docker" -m meta-llama/llama-3-8b-instruct:free
```

## Usage

### Basic Commands
```bash
# Ask any command-related question
qiai -q "your question"                    # Auto-select provider
qiai -q "your question" --openrouter       # Force OpenRouter
qiai -q "your question" --gemini           # Force Gemini
qiai -q "your question" --openai           # Force OpenAI

# Use a custom model on-the-fly (works for any provider)
qiai -q "your question" -m <model_id>

# Model management
qiai --list-models                         # List all available models in a beautiful table
qiai --set-model <model_id>                # Set default model (auto-switches provider!)

# API key management
qiai --set-openrouter-api-key your-key     # Set OpenRouter key
qiai --set-gemini-api-key your-key         # Set Gemini key
qiai --set-openai-api-key your-key         # Set OpenAI key

# Provider management
qiai --set-default-provider <provider>     # Set default provider (openrouter|gemini|openai)
```

### Provider & Model Management
The last API key you set automatically becomes the default provider. However, you can easily switch models and providers:

```bash
# List all supported models
qiai --list-models

# Set a model (this will automatically switch the default provider to match the model!)
qiai --set-model google/gemini-2.5-flash:free  # Switches provider to OpenRouter
qiai --set-model gemini-2.5-flash              # Switches provider to Gemini
qiai --set-model gpt-4o-mini                   # Switches provider to OpenAI

# Manually override default provider
qiai --set-default-provider openrouter
qiai --set-default-provider gemini
qiai --set-default-provider openai
```

## Examples

### Docker Commands
```bash
$ qiai -q "how to stop all docker containers"
Using GEMINI provider...
┌─────────────────────────────────┬─────────────────────┬──────────────┐
│ COMMAND                         │ DESCRIPTION         │ DANGER_LEVEL │
├─────────────────────────────────┼─────────────────────┼──────────────┤
│ docker stop $(docker ps -q)    │ Stop all containers │ Level 2      │
└─────────────────────────────────┴─────────────────────┴──────────────┘
```

### Git Commands
```bash
$ qiai -q "clone laravel project"
Using OPENAI provider...
┌─────────────────────────────────────┬─────────────────────────┬──────────────┐
│ COMMAND                             │ DESCRIPTION             │ DANGER_LEVEL │
├─────────────────────────────────────┼─────────────────────────┼──────────────┤
│ composer create-project laravel/... │ Create Laravel project  │ Level 1      │
│ cd my-project && php artisan serve  │ Start dev server        │ Level 1      │
└─────────────────────────────────────┴─────────────────────────┴──────────────┘
```

### System Commands
```bash
$ qiai -q "check disk usage"
$ qiai -q "find large files"
$ qiai -q "kill process by name"
$ qiai -q "compress folder to zip"
```

## Response Format

QIAI returns commands in a structured table format:
- **Command**: The actual terminal command to run
- **Description**: Brief explanation of what the command does  
- **Danger Level**: Safety indicator
  - Level 1: Safe commands (read-only, basic operations)
  - Level 2: Commands that might change data
  - Level 3: Potentially destructive commands

## API Keys Setup

### OpenRouter API Key (Recommended - Free Models!)
1. Go to [OpenRouter](https://openrouter.ai/) and sign up.
2. Go to **Keys** and create a new API key.
3. Set it: `qiai --set-openrouter-api-key your-key`

### Google Gemini API Key  
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Set it: `qiai --set-gemini-api-key your-key`

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Set it: `qiai --set-openai-api-key your-key`

## Features

- **Multi-AI Support**: Works with OpenRouter, Google Gemini, and OpenAI GPT.
- **Dynamic Model Selection**: Choose from a list of pre-defined models or use any custom model on-the-fly with `-m <model_id>`.
- **Auto Provider Selection**: Automatically uses available AI provider and switches provider based on your selected model.
- **OS-Specific**: Provides commands tailored for your operating system (Windows, macOS, Linux).
- **Smart Responses**: Returns organized commands with safety levels in a beautiful terminal table.
- **Token Optimized**: Efficient prompts to reduce API costs.

## Troubleshooting

### Command Not Found
```bash
# Reinstall globally
npm install -g qiai

# Check installation
which qiai
```

### API Errors
- Verify your API keys are valid
- Check your internet connection
- Ensure you have API credits/quota available

### No Response
- Make sure your question is about terminal commands
- Try rephrasing your question
- Check if the provider is working: `qiai -q "list files" --openai`

## More Examples

```bash
# Development
qiai -q "start a local python web server"
qiai -q "install node modules"
qiai -q "run database migration with express"

# System Administration  
qiai -q "check system memory"
qiai -q "monitor network traffic"
qiai -q "backup directory"

# File Operations
qiai -q "copy files recursively"
qiai -q "find files by extension"
qiai -q "change file permissions"
```