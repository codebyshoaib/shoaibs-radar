// server/lib/bd.js
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export async function runBd(cwd, args) {
  try {
    const { stdout } = await execFileAsync('bd', args, { cwd, timeout: 15000 })
    const text = stdout.trim()
    if (!text) return null
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  } catch (err) {
    throw new Error(err.stderr?.trim() || err.message)
  }
}
