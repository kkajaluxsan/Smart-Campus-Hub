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
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">Admin · Resources</h1>
        <p className="mt-1 text-slate-600">Create campus resources and review audit history.</p>
      </div>
      {error && <p className="text-red-700">{error}</p>}

      <section className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Create resource</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm"
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm"
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
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
          />
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm"
            placeholder="Location"
            required
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="UNAVAILABLE">UNAVAILABLE</option>
          </select>
          <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-600">
            Create
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">All resources</h2>
        <ul className="space-y-2">
          {list.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <span>
                {r.name} <span className="text-sm text-slate-500">({r.type})</span>
              </span>
              <button
                type="button"
                onClick={() => remove(r.id)}
                className="text-sm text-red-700 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Audit log (recent)</h2>
        <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 bg-white font-mono text-xs shadow-sm">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-100">
              <tr>
                <th className="p-2 text-slate-600">Time</th>
                <th className="p-2 text-slate-600">User</th>
                <th className="p-2 text-slate-600">Action</th>
                <th className="p-2 text-slate-600">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="whitespace-nowrap p-2 text-slate-600">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2 text-slate-800">{l.userEmail || '—'}</td>
                  <td className="p-2 text-uni-blue">{l.action}</td>
                  <td className="p-2 text-slate-600">{l.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
