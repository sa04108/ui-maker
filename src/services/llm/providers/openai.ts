import type { DesignSpecification } from '@/types';
import { IMAGE_ANALYSIS_PROMPT, getSvgGenerationPrompt } from '../prompts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function analyzeImageWithOpenAI(
  apiKey: string,
  imageBase64: string,
  mimeType: string
): Promise<Partial<DesignSpecification>> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: IMAGE_ANALYSIS_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
  }

  // JSON 파싱 시도
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse OpenAI response as JSON');
  }
}

export async function generateSvgsWithOpenAI(
  apiKey: string,
  specification: DesignSpecification,
  subject: string,
  seed: number
): Promise<string[]> {
  const prompt = getSvgGenerationPrompt(JSON.stringify(specification, null, 2), subject, 5);

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0,
      seed: seed,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
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
    throw new Error('Failed to parse OpenAI response as SVG array');
  }
}
