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
      <h1 className="text-2xl font-bold text-white mb-6">Notifications</h1>
      {loading && <p className="text-slate-500">Loading…</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <ul className="space-y-3">
        {list.map((n) => (
          <li
            key={n.id}
            className={`rounded-xl border p-4 flex flex-wrap justify-between gap-3 ${
              n.read ? 'border-slate-800 bg-slate-900/20' : 'border-sky-800/50 bg-sky-950/20'
            }`}
          >
            <div>
              <p className="text-slate-200">{n.message}</p>
              <p className="text-slate-500 text-xs mt-1">
                {n.type} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
            {!n.read && (
              <button
                type="button"
                onClick={() => mark(n.id)}
                className="self-start px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white"
              >
                Mark read
              </button>
            )}
          </li>
        ))}
      </ul>
      {!loading && list.length === 0 && (
        <p className="text-slate-500">No notifications yet.</p>
      )}
    </div>
  );
}
