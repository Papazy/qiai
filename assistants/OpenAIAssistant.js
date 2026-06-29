import { parseModelJSON, modelErrorFallback } from '../utils/parser.js';
import { buildSystemPrompt } from './prompt.js';

export default class OpenAIAssistant {
  static models = [
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "gpt-4o", name: "GPT-4o" }
  ];

  constructor(openai, os_information, defaultModel) {
    this.openai = openai;
    this.os_information = os_information;
    this.defaultModel = defaultModel || "gpt-4o-mini";
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
      max_tokens: 256,
    };

    try {
      const response = await this.openai.chat.completions.create(completion);
      const parsed = parseModelJSON(response.choices[0].message.content);
      if (response.usage) {
        parsed.usage = {
          input: response.usage.prompt_tokens,
          output: response.usage.completion_tokens,
          total: response.usage.total_tokens,
        };
      }
      return parsed;
    } catch (error) {
      return modelErrorFallback(modelToUse, error);
    }
  }
}
