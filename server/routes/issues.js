// server/routes/issues.js
import { Router } from 'express'
import { getProjectById } from '../lib/scanner.js'
import { runBd } from '../lib/bd.js'
import { listIssues, getIssue, getStats, searchIssues, getReadyIssues, getBlockedIssues } from '../lib/store.js'

const router = Router({ mergeParams: true })

function getProject(req, res) {
  const project = getProjectById(req.params.projectId)
  if (!project) { res.status(404).json({ error: 'Project not found' }); return null }
  return project
}

// Reads — served from issues.jsonl directly, instant
router.get('/', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  try { res.json(await listIssues(project.path, req.query)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/stats', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  try { res.json(await getStats(project.path)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/search', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  if (!req.query.q) return res.json([])
  try { res.json(await searchIssues(project.path, req.query.q)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/ready', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  try { res.json(await getReadyIssues(project.path)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/blocked', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  try { res.json(await getBlockedIssues(project.path)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/:id', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  try {
    const issue = await getIssue(project.path, req.params.id)
    if (!issue) return res.status(404).json({ error: 'Issue not found' })
    res.json(issue)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Writes — still go through bd cli
router.post('/', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  const { title, description, type, priority, assignee, acceptance, design } = req.body
  if (!title) return res.status(400).json({ error: 'title is required' })
  const args = ['create', '--json', `--title=${title}`]
  if (description) args.push(`--description=${description}`)
  if (type) args.push(`--type=${type}`)
  if (priority !== undefined) args.push(`--priority=${priority}`)
  if (assignee) args.push(`--assignee=${assignee}`)
  if (acceptance) args.push(`--acceptance=${acceptance}`)
  if (design) args.push(`--design=${design}`)
  try { res.json(await runBd(project.path, args)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.patch('/:id', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  const { title, description, notes, priority, assignee, status } = req.body
  const args = ['update', req.params.id]
  if (title) args.push(`--title=${title}`)
  if (description) args.push(`--description=${description}`)
  if (notes) args.push(`--notes=${notes}`)
  if (priority !== undefined) args.push(`--priority=${priority}`)
  if (assignee) args.push(`--assignee=${assignee}`)
  if (status === 'in_progress') args.push('--claim')
  else if (status === 'open') args.push('--status=open')
  else if (status === 'blocked') args.push('--status=blocked')
  try { res.json(await runBd(project.path, args)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:id', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  const args = ['close', req.params.id]
  if (req.body?.reason) args.push(`--reason=${req.body.reason}`)
  try { await runBd(project.path, args); res.json({ ok: true }) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/:id/comments', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  try { res.json(await runBd(project.path, ['comments', req.params.id, '--json']) ?? []) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/:id/comments', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  if (!req.body?.body) return res.status(400).json({ error: 'body is required' })
  try { res.json(await runBd(project.path, ['comment', req.params.id, req.body.body])) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/:id/deps', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  const { dependsOn } = req.body
  if (!dependsOn) return res.status(400).json({ error: 'dependsOn is required' })
  try { res.json(await runBd(project.path, ['dep', 'add', req.params.id, dependsOn])) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:id/deps/:depId', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  try { res.json(await runBd(project.path, ['dep', 'remove', req.params.id, req.params.depId])) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/:id/defer', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  const args = ['defer', req.params.id]
  if (req.body?.until) args.push(`--until=${req.body.until}`)
  try { res.json(await runBd(project.path, args)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/:id/labels', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  if (!req.body?.label) return res.status(400).json({ error: 'label is required' })
  try { res.json(await runBd(project.path, ['label', 'add', req.params.id, req.body.label])) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:id/labels/:label', async (req, res) => {
  const project = getProject(req, res); if (!project) return
  try { res.json(await runBd(project.path, ['label', 'remove', req.params.id, decodeURIComponent(req.params.label)])) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
