// server/lib/bd.js
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join } from 'node:path'

const execFileAsync = promisify(execFile)
const BD_PATH = '/home/shoaib/.local/bin/bd'
const TIMEOUT_MS = 10_000

/**
 * Run a bd command in the given project directory.
 * @param {string} projectPath - absolute path to project root
 * @param {string[]} args - bd subcommand + flags, e.g. ['list', '--json']
 * @returns {Promise<any>} parsed JSON from stdout
 */
export async function runBd(projectPath, args) {
  const beadsPath = join(projectPath, '.beads')
  const fullArgs = ['--db', beadsPath, ...args]

  try {
    const { stdout, stderr } = await execFileAsync(BD_PATH, fullArgs, {
      cwd: projectPath,
      timeout: TIMEOUT_MS,
    })
    if (!stdout.trim()) return null
    return JSON.parse(stdout)
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error('bd CLI not found at ' + BD_PATH)
    }
    if (err.killed) {
      throw new Error('bd command timed out after 10s')
    }
    // bd returns non-zero on some list commands with no results — try parsing anyway
    if (err.stdout?.trim()) {
      try { return JSON.parse(err.stdout) } catch {}
    }
    const msg = err.stderr?.trim() || err.message
    throw new Error(msg)
  }
}
