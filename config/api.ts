export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  auth: {
    sendCode: `${API_BASE_URL}/api/auth/send-code`,
    login: `${API_BASE_URL}/api/auth/login`,
    users: `${API_BASE_URL}/api/auth/users`,
  },
  collaboration: {
    projects: `${API_BASE_URL}/api/collaboration/projects`,
    project: (id: string) => `${API_BASE_URL}/api/collaboration/projects/${id}`,
    versions: (id: string) => `${API_BASE_URL}/api/collaboration/projects/${id}/versions`,
    restoreVersion: (id: string, version: string) => `${API_BASE_URL}/api/collaboration/projects/${id}/versions/${version}/restore`,
    comments: (id: string) => `${API_BASE_URL}/api/collaboration/projects/${id}/comments`,
    comment: (id: string, commentId: string) => `${API_BASE_URL}/api/collaboration/projects/${id}/comments/${commentId}`,
    replies: (id: string, commentId: string) => `${API_BASE_URL}/api/collaboration/projects/${id}/comments/${commentId}/replies`,
    collaborators: (id: string) => `${API_BASE_URL}/api/collaboration/projects/${id}/collaborators`,
    collaborator: (id: string, collaboratorId: string) => `${API_BASE_URL}/api/collaboration/projects/${id}/collaborators/${collaboratorId}`,
    activities: (id: string) => `${API_BASE_URL}/api/collaboration/projects/${id}/activities`,
    userActivities: `${API_BASE_URL}/api/collaboration/activities`,
  }
};
