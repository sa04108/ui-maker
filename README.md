# UI Maker

UI Maker is a browser app for turning a reference icon/button image into a reusable SVG icon set, with optional PNG export. It runs entirely in the browser and stores projects locally.

## Core flow
- Upload a reference image.
- Analyze the image with a selected LLM provider.
- Review the extracted design spec.
- Generate multiple SVG variants for a subject.
- Save and export SVG/PNG.

## Tech stack
- React + TypeScript + Vite
- Tailwind CSS
- Zustand for UI state
- Dexie (IndexedDB) for local storage
- OpenAI/Anthropic via direct HTTP calls

## Local data
- Projects and settings are stored in IndexedDB on the client.
- API keys are saved locally for the chosen provider.

## Scripts
```
npm run dev
npm run build
npm run lint
npm run preview
```

## Project structure
```
ui-maker/
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  tsconfig.json
  vite.config.ts
  src/
    App.tsx
    main.tsx
    index.css
    vite-env.d.ts
    components/
      common/
      generator/
      layout/
      library/
      settings/
      upload/
    services/
      llm/
      svg/
      export/
    store/
    db/
    types/
```
