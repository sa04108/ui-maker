import type { DesignSpecification, AnthropicModel } from '@/types';
import { IMAGE_ANALYSIS_PROMPT, getSvgGenerationPrompt } from '../prompts';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function analyzeImageWithAnthropic(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
  model: AnthropicModel = 'claude-sonnet-4-20250514'
): Promise<Partial<DesignSpecification>> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: IMAGE_ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API error');
  }

  const data = await response.json();
  const content = data.content[0]?.text;

  if (!content) {
    throw new Error('No response from Anthropic');
  }

  // JSON 파싱 시도
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse Anthropic response as JSON');
  }
}

export async function generateSvgsWithAnthropic(
  apiKey: string,
  specification: DesignSpecification,
  subject: string,
  _seed: number, // Anthropic은 seed 대신 temperature=0으로 일관성 보장
  model: AnthropicModel = 'claude-sonnet-4-20250514'
): Promise<string[]> {
  const prompt = getSvgGenerationPrompt(JSON.stringify(specification, null, 2), subject, 5);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 6000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API error');
  }

  const data = await response.json();
  const content = data.content[0]?.text;

  if (!content) {
    throw new Error('No response from Anthropic');
  }

  // JSON 배열 파싱
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    const svgs = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(svgs) || svgs.length === 0) {
      throw new Error('Invalid SVG array in response');
    }
    return svgs;
  } catch {
    throw new Error('Failed to parse Anthropic response as SVG array');
  }
}
