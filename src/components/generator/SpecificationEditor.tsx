import type {
  BackgroundSpec,
  DesignColors,
  DesignEffects,
  DesignLanguage,
  DesignSpecification,
  DesignStyle,
  DimensionSpec,
  GradientSpec,
  IconStyle,
} from '@/types';
import { Input, Select } from '@/components/common';

interface SpecificationEditorProps {
  specification: DesignSpecification | null;
  onChange: (specification: DesignSpecification) => void;
}

const booleanOptions = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

const shapeOptions = ['rounded', 'square', 'pill', 'circle', 'organic'];
const borderStyleOptions = ['solid', 'dashed', 'dotted', 'double'];
const paddingOptions = ['none', 'tight', 'normal', 'loose'];
const patternOptions = ['solid', 'gradient', 'noise', 'texture', 'none'];
const shadowTypeOptions = ['soft', 'hard', 'glow', 'long', 'layered'];
const gradientTypeOptions = ['linear', 'radial', 'conic'];
const gradientDirectionOptions = ['top', 'bottom', 'left', 'right', 'diagonal', 'center'];
const weightOptions = ['thin', 'light', 'regular', 'medium', 'bold', 'heavy'];
const strokeLinecapOptions = ['round', 'square', 'butt'];
const strokeLinejoinOptions = ['round', 'miter', 'bevel'];
const cornerStyleOptions = ['sharp', 'rounded', 'mixed'];
const complexityOptions = ['minimal', 'simple', 'moderate', 'detailed'];
const visualStyleOptions = ['flat', 'outlined', 'duotone', '3d', 'isometric', 'hand-drawn', 'geometric'];
const aspectRatioOptions = ['1:1', '4:3', '16:9', 'custom'];
const themeOptions = ['modern', 'classic', 'playful', 'professional', 'minimal', 'skeuomorphic', 'neumorphic', 'glassmorphism'];
const moodOptions = ['neutral', 'friendly', 'serious', 'energetic', 'calm'];

const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const pickerValue = isHexColor(value) ? value : '#000000';
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Input label={label} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
      <input
        type="color"
        value={pickerValue}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-12 bg-transparent border border-gray-700 rounded-md"
        aria-label={`${label} color picker`}
      />
    </div>
  );
}

export function SpecificationEditor({ specification, onChange }: SpecificationEditorProps) {
  if (!specification) {
    return (
      <div className="text-center text-gray-500 py-4 text-sm">
        Upload an image to analyze design
      </div>
    );
  }

  const updateStyle = (updates: Partial<DesignStyle>) => {
    onChange({ ...specification, style: { ...specification.style, ...updates } });
  };

  const updateColors = (updates: Partial<DesignColors>) => {
    onChange({ ...specification, colors: { ...specification.colors, ...updates } });
  };

  const updateBackground = (updates: Partial<BackgroundSpec>) => {
    onChange({
      ...specification,
      background: { ...(specification.background || { isTransparent: false, opacity: 100, pattern: 'none' }), ...updates },
    });
  };

  const updateEffects = (updates: Partial<DesignEffects>) => {
    onChange({ ...specification, effects: { ...specification.effects, ...updates } });
  };

  const updateGradient = (updates: Partial<GradientSpec>) => {
    const nextGradient: GradientSpec = {
      direction: specification.gradient?.direction || 'top',
      startColor: specification.gradient?.startColor || specification.colors.primary,
      endColor: specification.gradient?.endColor || specification.colors.secondary,
      ...updates,
    };
    onChange({
      ...specification,
      gradient: nextGradient,
      effects: {
        ...specification.effects,
        gradientDirection: nextGradient.direction,
        gradientColors: [nextGradient.startColor, nextGradient.endColor],
      },
    });
  };

  const updateIconStyle = (updates: Partial<IconStyle>) => {
    onChange({ ...specification, iconStyle: { ...specification.iconStyle, ...updates } });
  };

  const updateDimensions = (updates: Partial<DimensionSpec>) => {
    onChange({
      ...specification,
      dimensions: { ...(specification.dimensions || { aspectRatio: '1:1', suggestedSize: 24 }), ...updates },
    });
  };

  const updateDesignLanguage = (updates: Partial<DesignLanguage>) => {
    onChange({
      ...specification,
      designLanguage: { ...(specification.designLanguage || { theme: 'modern', mood: 'neutral' }), ...updates },
    });
  };

  const gradient = specification.gradient || {
    direction: 'top',
    startColor: specification.colors.primary,
    endColor: specification.colors.secondary,
  };

  return (
    <div className="space-y-4 text-sm">
      <div>
        <h4 className="font-medium text-gray-300 mb-2">Style</h4>
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Shape"
            value={specification.style.shape}
            options={toOptions(shapeOptions)}
            onChange={(e) => updateStyle({ shape: e.target.value as DesignStyle['shape'] })}
          />
          <Input
            label="Border Radius"
            type="number"
            min={0}
            max={50}
            value={specification.style.borderRadius}
            onChange={(e) => updateStyle({ borderRadius: Number(e.target.value) })}
          />
          <Select
            label="Border"
            value={String(specification.style.hasBorder)}
            options={booleanOptions}
            onChange={(e) => updateStyle({ hasBorder: e.target.value === 'true' })}
          />
          {specification.style.hasBorder && (
            <Select
              label="Border Style"
              value={specification.style.borderStyle || 'solid'}
              options={toOptions(borderStyleOptions)}
              onChange={(e) => updateStyle({ borderStyle: e.target.value as DesignStyle['borderStyle'] })}
            />
          )}
          {specification.style.hasBorder && (
            <Input
              label="Border Width"
              type="number"
              min={1}
              max={10}
              value={specification.style.borderWidth ?? 1}
              onChange={(e) => updateStyle({ borderWidth: Number(e.target.value) })}
            />
          )}
          <Select
            label="Padding"
            value={specification.style.padding || 'normal'}
            options={toOptions(paddingOptions)}
            onChange={(e) => updateStyle({ padding: e.target.value as DesignStyle['padding'] })}
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-300 mb-2">Colors</h4>
        <div className="grid grid-cols-2 gap-2">
          <ColorField label="Primary" value={specification.colors.primary} onChange={(value) => updateColors({ primary: value })} />
          <ColorField label="Secondary" value={specification.colors.secondary} onChange={(value) => updateColors({ secondary: value })} />
          <ColorField label="Accent" value={specification.colors.accent} onChange={(value) => updateColors({ accent: value })} />
          <ColorField label="Background" value={specification.colors.background} onChange={(value) => updateColors({ background: value })} />
          <ColorField label="Text" value={specification.colors.text} onChange={(value) => updateColors({ text: value })} />
          <ColorField label="Border" value={specification.colors.border || '#000000'} onChange={(value) => updateColors({ border: value })} />
          <ColorField label="Icon Fill" value={specification.colors.iconFill || '#000000'} onChange={(value) => updateColors({ iconFill: value })} />
          <ColorField label="Icon Stroke" value={specification.colors.iconStroke || '#000000'} onChange={(value) => updateColors({ iconStroke: value })} />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-300 mb-2">Background</h4>
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Transparent"
            value={String(specification.background?.isTransparent ?? false)}
            options={booleanOptions}
            onChange={(e) => updateBackground({ isTransparent: e.target.value === 'true' })}
          />
          <Input
            label="Opacity"
            type="number"
            min={0}
            max={100}
            value={specification.background?.opacity ?? 100}
            onChange={(e) => updateBackground({ opacity: Number(e.target.value) })}
          />
          <Select
            label="Pattern"
            value={specification.background?.pattern || 'none'}
            options={toOptions(patternOptions)}
            onChange={(e) => updateBackground({ pattern: e.target.value as BackgroundSpec['pattern'] })}
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-300 mb-2">Effects</h4>
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Shadow"
            value={String(specification.effects.hasShadow)}
            options={booleanOptions}
            onChange={(e) => updateEffects({ hasShadow: e.target.value === 'true' })}
          />
          {specification.effects.hasShadow && (
            <Select
              label="Shadow Type"
              value={specification.effects.shadowType || 'soft'}
              options={toOptions(shadowTypeOptions)}
              onChange={(e) => updateEffects({ shadowType: e.target.value as DesignEffects['shadowType'] })}
            />
          )}
          {specification.effects.hasShadow && (
            <ColorField
              label="Shadow Color"
              value={specification.effects.shadowColor || '#000000'}
              onChange={(value) => updateEffects({ shadowColor: value })}
            />
          )}
          {specification.effects.hasShadow && (
            <Input
              label="Shadow Blur"
              type="number"
              min={0}
              max={20}
              value={specification.effects.shadowBlur ?? 8}
              onChange={(e) => updateEffects({ shadowBlur: Number(e.target.value) })}
            />
          )}
          {specification.effects.hasShadow && (
            <Input
              label="Shadow Offset X"
              type="number"
              value={specification.effects.shadowOffset?.x ?? 0}
              onChange={(e) =>
                updateEffects({
                  shadowOffset: {
                    x: Number(e.target.value),
                    y: specification.effects.shadowOffset?.y ?? 0,
                  },
                })
              }
            />
          )}
          {specification.effects.hasShadow && (
            <Input
              label="Shadow Offset Y"
              type="number"
              value={specification.effects.shadowOffset?.y ?? 0}
              onChange={(e) =>
                updateEffects({
                  shadowOffset: {
                    x: specification.effects.shadowOffset?.x ?? 0,
                    y: Number(e.target.value),
                  },
                })
              }
            />
          )}
          <Select
            label="Gradient"
            value={String(specification.effects.hasGradient)}
            options={booleanOptions}
            onChange={(e) => updateEffects({ hasGradient: e.target.value === 'true' })}
          />
          {specification.effects.hasGradient && (
            <Select
              label="Gradient Type"
              value={specification.effects.gradientType || 'linear'}
              options={toOptions(gradientTypeOptions)}
              onChange={(e) => updateEffects({ gradientType: e.target.value as DesignEffects['gradientType'] })}
            />
          )}
          <Select
            label="Inner Shadow"
            value={String(specification.effects.hasInnerShadow)}
            options={booleanOptions}
            onChange={(e) => updateEffects({ hasInnerShadow: e.target.value === 'true' })}
          />
          <Select
            label="Glow"
            value={String(specification.effects.hasGlow ?? false)}
            options={booleanOptions}
            onChange={(e) => updateEffects({ hasGlow: e.target.value === 'true' })}
          />
          {specification.effects.hasGlow && (
            <ColorField
              label="Glow Color"
              value={specification.effects.glowColor || '#ffffff'}
              onChange={(value) => updateEffects({ glowColor: value })}
            />
          )}
          {specification.effects.hasGlow && (
            <Input
              label="Glow Intensity"
              type="number"
              min={0}
              max={100}
              value={specification.effects.glowIntensity ?? 50}
              onChange={(e) => updateEffects({ glowIntensity: Number(e.target.value) })}
            />
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-300 mb-2">Gradient</h4>
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Direction"
            value={gradient.direction}
            options={toOptions(gradientDirectionOptions)}
            onChange={(e) => updateGradient({ direction: e.target.value as GradientSpec['direction'] })}
          />
          <ColorField label="Start Color" value={gradient.startColor} onChange={(value) => updateGradient({ startColor: value })} />
          <ColorField label="End Color" value={gradient.endColor} onChange={(value) => updateGradient({ endColor: value })} />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-300 mb-2">Icon Style</h4>
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Weight"
            value={specification.iconStyle.weight}
            options={toOptions(weightOptions)}
            onChange={(e) => updateIconStyle({ weight: e.target.value as IconStyle['weight'] })}
          />
          <Select
            label="Filled"
            value={String(specification.iconStyle.filled)}
            options={booleanOptions}
            onChange={(e) => updateIconStyle({ filled: e.target.value === 'true' })}
          />
          <Input
            label="Stroke Width"
            type="number"
            min={0}
            max={8}
            value={specification.iconStyle.strokeWidth}
            onChange={(e) => updateIconStyle({ strokeWidth: Number(e.target.value) })}
          />
          <Select
            label="Stroke Linecap"
            value={specification.iconStyle.strokeLinecap || 'round'}
            options={toOptions(strokeLinecapOptions)}
            onChange={(e) => updateIconStyle({ strokeLinecap: e.target.value as IconStyle['strokeLinecap'] })}
          />
          <Select
            label="Stroke Linejoin"
            value={specification.iconStyle.strokeLinejoin || 'round'}
            options={toOptions(strokeLinejoinOptions)}
            onChange={(e) => updateIconStyle({ strokeLinejoin: e.target.value as IconStyle['strokeLinejoin'] })}
          />
          <Select
            label="Corner Style"
            value={specification.iconStyle.cornerStyle || 'rounded'}
            options={toOptions(cornerStyleOptions)}
            onChange={(e) => updateIconStyle({ cornerStyle: e.target.value as IconStyle['cornerStyle'] })}
          />
          <Select
            label="Complexity"
            value={specification.iconStyle.complexity || 'simple'}
            options={toOptions(complexityOptions)}
            onChange={(e) => updateIconStyle({ complexity: e.target.value as IconStyle['complexity'] })}
          />
          <Select
            label="Visual Style"
            value={specification.iconStyle.visualStyle || 'outlined'}
            options={toOptions(visualStyleOptions)}
            onChange={(e) => updateIconStyle({ visualStyle: e.target.value as IconStyle['visualStyle'] })}
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-300 mb-2">Dimensions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Aspect Ratio"
            value={specification.dimensions?.aspectRatio || '1:1'}
            options={toOptions(aspectRatioOptions)}
            onChange={(e) => updateDimensions({ aspectRatio: e.target.value as DimensionSpec['aspectRatio'] })}
          />
          <Input
            label="Suggested Size"
            type="number"
            min={16}
            max={128}
            value={specification.dimensions?.suggestedSize ?? 24}
            onChange={(e) => updateDimensions({ suggestedSize: Number(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-300 mb-2">Design Language</h4>
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Theme"
            value={specification.designLanguage?.theme || 'modern'}
            options={toOptions(themeOptions)}
            onChange={(e) => updateDesignLanguage({ theme: e.target.value as DesignLanguage['theme'] })}
          />
          <Select
            label="Mood"
            value={specification.designLanguage?.mood || 'neutral'}
            options={toOptions(moodOptions)}
            onChange={(e) => updateDesignLanguage({ mood: e.target.value as DesignLanguage['mood'] })}
          />
          <Input
            label="Brand Style"
            value={specification.designLanguage?.brandStyle || ''}
            onChange={(e) => updateDesignLanguage({ brandStyle: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
