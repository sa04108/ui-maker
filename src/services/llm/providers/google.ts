import type { DesignSpecification, GoogleModel } from '@/types';
import { IMAGE_ANALYSIS_PROMPT, getSvgGenerationPrompt } from '../prompts';

const GOOGLE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

type GeminiContentPart = {
  text?: string;
};

function buildGoogleUrl(model: GoogleModel, apiKey: string): string {
  return `${GOOGLE_API_URL}/${model}:generateContent?key=${apiKey}`;
}

function extractTextFromResponse(data: {
  candidates?: Array<{ content?: { parts?: GeminiContentPart[] } }>;
}): string | null {
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts) return null;
  const text = parts.map((part) => part.text || '').join('');
  return text.trim() ? text : null;
}

function extractSvgBlocks(content: string): string[] {
  const matches = content.match(/<svg[\s\S]*?<\/svg>/g);
  if (!matches) return [];
  return matches.map((svg) => svg.trim()).filter(Boolean);
}

export async function analyzeImageWithGoogle(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
  model: GoogleModel = 'gemini-2.5-flash'
): Promise<Partial<DesignSpecification>> {
  const response = await fetch(buildGoogleUrl(model, apiKey), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: IMAGE_ANALYSIS_PROMPT },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 1500,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Google Gemini API error');
  }

  const data = await response.json();
  const content = extractTextFromResponse(data);

  if (!content) {
    throw new Error('No response from Google Gemini');
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse Google Gemini response as JSON');
  }
}

export async function generateSvgsWithGoogle(
  apiKey: string,
  specification: DesignSpecification,
  subject: string,
  _seed: number,
  model: GoogleModel = 'gemini-2.5-flash'
): Promise<string[]> {
  const prompt = getSvgGenerationPrompt(JSON.stringify(specification, null, 2), subject, 5);

  const response = await fetch(buildGoogleUrl(model, apiKey), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 6000,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Google Gemini API error');
  }

  const data = await response.json();
  const content = extractTextFromResponse(data);

  if (!content) {
    throw new Error('No response from Google Gemini');
  }

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
    const fallbackSvgs = extractSvgBlocks(content);
    if (fallbackSvgs.length > 0) {
      return fallbackSvgs;
    }
    throw new Error('Failed to parse Google Gemini response as SVG array');
  }
}
