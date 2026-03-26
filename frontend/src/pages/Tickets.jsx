import { useEffect, useState } from 'react';
import { tickets, resources } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { downloadWithAuth } from '../utils/downloadWithAuth';

export default function TicketsPage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [resList, setResList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [newTicket, setNewTicket] = useState({
    resourceId: '',
    description: '',
    priority: 'MEDIUM',
  });
  const [commentText, setCommentText] = useState({});

  const load = async () => {
    setError('');
    try {
      const [{ data: t }, { data: r }] = await Promise.all([tickets.list(), resources.list({})]);
      setList(t);
      setResList(r);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      await tickets.create({
        resourceId: Number(newTicket.resourceId),
        description: newTicket.description,
        priority: newTicket.priority,
      });
      setNewTicket({ resourceId: '', description: '', priority: 'MEDIUM' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await tickets.update(id, { status });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const assignTech = async (id) => {
    const tid = window.prompt('Technician user id (e.g. from seeded tech user)');
    if (!tid) return;
    try {
      await tickets.assign(id, Number(tid));
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const addComment = async (ticketId) => {
    const text = commentText[ticketId];
    if (!text?.trim()) return;
    try {
      await tickets.addComment(ticketId, { content: text });
      setCommentText((c) => ({ ...c, [ticketId]: '' }));
      await load();
      setExpanded(ticketId);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const uploadFile = async (ticketId, file) => {
    if (!file) return;
    try {
      await tickets.uploadAttachment(ticketId, file);
      await load();
      setExpanded(ticketId);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const editComment = async (ticketId, comment) => {
    const next = window.prompt('Edit comment', comment.content);
    if (next == null) return;
    try {
      await tickets.updateComment(ticketId, comment.id, { content: next });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const deleteComment = async (ticketId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await tickets.deleteComment(ticketId, commentId);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-white">Tickets & maintenance</h1>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">New ticket</h2>
        <form onSubmit={createTicket} className="grid gap-4 max-w-xl">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Resource</label>
            <select
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              value={newTicket.resourceId}
              onChange={(e) => setNewTicket((t) => ({ ...t, resourceId: e.target.value }))}
            >
              <option value="">Select…</option>
              {resList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Priority</label>
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              value={newTicket.priority}
              onChange={(e) => setNewTicket((t) => ({ ...t, priority: e.target.value }))}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Description</label>
            <textarea
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white min-h-[100px]"
              value={newTicket.description}
              onChange={(e) => setNewTicket((t) => ({ ...t, description: e.target.value }))}
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white w-fit"
          >
            Submit ticket
          </button>
        </form>
      </section>

      {error && <p className="text-red-400">{error}</p>}
      {loading && <p className="text-slate-500">Loading…</p>}

      <section className="space-y-3">
        {list.map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <button
              type="button"
              className="w-full text-left p-4 flex flex-wrap justify-between gap-3 hover:bg-slate-800/30"
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            >
              <div>
                <span className="text-white font-medium">#{t.id}</span>{' '}
                <span className="text-slate-400">{t.resourceName}</span>
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    t.status === 'RESOLVED' || t.status === 'CLOSED'
                      ? 'bg-emerald-900/50 text-emerald-300'
                      : t.status === 'OPEN'
                        ? 'bg-amber-900/50 text-amber-200'
                        : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <span className="text-slate-500 text-sm">{t.priority}</span>
            </button>
            {expanded === t.id && (
              <div className="border-t border-slate-800 p-4 space-y-4 text-sm">
                <p className="text-slate-300 whitespace-pre-wrap">{t.description}</p>
                <div className="flex flex-wrap gap-2">
                  {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
                    <>
                      {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateStatus(t.id, s)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-white"
                        >
                          Set {s}
                        </button>
                      ))}
                    </>
                  )}
                  {user?.role === 'ADMIN' && (
                    <button
                      type="button"
                      onClick={() => assignTech(t.id)}
                      className="px-2 py-1 rounded bg-violet-800 hover:bg-violet-700 text-xs text-white"
                    >
                      Assign technician
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-2">Comments</p>
                  <ul className="space-y-2">
                    {(t.comments || []).map((c) => (
                      <li key={c.id} className="bg-slate-950/60 rounded-lg p-3 border border-slate-800">
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500 text-xs">{c.userEmail}</span>
                          {c.userId === user?.userId && (
                            <span className="flex gap-2">
                              <button
                                type="button"
                                className="text-sky-400 text-xs"
                                onClick={() => editComment(t.id, c)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="text-red-400 text-xs"
                                onClick={() => deleteComment(t.id, c.id)}
                              >
                                Delete
                              </button>
                            </span>
                          )}
                        </div>
                        <p className="text-slate-200 mt-1">{c.content}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <input
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      placeholder="Add a comment"
                      value={commentText[t.id] || ''}
                      onChange={(e) =>
                        setCommentText((m) => ({ ...m, [t.id]: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => addComment(t.id)}
                      className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                    >
                      Send
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-2">Images (max 3, JPG/PNG, 5MB)</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    onChange={(e) => uploadFile(t.id, e.target.files?.[0])}
                    className="text-slate-400 text-xs"
                  />
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {(t.attachments || []).map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          className="text-sky-400 hover:underline text-xs"
                          onClick={() =>
                            downloadWithAuth(a.downloadUrl, a.originalFilename).catch((err) =>
                              setError(err.response?.data?.message || err.message)
                            )
                          }
                        >
                          {a.originalFilename}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
