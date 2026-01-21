import type { DesignSpecification, LLMProvider } from '@/types';
import { analyzeImageWithOpenAI } from './providers/openai';
import { analyzeImageWithAnthropic } from './providers/anthropic';

function generateId(): string {
  return `spec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

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
  provider: LLMProvider
): Promise<DesignSpecification> {
  const { base64, mimeType } = await fileToBase64(file);

  let analysisResult: Partial<DesignSpecification>;

  if (provider === 'openai') {
    analysisResult = await analyzeImageWithOpenAI(apiKey, base64, mimeType);
  } else {
    analysisResult = await analyzeImageWithAnthropic(apiKey, base64, mimeType);
  }

  const now = new Date();

  // 기본값과 병합하여 완전한 DesignSpecification 생성
  const specification: DesignSpecification = {
    id: generateId(),
    name: file.name.replace(/\.[^/.]+$/, ''), // 확장자 제거
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
    effects: {
      hasShadow: false,
      hasGradient: false,
      hasInnerShadow: false,
      ...analysisResult.effects,
    },
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
