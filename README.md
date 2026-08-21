# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.

## Verification

Run the complete dashboard gate with:

```sh
npm run test:verify
```

The gate runs TypeScript, ESLint, the production build, proxy/auth security
checks, and deterministic Chromium lifecycle tests. Browser failures preserve
screenshots, video, traces, and error context in `test-results/browser`.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `src/components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```
