/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_WS_URL: string;
  readonly VITE_BACKEND_API_URL: string;
  readonly VITE_ROTAX_ENGINE_GLB_URL: string;
  readonly VITE_TAPAS_DRONE_GLB_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
