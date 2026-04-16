// client/src/hooks/useIssues.js
import { useState, useEffect, useCallback } from 'react'
import { api } from '../api.js'

export function useIssues(projectId, tab = 'all', filters = {}) {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const filtersKey = JSON.stringify(filters)

  const load = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    try {
      let data
      if (tab === 'ready') data = await api.getReadyIssues(projectId)
      else if (tab === 'blocked') data = await api.getBlockedIssues(projectId)
      else data = await api.getIssues(projectId, filters)
      setIssues(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId, tab, filtersKey])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [load])

  return { issues, loading, error, reload: load }
}
