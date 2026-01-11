import KVDB from '../utils/db';
import type { Env } from '../types/cloudflare';

declare class CollaborationHandlers {
  constructor(db: KVDB);
  handleGetProjects(request: Request): Promise<Response>;
  handleCreateProject(request: Request): Promise<Response>;
  handleGetProject(request: Request, projectId: string): Promise<Response>;
  handleUpdateProject(request: Request, projectId: string): Promise<Response>;
  handleDeleteProject(request: Request, projectId: string): Promise<Response>;
  handleGetVersions(request: Request, projectId: string): Promise<Response>;
  handleRestoreVersion(request: Request, projectId: string, version: string): Promise<Response>;
  handleGetComments(request: Request, projectId: string): Promise<Response>;
  handleCreateComment(request: Request, projectId: string): Promise<Response>;
  handleUpdateComment(request: Request, projectId: string, commentId: string): Promise<Response>;
  handleDeleteComment(request: Request, projectId: string, commentId: string): Promise<Response>;
  handleAddReply(request: Request, projectId: string, commentId: string): Promise<Response>;
}

export default CollaborationHandlers;
