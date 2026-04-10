import { forwardRef, useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation } from 'react-router-dom';
import { bookings, resources, seats } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { formatDepartment } from '../constants/studentProfile';
import SeatGrid from '../components/SeatGrid';
import {
  getBookingTimeErrors,
  localToApi,
  parseLocalDatetime,
  toLocalDatetimeLocalValue,
} from '../utils/datetimeLocal';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Info,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Repeat,
  Loader2
} from 'lucide-react';

const DateTimeField = forwardRef(function DateTimeField(
  { value, onClick, placeholder, id, invalid, disabled, ...rest },
  ref
) {
  return (
    <div className="relative group">
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
        className={cn(
          'w-full rounded-2xl border bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-slate-900 shadow-sm transition-all duration-300',
          'placeholder:text-slate-400 placeholder:font-medium',
          'focus:bg-white focus:border-uni-blue focus:outline-none focus:ring-4 focus:ring-uni-blue/10',
          'hover:border-slate-300 group-hover:bg-white',
          invalid ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-100',
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 hover:border-slate-100 group-hover:bg-slate-50' : 'cursor-pointer'
        )}
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-uni-blue transition-colors">
        <CalendarIcon size={16} />
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
    recurrence: 'NONE',
    recurrenceOccurrences: 2,
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
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
        const slotStart = location.state?.slotStart;
        const slotEnd = location.state?.slotEnd;
        if (slotStart && slotEnd) {
          setForm((f) => ({
            ...f,
            startTime: toLocalDatetimeLocalValue(new Date(slotStart)),
            endTime: toLocalDatetimeLocalValue(new Date(slotEnd)),
          }));
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
    setFormErrors((prev) => ({ ...prev, startTime: undefined }));
  };

  const onEndChange = (date) => {
    if (!date) {
      setForm((f) => ({ ...f, endTime: '' }));
      return;
    }
    setForm((f) => ({ ...f, endTime: toLocalDatetimeLocalValue(date) }));
    setFormErrors((prev) => ({ ...prev, endTime: undefined }));
  };

  const loadSeatMap = async () => {
    setError('');
    const errs = {};
    if (!form.resourceId) {
      errs.resourceId = 'Select a resource first.';
    }
    if (Object.keys(errs).length > 0) {
      setFormErrors((prev) => ({ ...prev, ...errs }));
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

  const validateForm = () => {
    const errs = {};
    if (!form.resourceId) errs.resourceId = 'Please select a resource.';
    if (!isAuditorium) {
      if (!form.attendees || isNaN(form.attendees) || Number(form.attendees) < 1) {
        errs.attendees = 'Please enter a valid number of attendees.';
      }
    }
    if (!form.purpose || form.purpose.trim().length < 5) {
      errs.purpose = 'Purpose must be at least 5 characters long.';
    }
    if (form.recurrence !== 'NONE') {
      const occ = Number(form.recurrenceOccurrences);
      if (isNaN(occ) || occ < 2 || occ > 26) {
        errs.recurrenceOccurrences = 'Occurrences must be between 2 and 26.';
      }
    }
    
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const te = getBookingTimeErrors(form.startTime, form.endTime);
    if (te.start || te.end) {
      return;
    }
    if (!validateForm()) {
      return;
    }
    try {
      const rec = form.recurrence === 'NONE' ? undefined : form.recurrence;
      const occ =
        form.recurrence === 'NONE' ? undefined : Math.min(26, Math.max(2, Number(form.recurrenceOccurrences) || 2));
      const body = {
        resourceId: Number(form.resourceId),
        startTime: localToApi(form.startTime),
        endTime: localToApi(form.endTime),
        purpose: form.purpose || undefined,
        attendees: isAuditorium ? selectedSeats.length : Number(form.attendees),
        seatIds: isAuditorium ? selectedSeats : undefined,
        recurrence: rec,
        recurrenceOccurrences: occ,
      };
      const { data } = await bookings.create(body);
      const created = Array.isArray(data) ? data : [data];
      setSuccessMsg(`Successfully created ${created.length} booking request(s).`);
      setForm({
        resourceId: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: '',
        recurrence: 'NONE',
        recurrenceOccurrences: 2,
      });
      setFormErrors({});
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
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookings.cancel(id);
      await loadBookings();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Badge tone="success">{status}</Badge>;
      case 'PENDING':
        return <Badge tone="warning">{status}</Badge>;
      case 'REJECTED':
        return <Badge tone="danger">{status}</Badge>;
      default:
        return <Badge tone="info">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <PageHeader
        title="Bookings"
        description="Request campus space. Auditoriums require seat selection."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Bookings' }]}
      />

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* New Booking Form */}
        <Card glass className="lg:col-span-1 animate-slide-up h-fit sticky top-24">
          <CardHeader>
            <div className="flex items-center gap-3 text-uni-blue mb-2">
              <div className="bg-uni-blue/10 p-2.5 rounded-xl">
                <CalendarCheck size={20} />
              </div>
              <CardTitle className="text-xl">New Booking</CardTitle>
            </div>
            <CardDescription>Reserve a resource and set your preferred timeline.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={submitBooking} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Resource</label>
                <div className="relative group">
                  <select
                    className={cn(
                      'w-full rounded-2xl border bg-white/50 px-4 py-3 text-sm text-slate-900 shadow-sm transition-all focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none appearance-none hover:bg-white',
                      formErrors.resourceId ? 'border-rose-300' : 'border-slate-100'
                    )}
                    value={form.resourceId}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, resourceId: e.target.value }));
                      setFormErrors((prev) => ({ ...prev, resourceId: undefined }));
                      setSeatRows([]);
                      setSelectedSeats([]);
                    }}
                  >
                    <option value="">Select Resource...</option>
                    {resList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.type})
                      </option>
                    ))}
                  </select>
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-uni-blue transition-colors" size={16} />
                </div>
                {formErrors.resourceId && <p className="text-xs font-semibold text-rose-500 ml-1 animate-fade-in">{formErrors.resourceId}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1" htmlFor="booking-start">
                  Start Time
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
                  placeholderText="Select start datetime"
                  popperClassName="booking-datepicker-popper z-50"
                  calendarClassName="booking-datepicker-calendar"
                  customInput={
                    <DateTimeField
                      invalid={Boolean(timeErrors.start)}
                      placeholder="Select start datetime"
                    />
                  }
                />
                {timeErrors.start ? (
                  <p className="mt-1 text-xs font-semibold text-rose-500 ml-1 animate-fade-in">{timeErrors.start}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1" htmlFor="booking-end">
                  End Time
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
                  placeholderText="Select end datetime"
                  popperClassName="booking-datepicker-popper z-50"
                  calendarClassName="booking-datepicker-calendar"
                  customInput={
                    <DateTimeField
                      invalid={Boolean(timeErrors.end)}
                      placeholder={
                        form.startTime ? 'Select end datetime' : 'Choose start first'
                      }
                    />
                  }
                />
                {timeErrors.end ? (
                  <p className="mt-1 text-xs font-semibold text-rose-500 ml-1 animate-fade-in">{timeErrors.end}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Recurrence</label>
                  <div className="relative group">
                    <select
                      className="w-full rounded-2xl border border-slate-100 bg-white/50 px-4 py-3 text-sm text-slate-900 shadow-sm transition-all focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none appearance-none hover:bg-white"
                      value={form.recurrence}
                      onChange={(e) => setForm((f) => ({ ...f, recurrence: e.target.value }))}
                    >
                      <option value="NONE">None</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="BIWEEKLY">Bi-weekly</option>
                    </select>
                    <Repeat className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                  </div>
                </div>
                {form.recurrence !== 'NONE' && (
                  <div className="space-y-2 animate-fade-in">
                    <Input
                      label="Occurrences"
                      type="number"
                      min={2}
                      max={26}
                      value={form.recurrenceOccurrences}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, recurrenceOccurrences: e.target.value }));
                        setFormErrors((prev) => ({ ...prev, recurrenceOccurrences: undefined }));
                      }}
                      error={formErrors.recurrenceOccurrences}
                      placeholder="2-26"
                    />
                  </div>
                )}
              </div>

              {isAuditorium && (
                <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-fuchsia-50/30 p-5 space-y-4 animate-slide-up">
                  <p className="text-slate-700 text-xs font-medium leading-relaxed">
                    <Info className="inline-block w-4 h-4 mr-1 text-violet-500 -mt-0.5" />
                    <strong className="text-violet-900">Auditorium mapping:</strong> pick your time range, then select required seating.
                  </p>
                  
                  <Button 
                    type="button" 
                    onClick={loadSeatMap} 
                    disabled={loadingSeats || !canLoadSeats}
                    variant="primary"
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 shadow-violet-500/25 border-none"
                  >
                    {loadingSeats ? 'Loading Seats...' : 'Load Seat Availability'}
                  </Button>
                  
                  {!canLoadSeats && (
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest text-center">
                      Select valid future time ranges first.
                    </p>
                  )}

                  {seatRows.length > 0 && (
                    <div className="animate-fade-in bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-violet-200/50">
                      <SeatGrid seats={seatRows} selectedIds={selectedSeats} onToggle={toggleSeat} />
                      <div className="mt-4 pt-3 border-t border-violet-200/50 flex flex-wrap gap-2 text-xs font-medium text-slate-600 justify-between items-center">
                         <span>Selected: <span className="font-bold text-violet-700">{selectedSeats.length} seats</span></span>
                         {selectedSeats.length > 0 && (
                           <span className="truncate max-w-[150px]" title={seatRows.filter((s) => selectedSeats.includes(s.id)).map((s) => s.seatLabel).join(', ')}>
                             {seatRows.filter((s) => selectedSeats.includes(s.id)).map((s) => s.seatLabel).join(', ')}
                           </span>
                         )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isAuditorium && (
                <Input
                  label="Attendees"
                  type="number"
                  min="1"
                  value={form.attendees}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, attendees: e.target.value }));
                    setFormErrors((prev) => ({ ...prev, attendees: undefined }));
                  }}
                  error={formErrors.attendees}
                  placeholder="Estimated user count"
                />
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Purpose Description</label>
                <div className="relative group">
                  <textarea
                    className={cn(
                      'min-h-[100px] w-full rounded-2xl border bg-white/50 backdrop-blur-sm px-4 py-3 text-sm text-slate-900 shadow-sm transition-all focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none resize-none hover:bg-white',
                      formErrors.purpose ? 'border-rose-300' : 'border-slate-100'
                    )}
                    placeholder="Describe specific use case ensuring admins approve quickly..."
                    value={form.purpose}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, purpose: e.target.value }));
                      setFormErrors((prev) => ({ ...prev, purpose: undefined }));
                    }}
                  />
                </div>
                {formErrors.purpose && <p className="text-xs font-semibold text-rose-500 ml-1 animate-fade-in">{formErrors.purpose}</p>}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={Boolean(timeErrors.start || timeErrors.end) || (isAuditorium && selectedSeats.length === 0)}
              >
                Submit Booking
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Bookings List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between xl:justify-start gap-4 mb-4">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Requests</h2>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              {list.length} Records Found
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
              <Loader2 className="animate-spin text-uni-blue" size={32} />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Records...</p>
            </div>
          )}

          {!loading && list.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle2 className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">No Reservations</h3>
              <p className="text-slate-500 mt-2 font-medium">You have not submitted any reservations yet.</p>
            </div>
          )}

          {list.map((b, i) => (
            <Card 
              key={b.id} 
              className="group overflow-hidden transition-all duration-500 animate-slide-up hover:shadow-soft-lg"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
                         <CalendarCheck className="text-uni-blue" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-none mb-1.5">{b.resourceName}</h3>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{b.id}</span>
                           {getStatusBadge(b.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100/50 ml-[52px] space-y-2">
                       <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                         <Clock size={14} className="text-slate-400" />
                         {b.startTime} <span className="text-slate-300">→</span> {b.endTime}
                       </div>
                       
                       {b.seatLabels?.length > 0 && (
                          <div className="flex items-start gap-2 text-sm text-violet-700 font-medium pt-1">
                            <Users size={14} className="mt-0.5 text-violet-400" />
                            <span className="flex-1">Seats: {b.seatLabels.join(', ')}</span>
                          </div>
                       )}

                       {user?.role === 'ADMIN' && (b.requesterStudentIndexNumber || b.requesterDepartment) && (
                          <div className="flex items-start gap-2 text-xs font-semibold text-slate-500 bg-white p-2 rounded-lg border border-slate-200 border-dashed">
                             <Users size={12} className="mt-0.5" />
                             <span>
                               {[b.requesterStudentIndexNumber, b.requesterDepartment && formatDepartment(b.requesterDepartment)].filter(Boolean).join(' · ')}
                             </span>
                          </div>
                       )}

                       {b.adminReason && (
                          <div className="mt-2 text-xs bg-rose-50/50 text-rose-700 p-2.5 rounded-lg border border-rose-100">
                             <strong>Admin Note:</strong> {b.adminReason}
                          </div>
                       )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    {user?.role === 'ADMIN' && b.status === 'PENDING' && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="primary"
                          className="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25 flex-1"
                          size="sm"
                          onClick={() => approve(b.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-1"
                          onClick={() => reject(b.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                        onClick={() => cancelBooking(b.id)}
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {(error || successMsg) && (
        <div className="fixed bottom-8 right-8 z-[100] animate-slide-up max-w-sm">
           <div className={cn(
             "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 relative overflow-hidden",
             error ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
           )}>
              {error ? <XCircle size={24} /> : <CheckCircle2 size={24} />}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                  {error ? 'Validation Failed' : 'Success'}
                </p>
                <p className="text-sm font-bold mt-0.5">{error || successMsg}</p>
              </div>
              <button 
                onClick={() => { setError(''); setSuccessMsg(''); }} 
                className="ml-auto p-1.5 hover:bg-white/20 rounded-xl transition-colors"
                aria-label="Close notification"
              >
                <XCircle size={18} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
