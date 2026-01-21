import { Trash2, Download } from 'lucide-react';
import type { GeneratedIcon } from '@/types';
import { downloadSvg } from '@/services/export';

interface IconGalleryProps {
  icons: GeneratedIcon[];
  onDelete: (iconId: string) => void;
}

export function IconGallery({ icons, onDelete }: IconGalleryProps) {
  if (icons.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8 text-sm">
        No saved icons yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {icons.map((icon) => (
        <div
          key={icon.id}
          className="group relative bg-gray-800 rounded-lg p-3 border border-gray-700"
        >
          <div
            className="w-full aspect-square"
            dangerouslySetInnerHTML={{ __html: icon.svgCode }}
          />
          <p className="mt-2 text-xs text-gray-400 text-center truncate">
            {icon.subject}
          </p>
          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => downloadSvg(icon.svgCode, icon.subject)}
              className="p-1 bg-gray-900/80 rounded text-gray-400 hover:text-white"
            >
              <Download size={12} />
            </button>
            <button
              onClick={() => onDelete(icon.id)}
              className="p-1 bg-gray-900/80 rounded text-gray-400 hover:text-red-400"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
