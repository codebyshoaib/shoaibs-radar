// server/routes/git.js
import { Router } from 'express'
import { getProjectById } from '../lib/scanner.js'
import { getGitInfo } from '../lib/git.js'

const router = Router({ mergeParams: true })

router.get('/', async (req, res) => {
  const project = getProjectById(req.params.projectId)
  if (!project) return res.status(404).json({ error: 'Project not found' })
  try {
    const info = await getGitInfo(project.path)
    res.json(info)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
