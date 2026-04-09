import { useEffect, useState } from 'react';
import { notifications } from '../api/api';

export default function NotificationsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const { data } = await notifications.list();
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

  const mark = async (id) => {
    try {
      await notifications.markRead(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  return (
    <div>
      <div className="border-b border-slate-200 pb-6 mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="mt-1 text-slate-600">Booking decisions, ticket updates, and comments.</p>
      </div>
      {loading && <p className="text-slate-500">Loading…</p>}
      {error && <p className="mb-4 text-red-700">{error}</p>}
      <ul className="space-y-3">
        {list.map((n) => (
          <li
            key={n.id}
            className={`flex flex-wrap justify-between gap-3 rounded-xl border p-4 ${
              n.read ? 'border-slate-200 bg-white' : 'border-sky-200 bg-sky-50/80'
            }`}
          >
            <div>
              <p className="text-slate-800">{n.message}</p>
              <p className="mt-1 text-xs text-slate-500">
                {n.type} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
            {!n.read && (
              <button
                type="button"
                onClick={() => mark(n.id)}
                className="self-start rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-800 hover:bg-slate-50"
              >
                Mark read
              </button>
            )}
          </li>
        ))}
      </ul>
      {!loading && list.length === 0 && <p className="text-slate-500">No notifications yet.</p>}
    </div>
  );
}
