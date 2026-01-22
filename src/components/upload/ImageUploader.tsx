import { useCallback, useState, useEffect, useMemo } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useGeneratorStore } from '@/store';

export function ImageUploader() {
  const { uploadedImage, uploadedImageUrl, setUploadedImage, imageDimensions, setImageDimensions } = useGeneratorStore();
  const [isDragging, setIsDragging] = useState(false);

  // 이미지 로드 시 크기 측정 (한 번만)
  useEffect(() => {
    if (uploadedImageUrl && !imageDimensions) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = uploadedImageUrl;
    }
  }, [uploadedImageUrl, imageDimensions, setImageDimensions]);

  // 이미지 스타일 계산 (메모이제이션)
  const imageStyle = useMemo(() => {
    if (!imageDimensions) return { width: '100%', aspectRatio: '1' };

    const containerMaxWidth = 300;
    const containerMaxHeight = 300;
    const imgRatio = imageDimensions.width / imageDimensions.height;

    let displayWidth = Math.min(imageDimensions.width, containerMaxWidth);
    let displayHeight = displayWidth / imgRatio;

    if (displayHeight > containerMaxHeight) {
      displayHeight = containerMaxHeight;
      displayWidth = displayHeight * imgRatio;
    }

    return {
      width: `${displayWidth}px`,
      height: `${displayHeight}px`,
    };
  }, [imageDimensions]);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith('image/')) {
        setUploadedImage(file);
      }
    },
    [setUploadedImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setUploadedImage(null);
  }, [setUploadedImage]);

  if (uploadedImage && uploadedImageUrl) {
    return (
      <div
        className="relative bg-gray-800 rounded-lg overflow-hidden mx-auto"
        style={imageStyle}
      >
        <img
          src={uploadedImageUrl}
          alt="Reference"
          className="w-full h-full object-contain"
        />
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1.5 bg-gray-900/80 rounded-full text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
        >
          <X size={16} />
        </button>
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-gray-900/80 rounded text-xs text-gray-300 max-w-[calc(100%-16px)] truncate">
          {uploadedImage.name}
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative w-full aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
      }`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-3 text-gray-400">
        {isDragging ? (
          <>
            <Upload size={40} className="text-blue-500" />
            <span className="text-blue-500">Drop image here</span>
          </>
        ) : (
          <>
            <ImageIcon size={40} />
            <span className="text-sm">Drag & drop or click to upload</span>
            <span className="text-xs text-gray-500">PNG, JPG, GIF, SVG</span>
          </>
        )}
      </div>
    </div>
  );
}
