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
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/resources" className="text-sky-400 hover:underline text-sm">
          ← Resources
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Auditorium seat map</h1>
      <p className="text-slate-400 mb-6">{name || `Resource #${resourceId}`}</p>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Start</label>
            <input
              type="datetime-local"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">End</label>
            <input
              type="datetime-local"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={loadSeats}
          disabled={loading || !startTime || !endTime}
          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm disabled:opacity-40"
        >
          {loading ? 'Loading…' : 'Load availability'}
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {seatRows.length > 0 && (
          <div className="transition-opacity duration-300">
            <SeatGrid seats={seatRows} selectedIds={selectedSeats} onToggle={toggleSeat} />
            <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-700 text-sm space-y-1">
              <p>
                <span className="text-slate-500">Selected seats:</span>{' '}
                <span className="text-amber-300 font-mono">
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
                className="inline-block mt-3 text-sky-400 hover:underline"
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
