import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { type, release, platform } from 'os';
import config from '../config/config.js';
import OpenAIAssistant from '../assistants/OpenAIAssistant.js';
import GeminiAssistant from '../assistants/GeminiAssistant.js';
import OpenRouterAssistant from '../assistants/OpenRouterAssistant.js';

export const os_information = `${type()}, ${platform()}:${release()}`;

let openai, gemini, openrouter;

if (config.openaiApiKey?.trim()) openai = new OpenAI({ apiKey: config.openaiApiKey });
if (config.geminiApiKey?.trim()) gemini = new GoogleGenerativeAI(config.geminiApiKey);
if (config.openrouterApiKey?.trim()) {
  openrouter = new OpenRouterAssistant(config.openrouterApiKey, os_information, config.defaultModel);
}

function noApiKeyError() {
  console.error('Error: No API keys configured. Set one:');
  console.error('  qiai --set-openai-api-key <key>');
  console.error('  qiai --set-gemini-api-key <key>');
  console.error('  qiai --set-openrouter-api-key <key>');
  process.exit(1);
}

export function getAvailableProvider() {
  const { defaultProvider, openaiApiKey, geminiApiKey, openrouterApiKey } = config;
  if (defaultProvider === 'gemini' && geminiApiKey?.trim()) return 'gemini';
  if (defaultProvider === 'openai' && openaiApiKey?.trim()) return 'openai';
  if (defaultProvider === 'openrouter' && openrouterApiKey?.trim()) return 'openrouter';
  if (openaiApiKey?.trim()) return 'openai';
  if (geminiApiKey?.trim()) return 'gemini';
  if (openrouterApiKey?.trim()) return 'openrouter';
  noApiKeyError();
}

export function ensureApiKeys() {
  if (!config.openaiApiKey?.trim() && !config.geminiApiKey?.trim() && !config.openrouterApiKey?.trim()) {
    noApiKeyError();
  }
}

export async function getResponse(provider, query, customModel = null) {
  if (provider === 'openrouter') {
    if (!openrouter) {
      console.error('OpenRouter not configured. Run: qiai --set-openrouter-api-key <key>');
      process.exit(1);
    }
    const model = customModel || config.defaultModel || 'google/gemini-2.5-flash:free';
    console.log(`Using OPENROUTER with model: ${model}...`);
    return openrouter.getCommands(query, customModel);
  }
  if (provider === 'gemini') {
    const model = customModel || config.defaultModel || 'gemini-2.5-flash';
    console.log(`Using GEMINI with model: ${model}...`);
    return new GeminiAssistant(gemini, os_information, config.defaultModel).getCommands(query, customModel);
  }
  const model = customModel || config.defaultModel || 'gpt-4o-mini';
  console.log(`Using OPENAI with model: ${model}...`);
  return new OpenAIAssistant(openai, os_information, config.defaultModel).getCommands(query, customModel);
}
