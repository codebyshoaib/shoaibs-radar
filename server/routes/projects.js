// server/routes/projects.js
import { Router } from 'express'
import { discoverProjects, getCachedProjects } from '../lib/scanner.js'
import { getStats } from '../lib/store.js'

const router = Router()

async function enrichProject(project) {
  const stats = await getStats(project.path).catch(() => null)
  return { ...project, stats }
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
