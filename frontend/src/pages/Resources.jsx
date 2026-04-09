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
    <div className="animate-fade-in">
      <div className="border-b border-slate-200/50 pb-6 mb-8">
        <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">Campus resources</h1>
        <p className="mt-2 text-slate-500 font-medium">Search rooms, labs, auditoriums, and equipment.</p>
      </div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Type</label>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
          <label className="mb-1 block text-xs font-medium text-slate-600">Min capacity</label>
          <input
            type="number"
            min="0"
            className="w-28 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all hover:border-slate-400"
            value={filters.minCapacity}
            onChange={(e) => setFilters((f) => ({ ...f, minCapacity: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Location contains</label>
          <input
            className="w-48 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all hover:border-slate-400"
            value={filters.location}
            onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
            placeholder="Building…"
          />
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-blue-800 transition-all active:scale-[0.98]"
        >
          Search
        </button>
      </div>
      {loading && <p className="text-slate-500">Loading…</p>}
      {error && <p className="text-red-700">{error}</p>}
      <div className="space-y-3">
        {list.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <h2 className="font-bold text-slate-900">{r.name}</h2>
              <p className="text-sm text-slate-600">
                {r.type} · {r.location} · capacity {r.capacity ?? '—'} ·{' '}
                <span
                  className={
                    r.status === 'AVAILABLE' ? 'font-medium text-emerald-700' : 'font-medium text-amber-700'
                  }
                >
                  {r.status}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/resources/${r.id}/schedule`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 no-underline hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
              >
                Schedule
              </Link>
              {r.type === 'AUDITORIUM' && (
                <Link
                  to={`/auditorium/${r.id}`}
                  state={{ resourceName: r.name }}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-1.5 text-sm font-medium text-white no-underline shadow-sm hover:from-violet-700 hover:to-purple-700 transition-all"
                >
                  Seat map
                </Link>
              )}
              <Link
                to="/bookings"
                state={{ preselectResourceId: r.id }}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-1.5 text-sm font-medium text-white no-underline shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all"
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
