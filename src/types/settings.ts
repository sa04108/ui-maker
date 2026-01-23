export type LLMProvider = 'openai' | 'anthropic' | 'google';

export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'o4-mini' | 'gpt-4.1';
export type AnthropicModel = 'claude-sonnet-4-20250514' | 'claude-opus-4-20250514';
export type GoogleModel = 'gemini-3';

export type LLMModel = OpenAIModel | AnthropicModel | GoogleModel;

export interface ModelOption {
  id: LLMModel;
  name: string;
  provider: LLMProvider;
  description: string;
  tier: 'standard' | 'premium';
}

export const OPENAI_MODELS: ModelOption[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'Fast and capable multimodal model', tier: 'standard' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', description: 'Affordable and intelligent small model', tier: 'standard' },
  { id: 'o4-mini', name: 'o4-mini', provider: 'openai', description: 'Latest reasoning model (fast)', tier: 'premium' },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai', description: 'Latest flagship model', tier: 'premium' },
];

export const ANTHROPIC_MODELS: ModelOption[] = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic', description: 'Balanced performance and speed', tier: 'standard' },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', provider: 'anthropic', description: 'Most capable model', tier: 'premium' },
];

export const GOOGLE_MODELS: ModelOption[] = [
  { id: 'gemini-3', name: 'Gemini 3', provider: 'google', description: 'Next-generation Gemini model', tier: 'premium' },
];

export const ALL_MODELS: ModelOption[] = [...OPENAI_MODELS, ...ANTHROPIC_MODELS, ...GOOGLE_MODELS];

export function getModelsForProvider(provider: LLMProvider): ModelOption[] {
  if (provider === 'openai') return OPENAI_MODELS;
  if (provider === 'anthropic') return ANTHROPIC_MODELS;
  return GOOGLE_MODELS;
}

export function getDefaultModelForProvider(provider: LLMProvider): LLMModel {
  if (provider === 'openai') return 'gpt-4o';
  if (provider === 'anthropic') return 'claude-sonnet-4-20250514';
  return 'gemini-3';
}

export interface Settings {
  id: string;
  apiKey: string;
  provider: LLMProvider;
  model: LLMModel;
}
