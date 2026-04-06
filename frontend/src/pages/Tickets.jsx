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
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">Service tickets</h1>
        <p className="mt-1 text-slate-600">Report facility issues. SLA targets depend on priority.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">New ticket</h2>
        <form onSubmit={createTicket} className="grid gap-4 max-w-xl">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Resource</label>
            <select
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm"
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
            <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm"
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
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              required
              className="min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm"
              value={newTicket.description}
              onChange={(e) => setNewTicket((t) => ({ ...t, description: e.target.value }))}
            />
          </div>
          <button
            type="submit"
            className="w-fit rounded-lg bg-uni-blue px-5 py-2 text-white shadow-sm hover:bg-[#1a4380]"
          >
            Submit ticket
          </button>
        </form>
      </section>

      {error && <p className="text-red-700">{error}</p>}
      {loading && <p className="text-slate-500">Loading…</p>}

      <section className="space-y-3">
        {list.map((t) => (
          <div key={t.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              className="flex w-full flex-wrap justify-between gap-3 p-4 text-left hover:bg-slate-50"
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            >
              <div>
                <span className="font-medium text-slate-900">#{t.id}</span>{' '}
                <span className="text-slate-600">{t.resourceName}</span>
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    t.status === 'RESOLVED' || t.status === 'CLOSED'
                      ? 'bg-emerald-900/50 text-emerald-300'
                      : t.status === 'OPEN'
                        ? 'bg-amber-900/50 text-amber-200'
                        : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <span className="text-sm text-slate-600">{t.priority}</span>
              {t.slaBreached && (
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">SLA</span>
              )}
            </button>
            {expanded === t.id && (
              <div className="space-y-4 border-t border-slate-100 p-4 text-sm">
                {t.slaDueAt && (
                  <p className="text-xs text-slate-500">
                    SLA target: {new Date(t.slaDueAt).toLocaleString()}
                    {t.slaBreached ? ' (breached)' : ''}
                  </p>
                )}
                <p className="whitespace-pre-wrap text-slate-700">{t.description}</p>
                <div className="flex flex-wrap gap-2">
                  {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
                    <>
                      {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateStatus(t.id, s)}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 hover:bg-slate-50"
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
                      className="rounded bg-violet-700 px-2 py-1 text-xs text-white hover:bg-violet-600"
                    >
                      Assign technician
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-2">Comments</p>
                  <ul className="space-y-2">
                    {(t.comments || []).map((c) => (
                      <li key={c.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex justify-between gap-2">
                          <span className="text-xs text-slate-500">{c.userEmail}</span>
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
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm"
                      placeholder="Add a comment"
                      value={commentText[t.id] || ''}
                      onChange={(e) =>
                        setCommentText((m) => ({ ...m, [t.id]: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => addComment(t.id)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 hover:bg-slate-50"
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
