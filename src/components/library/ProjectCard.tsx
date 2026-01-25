import { useState, useEffect, useRef, memo } from 'react';
import { Trash2, ChevronRight } from 'lucide-react';
import type { DesignProject } from '@/types';

interface ProjectCardProps {
  project: DesignProject;
  isSelected: boolean;
  onSelect: () => void;
  onViewInGenerator: () => void;
  onDelete: () => void;
}

export const ProjectCard = memo(function ProjectCard({
  project,
  isSelected,
  onSelect,
  onViewInGenerator,
  onDelete,
}: ProjectCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    // 이미 URL이 있으면 재생성하지 않음
    if (urlRef.current) {
      setImageUrl(urlRef.current);
      return;
    }
    const url = URL.createObjectURL(project.referenceImage);
    urlRef.current = url;
    setImageUrl(url);
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [project.referenceImage]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleViewInGenerator = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewInGenerator();
  };

  const displayName = project.name;

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-600/20 border border-blue-500'
          : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
      }`}
    >
      {imageUrl && (
        <div className="w-12 h-12 rounded bg-gray-700 overflow-hidden flex-shrink-0">
          <img src={imageUrl} alt={project.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-200 truncate">{displayName}</h4>
        <p className="text-xs text-gray-500">
          {project.generatedIcons.length} icons
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleViewInGenerator}
          className="px-2 py-1 text-xs text-blue-300 bg-blue-900/30 border border-blue-700/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          View in Generator
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
        <ChevronRight size={16} className="text-gray-500" />
      </div>
    </div>
  );
});
