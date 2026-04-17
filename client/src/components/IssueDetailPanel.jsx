import { useState, useEffect } from 'react'
import { api } from '../api.js'
import { DependencyGraph } from './DependencyGraph.jsx'

export function IssueDetailPanel({ projectId, issueId, onClose, onUpdate, onSelectIssue }) {
  const [issue, setIssue] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [newComment, setNewComment] = useState('')
  const [newNote, setNewNote] = useState('')
  const [newDep, setNewDep] = useState('')
  const [closeReason, setCloseReason] = useState('')
  const [showCloseForm, setShowCloseForm] = useState(false)
  const [showDeferForm, setShowDeferForm] = useState(false)
  const [deferDate, setDeferDate] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [showGraph, setShowGraph] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [iss, cmts] = await Promise.all([
        api.getIssue(projectId, issueId),
        api.getComments(projectId, issueId),
      ])
      setIssue(iss)
      setComments(cmts ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [projectId, issueId])

  async function patch(data) {
    try {
      await api.updateIssue(projectId, issueId, data)
      await load()
      onUpdate?.()
    } catch (err) { setError(err.message) }
  }

  async function handleClose() {
    try {
      await api.closeIssue(projectId, issueId, closeReason || undefined)
      onClose()
      onUpdate?.()
    } catch (err) { setError(err.message) }
  }

  async function handleAddComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    try { await api.addComment(projectId, issueId, newComment); setNewComment(''); await load() }
    catch (err) { setError(err.message) }
  }

  async function handleAddNote(e) {
    e.preventDefault()
    if (!newNote.trim()) return
    try { await patch({ notes: newNote }); setNewNote('') }
    catch (err) { setError(err.message) }
  }

  async function handleAddDep(e) {
    e.preventDefault()
    if (!newDep.trim()) return
    try { await api.addDep(projectId, issueId, newDep); setNewDep(''); await load() }
    catch (err) { setError(err.message) }
  }

  async function handleRemoveDep(depId) {
    try { await api.removeDep(projectId, issueId, depId); await load() }
    catch (err) { setError(err.message) }
  }

  async function handleDefer(e) {
    e.preventDefault()
    try { await api.deferIssue(projectId, issueId, deferDate || undefined); onClose(); onUpdate?.() }
    catch (err) { setError(err.message) }
  }

  async function handleAddLabel(e) {
    e.preventDefault()
    if (!newLabel.trim()) return
    try { await api.addLabel(projectId, issueId, newLabel); setNewLabel(''); await load() }
    catch (err) { setError(err.message) }
  }

  async function handleRemoveLabel(label) {
    try { await api.removeLabel(projectId, issueId, label); await load() }
    catch (err) { setError(err.message) }
  }

  if (loading) return (
    <div className="w-96 border-l border-gray-700 bg-gray-900 p-4 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Loading…</p>
    </div>
  )

  if (error || !issue) return (
    <div className="w-96 border-l border-gray-700 bg-gray-900 p-4">
      <p className="text-red-400 text-sm">{error ?? 'Issue not found'}</p>
      <button onClick={onClose} className="text-xs text-gray-500 mt-2">✕ Close</button>
    </div>
  )

  return (
    <div className="w-96 border-l border-gray-700 bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editingTitle ? (
            <form onSubmit={e => { e.preventDefault(); patch({ title: titleDraft }); setEditingTitle(false) }}>
              <input
                autoFocus
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                className="w-full bg-gray-800 text-white text-sm px-2 py-1 rounded border border-blue-500 outline-none"
              />
            </form>
          ) : (
            <h3
              onClick={() => { setTitleDraft(issue.title); setEditingTitle(true) }}
              className="text-white text-sm font-medium cursor-text hover:text-blue-300 transition-colors"
            >
              {issue.title}
            </h3>
          )}
          <p className="text-gray-500 font-mono text-xs mt-1">{issue.id}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none shrink-0">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {error && <p className="text-red-400 text-xs">{error}</p>}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-gray-500 block mb-1">Status</label>
            <select
              value={issue.status}
              onChange={e => patch({ status: e.target.value })}
              className="bg-gray-800 border border-gray-600 text-gray-200 rounded px-2 py-1 w-full"
            >
              {['open', 'in_progress', 'blocked', 'closed'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-500 block mb-1">Priority</label>
            <select
              value={issue.priority}
              onChange={e => patch({ priority: parseInt(e.target.value) })}
              className="bg-gray-800 border border-gray-600 text-gray-200 rounded px-2 py-1 w-full"
            >
              {[0,1,2,3,4].map(p => <option key={p} value={p}>P{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-500 block mb-1">Type</label>
            <select
              value={issue.issue_type}
              onChange={e => patch({ type: e.target.value })}
              className="bg-gray-800 border border-gray-600 text-gray-200 rounded px-2 py-1 w-full"
            >
              {['task', 'bug', 'feature', 'epic'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-500 block mb-1">Assignee</label>
            <input
              defaultValue={issue.owner ?? ''}
              onBlur={e => e.target.value !== (issue.owner ?? '') && patch({ assignee: e.target.value })}
              className="bg-gray-800 border border-gray-600 text-gray-200 rounded px-2 py-1 w-full outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-gray-500 text-xs block mb-1">Description</label>
          <p className="text-gray-300 text-sm whitespace-pre-wrap bg-gray-800 rounded p-2">{issue.description || '—'}</p>
        </div>

        {/* Labels */}
        <div>
          <label className="text-gray-500 text-xs block mb-1">Labels</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {(issue.labels ?? []).map(l => (
              <span key={l} className="bg-gray-700 text-gray-200 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                {l}
                <button onClick={() => handleRemoveLabel(l)} className="text-gray-400 hover:text-white">×</button>
              </span>
            ))}
          </div>
          <form onSubmit={handleAddLabel} className="flex gap-1">
            <input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="Add label…"
              className="flex-1 bg-gray-800 border border-gray-600 text-gray-200 text-xs rounded px-2 py-1 outline-none focus:border-blue-500"
            />
            <button type="submit" className="text-xs text-blue-400 hover:text-blue-300 px-2">Add</button>
          </form>
        </div>

        {/* Dependencies */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-gray-500 text-xs">Dependencies</label>
            <button onClick={() => setShowGraph(g => !g)} className="text-xs text-blue-400 hover:text-blue-300">
              {showGraph ? 'Hide graph' : 'Show graph'}
            </button>
          </div>
          {showGraph && (
            <div className="mb-3 bg-gray-800 rounded p-2 overflow-x-auto">
              <DependencyGraph issue={issue} onSelectIssue={onSelectIssue} />
            </div>
          )}
          {(issue.dependencies ?? []).length > 0 && (
            <div className="mb-1">
              <p className="text-gray-600 text-xs mb-1">Depends on:</p>
              {issue.dependencies.map(dep => (
                <div key={dep.id} className="flex items-center justify-between py-0.5">
                  <span className="text-xs font-mono text-gray-300">{dep.id} — {dep.title?.slice(0, 30)}</span>
                  <button onClick={() => handleRemoveDep(dep.id)} className="text-gray-600 hover:text-red-400 text-xs">×</button>
                </div>
              ))}
            </div>
          )}
          {(issue.dependents ?? []).length > 0 && (
            <div className="mb-1">
              <p className="text-gray-600 text-xs mb-1">Blocks:</p>
              {issue.dependents.map(dep => (
                <span key={dep.id} className="block text-xs font-mono text-gray-400">{dep.id} — {dep.title?.slice(0, 30)}</span>
              ))}
            </div>
          )}
          <form onSubmit={handleAddDep} className="flex gap-1 mt-1">
            <input
              value={newDep}
              onChange={e => setNewDep(e.target.value)}
              placeholder="Add dep (e.g. proj-abc)…"
              className="flex-1 bg-gray-800 border border-gray-600 text-gray-200 text-xs rounded px-2 py-1 outline-none focus:border-blue-500"
            />
            <button type="submit" className="text-xs text-blue-400 hover:text-blue-300 px-2">Add</button>
          </form>
        </div>

        {/* Notes */}
        <div>
          <label className="text-gray-500 text-xs block mb-1">Notes</label>
          {issue.notes && <p className="text-gray-300 text-xs bg-gray-800 rounded p-2 mb-2 whitespace-pre-wrap">{issue.notes}</p>}
          <form onSubmit={handleAddNote} className="flex gap-1">
            <input
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Append a note…"
              className="flex-1 bg-gray-800 border border-gray-600 text-gray-200 text-xs rounded px-2 py-1 outline-none focus:border-blue-500"
            />
            <button type="submit" className="text-xs text-blue-400 hover:text-blue-300 px-2">Add</button>
          </form>
        </div>

        {/* Comments */}
        <div>
          <label className="text-gray-500 text-xs block mb-1">Comments ({comments.length})</label>
          <div className="space-y-2 mb-2">
            {comments.map((c, i) => (
              <div key={i} className="bg-gray-800 rounded p-2 text-xs text-gray-300">
                <p className="text-gray-500 mb-1">{c.author ?? 'unknown'} · {c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</p>
                <p className="whitespace-pre-wrap">{c.body}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-1">
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 bg-gray-800 border border-gray-600 text-gray-200 text-xs rounded px-2 py-1 outline-none focus:border-blue-500"
            />
            <button type="submit" className="text-xs text-blue-400 hover:text-blue-300 px-2">Post</button>
          </form>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-700 pt-4 space-y-2">
          {!showDeferForm ? (
            <button onClick={() => setShowDeferForm(true)} className="w-full text-xs text-yellow-400 hover:text-yellow-300 py-1 px-3 border border-yellow-800 rounded hover:bg-yellow-900/30 transition-colors">
              Defer issue
            </button>
          ) : (
            <form onSubmit={handleDefer} className="flex gap-1">
              <input
                type="date"
                value={deferDate}
                onChange={e => setDeferDate(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-600 text-gray-200 text-xs rounded px-2 py-1"
              />
              <button type="submit" className="text-xs text-yellow-400 px-2">Defer</button>
              <button type="button" onClick={() => setShowDeferForm(false)} className="text-xs text-gray-500 px-2">✕</button>
            </form>
          )}

          {issue.status !== 'closed' && !showCloseForm && (
            <button onClick={() => setShowCloseForm(true)} className="w-full text-xs text-green-400 hover:text-green-300 py-1 px-3 border border-green-800 rounded hover:bg-green-900/30 transition-colors">
              Close issue
            </button>
          )}
          {showCloseForm && (
            <div className="space-y-1">
              <input
                value={closeReason}
                onChange={e => setCloseReason(e.target.value)}
                placeholder="Reason (optional)…"
                className="w-full bg-gray-800 border border-gray-600 text-gray-200 text-xs rounded px-2 py-1 outline-none focus:border-blue-500"
              />
              <div className="flex gap-1">
                <button onClick={handleClose} className="flex-1 text-xs bg-green-700 hover:bg-green-600 text-white py-1 rounded transition-colors">Confirm close</button>
                <button onClick={() => setShowCloseForm(false)} className="text-xs text-gray-500 px-2">✕</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
