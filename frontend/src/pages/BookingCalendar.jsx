import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { bookings } from '../api/api';
import PageHeader from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function BookingCalendar() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  const [view, setView] = useState('week');

  const load = useCallback(async () => {
    setError('');
    try {
      const { data } = await bookings.list();
      setList(data);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const events = useMemo(
    () =>
      list.map((b) => ({
        title: `${b.resourceName} (${b.status})`,
        start: new Date(b.startTime),
        end: new Date(b.endTime),
        resource: b,
      })),
    [list]
  );

  const onSelectSlot = useCallback(
    ({ start, end }) => {
      navigate('/bookings', {
        state: { slotStart: start.toISOString(), slotEnd: end.toISOString() },
      });
    },
    [navigate]
  );

  return (
    <div>
      <PageHeader
        title="Booking calendar"
        description="View your bookings in a calendar. Drag on empty time to create a new booking for that range."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Booking calendar' }]}
        actions={
          <Button variant="secondary" type="button" onClick={() => navigate('/bookings')}>
            New booking form
          </Button>
        }
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setView('month')}>
              Month
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setView('week')}>
              Week
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setView('day')}>
              Day
            </Button>
          </div>
          <div className="min-h-[520px]">
            <Calendar
              localizer={localizer}
              events={events}
              view={view}
              onView={setView}
              defaultView="week"
              views={['month', 'week', 'day', 'agenda']}
              selectable
              onSelectSlot={onSelectSlot}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
