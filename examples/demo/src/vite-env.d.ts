/// <reference types="vite-plus/client" />

interface ImportMetaEnv {
  readonly VITE_ONESIGNAL_API_KEY?: string;
  readonly VITE_ONESIGNAL_ANDROID_CHANNEL_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
