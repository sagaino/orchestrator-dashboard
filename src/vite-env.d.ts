/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_LOGIN_ENDPOINT?: string
  readonly VITE_SECRET_KEY?: string
  readonly VITE_ORCHESTRATOR_CROSS_PROJECT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
