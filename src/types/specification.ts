export interface DesignStyle {
  shape: 'rounded' | 'square' | 'pill' | 'circle' | 'organic';
  borderRadius: number; // 0-50
  hasBorder: boolean;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  borderWidth?: number;
  padding?: 'none' | 'tight' | 'normal' | 'loose';
}

export interface DesignColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border?: string;
  iconFill?: string;
  iconStroke?: string;
}

export interface BackgroundSpec {
  isTransparent: boolean;
  opacity: number; // 0-100
  pattern: 'solid' | 'gradient' | 'noise' | 'texture' | 'none';
}

export interface ShadowOffset {
  x: number;
  y: number;
}

export interface DesignEffects {
  hasShadow: boolean;
  shadowType?: 'soft' | 'hard' | 'glow' | 'long' | 'layered';
  shadowColor?: string;
  shadowOffset?: ShadowOffset;
  shadowBlur?: number;
  hasGradient: boolean;
  gradientType?: 'linear' | 'radial' | 'conic';
  gradientDirection?: string;
  gradientColors?: string[];
  hasInnerShadow: boolean;
  hasGlow?: boolean;
  glowColor?: string;
  glowIntensity?: number;
}

export interface GradientSpec {
  direction: 'top' | 'bottom' | 'left' | 'right' | 'diagonal' | 'center';
  startColor: string;
  endColor: string;
}

export interface IconStyle {
  weight: 'thin' | 'light' | 'regular' | 'medium' | 'bold' | 'heavy';
  filled: boolean;
  strokeWidth: number;
  strokeLinecap?: 'round' | 'square' | 'butt';
  strokeLinejoin?: 'round' | 'miter' | 'bevel';
  cornerStyle?: 'sharp' | 'rounded' | 'mixed';
  complexity?: 'minimal' | 'simple' | 'moderate' | 'detailed';
  visualStyle?: 'flat' | 'outlined' | 'duotone' | '3d' | 'isometric' | 'hand-drawn' | 'geometric';
}

export interface DimensionSpec {
  aspectRatio: '1:1' | '4:3' | '16:9' | 'custom';
  suggestedSize: number; // 16-128
}

export interface DesignLanguage {
  theme: 'modern' | 'classic' | 'playful' | 'professional' | 'minimal' | 'skeuomorphic' | 'neumorphic' | 'glassmorphism';
  mood: 'neutral' | 'friendly' | 'serious' | 'energetic' | 'calm';
  brandStyle?: string;
}

export interface DesignSpecification {
  id: string;
  name: string;
  style: DesignStyle;
  colors: DesignColors;
  background?: BackgroundSpec;
  effects: DesignEffects;
  gradient?: GradientSpec;
  iconStyle: IconStyle;
  dimensions?: DimensionSpec;
  designLanguage?: DesignLanguage;
  rawAnalysis: string;
  createdAt: Date;
  updatedAt: Date;
}
