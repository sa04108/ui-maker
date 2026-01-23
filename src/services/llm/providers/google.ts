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

function extractJsonBlock(content: string): string | null {
  const fencedMatch = content.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : null;
}

function extractSvgBlocks(content: string): string[] {
  const matches = content.match(/<svg[\s\S]*?<\/svg>/g);
  if (!matches) return [];
  return matches.map((svg) => svg.trim()).filter(Boolean);
}

function sanitizeSvg(svg: string): string | null {
  const match = svg.match(/<svg[\s\S]*?<\/svg>/);
  if (!match) return null;
  let cleaned = match[0].trim();

  // Ensure xmlns is present for consistent parsing.
  if (!/xmlns=/.test(cleaned)) {
    cleaned = cleaned.replace(
      /<svg\b/,
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
  }

  // Fix unquoted viewBox values like viewBox=0 0 24 24.
  cleaned = cleaned.replace(
    /\sviewBox=([0-9.\- ]+)(?=[\s>])/g,
    ' viewBox="$1"'
  );

  return cleaned;
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
    const jsonBlock = extractJsonBlock(content);
    if (!jsonBlock) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonBlock);
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
    const sanitized = svgs
      .map((svg) => (typeof svg === 'string' ? sanitizeSvg(svg) : null))
      .filter((svg): svg is string => Boolean(svg));
    if (sanitized.length === 0) {
      throw new Error('Invalid SVG array in response');
    }
    return sanitized;
  } catch {
    const fallbackSvgs = extractSvgBlocks(content);
    if (fallbackSvgs.length > 0) {
      const sanitized = fallbackSvgs
        .map((svg) => sanitizeSvg(svg))
        .filter((svg): svg is string => Boolean(svg));
      if (sanitized.length > 0) {
        return sanitized;
      }
    }
    throw new Error('Failed to parse Google Gemini response as SVG array');
  }
}
