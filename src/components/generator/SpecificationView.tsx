import type { DesignSpecification } from '@/types';

interface SpecificationViewProps {
  specification: DesignSpecification | null;
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-4 h-4 rounded border border-gray-600"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs text-gray-500">{color}</span>
    </div>
  );
}

export function SpecificationView({ specification }: SpecificationViewProps) {
  if (!specification) {
    return (
      <div className="text-center text-gray-500 py-4 text-sm">
        Upload an image to analyze design
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <div>
        <h4 className="font-medium text-gray-300 mb-2">Style</h4>
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
          <span>Shape: {specification.style.shape}</span>
          <span>Border Radius: {specification.style.borderRadius}</span>
          <span>Border: {specification.style.hasBorder ? 'Yes' : 'No'}</span>
          {specification.style.hasBorder && (
            <span>Border Style: {specification.style.borderStyle}</span>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-300 mb-2">Colors</h4>
        <div className="space-y-1">
          <ColorSwatch color={specification.colors.primary} label="Primary" />
          <ColorSwatch color={specification.colors.secondary} label="Secondary" />
          <ColorSwatch color={specification.colors.accent} label="Accent" />
          <ColorSwatch color={specification.colors.background} label="Background" />
          <ColorSwatch color={specification.colors.text} label="Text" />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-300 mb-2">Effects</h4>
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
          <span>Shadow: {specification.effects.hasShadow ? specification.effects.shadowType : 'None'}</span>
          <span>Gradient: {specification.effects.hasGradient ? specification.effects.gradientDirection : 'None'}</span>
          <span>Inner Shadow: {specification.effects.hasInnerShadow ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-300 mb-2">Icon Style</h4>
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
          <span>Weight: {specification.iconStyle.weight}</span>
          <span>Filled: {specification.iconStyle.filled ? 'Yes' : 'No'}</span>
          <span>Stroke Width: {specification.iconStyle.strokeWidth}</span>
        </div>
      </div>
    </div>
  );
}
