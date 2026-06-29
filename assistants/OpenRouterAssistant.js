import OpenAI from "openai";
import { parseModelJSON, modelErrorFallback } from '../utils/parser.js';
import { buildSystemPrompt } from './prompt.js';

export default class OpenRouterAssistant {
  static models = [
    { id: "google/gemini-2.5-flash:free", name: "Gemini 2.5 Flash (Free)" },
    { id: "meta-llama/llama-3-8b-instruct:free", name: "Llama 3 8B Instruct (Free)" },
    { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B Instruct (Free)" },
    { id: "microsoft/phi-3-medium-128k-instruct:free", name: "Phi-3 Medium (Free)" }
  ];

  constructor(apiKey, os_information, defaultModel) {
    this.os_information = os_information;
    this.defaultModel = defaultModel || "google/gemini-2.5-flash:free";

    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://github.com/riparuk/qiai",
        "X-Title": "QIAI CLI",
      }
    });

    this.assistant_instruction = buildSystemPrompt(os_information);
  }

  async getCommands(query, customModel = null) {
    const modelToUse = customModel || this.defaultModel;

    const messages = [
      { role: "system", content: this.assistant_instruction },
      { role: "user", content: query }
    ];

    const completion = {
      messages: messages,
      model: modelToUse,
      response_format: { type: "json_object" },
      // some free models may wrap response in markdown code blocks despite json_object mode
      max_tokens: 512,
    };

    try {
      const response = await this.client.chat.completions.create(completion);

      return parseModelJSON(response.choices[0].message.content);
    } catch (error) {
      return modelErrorFallback(modelToUse, error);
    }
  }
}
