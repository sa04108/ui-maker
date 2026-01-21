export const IMAGE_ANALYSIS_PROMPT = `Analyze this UI button/icon reference image and extract comprehensive design specifications.
Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):

{
  "style": {
    "shape": "rounded|square|pill|circle|organic",
    "borderRadius": <number 0-50>,
    "hasBorder": <boolean>,
    "borderStyle": "solid|dashed|dotted|double",
    "borderWidth": <number 1-5>,
    "padding": "none|tight|normal|loose"
  },
  "colors": {
    "primary": "<hex color>",
    "secondary": "<hex color>",
    "accent": "<hex color>",
    "background": "<hex color or 'transparent'>",
    "text": "<hex color>",
    "border": "<hex color>",
    "iconFill": "<hex color or 'none'>",
    "iconStroke": "<hex color>"
  },
  "background": {
    "isTransparent": <boolean>,
    "opacity": <number 0-100>,
    "pattern": "solid|gradient|noise|texture|none"
  },
  "effects": {
    "hasShadow": <boolean>,
    "shadowType": "soft|hard|glow|long|layered",
    "shadowColor": "<hex color with alpha, e.g. #00000033>",
    "shadowOffset": { "x": <number>, "y": <number> },
    "shadowBlur": <number 0-20>,
    "hasGradient": <boolean>,
    "gradientType": "linear|radial|conic",
    "gradientDirection": "top|bottom|left|right|diagonal|center",
    "gradientColors": ["<hex color>", "<hex color>"],
    "hasInnerShadow": <boolean>,
    "hasGlow": <boolean>,
    "glowColor": "<hex color>",
    "glowIntensity": <number 0-100>
  },
  "iconStyle": {
    "weight": "thin|light|regular|medium|bold|heavy",
    "filled": <boolean>,
    "strokeWidth": <number 0.5-4>,
    "strokeLinecap": "round|square|butt",
    "strokeLinejoin": "round|miter|bevel",
    "cornerStyle": "sharp|rounded|mixed",
    "complexity": "minimal|simple|moderate|detailed",
    "visualStyle": "flat|outlined|duotone|3d|isometric|hand-drawn|geometric"
  },
  "dimensions": {
    "aspectRatio": "1:1|4:3|16:9|custom",
    "suggestedSize": <number 16-128>
  },
  "designLanguage": {
    "theme": "modern|classic|playful|professional|minimal|skeuomorphic|neumorphic|glassmorphism",
    "mood": "neutral|friendly|serious|energetic|calm",
    "brandStyle": "<brief description of overall visual identity>"
  }
}

Analyze carefully:
1. Check if the background is transparent or solid colored
2. Identify the exact icon stroke style and weight
3. Note any special effects like shadows, glows, or gradients
4. Determine the overall design language and visual style
5. Be precise about colors - use exact hex values observed in the image

Be extremely precise and consistent. Focus on capturing every visual detail.`;

export function getSvgGenerationPrompt(
  specification: string,
  subject: string,
  count: number = 5
): string {
  return `You are an expert SVG icon designer. Generate ${count} professional-quality SVG icon variations for "${subject}" based on the design specification below.

Design Specification:
${specification}

CRITICAL Requirements:
1. Each SVG MUST be valid, self-contained, and production-ready
2. Use viewBox="0 0 24 24" - no width/height attributes
3. STRICTLY follow the specification's visual style:
   - If "visualStyle" is "outlined", use stroke only (no fill or fill="none")
   - If "visualStyle" is "filled", use solid fills
   - If "visualStyle" is "duotone", use two-tone coloring
   - Match the exact strokeWidth, strokeLinecap, strokeLinejoin from iconStyle
4. Apply colors EXACTLY as specified:
   - Use iconStroke color for strokes
   - Use iconFill color for fills (or "none" if specified)
   - Respect background transparency setting
5. Match the complexity level: ${getComplexityGuidance()}
6. Each of the ${count} variations should be DISTINCTLY different:
   - Variation 1: Most literal/standard interpretation
   - Variation 2: Minimal/simplified version
   - Variation 3: Creative/unique interpretation
   - Variation 4: Detailed/elaborate version
   - Variation 5: Alternative metaphor/symbol

SVG Best Practices:
- Use <path> elements with optimized d attributes
- Avoid unnecessary transforms or groups
- Ensure all paths are properly closed
- Use currentColor for adaptable coloring when appropriate
- Apply effects (shadows, glows) using SVG filters if specified

Return ONLY a JSON array of ${count} complete SVG strings:
["<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\">...</svg>", ...]`;
}

function getComplexityGuidance(): string {
  return `minimal=few strokes/shapes, simple=clean and clear, moderate=balanced detail, detailed=intricate design`;
}
