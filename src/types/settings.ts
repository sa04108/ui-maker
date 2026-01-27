export type LLMProvider = 'openai' | 'anthropic' | 'google';

export type OpenAIModel = 'gpt-5.2-codex' | 'gpt-4o' | 'gpt-4o-mini' | 'o4-mini' | 'gpt-4.1' | 'gpt-3.5-turbo';
export type AnthropicModel = 'claude-opus-4-5-20251101' | 'claude-sonnet-4-5-20250929' | 'claude-haiku-4-5-20251001';
export type GoogleModel = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.0-flash';

export type LLMModel = OpenAIModel | AnthropicModel | GoogleModel;

export interface ModelOption {
  id: LLMModel;
  name: string;
  provider: LLMProvider;
  description: string;
  tier: 'standard' | 'premium';
}

export const OPENAI_MODELS: ModelOption[] = [
  { id: 'gpt-5.2-codex', name: 'GPT-5.2 Codex', provider: 'openai', description: 'Coding-focused model for complex tasks', tier: 'premium' },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai', description: 'Latest flagship model', tier: 'premium' },
  { id: 'o4-mini', name: 'o4-mini', provider: 'openai', description: 'Latest reasoning model (fast)', tier: 'premium' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'Fast and capable multimodal model', tier: 'standard' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', description: 'Affordable and intelligent small model', tier: 'standard' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', description: 'Legacy fast model for lightweight tasks', tier: 'standard' },
];

export const ANTHROPIC_MODELS: ModelOption[] = [
  { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', provider: 'anthropic', description: 'Most capable model', tier: 'premium' },
  { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', provider: 'anthropic', description: 'Balanced performance and speed', tier: 'standard' },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', provider: 'anthropic', description: 'Fastest model for simple tasks', tier: 'standard' },
];

export const GOOGLE_MODELS: ModelOption[] = [
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', description: 'Most capable Gemini model', tier: 'premium' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', description: 'Fast multimodal model for general use', tier: 'standard' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', description: 'Reliable fast model for everyday tasks', tier: 'standard' },
];

export const ALL_MODELS: ModelOption[] = [...OPENAI_MODELS, ...ANTHROPIC_MODELS, ...GOOGLE_MODELS];

export function getModelsForProvider(provider: LLMProvider): ModelOption[] {
  if (provider === 'openai') return OPENAI_MODELS;
  if (provider === 'anthropic') return ANTHROPIC_MODELS;
  return GOOGLE_MODELS;
}

export function getDefaultModelForProvider(provider: LLMProvider): LLMModel {
  if (provider === 'openai') return 'gpt-5.2-codex';
  if (provider === 'anthropic') return 'claude-opus-4-5-20251101';
  return 'gemini-2.5-pro';
}

export function getModelDisplayName(modelId: string): string {
  const model = ALL_MODELS.find(m => m.id === modelId);
  return model?.name || modelId;
}

export interface Settings {
  id: string;
  apiKeys: Record<LLMProvider, string>;
  provider: LLMProvider;
  model: LLMModel;
}
