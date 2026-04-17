// server/routes/projects.js
import { Router } from 'express'
import { discoverProjects, getCachedProjects } from '../lib/scanner.js'
import { getGitInfo } from '../lib/git.js'
import { runBd } from '../lib/bd.js'

const router = Router()

const ENRICH_TIMEOUT = 5000

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))])
}

async function enrichProject(project) {
  const [git, stats] = await Promise.allSettled([
    withTimeout(getGitInfo(project.path), ENRICH_TIMEOUT),
    withTimeout(runBd(project.path, ['stats', '--json']), ENRICH_TIMEOUT),
  ])
  return {
    ...project,
    git: git.status === 'fulfilled' ? git.value : { isGitRepo: false },
    stats: stats.status === 'fulfilled' ? stats.value?.summary ?? null : null,
  }
}

router.get('/', async (req, res) => {
  try {
    let projects = getCachedProjects()
    if (!projects.length) projects = await discoverProjects()
    const enriched = await Promise.all(projects.map(enrichProject))
    res.json(enriched)
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
