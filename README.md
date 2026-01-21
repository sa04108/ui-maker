# UI Maker - Spec

## 프로젝트 개요

**목적**: 레퍼런스 이미지를 LLM에 업로드하여 일관된 디자인의 버튼 UI를 생성하는 도구

**핵심 가치**: **일관성** - 같은 이미지에 대해 항상 동일한 근본적 디자인 유지

---

## 1. 기술 스택

```
Frontend: React 18.3.1 + TypeScript 5.6.2 + Vite 5.4.10 + Tailwind CSS 3.4.14
State: Zustand 5.0.0
DB: IndexedDB (Dexie 4.0.8 + dexie-react-hooks 1.1.7) - 클라이언트 사이드 영구 저장
Icons: Lucide React 0.460.0
LLM: OpenAI/Anthropic API (Vision 지원)
SVG: LLM 생성 (seed 고정으로 일관성 보장) + svg-to-png 변환
```

### 지원 모델

| Provider  | 모델                      | Tier     |
| --------- | ------------------------- | -------- |
| OpenAI    | gpt-4o                    | premium  |
| OpenAI    | gpt-4o-mini               | standard |
| OpenAI    | o4-mini                   | standard |
| OpenAI    | gpt-4.1                   | premium  |
| Anthropic | claude-sonnet-4-20250514  | standard |
| Anthropic | claude-opus-4-20250514    | premium  |

---

## 2. 핵심 데이터 구조

### 2.1 디자인 명세서 (Design Specification)

```tsx
interface DesignStyle {
  shape: 'rounded' | 'square' | 'pill' | 'circle' | 'organic';
  borderRadius: number; // 0-50
  hasBorder: boolean;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  borderWidth: number;
  padding: 'none' | 'tight' | 'normal' | 'loose';
}

interface DesignColors {
  primary: string; // HEX
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border?: string;
  iconFill?: string;
  iconStroke?: string;
}

interface BackgroundSpec {
  isTransparent: boolean;
  opacity: number; // 0-100
  pattern: 'solid' | 'gradient' | 'noise' | 'texture' | 'none';
}

interface DesignEffects {
  hasShadow: boolean;
  shadowType: 'soft' | 'hard' | 'glow' | 'long' | 'layered';
  shadowColor?: string; // RGBA 형식
  shadowOffset?: { x: number; y: number };
  shadowBlur?: number;
  hasGradient: boolean;
  gradientType: 'linear' | 'radial' | 'conic';
  gradientDirection: string;
  gradientColors: string[];
  hasInnerShadow: boolean;
  hasGlow?: boolean;
  glowColor?: string;
  glowIntensity?: number; // 0-100
}

interface IconStyle {
  weight: 'thin' | 'light' | 'regular' | 'medium' | 'bold' | 'heavy';
  filled: boolean;
  strokeWidth: number;
  strokeLinecap: 'round' | 'square' | 'butt';
  strokeLinejoin: 'round' | 'miter' | 'bevel';
  cornerStyle: 'sharp' | 'rounded' | 'mixed';
  complexity: 'minimal' | 'simple' | 'moderate' | 'detailed';
  visualStyle:
    | 'flat'
    | 'outlined'
    | 'duotone'
    | '3d'
    | 'isometric'
    | 'hand-drawn'
    | 'geometric';
}

interface DimensionSpec {
  aspectRatio: '1:1' | '4:3' | '16:9' | 'custom';
  suggestedSize: number; // 16-128
}

interface DesignLanguage {
  theme:
    | 'modern'
    | 'classic'
    | 'playful'
    | 'professional'
    | 'minimal'
    | 'skeuomorphic'
    | 'neumorphic'
    | 'glassmorphism';
  mood: 'neutral' | 'friendly' | 'serious' | 'energetic' | 'calm';
  brandStyle?: string;
}

interface DesignSpecification {
  id: string;
  name: string;
  style: DesignStyle;
  colors: DesignColors;
  background?: BackgroundSpec;
  effects: DesignEffects;
  iconStyle: IconStyle;
  dimensions?: DimensionSpec;
  designLanguage?: DesignLanguage;
  rawAnalysis: string; // 원본 LLM 분석 텍스트
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 프로젝트 (디자인 보관함)

```tsx
interface DesignProject {
  id: string;
  name: string;
  referenceImage: Blob; // 원본 이미지
  specification: DesignSpecification;
  generatedIcons: GeneratedIcon[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.3 생성된 아이콘

```tsx
interface GeneratedIcon {
  id: string;
  projectId: string;
  subject: string; // "저장", "불러오기", "종료" 등
  svgCode: string;
  createdAt: Date;
}
```

### 2.4 설정

```tsx
type LLMProvider = 'openai' | 'anthropic';
type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'o4-mini' | 'gpt-4.1';
type AnthropicModel = 'claude-sonnet-4-20250514' | 'claude-opus-4-20250514';
type LLMModel = OpenAIModel | AnthropicModel;

interface ModelOption {
  id: LLMModel;
  name: string;
  provider: LLMProvider;
  description: string;
  tier: 'standard' | 'premium';
}

interface Settings {
  id: string;
  apiKey: string;
  provider: LLMProvider;
  model: LLMModel;
}
```

---

## 3. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI Layer                                │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│  Settings   │ ImageUpload │  Generator  │  Library/Gallery      │
│  (API Key)  │ (Drag&Drop) │  (Subject)  │  (Saved Projects)     │
│  (Model)    │             │             │                       │
└─────────────┴─────────────┴─────────────┴───────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic                             │
├─────────────────────────────────────────────────────────────────┤
│  ImageAnalyzer      │  SVGGenerator      │  PngExporter         │
│  (LLM Vision API)   │  (명세서→SVG변환)   │  (PNG 다운로드)        │
│  ├─ OpenAI          │  (seed 고정)       │  (Canvas 변환)        │
│  └─ Anthropic       │                    │                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  IndexedDB (Dexie)                                              │
│  - projects: DesignProject[] (id, name, createdAt, updatedAt)   │
│  - settings: { apiKey, provider, model }                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 핵심 기능 흐름

### 4.1 새 디자인 생성 흐름

```
1. 사용자가 레퍼런스 이미지 업로드 (드래그&드랍)
2. LLM Vision API로 이미지 분석 (OpenAI 또는 Anthropic)
   - 색상, 형태, 효과, 아이콘 스타일 추출
   - 일관성을 위해 구조화된 JSON 출력 요청
   - temperature=0 설정
3. 분석 결과로 DesignSpecification 생성
4. 프로젝트로 저장 (이미지 + 명세서)
5. 바로 아이콘 생성 가능
```

### 4.2 아이콘 생성 흐름

```
1. 저장된 프로젝트 선택 또는 새 프로젝트에서
2. 원하는 버튼 주제 입력 (예: "저장", "삭제")
3. LLM으로 SVG 5개 변형 생성 (seed 고정)
   - 명세서의 색상, 형태, 효과 적용
   - 아이콘 도형은 주제에 맞게 생성
   - 한 번의 API 호출로 5개 생성 (토큰 효율)
4. 5개 미리보기 → 사용자가 원하는 것 선택
5. 선택한 아이콘 저장
6. 원하는 크기로 PNG/SVG 내보내기
```

### 4.3 일관성 보장 전략 (seed 고정)

```
핵심: 같은 명세서 + 같은 주제 → 항상 같은 5개 변형

1. LLM 이미지 분석 시:
   - temperature=0 설정
   - 구조화된 JSON 스키마 강제
   - 분석 결과를 저장하여 재사용

2. SVG 생성 시 (LLM 사용):
   - temperature=0 + seed 파라미터 고정
   - seed = hashString(specificationId + subject)
   - 한 번에 5개 변형 생성 (토큰 효율적)
   - 사용자가 5개 중 원하는 것 선택
   - OpenAI: seed 파라미터 사용
   - Anthropic: temperature=0으로 일관성 보장
```

---

## 5. 폴더 구조

```
src/
├── components/
│   ├── common/           # Button, Input, Modal, Select
│   ├── upload/           # ImageUploader (드래그&드랍)
│   ├── generator/        # GeneratorPanel, SpecificationView, SvgPreview, ExportPanel
│   ├── library/          # LibraryPanel, ProjectCard, IconGallery
│   ├── layout/           # Header
│   └── settings/         # SettingsModal
│
├── services/
│   ├── llm/
│   │   ├── ImageAnalyzer.ts      # Vision API 호출 (fileToBase64, generateId)
│   │   ├── prompts.ts            # 분석/생성용 프롬프트
│   │   └── providers/
│   │       ├── openai.ts         # OpenAI API 통합
│   │       ├── anthropic.ts      # Anthropic API 통합
│   │       └── index.ts
│   ├── svg/
│   │   └── SVGGenerator.ts       # LLM으로 SVG 5개 변형 생성 (hashString, validateSvg, normalizeSvg)
│   └── export/
│       └── PngExporter.ts        # SVG→PNG 변환 (Canvas 사용)
│
├── store/
│   ├── projectStore.ts           # 프로젝트 CRUD (IndexedDB 동기화)
│   ├── settingsStore.ts          # API 키, 프로바이더, 모델 설정
│   └── generatorStore.ts         # 현재 생성 상태 (메모리 기반)
│
├── db/
│   └── database.ts               # Dexie 설정 (toDBProject, fromDBProject)
│
├── types/
│   ├── specification.ts          # 디자인 명세서 타입
│   ├── project.ts                # 프로젝트/아이콘 타입
│   ├── settings.ts               # 설정/모델 타입
│   └── index.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## 6. 주요 컴포넌트 상세

### 6.1 메인 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│  Header: 앱 제목 + 설정(API Key, Model) 버튼                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Tab: 생성기 | 라이브러리]                                   │
│                                                             │
│  생성기 (2열 레이아웃):                                       │
│  ┌──────────────────────┬──────────────────────┐            │
│  │ 이미지 업로드          │ 주제 입력              │            │
│  │ 분석 버튼             │ 생성 버튼              │            │
│  │ 명세서 미리보기        │ SVG 5개 미리보기       │            │
│  │                      │ 내보내기 옵션          │            │
│  └──────────────────────┴──────────────────────┘            │
│                                                             │
│  라이브러리 (3열 레이아웃):                                    │
│  ┌────────────┬────────────────────────────────┐            │
│  │ 프로젝트    │ 선택한 프로젝트 명세서            │            │
│  │ 목록       │ 생성된 아이콘 갤러리              │            │
│  └────────────┴────────────────────────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 컴포넌트 역할

| 컴포넌트           | 역할                                          |
| ----------------- | -------------------------------------------- |
| Header            | 앱 제목, API 키 설정 버튼, 미설정 시 경고 표시     |
| SettingsModal     | 프로바이더/모델 선택, API 키 입력                |
| ImageUploader     | 드래그&드랍 이미지 업로드, 미리보기               |
| GeneratorPanel    | 이미지 분석, SVG 생성, 저장 통합 UI              |
| SpecificationView | 디자인 명세서 시각화 (스타일, 색상, 효과, 아이콘)   |
| SvgPreview        | 5개 SVG 변형 미리보기, 선택 기능                 |
| ExportPanel       | 크기 선택, PNG/SVG 다운로드                     |
| LibraryPanel      | 저장된 프로젝트 목록, 선택한 프로젝트 상세 정보     |
| ProjectCard       | 프로젝트 썸네일, 이름, 아이콘 개수, 삭제          |
| IconGallery       | 생성된 아이콘 갤러리, 다운로드/삭제               |

---

## 7. LLM 프롬프트 전략

### 이미지 분석 프롬프트 (일관성 핵심)

```
You are an expert UI/UX designer analyzing a reference image for an icon/button design system.
Analyze this image with EXTREME attention to detail and extract a comprehensive design specification.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):

{
  "style": {
    "shape": "rounded|square|pill|circle|organic",
    "borderRadius": <number 0-50>,
    "hasBorder": <boolean>,
    "borderStyle": "solid|dashed|dotted|double",
    "borderWidth": <number 0-10>,
    "padding": "none|tight|normal|loose"
  },
  "colors": {
    "primary": "<hex>",
    "secondary": "<hex>",
    "accent": "<hex>",
    "background": "<hex>",
    "text": "<hex>",
    "border": "<hex>",
    "iconFill": "<hex>",
    "iconStroke": "<hex>"
  },
  "background": {
    "isTransparent": <boolean>,
    "opacity": <number 0-100>,
    "pattern": "solid|gradient|noise|texture|none"
  },
  "effects": {
    "hasShadow": <boolean>,
    "shadowType": "soft|hard|glow|long|layered",
    "shadowColor": "<rgba>",
    "shadowOffset": { "x": <number>, "y": <number> },
    "shadowBlur": <number>,
    "hasGradient": <boolean>,
    "gradientType": "linear|radial|conic",
    "gradientDirection": "top|bottom|left|right|diagonal|<angle>",
    "gradientColors": ["<hex>", "<hex>"],
    "hasInnerShadow": <boolean>,
    "hasGlow": <boolean>,
    "glowColor": "<rgba>",
    "glowIntensity": <number 0-100>
  },
  "iconStyle": {
    "weight": "thin|light|regular|medium|bold|heavy",
    "filled": <boolean>,
    "strokeWidth": <number 0.5-6>,
    "strokeLinecap": "round|square|butt",
    "strokeLinejoin": "round|miter|bevel",
    "cornerStyle": "sharp|rounded|mixed",
    "complexity": "minimal|simple|moderate|detailed",
    "visualStyle": "flat|outlined|duotone|3d|isometric|hand-drawn|geometric"
  },
  "dimensions": {
    "aspectRatio": "1:1|4:3|16:9|custom",
    "suggestedSize": <number 16-128>
  },
  "designLanguage": {
    "theme": "modern|classic|playful|professional|minimal|skeuomorphic|neumorphic|glassmorphism",
    "mood": "neutral|friendly|serious|energetic|calm",
    "brandStyle": "<optional description>"
  }
}

Be extremely precise and consistent. Focus on extracting every visual detail accurately.
```

### SVG 생성 프롬프트

```
getSvgGenerationPrompt(specification, subject):
  - 명세서의 모든 스타일 속성 포함
  - 5개의 서로 다른 변형 요청
  - viewBox="0 0 24 24" 강제
  - width/height 속성 제거
  - 각 변형은 다른 해석 제공
```

---

## 8. 내보내기 크기 지원

```tsx
const EXPORT_SIZES = [16, 32, 64, 128, 256, 512, 1024];
```

SVG → Canvas → PNG 변환으로 정확한 크기 보장

---

## 9. API 통합

### OpenAI API 호출

```typescript
// 이미지 분석
POST https://api.openai.com/v1/chat/completions
Headers: Authorization: Bearer {apiKey}
Body: {
  model: "gpt-4o",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: IMAGE_ANALYSIS_PROMPT },
      { type: "image_url", image_url: { url: "data:image/png;base64,..." } }
    ]
  }],
  temperature: 0,
  max_tokens: 1500
}

// SVG 생성
Body: {
  model: "gpt-4o",
  messages: [{ role: "user", content: getSvgGenerationPrompt(...) }],
  temperature: 0,
  seed: hashString(`${specId}_${subject}`),
  max_tokens: 6000
}
```

### Anthropic API 호출

```typescript
POST https://api.anthropic.com/v1/messages
Headers:
  x-api-key: {apiKey}
  anthropic-version: 2023-06-01
  anthropic-dangerous-direct-browser-access: true
Body: {
  model: "claude-sonnet-4-20250514",
  max_tokens: 1500,
  messages: [{
    role: "user",
    content: [
      { type: "image", source: { type: "base64", media_type: "image/png", data: "..." } },
      { type: "text", text: IMAGE_ANALYSIS_PROMPT }
    ]
  }]
}
```

---

## 10. 구현 순서

### Phase 1: 기반 구축 ✅

1. 프로젝트 초기화 (Vite + React + TS + Tailwind)
2. Dexie DB 설정
3. 기본 레이아웃 및 컴포넌트

### Phase 2: 핵심 기능 ✅

1. 이미지 업로드 컴포넌트 (드래그&드랍)
2. 설정 페이지 (API Key, Provider, Model 입력)
3. LLM 이미지 분석 서비스 (OpenAI, Anthropic)
4. 명세서 저장 및 표시

### Phase 3: SVG 생성 ✅

1. LLM SVG 생성 서비스 (seed 고정, 5개 변형)
2. SVG 미리보기 및 선택 UI
3. 선택한 아이콘 저장 로직

### Phase 4: 내보내기 및 보관 ✅

1. PNG/SVG 내보내기 (다양한 크기)
2. 프로젝트 라이브러리 UI
3. 생성된 아이콘 갤러리

---

## 11. 검증 계획

1. **이미지 업로드 테스트**: 드래그&드랍, 클릭 선택 모두 동작
2. **LLM 분석 테스트**: API 키 설정 후 이미지 분석 실행
3. **일관성 테스트**: 같은 이미지 여러 번 분석 → 동일 결과 확인
4. **SVG 생성 테스트**: 명세서로 SVG 생성 및 미리보기
5. **내보내기 테스트**: 16x16 ~ 1024x1024 모든 크기 PNG 다운로드
6. **저장 테스트**: 브라우저 새로고침 후 프로젝트 유지 확인

---

## 12. 파일 목록

```
ui-maker/
├── package.json              # 의존성
├── vite.config.ts            # Vite 설정
├── tailwind.config.js        # Tailwind 설정
├── postcss.config.js         # PostCSS 설정
├── tsconfig.json             # TypeScript 설정
├── index.html                # HTML 진입점
└── src/
    ├── main.tsx              # React 진입점
    ├── App.tsx               # 앱 루트
    ├── index.css             # 전역 스타일
    ├── vite-env.d.ts         # Vite 타입 정의
    ├── db/
    │   └── database.ts       # IndexedDB 설정
    ├── types/
    │   ├── specification.ts  # 디자인 명세서 타입
    │   ├── project.ts        # 프로젝트/아이콘 타입
    │   ├── settings.ts       # 설정/모델 타입
    │   └── index.ts          # 타입 export
    ├── store/
    │   ├── projectStore.ts   # 프로젝트 스토어
    │   ├── settingsStore.ts  # 설정 스토어
    │   ├── generatorStore.ts # 생성기 상태
    │   └── index.ts          # 스토어 export
    ├── services/
    │   ├── llm/
    │   │   ├── ImageAnalyzer.ts
    │   │   ├── prompts.ts
    │   │   ├── providers/
    │   │   │   ├── openai.ts
    │   │   │   ├── anthropic.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   ├── svg/
    │   │   ├── SVGGenerator.ts
    │   │   └── index.ts
    │   └── export/
    │       ├── PngExporter.ts
    │       └── index.ts
    └── components/
        ├── common/
        │   ├── Button.tsx
        │   ├── Input.tsx
        │   ├── Modal.tsx
        │   ├── Select.tsx
        │   └── index.ts
        ├── upload/
        │   ├── ImageUploader.tsx
        │   └── index.ts
        ├── generator/
        │   ├── GeneratorPanel.tsx
        │   ├── SpecificationView.tsx
        │   ├── SvgPreview.tsx
        │   ├── ExportPanel.tsx
        │   └── index.ts
        ├── library/
        │   ├── LibraryPanel.tsx
        │   ├── ProjectCard.tsx
        │   ├── IconGallery.tsx
        │   └── index.ts
        ├── layout/
        │   ├── Header.tsx
        │   └── index.ts
        └── settings/
            ├── SettingsModal.tsx
            └── index.ts
```
