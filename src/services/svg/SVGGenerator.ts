import type { DesignSpecification, LLMProvider, LLMModel, OpenAIModel, AnthropicModel, GoogleModel } from '@/types';
import { generateSvgsWithOpenAI, generateSvgsWithAnthropic, generateSvgsWithGoogle } from '../llm/providers';

// 문자열 해시 함수 (seed 생성용)
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export async function generateSvgs(
  specification: DesignSpecification,
  subject: string,
  apiKey: string,
  provider: LLMProvider,
  model: LLMModel
): Promise<string[]> {
  // seed = hash(specificationId + subject) for consistency
  const seed = hashString(`${specification.id}_${subject}`);

  if (provider === 'openai') {
    return generateSvgsWithOpenAI(apiKey, specification, subject, seed, model as OpenAIModel);
  }
  if (provider === 'anthropic') {
    return generateSvgsWithAnthropic(apiKey, specification, subject, seed, model as AnthropicModel);
  }
  return generateSvgsWithGoogle(apiKey, specification, subject, seed, model as GoogleModel);
}

// SVG 유효성 검사
export function validateSvg(svg: string): boolean {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const errorNode = doc.querySelector('parsererror');
    return !errorNode && doc.documentElement.tagName === 'svg';
  } catch {
    return false;
  }
}

// SVG를 정규화 (viewBox 설정 등)
export function normalizeSvg(svg: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const svgElement = doc.documentElement;

    // viewBox가 없으면 기본값 설정
    if (!svgElement.hasAttribute('viewBox')) {
      svgElement.setAttribute('viewBox', '0 0 24 24');
    }

    // width, height 제거 (스케일링을 위해)
    svgElement.removeAttribute('width');
    svgElement.removeAttribute('height');

    return new XMLSerializer().serializeToString(svgElement);
  } catch {
    return svg;
  }
}
