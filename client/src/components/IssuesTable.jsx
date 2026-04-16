// client/src/components/IssuesTable.jsx
import { useState } from 'react'
import { useIssues } from '../hooks/useIssues.js'

const PRIORITY_BADGES = {
  0: 'bg-red-900 text-red-200',
  1: 'bg-orange-900 text-orange-200',
  2: 'bg-yellow-900 text-yellow-200',
  3: 'bg-blue-900 text-blue-200',
  4: 'bg-gray-700 text-gray-300',
}

const STATUS_ICONS = {
  open: '○',
  in_progress: '◐',
  blocked: '●',
  closed: '✓',
}

const STATUS_COLORS = {
  open: 'text-gray-300',
  in_progress: 'text-yellow-400',
  blocked: 'text-red-400',
  closed: 'text-green-400',
}

const TABS = ['all', 'ready', 'blocked']

export function IssuesTable({ projectId, onSelectIssue }) {
  const [tab, setTab] = useState('all')
  const [filters, setFilters] = useState({})
  const { issues, loading, error, reload } = useIssues(projectId, tab, filters)

  function setFilter(key, value) {
    setFilters(f => value ? { ...f, [key]: value } : Object.fromEntries(Object.entries(f).filter(([k]) => k !== key)))
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-4 border-b border-gray-700">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 px-4 py-3 border-b border-gray-700 bg-gray-900">
        <select
          onChange={e => setFilter('status', e.target.value)}
          className="bg-gray-800 border border-gray-600 text-gray-200 text-xs rounded px-2 py-1"
        >
          <option value="">All statuses</option>
          {['open', 'in_progress', 'blocked', 'closed'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          onChange={e => setFilter('priority', e.target.value)}
          className="bg-gray-800 border border-gray-600 text-gray-200 text-xs rounded px-2 py-1"
        >
          <option value="">All priorities</option>
          {[0,1,2,3,4].map(p => (
            <option key={p} value={p}>P{p}</option>
          ))}
        </select>
        <select
          onChange={e => setFilter('type', e.target.value)}
          className="bg-gray-800 border border-gray-600 text-gray-200 text-xs rounded px-2 py-1"
        >
          <option value="">All types</option>
          {['task', 'bug', 'feature', 'epic'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button onClick={reload} className="ml-auto text-xs text-gray-500 hover:text-gray-300">↺</button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {loading && <p className="text-gray-500 text-sm p-4">Loading…</p>}
        {error && <p className="text-red-400 text-sm p-4">Error: {error}</p>}
        {!loading && !error && issues.length === 0 && (
          <p className="text-gray-500 text-sm p-4">No issues found.</p>
        )}
        {issues.map(issue => (
          <div
            key={issue.id}
            onClick={() => onSelectIssue(issue.id)}
            className="flex items-center gap-4 px-4 py-3 border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition-colors"
          >
            <span className={`text-base w-4 ${STATUS_COLORS[issue.status]}`}>
              {STATUS_ICONS[issue.status] ?? '○'}
            </span>
            <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${PRIORITY_BADGES[issue.priority] ?? PRIORITY_BADGES[4]}`}>
              P{issue.priority}
            </span>
            <span className="font-mono text-xs text-gray-500 w-28 shrink-0">{issue.id}</span>
            <span className="flex-1 text-sm text-gray-200 truncate">{issue.title}</span>
            <span className="text-xs text-gray-500 shrink-0 capitalize">{issue.issue_type}</span>
            {issue.owner && (
              <span className="text-xs text-gray-600 shrink-0 truncate max-w-24">{issue.owner.split('@')[0]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
