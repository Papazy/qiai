import { parseModelJSON, modelErrorFallback } from '../utils/parser.js';
import { buildSystemPrompt } from './prompt.js';

export default class GeminiAssistant {
  static models = [
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" }
  ];

  constructor(gemini, os_information, defaultModel) {
    this.gemini = gemini;
    this.os_information = os_information;
    this.defaultModel = defaultModel || "gemini-2.5-flash";
    this.assistant_instruction = buildSystemPrompt(os_information);
  }

  async getCommands(query, customModel = null) {
    const modelToUse = customModel || this.defaultModel;
    const modelInstance = this.gemini.getGenerativeModel({ model: modelToUse });

    try {
      const prompt = `${this.assistant_instruction}

User Query: ${query}

Response:`;

      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const meta = response.usageMetadata;

      const parsed = parseModelJSON(text);
      if (meta) {
        parsed.usage = {
          input: meta.promptTokenCount ?? 0,
          output: meta.candidatesTokenCount ?? 0,
          total: meta.totalTokenCount ?? 0,
        };
      }
      return parsed;

    } catch (error) {
      return modelErrorFallback(modelToUse, error);
    }
  }
}
