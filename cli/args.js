import OpenAIAssistant from '../assistants/OpenAIAssistant.js';
import GeminiAssistant from '../assistants/GeminiAssistant.js';
import OpenRouterAssistant from '../assistants/OpenRouterAssistant.js';
import { displayTableSteps } from '../utils/display.js';
import { interactiveModelSelect } from '../utils/modelSelector.js';
import { getAvailableProvider, ensureApiKeys, getResponse } from '../utils/provider.js';
import { patchConfig } from '../config/writer.js';
import { startInteractiveMode } from './interactive.js';

const PROVIDERS = ['openai', 'gemini', 'openrouter'];

function argVal(args, flag) {
  const i = args.indexOf(flag) + 1;
  return i > 0 && args[i] && !args[i].startsWith('-') ? args[i] : null;
}

export async function main() {
  const args = process.argv.slice(2);

  if (args.includes('-q')) {
    const query = argVal(args, '-q') ?? args[args.indexOf('-q') + 1];
    if (!query) {
      console.log("Usage: qiai -q 'your question'");
      process.exit(0);
    }

    ensureApiKeys();

    const customModel = args.includes('-m') ? argVal(args, '-m') : null;
    if (args.includes('-m') && !customModel) {
      console.error('Provide a model name after -m');
      process.exit(1);
    }

    let provider;
    if (args.includes('--gemini')) provider = 'gemini';
    else if (args.includes('--openai')) provider = 'openai';
    else if (args.includes('--openrouter')) provider = 'openrouter';
    else provider = getAvailableProvider();

    displayTableSteps(await getResponse(provider, query, customModel));
    process.exit(0);
  }

  if (args.includes('--set-openai-api-key')) {
    const key = argVal(args, '--set-openai-api-key');
    if (!key) { console.error('Provide key after --set-openai-api-key'); process.exit(1); }
    patchConfig({ openaiApiKey: key, defaultProvider: 'openai' });
    console.log('OpenAI API key set as default provider.');
    process.exit(0);
  }

  if (args.includes('--set-gemini-api-key')) {
    const key = argVal(args, '--set-gemini-api-key');
    if (!key) { console.error('Provide key after --set-gemini-api-key'); process.exit(1); }
    patchConfig({ geminiApiKey: key, defaultProvider: 'gemini' });
    console.log('Gemini API key set as default provider.');
    process.exit(0);
  }

  if (args.includes('--set-openrouter-api-key')) {
    const key = argVal(args, '--set-openrouter-api-key');
    if (!key) { console.error('Provide key after --set-openrouter-api-key'); process.exit(1); }
    patchConfig({ openrouterApiKey: key, defaultProvider: 'openrouter' });
    console.log('OpenRouter API key set as default provider.');
    process.exit(0);
  }

  if (args.includes('--set-openrouter-model')) {
    const model = argVal(args, '--set-openrouter-model');
    if (!model) { console.error('Provide model name after --set-openrouter-model'); process.exit(1); }
    patchConfig({ defaultModel: model });
    console.log(`Default model set to: ${model}`);
    process.exit(0);
  }

  if (args.includes('--select-model') || args.includes('--list-models')) {
    await interactiveModelSelect();
    process.exit(0);
  }

  if (args.includes('--set-model')) {
    const modelId = argVal(args, '--set-model');
    if (!modelId) { console.error('Provide model ID after --set-model'); process.exit(1); }

    const allModels = [...OpenAIAssistant.models, ...GeminiAssistant.models, ...OpenRouterAssistant.models];
    if (!allModels.find(m => m.id === modelId)) {
      console.log(`Warning: '${modelId}' not in pre-defined list, setting anyway.`);
    }

    const updates = { defaultModel: modelId };
    if (OpenAIAssistant.models.find(m => m.id === modelId)) {
      updates.defaultProvider = 'openai';
      console.log('Auto-switched provider to: OPENAI');
    } else if (GeminiAssistant.models.find(m => m.id === modelId)) {
      updates.defaultProvider = 'gemini';
      console.log('Auto-switched provider to: GEMINI');
    } else if (OpenRouterAssistant.models.find(m => m.id === modelId)) {
      updates.defaultProvider = 'openrouter';
      console.log('Auto-switched provider to: OPENROUTER');
    }
    patchConfig(updates);
    console.log(`Default model set to: ${modelId}`);
    process.exit(0);
  }

  if (args.includes('--set-default-provider')) {
    const provider = argVal(args, '--set-default-provider');
    if (!provider || !PROVIDERS.includes(provider)) {
      console.error('Provide valid provider: openai | gemini | openrouter');
      process.exit(1);
    }
    patchConfig({ defaultProvider: provider });
    console.log(`Default provider set to: ${provider.toUpperCase()}`);
    process.exit(0);
  }

  await startInteractiveMode();
}
