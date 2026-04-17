// client/src/components/Sidebar.jsx
export function Sidebar({ projects, activeId, onSelect, onRefresh, loading }) {
  function healthDot(project) {
    const stats = project.stats
    if (!stats) return '⚪'
    if (stats.blocked_issues > 0) return '🟡'
    return '🟢'
  }

  return (
    <aside className="w-56 min-h-screen bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-white font-bold text-lg font-mono">Shoaib's Radar</h1>
        <p className="text-gray-400 text-xs">beads issue tracker</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {loading && !projects.length && (
          <p className="text-gray-500 text-xs px-4 py-2">Scanning projects…</p>
        )}
        {projects.map(project => (
          <button
            key={project.id}
            onClick={() => onSelect(project.id)}
            className={`w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-gray-800 transition-colors ${
              activeId === project.id ? 'bg-gray-800 border-l-2 border-blue-500' : ''
            }`}
          >
            <span className="text-sm">{healthDot(project)}</span>
            <div className="min-w-0">
              <p className={`text-sm font-mono truncate ${activeId === project.id ? 'text-white' : 'text-gray-300'}`}>
                {project.name}
              </p>
              {project.stats && (
                <p className="text-xs text-gray-500">
                  {project.stats.open_issues} open · {project.stats.blocked_issues} blocked
                </p>
              )}
            </div>
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-700">
        <button
          onClick={onRefresh}
          className="w-full text-xs text-gray-400 hover:text-white py-1 px-2 rounded hover:bg-gray-800 transition-colors"
        >
          ↺ Refresh projects
        </button>
      </div>
    </aside>
  )
}
