// client/src/api.js
const BASE = '/api'

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export const api = {
  getProjects: () => req('/projects'),
  refreshProjects: () => req('/projects/refresh'),

  getIssues: (projectId, filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return req(`/${projectId}/issues${params ? '?' + params : ''}`)
  },
  getReadyIssues: (projectId) => req(`/${projectId}/issues/ready`),
  getBlockedIssues: (projectId) => req(`/${projectId}/issues/blocked`),
  getIssue: (projectId, id) => req(`/${projectId}/issues/${id}`),
  createIssue: (projectId, data) => req(`/${projectId}/issues`, { method: 'POST', body: data }),
  updateIssue: (projectId, id, data) => req(`/${projectId}/issues/${id}`, { method: 'PATCH', body: data }),
  closeIssue: (projectId, id, reason) => req(`/${projectId}/issues/${id}`, { method: 'DELETE', body: { reason } }),

  getComments: (projectId, id) => req(`/${projectId}/issues/${id}/comments`),
  addComment: (projectId, id, body) => req(`/${projectId}/issues/${id}/comments`, { method: 'POST', body: { body } }),

  addDep: (projectId, id, dependsOn) => req(`/${projectId}/issues/${id}/deps`, { method: 'POST', body: { dependsOn } }),
  removeDep: (projectId, id, depId) => req(`/${projectId}/issues/${id}/deps/${depId}`, { method: 'DELETE' }),

  deferIssue: (projectId, id, until) => req(`/${projectId}/issues/${id}/defer`, { method: 'POST', body: { until } }),
  addLabel: (projectId, id, label) => req(`/${projectId}/issues/${id}/labels`, { method: 'POST', body: { label } }),
  removeLabel: (projectId, id, label) => req(`/${projectId}/issues/${id}/labels/${encodeURIComponent(label)}`, { method: 'DELETE' }),

  getGit: (projectId) => req(`/${projectId}/git`),
  getStats: (projectId) => req(`/${projectId}/issues/stats`),
  searchIssues: (projectId, query) => req(`/${projectId}/issues/search?q=${encodeURIComponent(query)}`),
}
