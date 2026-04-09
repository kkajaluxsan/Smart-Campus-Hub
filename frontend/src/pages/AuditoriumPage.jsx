import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { resources, seats } from '../api/api';
import SeatGrid from '../components/SeatGrid';

function localToApi(dtLocal) {
  if (!dtLocal) return '';
  return dtLocal.length === 16 ? `${dtLocal}:00` : dtLocal;
}

export default function AuditoriumPage() {
  const { resourceId } = useParams();
  const location = useLocation();
  const [name, setName] = useState(location.state?.resourceName || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [seatRows, setSeatRows] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await resources.get(resourceId);
        setName(data.name);
      } catch {
        /* ignore */
      }
    })();
  }, [resourceId]);

  const loadSeats = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await seats.availability(
        resourceId,
        localToApi(startTime),
        localToApi(endTime)
      );
      setSeatRows(data);
      setSelectedSeats([]);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (id) => {
    setSelectedSeats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/resources" className="text-sm font-medium text-blue-600 no-underline hover:underline transition-colors">
          ← Resources
        </Link>
      </div>
      <h1 className="font-display text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Auditorium seat map</h1>
      <p className="text-slate-500 font-medium mb-8">{name || `Resource #${resourceId}`}</p>

      <div className="max-w-3xl space-y-5 rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Start</label>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm transition-all hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">End</label>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm transition-all hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={loadSeats}
          disabled={loading || !startTime || !endTime}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-medium shadow-md shadow-violet-500/20 disabled:opacity-40 transition-all"
        >
          {loading ? 'Loading…' : 'Load availability'}
        </button>
        {error && <p className="text-sm text-red-700">{error}</p>}
        {seatRows.length > 0 && (
          <div className="transition-opacity duration-300">
            <SeatGrid seats={seatRows} selectedIds={selectedSeats} onToggle={toggleSeat} />
            <div className="mt-6 space-y-2 rounded-2xl border border-slate-200/60 bg-gradient-to-r from-slate-50 to-blue-50/30 p-5 text-sm">
              <p>
                <span className="text-slate-500">Selected seats:</span>{' '}
                <span className="font-mono text-amber-900">
                  {seatRows
                    .filter((s) => selectedSeats.includes(s.id))
                    .map((s) => s.seatLabel)
                    .join(', ') || '—'}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Time:</span> {startTime} → {endTime}
              </p>
              <Link
                to="/bookings"
                state={{ preselectResourceId: Number(resourceId) }}
                className="mt-3 inline-block font-medium text-blue-600 no-underline hover:underline transition-colors"
              >
                Continue to booking form →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
