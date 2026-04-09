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
      <div className="border-b border-slate-200 pb-6 mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">Campus resources</h1>
        <p className="mt-1 text-slate-600">Search rooms, labs, auditoriums, and equipment.</p>
      </div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Type</label>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
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
            className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
            value={filters.minCapacity}
            onChange={(e) => setFilters((f) => ({ ...f, minCapacity: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Location contains</label>
          <input
            className="w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
            value={filters.location}
            onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
            placeholder="Building…"
          />
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-lg bg-uni-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1a4380]"
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
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <h2 className="font-semibold text-slate-900">{r.name}</h2>
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
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
              >
                Schedule
              </Link>
              {r.type === 'AUDITORIUM' && (
                <Link
                  to={`/auditorium/${r.id}`}
                  state={{ resourceName: r.name }}
                  className="rounded-lg bg-violet-700 px-3 py-1.5 text-sm text-white hover:bg-violet-600"
                >
                  Seat map
                </Link>
              )}
              <Link
                to="/bookings"
                state={{ preselectResourceId: r.id }}
                className="rounded-lg bg-uni-blue px-3 py-1.5 text-sm text-white hover:bg-[#1a4380]"
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
