/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_LOGIN_ENDPOINT?: string
  readonly VITE_SECRET_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

