/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROXY?: string
  readonly VITE_AI_PROXY_URL?: string
  readonly VITE_PROXY_APP_TOKEN?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
