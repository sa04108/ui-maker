export interface DesignStyle {
  shape: 'rounded' | 'square' | 'pill' | 'circle';
  borderRadius: number; // 0-50
  hasBorder: boolean;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderWidth?: number;
}

export interface DesignColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border?: string;
}

export interface DesignEffects {
  hasShadow: boolean;
  shadowType?: 'soft' | 'hard' | 'glow';
  hasGradient: boolean;
  gradientDirection?: string;
  hasInnerShadow: boolean;
}

export interface IconStyle {
  weight: 'thin' | 'light' | 'regular' | 'bold';
  filled: boolean;
  strokeWidth: number;
}

export interface DesignSpecification {
  id: string;
  name: string;
  style: DesignStyle;
  colors: DesignColors;
  effects: DesignEffects;
  iconStyle: IconStyle;
  rawAnalysis: string;
  createdAt: Date;
  updatedAt: Date;
}
