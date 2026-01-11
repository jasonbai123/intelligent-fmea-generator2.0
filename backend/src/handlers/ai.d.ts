import type { Env } from '../types/cloudflare';

declare class AIHandlers {
  constructor(env: Env);
  handleGetProviders(request: Request): Promise<Response>;
  handleAIRequest(provider: string, request: Request): Promise<Response>;
}

export default AIHandlers;
