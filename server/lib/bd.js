// server/lib/bd.js
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const LOCK_RE = /waiting for lock|database is locked|context canceled/i

async function attempt(cwd, args) {
  const { stdout } = await execFileAsync('bd', args, { cwd, timeout: 15000 })
  const text = stdout.trim()
  if (!text) return null
  // bd sometimes returns JSON error objects in stdout
  try {
    const parsed = JSON.parse(text)
    if (parsed?.error && LOCK_RE.test(parsed.error)) throw new Error(parsed.error)
    return parsed
  } catch (e) {
    if (LOCK_RE.test(e.message)) throw e
    return text
  }
}

export async function runBd(cwd, args, { retries = 3, retryDelay = 500 } = {}) {
  let lastErr
  for (let i = 0; i < retries; i++) {
    try {
      return await attempt(cwd, args)
    } catch (err) {
      lastErr = err
      const msg = err.stderr?.trim() || err.message || ''
      if (LOCK_RE.test(msg) && i < retries - 1) {
        await new Promise(r => setTimeout(r, retryDelay * (i + 1)))
        continue
      }
      throw new Error(msg || err.message)
    }
  }
  throw new Error(`bd lock: database busy after ${retries} retries — ${lastErr?.message}`)
}
