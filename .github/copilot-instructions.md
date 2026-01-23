# UI Maker - AI Coding Agent Instructions

## Project Overview
UI Maker is a React TypeScript application that analyzes reference images using LLM APIs (OpenAI/Anthropic) to generate consistent button/icon SVG designs. The app maintains design consistency through seeded LLM calls and stores projects in IndexedDB.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **State**: Zustand stores with IndexedDB (Dexie) persistence
- **Services**: LLM image analysis, SVG generation, PNG export
- **Data Flow**: Image upload → LLM analysis → DesignSpecification → SVG generation → Export

## Key Patterns

### State Management
Use Zustand stores with async DB operations. Stores automatically sync to IndexedDB:
```typescript
// Example from settingsStore.ts
setApiKey: async (apiKey: string) => {
  set({ apiKey });
  await db.settings.put({ id: SETTINGS_ID, apiKey, ... });
}
```

### LLM Integration
- **Image Analysis**: Strict JSON schema prompts, temperature=0 for consistency
- **SVG Generation**: Seeded calls using `hashString(specId + subject)` for reproducibility
- **Providers**: Separate modules for OpenAI vs Anthropic API differences

### Data Serialization
Convert Date objects to timestamps for IndexedDB storage:
```typescript
// From database.ts
toDBProject(project: DesignProject): DBDesignProject {
  return {
    ...project,
    createdAt: project.createdAt.getTime(),
    // ...
  };
}
```

### Component Organization
Components grouped by feature in subfolders with index.ts exports:
```
components/
├── common/     # Reusable UI components
├── generator/  # Image analysis & SVG generation UI
├── library/    # Project management & gallery
└── settings/   # API configuration
```

### SVG Handling
- Validate and normalize generated SVGs
- Force `viewBox="0 0 24 24"` for consistency
- Export to PNG using Canvas API at sizes: 16, 32, 64, 128, 256, 512, 1024

## Development Workflow
- **Dev server**: `npm run dev`
- **Build**: `npm run build` (includes TypeScript compilation)
- **Lint**: `npm run lint`
- **Preview**: `npm run preview`

## Key Files
- `src/store/` - Zustand stores with DB persistence
- `src/services/llm/` - LLM API integrations and prompts
- `src/services/svg/` - SVG generation and validation
- `src/db/database.ts` - IndexedDB schema and converters
- `src/types/` - TypeScript interfaces for specifications and projects

## Conventions
- Use `@/` alias for src imports
- Async store setters handle both memory and DB updates
- LLM prompts enforce exact JSON schemas for consistency
- File names match component/service names
- Export all public APIs through index.ts files