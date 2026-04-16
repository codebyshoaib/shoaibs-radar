// client/src/hooks/useProjects.js
import { useState, useEffect, useCallback } from 'react'
import { api } from '../api.js'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async (refresh = false) => {
    try {
      setError(null)
      const data = refresh ? await api.refreshProjects() : await api.getProjects()
      setProjects(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(() => load(), 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [load])

  return { projects, loading, error, refresh: () => load(true) }
}
