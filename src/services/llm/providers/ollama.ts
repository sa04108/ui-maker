import type { DesignSpecification, OllamaModel } from '@/types';
import { IMAGE_ANALYSIS_PROMPT, getSvgGenerationPrompt } from '../prompts';

const OLLAMA_API_URL = 'http://localhost:11434/api';

export async function checkOllamaConnection(): Promise<{ models: string[] }> {
  const response = await fetch(`${OLLAMA_API_URL}/tags`);
  if (!response.ok) {
    throw new Error('Ollama is not reachable at http://localhost:11434.');
  }
  const data = await response.json();
  const models = Array.isArray(data.models)
    ? data.models.map((model: { name?: string }) => model.name).filter((name: string | undefined): name is string => !!name)
    : [];
  return { models };
}

export async function analyzeImageWithOllama(
  imageBase64: string,
  model: OllamaModel = 'llama3.2-vision'
): Promise<Partial<DesignSpecification>> {
  const response = await fetch(`${OLLAMA_API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: IMAGE_ANALYSIS_PROMPT,
          images: [imageBase64],
        },
      ],
      options: {
        temperature: 0,
      },
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || 'Ollama API error');
  }

  const data = await response.json();
  const content = data.message?.content;

  if (!content) {
    throw new Error('No response from Ollama');
  }

  // Debug: log raw model output in browser console for inspection
  console.log('[LLM][Ollama][generateSvgs] raw message:', content);

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse Ollama response as JSON');
  }
}

export async function generateSvgsWithOllama(
  specification: DesignSpecification,
  subject: string,
  seed: number,
  model: OllamaModel = 'llama3.2-vision',
  lastSubject: string = '',
  lastGeneratedSvgs: string[] = []
): Promise<string[]> {
  const prompt = getSvgGenerationPrompt(
    JSON.stringify(specification, null, 2),
    subject,
    5,
    lastSubject,
    lastGeneratedSvgs
  );

  const response = await fetch(`${OLLAMA_API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      options: {
        temperature: 0,
        seed,
      },
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || 'Ollama API error');
  }

  const data = await response.json();
  const content = data.message?.content;

  if (!content) {
    throw new Error('No response from Ollama');
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
    throw new Error('Failed to parse Ollama response as SVG array');
  }
}
