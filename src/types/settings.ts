export type LLMProvider = 'openai' | 'anthropic';

export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'o4-mini' | 'gpt-4.1';
export type AnthropicModel = 'claude-sonnet-4-20250514' | 'claude-opus-4-20250514';

export type LLMModel = OpenAIModel | AnthropicModel;

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

export const ALL_MODELS: ModelOption[] = [...OPENAI_MODELS, ...ANTHROPIC_MODELS];

export function getModelsForProvider(provider: LLMProvider): ModelOption[] {
  return provider === 'openai' ? OPENAI_MODELS : ANTHROPIC_MODELS;
}

export function getDefaultModelForProvider(provider: LLMProvider): LLMModel {
  return provider === 'openai' ? 'gpt-4o' : 'claude-sonnet-4-20250514';
}

export interface Settings {
  id: string;
  apiKey: string;
  provider: LLMProvider;
  model: LLMModel;
}
