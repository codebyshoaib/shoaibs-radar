// server/index.js
import express from 'express'
import cors from 'cors'
import { execSync } from 'node:child_process'
import { discoverProjects } from './lib/scanner.js'
import projectsRouter from './routes/projects.js'
import issuesRouter from './routes/issues.js'

// Kill any stale bd processes and clear dolt locks on startup
try {
  execSync(`pkill -9 -x bd 2>/dev/null || true`)
  execSync(`find ${process.env.HOME} -name ".lock" -path "*embeddeddolt*" -delete 2>/dev/null || true`)
} catch {}

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
