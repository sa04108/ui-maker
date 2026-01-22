import { useCallback, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useGeneratorStore } from '@/store';

interface ImageUploaderProps {
  maxSize?: { width: number; height: number } | null;
}

export function ImageUploader({ maxSize }: ImageUploaderProps) {
  const { uploadedImage, uploadedImageUrl, setUploadedImage } = useGeneratorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [imageStyle, setImageStyle] = useState<{ width?: string; height?: string }>({});

  // 이미지 크기 계산: 업로드한 이미지에 맞게 영역 축소, 최대 크기는 초기 영역 크기를 넘지 않음
  useEffect(() => {
    if (uploadedImageUrl && maxSize) {
      const img = new Image();
      img.onload = () => {
        const containerMaxWidth = 300; // 초기 영역의 최대 너비 (1/3 화면의 대략적인 크기)
        const containerMaxHeight = 300;

        const imgRatio = img.width / img.height;

        let displayWidth = Math.min(img.width, containerMaxWidth);
        let displayHeight = displayWidth / imgRatio;

        if (displayHeight > containerMaxHeight) {
          displayHeight = containerMaxHeight;
          displayWidth = displayHeight * imgRatio;
        }

        setImageStyle({
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
        });
      };
      img.src = uploadedImageUrl;
    } else {
      setImageStyle({});
    }
  }, [uploadedImageUrl, maxSize]);

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
        style={imageStyle.width ? imageStyle : { width: '100%', aspectRatio: '1' }}
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
