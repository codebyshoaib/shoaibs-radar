// server/lib/git.js
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

async function git(cwd, args) {
  try {
    const { stdout } = await execFileAsync('git', args, { cwd, timeout: 5000 })
    return stdout.trim()
  } catch {
    return null
  }
}

export async function getGitInfo(projectPath) {
  const [branch, dirty, log] = await Promise.all([
    git(projectPath, ['rev-parse', '--abbrev-ref', 'HEAD']),
    git(projectPath, ['status', '--porcelain']),
    git(projectPath, ['log', '--oneline', '-5', '--format=%h|%s|%cr']),
  ])

  if (branch === null) {
    return { isGitRepo: false }
  }

  const commits = (log || '').split('\n').filter(Boolean).map(line => {
    const [hash, subject, time] = line.split('|')
    return { hash, subject, time }
  })

  return {
    isGitRepo: true,
    branch,
    isDirty: (dirty || '').length > 0,
    commits,
  }
}
