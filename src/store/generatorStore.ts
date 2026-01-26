import { create } from 'zustand';

interface ImageDimensions {
  width: number;
  height: number;
}

type ActiveProjectSource = 'analysis' | 'library' | null;

interface GeneratorState {
  // 이미지 업로드 상태
  uploadedImage: File | null;
  uploadedImageUrl: string | null;
  imageDimensions: ImageDimensions | null;

  // 분석 상태
  isAnalyzing: boolean;
  analysisError: string | null;

  // SVG 생성 상태
  subject: string;
  isGenerating: boolean;
  generatedSvgs: string[];
  selectedSvgIndex: number | null;
  generationError: string | null;
  lastSubject: string;
  lastGeneratedSvgs: string[];

  // Generator에 표시 중인 프로젝트
  activeProjectId: string | null;
  activeProjectSource: ActiveProjectSource;
  resetKey: number;

  // 액션
  setUploadedImage: (file: File | null) => void;
  setImageDimensions: (dimensions: ImageDimensions | null) => void;
  setSubject: (subject: string) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setGeneratedSvgs: (svgs: string[]) => void;
  setSelectedSvgIndex: (index: number | null) => void;
  setGenerationError: (error: string | null) => void;
  setLastGeneration: (subject: string, svgs: string[]) => void;
  setActiveProject: (projectId: string | null, source: ActiveProjectSource) => void;
  clearActiveProject: () => void;
  reset: () => void;
}

export const useGeneratorStore = create<GeneratorState>((set, get) => ({
  uploadedImage: null,
  uploadedImageUrl: null,
  imageDimensions: null,
  isAnalyzing: false,
  analysisError: null,
  subject: '',
  isGenerating: false,
  generatedSvgs: [],
  selectedSvgIndex: null,
  generationError: null,
  lastSubject: '',
  lastGeneratedSvgs: [],
  activeProjectId: null,
  activeProjectSource: null,
  resetKey: 0,

  setUploadedImage: (file: File | null) => {
    // 이전 URL 해제
    const prevUrl = get().uploadedImageUrl;
    if (prevUrl) {
      URL.revokeObjectURL(prevUrl);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      set({
        uploadedImage: file,
        uploadedImageUrl: url,
        imageDimensions: null,
        activeProjectId: null,
        activeProjectSource: null,
      });
    } else {
      set({ uploadedImage: null, uploadedImageUrl: null, imageDimensions: null });
    }
  },

  setImageDimensions: (dimensions: ImageDimensions | null) => set({ imageDimensions: dimensions }),

  setSubject: (subject: string) => set({ subject }),
  setIsAnalyzing: (isAnalyzing: boolean) => set({ isAnalyzing }),
  setAnalysisError: (error: string | null) => set({ analysisError: error }),
  setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
  setGeneratedSvgs: (svgs: string[]) => set({ generatedSvgs: svgs, selectedSvgIndex: null }),
  setSelectedSvgIndex: (index: number | null) => set({ selectedSvgIndex: index }),
  setGenerationError: (error: string | null) => set({ generationError: error }),
  setLastGeneration: (subject: string, svgs: string[]) =>
    set({ lastSubject: subject, lastGeneratedSvgs: svgs }),
  setActiveProject: (projectId: string | null, source: ActiveProjectSource) =>
    set({
      activeProjectId: projectId,
      activeProjectSource: projectId ? source : null,
    }),
  clearActiveProject: () =>
    set({
      activeProjectId: null,
      activeProjectSource: null,
    }),

  reset: () => {
    const prevUrl = get().uploadedImageUrl;
    if (prevUrl) {
      URL.revokeObjectURL(prevUrl);
    }
    set({
      uploadedImage: null,
      uploadedImageUrl: null,
      imageDimensions: null,
      isAnalyzing: false,
      analysisError: null,
      subject: '',
      isGenerating: false,
      generatedSvgs: [],
      selectedSvgIndex: null,
      generationError: null,
      lastSubject: '',
      lastGeneratedSvgs: [],
      activeProjectId: null,
      activeProjectSource: null,
      resetKey: get().resetKey + 1,
    });
  },
}));
