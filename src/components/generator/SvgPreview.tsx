import { Check } from 'lucide-react';

interface SvgPreviewProps {
  svgs: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function SvgPreview({ svgs, selectedIndex, onSelect }: SvgPreviewProps) {
  if (svgs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Generate icons to see preview
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-3">
      {svgs.map((svg, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`relative aspect-square p-3 rounded-lg border-2 transition-all ${
            selectedIndex === index
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
          }`}
        >
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          {selectedIndex === index && (
            <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
