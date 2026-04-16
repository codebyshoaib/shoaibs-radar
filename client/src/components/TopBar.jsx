// client/src/components/TopBar.jsx
export function TopBar({ project, onNewIssue }) {
  const git = project?.git
  const stats = project?.stats

  const statPills = [
    { label: 'open', value: stats?.open_issues ?? 0, color: 'bg-blue-900 text-blue-200' },
    { label: 'in progress', value: stats?.in_progress_issues ?? 0, color: 'bg-yellow-900 text-yellow-200' },
    { label: 'blocked', value: stats?.blocked_issues ?? 0, color: 'bg-red-900 text-red-200' },
    { label: 'closed', value: stats?.closed_issues ?? 0, color: 'bg-green-900 text-green-200' },
  ]

  return (
    <div className="border-b border-gray-700 bg-gray-900 px-6 py-3 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <h2 className="text-white font-bold font-mono text-base shrink-0">{project?.name}</h2>
        {git?.isGitRepo && (
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 min-w-0">
            <span className="text-purple-400">⎇ {git.branch}</span>
            {git.isDirty && <span className="text-orange-400">● dirty</span>}
            {git.commits?.[0] && (
              <span className="truncate text-gray-500" title={git.commits[0].subject}>
                {git.commits[0].hash} {git.commits[0].subject}
              </span>
            )}
          </div>
        )}
        {git && !git.isGitRepo && (
          <span className="text-xs text-gray-600">not a git repo</span>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex gap-2">
          {statPills.map(pill => (
            <span key={pill.label} className={`text-xs px-2 py-0.5 rounded font-mono ${pill.color}`}>
              {pill.label}: {pill.value}
            </span>
          ))}
        </div>
        <button
          onClick={onNewIssue}
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors font-medium"
        >
          + New Issue
        </button>
      </div>
    </div>
  )
}
