import KVDB from '../utils/db';
import type { Env } from '../types/cloudflare';

declare class AuthHandlers {
  constructor(db: KVDB);
  handleSendCode(request: Request): Promise<Response>;
  handleLogin(request: Request): Promise<Response>;
  handleGetUsers(request: Request): Promise<Response>;
  handleGetAllVerificationCodes(request: Request): Promise<Response>;
  handleUpdateUserExpiration(request: Request): Promise<Response>;
  handleConvertTrialToRegular(request: Request): Promise<Response>;
  handleDeleteUser(request: Request): Promise<Response>;
}

export default AuthHandlers;
