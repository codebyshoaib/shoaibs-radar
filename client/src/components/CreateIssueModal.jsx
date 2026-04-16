import { useState } from 'react'
import { api } from '../api.js'

export function CreateIssueModal({ projectId, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', type: 'task', priority: 2, assignee: '', acceptance: '', design: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required')
    setLoading(true)
    setError(null)
    try {
      await api.createIssue(projectId, form)
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-white font-medium">New Issue</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div>
            <label className="text-gray-400 text-xs block mb-1">Title *</label>
            <input
              autoFocus
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Summary of this issue"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded px-3 py-2 outline-none focus:border-blue-500 resize-none"
              placeholder="Why this issue exists and what needs to be done"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs block mb-1">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded px-2 py-2">
                {['task', 'bug', 'feature', 'epic'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Priority</label>
              <select value={form.priority} onChange={e => set('priority', parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded px-2 py-2">
                {[0,1,2,3,4].map(p => <option key={p} value={p}>P{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs block mb-1">Assignee</label>
            <input
              value={form.assignee}
              onChange={e => set('assignee', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
              placeholder="username or email"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs block mb-1">Acceptance Criteria</label>
            <textarea
              value={form.acceptance}
              onChange={e => set('acceptance', e.target.value)}
              rows={2}
              className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded px-3 py-2 outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs block mb-1">Design Notes</label>
            <textarea
              value={form.design}
              onChange={e => set('design', e.target.value)}
              rows={2}
              className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded px-3 py-2 outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-700">
            <button type="button" onClick={onClose} className="text-sm text-gray-400 hover:text-white px-4 py-2">Cancel</button>
            <button
              type="submit"
              disabled={loading}
              className="text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors"
            >
              {loading ? 'Creating…' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
