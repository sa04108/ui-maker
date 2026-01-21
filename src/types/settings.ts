export type LLMProvider = 'openai' | 'anthropic';

export interface Settings {
  id: string;
  apiKey: string;
  provider: LLMProvider;
}
