// server/index.js
import express from 'express'
import cors from 'cors'
import { execSync } from 'node:child_process'
import { discoverProjects } from './lib/scanner.js'
import projectsRouter from './routes/projects.js'
import issuesRouter from './routes/issues.js'

// Kill any previous server on this port
try { execSync(`fuser -k ${3131}/tcp 2>/dev/null || true`) } catch {}

const app = express()
const PORT = 3131

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/projects', projectsRouter)
app.use('/api/:projectId/issues', issuesRouter)

app.listen(PORT, async () => {
  console.log(`Shoaib's Radar server running on http://localhost:${PORT}`)
  await discoverProjects()
  console.log('Project scan complete')
})
