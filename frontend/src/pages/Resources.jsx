import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resources } from '../api/api';

export default function Resources() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ type: '', minCapacity: '', location: '' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.minCapacity) params.minCapacity = Number(filters.minCapacity);
      if (filters.location) params.location = filters.location;
      const { data } = await resources.list(params);
      setList(data);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Resources</h1>
      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Type</label>
          <select
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="">Any</option>
            <option value="ROOM">Room</option>
            <option value="LAB">Lab</option>
            <option value="AUDITORIUM">Auditorium</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Min capacity</label>
          <input
            type="number"
            min="0"
            className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            value={filters.minCapacity}
            onChange={(e) => setFilters((f) => ({ ...f, minCapacity: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Location contains</label>
          <input
            className="w-48 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            value={filters.location}
            onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
            placeholder="Building…"
          />
        </div>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white"
        >
          Search
        </button>
      </div>
      {loading && <p className="text-slate-500">Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}
      <div className="space-y-3">
        {list.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4"
          >
            <div>
              <h2 className="font-semibold text-white">{r.name}</h2>
              <p className="text-slate-500 text-sm">
                {r.type} · {r.location} · capacity {r.capacity ?? '—'} ·{' '}
                <span
                  className={
                    r.status === 'AVAILABLE' ? 'text-emerald-400' : 'text-amber-400'
                  }
                >
                  {r.status}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              {r.type === 'AUDITORIUM' && (
                <Link
                  to={`/auditorium/${r.id}`}
                  state={{ resourceName: r.name }}
                  className="px-3 py-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-500 text-sm text-white"
                >
                  Seat map
                </Link>
              )}
              <Link
                to="/bookings"
                state={{ preselectResourceId: r.id }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-white border border-slate-600"
              >
                Book
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
