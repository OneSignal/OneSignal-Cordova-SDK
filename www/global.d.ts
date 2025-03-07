declare global {
  interface Window {
    plugins?: {
      OneSignal?: import("./index").OneSignalPlugin;
    };
  }
}

export {};
