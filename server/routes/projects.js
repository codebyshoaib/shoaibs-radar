// server/routes/projects.js
import { Router } from 'express'
import { discoverProjects, getCachedProjects } from '../lib/scanner.js'
import { getGitInfo } from '../lib/git.js'
import { runBd } from '../lib/bd.js'

const router = Router()

const ENRICH_TIMEOUT = 5000

// Cache enriched project data so first response is instant
const enrichCache = new Map()

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))])
}

async function enrichProject(project) {
  const [git, stats] = await Promise.allSettled([
    withTimeout(getGitInfo(project.path), ENRICH_TIMEOUT),
    withTimeout(runBd(project.path, ['stats', '--json']), ENRICH_TIMEOUT),
  ])
  const enriched = {
    ...project,
    git: git.status === 'fulfilled' ? git.value : { isGitRepo: false },
    stats: stats.status === 'fulfilled' ? stats.value?.summary ?? null : null,
  }
  enrichCache.set(project.id, enriched)
  return enriched
}

function enrichInBackground(projects) {
  // Fire and forget — updates the cache for next request
  Promise.allSettled(projects.map(enrichProject)).catch(() => {})
}

router.get('/', async (req, res) => {
  try {
    let projects = getCachedProjects()
    if (!projects.length) projects = await discoverProjects()

    // Return cached enriched data immediately if available, otherwise bare project
    const result = projects.map(p => enrichCache.get(p.id) ?? p)
    res.json(result)

    // Enrich in background for next request
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
