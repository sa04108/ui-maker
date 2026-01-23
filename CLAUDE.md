# UI Maker - Agent Instructions (Local)

Use this document as the working rules for edits in this repo.

## Goals

- Produce correct, minimal changes with low bug risk.
- Keep code reachable and used (no dead branches or unused helpers).
- Prefer simple, explicit solutions over clever ones.

## Before you change code

- Read the relevant files first; mirror existing patterns.
- Confirm the data flow: upload -> analysis -> spec -> SVG -> export.
- Check types in `src/types/` and storage in `src/db/database.ts`.

## Implementation rules

- Follow Zustand + Dexie patterns (async setters write to DB).
- Preserve seeded SVG generation for consistency (`hashString(specId + subject)`).
- Keep LLM prompts strict JSON, `temperature=0`, and parse defensively.
- Avoid adding new dependencies unless explicitly requested.
- Remove unused code and props introduced by your changes.

## Reliability checks

- Validate external data (LLM responses, SVG arrays) before use.
- Guard against missing keys and empty responses.
- Use consistent viewBox (`0 0 24 24`) and normalized SVGs.

## Code quality

- Keep functions small and single-purpose.
- Prefer clear names over short names.
- Add a short comment only when logic is non-obvious.

## UI/UX constraints

- Keep layouts consistent with existing components.
- Avoid breaking changes to component props without updating all uses.

## Selection guidance

- When multiple solutions exist, choose the simplest that:
    - Minimizes new surface area
    - Matches current architecture
    - Is easiest to test

## Test guidance

- If relevant, suggest running `npm run lint`.
- If UI behavior changes, suggest `npm run dev` for manual checks.
