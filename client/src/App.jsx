// client/src/App.jsx
import { useState } from 'react'
import { Sidebar } from './components/Sidebar.jsx'
import { TopBar } from './components/TopBar.jsx'
import { IssuesTable } from './components/IssuesTable.jsx'
import { useProjects } from './hooks/useProjects.js'

export default function App() {
  const { projects, loading, refresh } = useProjects()
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [selectedIssueId, setSelectedIssueId] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const activeProject = projects.find(p => p.id === activeProjectId) ?? projects[0] ?? null

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar
        projects={projects}
        activeId={activeProject?.id}
        onSelect={id => { setActiveProjectId(id); setSelectedIssueId(null) }}
        onRefresh={refresh}
        loading={loading}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeProject ? (
          <>
            <TopBar project={activeProject} onNewIssue={() => setShowCreateModal(true)} />
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden">
                <IssuesTable
                  projectId={activeProject.id}
                  onSelectIssue={setSelectedIssueId}
                />
              </div>
              {selectedIssueId && (
                <div className="w-96 border-l border-gray-700 bg-gray-900 p-4 overflow-y-auto">
                  <p className="text-gray-400 text-sm">Detail panel placeholder: {selectedIssueId}</p>
                  <button onClick={() => setSelectedIssueId(null)} className="text-xs text-gray-500 mt-2">✕ Close</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="p-8 text-gray-500">No projects found.</p>
        )}
      </main>
    </div>
  )
}
