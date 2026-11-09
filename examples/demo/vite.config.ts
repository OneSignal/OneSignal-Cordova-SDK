import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite-plus';

// Fails `vp build` and `vp dev` (not lint) when the demo has no app id.
function requireAppId(): Plugin {
  let appId: string | undefined;
  return {
    name: 'require-onesignal-app-id',
    configResolved(config) {
      appId = config.env.VITE_ONESIGNAL_APP_ID as string | undefined;
    },
    buildStart() {
      if (!appId?.trim()) {
        throw new Error('VITE_ONESIGNAL_APP_ID is not set. Add it to examples/demo/.env.');
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), requireAppId()],
});
