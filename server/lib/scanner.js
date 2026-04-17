// server/lib/scanner.js
import { readdir, readFile } from 'node:fs/promises'
import { join, basename } from 'node:path'

const HOME = process.env.HOME || process.env.USERPROFILE || '/home'
const MAX_DEPTH = 3

async function scanDir(dir, depth) {
  if (depth >= MAX_DEPTH) return []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }

  const results = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('.') && entry.name !== '.beads') continue

    const fullPath = join(dir, entry.name)

    if (entry.name === '.beads') {
      const metaPath = join(dir, '.beads', 'metadata.json')
      try {
        const raw = await readFile(metaPath, 'utf8')
        const meta = JSON.parse(raw)
        results.push({
          id: meta.dolt_database ?? basename(dir),
          name: meta.dolt_database ?? basename(dir),
          path: dir,
          beadsPath: join(dir, '.beads'),
          projectId: meta.project_id,
        })
      } catch {}
      continue
    }

    const sub = await scanDir(fullPath, depth + 1)
    results.push(...sub)
  }

  return results
}

let cachedProjects = null

export async function discoverProjects() {
  cachedProjects = await scanDir(HOME, 0)
  return cachedProjects
}

export function getCachedProjects() {
  return cachedProjects ?? []
}

export function getProjectById(id) {
  return (cachedProjects ?? []).find(p => p.id === id) ?? null
}
