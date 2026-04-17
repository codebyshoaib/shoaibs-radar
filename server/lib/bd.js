// server/lib/bd.js
import { execFile } from 'node:child_process'

const TIMEOUT = 8000

function run(cwd, args) {
  return new Promise((resolve, reject) => {
    const proc = execFile('bd', args, { cwd }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr?.trim() || err.message))
      const text = stdout.trim()
      if (!text) return resolve(null)
      try {
        const parsed = JSON.parse(text)
        if (parsed?.error) return reject(new Error(parsed.error))
        resolve(parsed)
      } catch {
        resolve(text)
      }
    })

    const timer = setTimeout(() => {
      proc.kill('SIGKILL')
      reject(new Error(`bd timed out after ${TIMEOUT}ms: bd ${args.join(' ')}`))
    }, TIMEOUT)

    proc.on('close', () => clearTimeout(timer))
  })
}

export function runBd(cwd, args) {
  return run(cwd, args)
}
