import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { resources, audit } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function AdminResourcesPage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    type: 'ROOM',
    capacity: '',
    location: '',
    status: 'AVAILABLE',
  });

  const load = useCallback(async () => {
    try {
      const [{ data: r }, { data: a }] = await Promise.all([
        resources.list({}),
        audit.list(),
      ]);
      setList(r);
      setLogs(a);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    load();
  }, [user, load]);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await resources.create({
        name: form.name,
        type: form.type,
        capacity: form.capacity ? Number(form.capacity) : null,
        location: form.location,
        status: form.status,
      });
      setForm({
        name: '',
        type: 'ROOM',
        capacity: '',
        location: '',
        status: 'AVAILABLE',
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await resources.remove(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="border-b border-slate-200/50 pb-6">
        <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">Admin · Resources</h1>
        <p className="mt-2 text-slate-500 font-medium">Create campus resources and review audit history.</p>
      </div>
      {error && <p className="text-red-700">{error}</p>}

      <section className="max-w-xl rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="mb-6 text-xl font-display font-bold text-slate-900">Create resource</h2>
        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm transition-all hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm transition-all hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="ROOM">ROOM</option>
            <option value="LAB">LAB</option>
            <option value="AUDITORIUM">AUDITORIUM</option>
            <option value="EQUIPMENT">EQUIPMENT</option>
          </select>
          <input
            type="number"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm transition-all hover:border-slate-400"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
          />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm transition-all hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            placeholder="Location"
            required
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm transition-all hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="UNAVAILABLE">UNAVAILABLE</option>
          </select>
          <button type="submit" className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-2.5 font-semibold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-emerald-800 transition-all active:scale-[0.98]">
            Create
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-display font-bold text-slate-900">All resources</h2>
        <ul className="space-y-2">
          {list.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span>
                {r.name} <span className="text-sm text-slate-500">({r.type})</span>
              </span>
              <button
                type="button"
                onClick={() => remove(r.id)}
                className="text-sm font-medium text-rose-600 hover:underline transition-colors"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-display font-bold text-slate-900">Audit log (recent)</h2>
        <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-2xl border border-slate-200/60 bg-white font-mono text-xs shadow-sm">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm">
              <tr>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Time</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                <th className="p-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-slate-50">
                  <td className="whitespace-nowrap p-3 text-slate-600">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-slate-800">{l.userEmail || '—'}</td>
                  <td className="p-3 text-blue-600 font-medium">{l.action}</td>
                  <td className="p-3 text-slate-600">{l.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
