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
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-white">Admin · Resources</h1>
      {error && <p className="text-red-400">{error}</p>}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 max-w-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Create resource</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <select
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
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
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
          />
          <input
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
            placeholder="Location"
            required
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <select
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="UNAVAILABLE">UNAVAILABLE</option>
          </select>
          <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">
            Create
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">All resources</h2>
        <ul className="space-y-2">
          {list.map((r) => (
            <li
              key={r.id}
              className="flex justify-between items-center rounded-lg border border-slate-800 px-4 py-3"
            >
              <span>
                {r.name} <span className="text-slate-500 text-sm">({r.type})</span>
              </span>
              <button
                type="button"
                onClick={() => remove(r.id)}
                className="text-red-400 text-sm hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Audit log (recent)</h2>
        <div className="rounded-xl border border-slate-800 overflow-x-auto max-h-96 overflow-y-auto text-xs font-mono">
          <table className="w-full text-left">
            <thead className="bg-slate-900 sticky top-0">
              <tr>
                <th className="p-2 text-slate-400">Time</th>
                <th className="p-2 text-slate-400">User</th>
                <th className="p-2 text-slate-400">Action</th>
                <th className="p-2 text-slate-400">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-slate-800">
                  <td className="p-2 text-slate-500 whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2 text-slate-300">{l.userEmail || '—'}</td>
                  <td className="p-2 text-sky-300">{l.action}</td>
                  <td className="p-2 text-slate-400">{l.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
