// server/lib/bd.js
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const LOCK_RE = /waiting for lock|database is locked|context canceled/i

// Per-project mutex — only one bd call at a time per cwd
const queues = new Map()

function enqueue(cwd, fn) {
  if (!queues.has(cwd)) queues.set(cwd, Promise.resolve())
  const next = queues.get(cwd).then(fn, fn)
  queues.set(cwd, next.catch(() => {}))
  return next
}

async function attempt(cwd, args) {
  const { stdout } = await execFileAsync('bd', args, { cwd, timeout: 15000 })
  const text = stdout.trim()
  if (!text) return null
  try {
    const parsed = JSON.parse(text)
    if (parsed?.error && LOCK_RE.test(parsed.error)) throw new Error(parsed.error)
    return parsed
  } catch (e) {
    if (LOCK_RE.test(e.message)) throw e
    return text
  }
}

export function runBd(cwd, args) {
  return enqueue(cwd, async () => {
    const { stdout, stderr } = await execFileAsync('bd', args, { cwd, timeout: 15000 }).catch(err => {
      throw new Error(err.stderr?.trim() || err.message)
    })
    const text = stdout.trim()
    if (!text) return null
    try {
      const parsed = JSON.parse(text)
      if (parsed?.error) throw new Error(parsed.error)
      return parsed
    } catch (e) {
      if (e.message === text) throw e
      return text
    }
  })
}
