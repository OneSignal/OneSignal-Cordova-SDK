/// <reference types="vite-plus/client" />

interface ImportMetaEnv {
  readonly VITE_ONESIGNAL_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
