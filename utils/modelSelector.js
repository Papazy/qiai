import select from '@inquirer/select';
import readline from 'readline';
import config from '../config/config.js';
import OpenAIAssistant from '../assistants/OpenAIAssistant.js';
import GeminiAssistant from '../assistants/GeminiAssistant.js';
import OpenRouterAssistant from '../assistants/OpenRouterAssistant.js';
import { patchConfig } from '../config/writer.js';

const BACK = '__BACK__';
const CANCEL = '__CANCEL__';

const STATIC_MODELS = {
  openai: OpenAIAssistant.models,
  gemini: GeminiAssistant.models,
  openrouter: OpenRouterAssistant.models,
};

async function fetchOpenAIModels(apiKey) {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });
  const response = await client.models.list();
  const excluded = ['dall-e', 'tts', 'whisper', 'text-embedding', 'text-moderation', 'babbage', 'davinci'];
  return response.data
    .filter(m => !excluded.some(prefix => m.id.startsWith(prefix)))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(m => ({ id: m.id, name: m.id }));
}

async function fetchGeminiModels(apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );
  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
  const data = await response.json();
  return (data.models || [])
    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
    .map(m => ({
      id: m.name.replace('models/', ''),
      name: m.displayName || m.name.replace('models/', ''),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchOpenRouterModels(apiKey) {
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);
  const data = await response.json();
  return (data.data || [])
    .map(m => {
      const inputPrice = parseFloat(m.pricing?.prompt || 0) * 1_000_000;
      const outputPrice = parseFloat(m.pricing?.completion || 0) * 1_000_000;
      return {
        id: m.id,
        name: m.name || m.id,
        inputPrice,
        outputPrice,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function formatPrice(price) {
  if (price === 0) return 'free';
  if (price < 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(3)}`;
}

function promptApiKey(provider) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`Enter ${provider.toUpperCase()} API key: `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function saveConfig(provider, modelId, apiKey) {
  const keyMap = { openai: 'openaiApiKey', gemini: 'geminiApiKey', openrouter: 'openrouterApiKey' };
  const updates = { defaultModel: modelId, defaultProvider: provider };
  if (apiKey) updates[keyMap[provider]] = apiKey;
  patchConfig(updates);
}

function getApiKey(provider) {
  if (provider === 'openai') return config.openaiApiKey;
  if (provider === 'gemini') return config.geminiApiKey;
  if (provider === 'openrouter') return config.openrouterApiKey;
  return '';
}

function buildModelChoices(models, provider, isStatic) {
  const sorted = [...models].sort((a, b) => a.name.localeCompare(b.name));
  return [
    { name: '← Back to providers', value: BACK },
    ...sorted.map(m => {
      let label = m.name;
      if (provider === 'openrouter' && !isStatic) {
        const inp = formatPrice(m.inputPrice);
        const out = formatPrice(m.outputPrice);
        label = inp === 'free' && out === 'free'
          ? `${m.name}  —  free`
          : `${m.name}  —  ${inp}/1M in · ${out}/1M out`;
      }
      return { name: label, value: m.id, short: m.id };
    })
  ];
}

export async function interactiveModelSelect() {
  const isExitError = (e) => e?.name === 'ExitPromptError' || e?.message?.includes('force closed');

  while (true) {
    console.clear();
    const providerChoices = [
      { name: 'OpenAI', value: 'openai' },
      { name: 'Gemini', value: 'gemini' },
      { name: 'OpenRouter', value: 'openrouter' },
      { name: '✕  Cancel', value: CANCEL },
    ];

    let provider;
    try {
      provider = await select({ message: 'Select provider:', choices: providerChoices });
    } catch (e) {
      if (isExitError(e)) { console.log('\nCancelled.'); return; }
      throw e;
    }

    if (provider === CANCEL) { console.log('Cancelled.'); return; }

    const apiKey = getApiKey(provider);
    const hasKey = apiKey?.trim();

    let models = [];
    let isStatic = false;

    if (hasKey) {
      process.stdout.write('Fetching models...');
      try {
        if (provider === 'openai') models = await fetchOpenAIModels(apiKey);
        else if (provider === 'gemini') models = await fetchGeminiModels(apiKey);
        else if (provider === 'openrouter') models = await fetchOpenRouterModels(apiKey);
        process.stdout.write('\r\x1b[K');
      } catch (err) {
        process.stdout.write('\r\x1b[K');
        console.error(`Failed to fetch models: ${err.message}`);
        console.log('Falling back to built-in model list.');
        models = STATIC_MODELS[provider];
        isStatic = true;
      }
    } else {
      models = STATIC_MODELS[provider];
      isStatic = true;
    }

    if (models.length === 0) {
      console.error(`No models available for ${provider}.`);
      continue;
    }

    console.clear();
    if (isStatic) {
      console.log(`Note: Showing built-in models only. Set an API key to load the full model list.\n`);
    }

    let modelId;
    try {
      modelId = await select({
        message: `Select model (${provider}):`,
        choices: buildModelChoices(models, provider, isStatic),
        pageSize: 15,
      });
    } catch (e) {
      if (isExitError(e)) { console.log('\nCancelled.'); return; }
      throw e;
    }

    if (modelId === BACK) continue;

    let newApiKey = null;
    if (!hasKey) {
      console.log(`\nAPI key for ${provider.toUpperCase()} not set.`);
      newApiKey = await promptApiKey(provider);
      if (!newApiKey) {
        console.log('No API key entered. Model not saved.');
        continue;
      }
    }

    saveConfig(provider, modelId, newApiKey);
    console.log(`\nProvider : ${provider.toUpperCase()}`);
    console.log(`Model    : ${modelId}`);
    if (newApiKey) console.log('API key  : saved');
    console.log('Saved as default.');
    return;
  }
}
