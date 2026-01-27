import type { DesignSpecification, LLMProvider, LLMModel, OpenAIModel, AnthropicModel, GoogleModel, OllamaModel } from '@/types';
import { analyzeImageWithOpenAI } from './providers/openai';
import { analyzeImageWithAnthropic } from './providers/anthropic';
import { analyzeImageWithGoogle } from './providers/google';
import { analyzeImageWithOllama } from './providers/ollama';
import { generateId, removeExtension } from '@/utils';

async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data:image/png;base64,xxxxx 형태에서 base64 부분만 추출
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Failed to read file as base64'));
        return;
      }
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function analyzeImage(
  file: File,
  apiKey: string,
  provider: LLMProvider,
  model: LLMModel
): Promise<DesignSpecification> {
  const { base64, mimeType } = await fileToBase64(file);

  let analysisResult: Partial<DesignSpecification>;

  if (provider === 'openai') {
    analysisResult = await analyzeImageWithOpenAI(apiKey, base64, mimeType, model as OpenAIModel);
  } else if (provider === 'anthropic') {
    analysisResult = await analyzeImageWithAnthropic(apiKey, base64, mimeType, model as AnthropicModel);
  } else if (provider === 'google') {
    analysisResult = await analyzeImageWithGoogle(apiKey, base64, mimeType, model as GoogleModel);
  } else {
    analysisResult = await analyzeImageWithOllama(base64, model as OllamaModel);
  }

  const now = new Date();
  const gradientDefaults = {
    direction: 'top' as const,
    startColor: analysisResult.colors?.primary || '#3b82f6',
    endColor: analysisResult.colors?.secondary || '#64748b',
  };
  const effectGradientColors = analysisResult.effects?.gradientColors;
  const gradientFromEffects = effectGradientColors
    ? {
        direction: (analysisResult.effects?.gradientDirection as typeof gradientDefaults.direction) || gradientDefaults.direction,
        startColor: effectGradientColors[0] || gradientDefaults.startColor,
        endColor: effectGradientColors[1] || gradientDefaults.endColor,
      }
    : null;

  const mergedEffects = {
    hasShadow: false,
    hasGradient: false,
    hasInnerShadow: false,
    ...analysisResult.effects,
  };
  const mergedGradient = {
    ...gradientDefaults,
    ...(gradientFromEffects || {}),
    ...analysisResult.gradient,
  };
  mergedEffects.gradientDirection = mergedEffects.gradientDirection || mergedGradient.direction;
  mergedEffects.gradientColors = mergedEffects.gradientColors || [mergedGradient.startColor, mergedGradient.endColor];

  // 기본값과 병합하여 완전한 DesignSpecification 생성
  const specification: DesignSpecification = {
    id: generateId('spec'),
    name: removeExtension(file.name),
    style: {
      shape: 'rounded',
      borderRadius: 8,
      hasBorder: false,
      ...analysisResult.style,
    },
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937',
      ...analysisResult.colors,
    },
    effects: mergedEffects,
    gradient: mergedGradient,
    iconStyle: {
      weight: 'regular',
      filled: false,
      strokeWidth: 2,
      ...analysisResult.iconStyle,
    },
    rawAnalysis: JSON.stringify(analysisResult, null, 2),
    createdAt: now,
    updatedAt: now,
  };

  return specification;
}
