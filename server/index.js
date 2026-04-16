// server/index.js
import express from 'express'
import cors from 'cors'
import { discoverProjects } from './lib/scanner.js'
import projectsRouter from './routes/projects.js'
import issuesRouter from './routes/issues.js'
import gitRouter from './routes/git.js'

const app = express()
const PORT = 3131

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/projects', projectsRouter)
app.use('/api/:projectId/issues', issuesRouter)
app.use('/api/:projectId/git', gitRouter)

app.listen(PORT, async () => {
  console.log(`beads-ui server running on http://localhost:${PORT}`)
  await discoverProjects()
  console.log('Project scan complete')
})
