import { create } from 'zustand';

interface GeneratorState {
  // 이미지 업로드 상태
  uploadedImage: File | null;
  uploadedImageUrl: string | null;

  // 분석 상태
  isAnalyzing: boolean;
  analysisError: string | null;

  // SVG 생성 상태
  subject: string;
  isGenerating: boolean;
  generatedSvgs: string[];
  selectedSvgIndex: number | null;
  generationError: string | null;

  // 액션
  setUploadedImage: (file: File | null) => void;
  setSubject: (subject: string) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setGeneratedSvgs: (svgs: string[]) => void;
  setSelectedSvgIndex: (index: number | null) => void;
  setGenerationError: (error: string | null) => void;
  reset: () => void;
}

export const useGeneratorStore = create<GeneratorState>((set, get) => ({
  uploadedImage: null,
  uploadedImageUrl: null,
  isAnalyzing: false,
  analysisError: null,
  subject: '',
  isGenerating: false,
  generatedSvgs: [],
  selectedSvgIndex: null,
  generationError: null,

  setUploadedImage: (file: File | null) => {
    // 이전 URL 해제
    const prevUrl = get().uploadedImageUrl;
    if (prevUrl) {
      URL.revokeObjectURL(prevUrl);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      set({ uploadedImage: file, uploadedImageUrl: url });
    } else {
      set({ uploadedImage: null, uploadedImageUrl: null });
    }
  },

  setSubject: (subject: string) => set({ subject }),
  setIsAnalyzing: (isAnalyzing: boolean) => set({ isAnalyzing }),
  setAnalysisError: (error: string | null) => set({ analysisError: error }),
  setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
  setGeneratedSvgs: (svgs: string[]) => set({ generatedSvgs: svgs, selectedSvgIndex: null }),
  setSelectedSvgIndex: (index: number | null) => set({ selectedSvgIndex: index }),
  setGenerationError: (error: string | null) => set({ generationError: error }),

  reset: () => {
    const prevUrl = get().uploadedImageUrl;
    if (prevUrl) {
      URL.revokeObjectURL(prevUrl);
    }
    set({
      uploadedImage: null,
      uploadedImageUrl: null,
      isAnalyzing: false,
      analysisError: null,
      subject: '',
      isGenerating: false,
      generatedSvgs: [],
      selectedSvgIndex: null,
      generationError: null,
    });
  },
}));
