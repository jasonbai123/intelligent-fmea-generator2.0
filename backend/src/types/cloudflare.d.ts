declare const self: ServiceWorkerGlobalScope;

interface KVNamespace {
  get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<string | null>;
  get(key: string, options: { type: 'json' }): Promise<any | null>;
  get(key: string, options: { type: 'arrayBuffer' }): Promise<ArrayBuffer | null>;
  get(key: string, options: { type: 'stream' }): Promise<ReadableStream | null>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: {
    expiration?: number;
    expirationTtl?: number;
    metadata?: any;
  }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: {
    cursor?: string;
    prefix?: string;
    limit?: number;
  }): Promise<{
    keys: Array<{ name: string; metadata?: any; expiration?: number }>;
    list_complete: boolean;
    cursor: string;
  }>;
}

interface Env {
  FMEA_DATA: KVNamespace;
  DEEPSEEK_API_KEY?: string;
  SILICONFLOW_API_KEY?: string;
  ZHIPU_API_KEY?: string;
  GEMINI_API_KEY?: string;
}

export type { KVNamespace, Env };
