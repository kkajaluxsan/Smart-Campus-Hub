import { forwardRef, useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation } from 'react-router-dom';
import { bookings, resources, seats } from '../api/api';
import { useAuth } from '../context/AuthContext';
import SeatGrid from '../components/SeatGrid';
import {
  getBookingTimeErrors,
  localToApi,
  parseLocalDatetime,
  toLocalDatetimeLocalValue,
} from '../utils/datetimeLocal';

const CalendarIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
    />
  </svg>
);

const DateTimeField = forwardRef(function DateTimeField(
  { value, onClick, placeholder, id, invalid, disabled, ...rest },
  ref
) {
  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        type="text"
        readOnly
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        {...rest}
        className={`w-full rounded-lg border bg-slate-950 px-3 py-2 pr-10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-600/50 disabled:cursor-not-allowed disabled:opacity-50 ${
          invalid ? 'border-red-500/70' : 'border-slate-700'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
        <CalendarIcon />
      </span>
    </div>
  );
});

DateTimeField.displayName = 'DateTimeField';

export default function BookingsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [list, setList] = useState([]);
  const [resList, setResList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    resourceId: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: '',
  });
  const [seatRows, setSeatRows] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const loadBookings = async () => {
    try {
      const { data } = await bookings.list();
      setList(data);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [{ data: b }, { data: r }] = await Promise.all([bookings.list(), resources.list({})]);
        if (cancelled) return;
        setList(b);
        setResList(r);
        const pre = location.state?.preselectResourceId;
        if (pre) {
          setForm((f) => ({ ...f, resourceId: String(pre) }));
        }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.state]);

  const selectedResource = resList.find((x) => String(x.id) === String(form.resourceId));
  const isAuditorium =
    selectedResource && String(selectedResource.type || '').toUpperCase() === 'AUDITORIUM';

  const timeErrors = useMemo(
    () => getBookingTimeErrors(form.startTime, form.endTime),
    [form.startTime, form.endTime]
  );
  const canLoadSeats = Boolean(
    isAuditorium && !timeErrors.start && !timeErrors.end
  );

  const startSelected = parseLocalDatetime(form.startTime);
  const endMinDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startSelected) {
      const s = new Date(startSelected);
      s.setHours(0, 0, 0, 0);
      return s >= today ? s : today;
    }
    return today;
  }, [form.startTime]);

  const filterStartTime = (time) => time.getTime() > Date.now();
  const filterEndTime = (time) => {
    const start = parseLocalDatetime(form.startTime);
    if (!start) return true;
    return time.getTime() > start.getTime();
  };

  const onStartChange = (date) => {
    if (!date) {
      setForm((f) => ({ ...f, startTime: '', endTime: '' }));
      return;
    }
    const startStr = toLocalDatetimeLocalValue(date);
    setForm((f) => {
      let endTime = f.endTime;
      if (endTime) {
        const end = parseLocalDatetime(endTime);
        const start = parseLocalDatetime(startStr);
        if (end && start && end.getTime() <= start.getTime()) {
          const bumped = new Date(date);
          bumped.setHours(bumped.getHours() + 1);
          endTime = toLocalDatetimeLocalValue(bumped);
        }
      }
      return { ...f, startTime: startStr, endTime };
    });
  };

  const onEndChange = (date) => {
    if (!date) {
      setForm((f) => ({ ...f, endTime: '' }));
      return;
    }
    setForm((f) => ({ ...f, endTime: toLocalDatetimeLocalValue(date) }));
  };

  const loadSeatMap = async () => {
    setError('');
    if (!form.resourceId) {
      setError('Select a resource first.');
      return;
    }
    if (!isAuditorium) {
      setError('Seat map is only available for auditorium resources.');
      return;
    }
    const te = getBookingTimeErrors(form.startTime, form.endTime);
    if (te.start || te.end) {
      return;
    }
    setLoadingSeats(true);
    try {
      const start = localToApi(form.startTime);
      const end = localToApi(form.endTime);
      const { data } = await seats.availability(form.resourceId, start, end);
      setSeatRows(Array.isArray(data) ? data : []);
      setSelectedSeats([]);
      if (!data?.length) {
        setError('No seats are configured for this auditorium yet. Ask an admin to add seats or re-seed the database.');
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      setSeatRows([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  const toggleSeat = (id) => {
    setSelectedSeats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setError('');
    const te = getBookingTimeErrors(form.startTime, form.endTime);
    if (te.start || te.end) {
      return;
    }
    try {
      const body = {
        resourceId: Number(form.resourceId),
        startTime: localToApi(form.startTime),
        endTime: localToApi(form.endTime),
        purpose: form.purpose || undefined,
        attendees: isAuditorium ? selectedSeats.length : Number(form.attendees),
        seatIds: isAuditorium ? selectedSeats : undefined,
      };
      await bookings.create(body);
      setForm({
        resourceId: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: '',
      });
      setSeatRows([]);
      setSelectedSeats([]);
      await loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const approve = async (id) => {
    try {
      await bookings.approve(id, null);
      await loadBookings();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const reject = async (id) => {
    const reason = window.prompt('Reason (optional)') || '';
    try {
      await bookings.reject(id, reason || null);
      await loadBookings();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await bookings.cancel(id);
      await loadBookings();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-white">Bookings</h1>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">New booking</h2>
        <form onSubmit={submitBooking} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Resource</label>
            <select
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              value={form.resourceId}
              onChange={(e) => {
                setForm((f) => ({ ...f, resourceId: e.target.value }));
                setSeatRows([]);
                setSelectedSeats([]);
              }}
            >
              <option value="">Select…</option>
              {resList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type})
                </option>
              ))}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1" htmlFor="booking-start">
                Start
              </label>
              <DatePicker
                id="booking-start"
                selected={startSelected}
                onChange={onStartChange}
                showTimeSelect
                timeIntervals={60}
                dateFormat="MMM d, yyyy h:mm aa"
                minDate={new Date()}
                filterTime={filterStartTime}
                placeholderText="Click to pick date and time"
                popperClassName="booking-datepicker-popper z-50"
                calendarClassName="booking-datepicker-calendar"
                customInput={
                  <DateTimeField
                    invalid={Boolean(timeErrors.start)}
                    placeholder="Click to pick date and time"
                  />
                }
              />
              {timeErrors.start ? (
                <p className="mt-1 text-xs text-red-400">{timeErrors.start}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">Must be in the future.</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1" htmlFor="booking-end">
                End
              </label>
              <DatePicker
                id="booking-end"
                selected={parseLocalDatetime(form.endTime)}
                onChange={onEndChange}
                showTimeSelect
                timeIntervals={60}
                dateFormat="MMM d, yyyy h:mm aa"
                minDate={endMinDate}
                filterTime={filterEndTime}
                disabled={!form.startTime}
                placeholderText="Pick end date and time"
                popperClassName="booking-datepicker-popper z-50"
                calendarClassName="booking-datepicker-calendar"
                customInput={
                  <DateTimeField
                    invalid={Boolean(timeErrors.end)}
                    placeholder={
                      form.startTime ? 'Click to pick date and time' : 'Choose start first'
                    }
                  />
                }
              />
              {timeErrors.end ? (
                <p className="mt-1 text-xs text-red-400">{timeErrors.end}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  {form.startTime ? 'Must be after start.' : 'Pick start first, then end.'}
                </p>
              )}
            </div>
          </div>

          {isAuditorium && (
            <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-4 space-y-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                <strong className="text-violet-200">Auditorium booking:</strong> first choose{' '}
                <strong>Start</strong> and <strong>End</strong> above (must be in the future and end after start),
                then click <strong>Load seat availability</strong>. The seat map appears below this button.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={loadSeatMap}
                  disabled={loadingSeats || !canLoadSeats}
                  title={
                    !canLoadSeats
                      ? 'Fix start/end validation above, or pick an auditorium resource'
                      : 'Load seats for the selected time range'
                  }
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loadingSeats ? 'Loading seats…' : 'Load seat availability'}
                </button>
                <p className="text-slate-400 text-sm">
                  Green = free · Red = taken · Yellow = your selection
                </p>
              </div>
              {!canLoadSeats && (
                <p className="text-amber-200/90 text-sm">
                  Choose start and end with the calendars above (future start, end after start), then load seats.
                </p>
              )}
              {seatRows.length > 0 && (
                <>
                  <SeatGrid seats={seatRows} selectedIds={selectedSeats} onToggle={toggleSeat} />
                  <div className="text-sm text-slate-300 border-t border-slate-700 pt-3">
                    <p>
                      <span className="text-slate-500">Resource:</span>{' '}
                      <span className="text-white">{selectedResource?.name}</span>
                    </p>
                    <p>
                      <span className="text-slate-500">Selected:</span>{' '}
                      <span className="text-amber-300 font-mono">
                        {seatRows
                          .filter((s) => selectedSeats.includes(s.id))
                          .map((s) => s.seatLabel)
                          .join(', ') || '—'}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-500">When:</span>{' '}
                      {form.startTime} → {form.endTime}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {!isAuditorium && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">Attendees</label>
              <input
                type="number"
                min="1"
                required={!isAuditorium}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                value={form.attendees}
                onChange={(e) => setForm((f) => ({ ...f, attendees: e.target.value }))}
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Purpose</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white min-h-[80px]"
              value={form.purpose}
              onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={
              Boolean(timeErrors.start || timeErrors.end) ||
              (isAuditorium && selectedSeats.length === 0)
            }
            className="px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium disabled:opacity-40"
          >
            Submit booking
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Your bookings</h2>
        {loading && <p className="text-slate-500">Loading…</p>}
        <div className="space-y-3">
          {list.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-wrap justify-between gap-3"
            >
              <div>
                <p className="font-medium text-white">
                  {b.resourceName}{' '}
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      b.status === 'APPROVED'
                        ? 'bg-emerald-900/60 text-emerald-300'
                        : b.status === 'PENDING'
                          ? 'bg-amber-900/60 text-amber-200'
                          : b.status === 'REJECTED'
                            ? 'bg-red-900/60 text-red-300'
                            : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {b.status}
                  </span>
                </p>
                <p className="text-slate-500 text-sm">
                  {b.startTime} → {b.endTime}
                </p>
                {b.seatLabels?.length > 0 && (
                  <p className="text-violet-300 text-sm mt-1">Seats: {b.seatLabels.join(', ')}</p>
                )}
                {b.adminReason && (
                  <p className="text-slate-400 text-sm mt-1">Note: {b.adminReason}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {user?.role === 'ADMIN' && b.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => approve(b.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-sm text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => reject(b.id)}
                      className="px-3 py-1 rounded-lg bg-red-800 hover:bg-red-700 text-sm text-white"
                    >
                      Reject
                    </button>
                  </>
                )}
                {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                  <button
                    type="button"
                    onClick={() => cancelBooking(b.id)}
                    className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
