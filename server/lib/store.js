// server/lib/store.js
// Fast reads directly from .beads/issues.jsonl — no bd process spawning
import { readFile, watch } from 'node:fs/promises'
import { join } from 'node:path'

const caches = new Map() // projectPath -> { issues, mtime }

async function loadIssues(projectPath) {
  const file = join(projectPath, '.beads', 'issues.jsonl')
  try {
    const stat = await import('node:fs/promises').then(m => m.stat(file))
    const cached = caches.get(projectPath)
    if (cached && cached.mtime >= stat.mtimeMs) return cached.issues

    const text = await readFile(file, 'utf8')
    const issues = text.trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
    caches.set(projectPath, { issues, mtime: stat.mtimeMs })
    return issues
  } catch {
    return []
  }
}

export async function listIssues(projectPath, filters = {}) {
  let issues = await loadIssues(projectPath)
  if (filters.status) issues = issues.filter(i => i.status === filters.status)
  if (filters.priority !== undefined) issues = issues.filter(i => i.priority === Number(filters.priority))
  if (filters.type) issues = issues.filter(i => i.issue_type === filters.type)
  return issues
}

export async function getIssue(projectPath, id) {
  const issues = await loadIssues(projectPath)
  return issues.find(i => i.id === id) ?? null
}

export async function getStats(projectPath) {
  const issues = await loadIssues(projectPath)
  return {
    total_issues: issues.length,
    open_issues: issues.filter(i => i.status === 'open').length,
    in_progress_issues: issues.filter(i => i.status === 'in_progress').length,
    blocked_issues: issues.filter(i => i.status === 'blocked').length,
    closed_issues: issues.filter(i => i.status === 'closed').length,
  }
}

export async function searchIssues(projectPath, query) {
  const issues = await loadIssues(projectPath)
  const q = query.toLowerCase()
  return issues.filter(i =>
    i.title?.toLowerCase().includes(q) ||
    i.description?.toLowerCase().includes(q) ||
    i.id?.toLowerCase().includes(q)
  )
}

export async function getReadyIssues(projectPath) {
  const issues = await loadIssues(projectPath)
  const openIds = new Set(issues.filter(i => i.status !== 'closed').map(i => i.id))
  return issues.filter(i =>
    i.status === 'open' &&
    i.dependency_count === 0
  )
}

export async function getBlockedIssues(projectPath) {
  const issues = await loadIssues(projectPath)
  return issues.filter(i => i.status === 'blocked')
}
