// server/routes/projects.js
import { Router } from 'express'
import { discoverProjects, getCachedProjects } from '../lib/scanner.js'
import { runBd } from '../lib/bd.js'

const router = Router()

const ENRICH_TIMEOUT = 5000
const enrichCache = new Map()

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))])
}

async function enrichProject(project) {
  const stats = await withTimeout(runBd(project.path, ['stats', '--json']), ENRICH_TIMEOUT).catch(() => null)
  const enriched = { ...project, stats: stats?.summary ?? null }
  enrichCache.set(project.id, enriched)
  return enriched
}

function enrichInBackground(projects) {
  Promise.allSettled(projects.map(enrichProject)).catch(() => {})
}

router.get('/', async (req, res) => {
  try {
    let projects = getCachedProjects()
    if (!projects.length) projects = await discoverProjects()
    const result = projects.map(p => enrichCache.get(p.id) ?? p)
    res.json(result)
    enrichInBackground(projects)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/refresh', async (req, res) => {
  try {
    const projects = await discoverProjects()
    const enriched = await Promise.all(projects.map(enrichProject))
    res.json(enriched)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
