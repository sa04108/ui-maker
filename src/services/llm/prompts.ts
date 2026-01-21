export const IMAGE_ANALYSIS_PROMPT = `Analyze this UI button/icon reference image and extract design specifications.
Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):

{
  "style": {
    "shape": "rounded|square|pill|circle",
    "borderRadius": <number 0-50>,
    "hasBorder": <boolean>,
    "borderStyle": "solid|dashed|dotted",
    "borderWidth": <number 1-5>
  },
  "colors": {
    "primary": "<hex color>",
    "secondary": "<hex color>",
    "accent": "<hex color>",
    "background": "<hex color>",
    "text": "<hex color>",
    "border": "<hex color>"
  },
  "effects": {
    "hasShadow": <boolean>,
    "shadowType": "soft|hard|glow",
    "hasGradient": <boolean>,
    "gradientDirection": "top|bottom|left|right|diagonal",
    "hasInnerShadow": <boolean>
  },
  "iconStyle": {
    "weight": "thin|light|regular|bold",
    "filled": <boolean>,
    "strokeWidth": <number 1-4>
  }
}

Be precise and consistent. Focus on the dominant visual characteristics.`;

export function getSvgGenerationPrompt(
  specification: string,
  subject: string,
  count: number = 5
): string {
  return `Based on the following design specification, generate ${count} different SVG icon variations for a "${subject}" button.

Design Specification:
${specification}

Requirements:
1. Each SVG must be a valid, self-contained SVG element
2. Each SVG should have viewBox="0 0 24 24" for consistent sizing
3. Apply the colors, styles, and effects from the specification
4. Create ${count} visually distinct variations while maintaining the design language
5. Each variation should clearly represent "${subject}" action
6. Use the iconStyle settings (weight, filled, strokeWidth) from the specification

Return ONLY a JSON array of ${count} SVG strings, no explanation:
["<svg ...>...</svg>", "<svg ...>...</svg>", ...]`;
}
