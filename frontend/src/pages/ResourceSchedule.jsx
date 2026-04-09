import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { parseISO } from 'date-fns';
import { resources } from '../api/api';
import PageHeader from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function ResourceSchedule() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resource, setResource] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState('');

  const toLocalParam = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const range = useMemo(() => {
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    if (start && end) return { start, end };
    const startD = new Date();
    startD.setHours(0, 0, 0, 0);
    const endD = new Date(startD);
    endD.setDate(endD.getDate() + 7);
    return { start: toLocalParam(startD), end: toLocalParam(endD) };
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError('');
      try {
        const [{ data: r }, { data: s }] = await Promise.all([
          resources.get(id),
          resources.schedule(id, range.start, range.end),
        ]);
        if (!cancelled) {
          setResource(r);
          setSchedule(s);
        }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, range.start, range.end]);

  const setRangeDays = (days) => {
    const start = parseISO(range.start);
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    setSearchParams({
      start: toLocalParam(start),
      end: toLocalParam(end),
    });
  };

  return (
    <div>
      <PageHeader
        title={resource ? `Schedule: ${resource.name}` : 'Resource schedule'}
        description="Confirmed and pending bookings that block this resource in the selected window."
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Resources', to: '/resources' },
          { label: 'Schedule' },
        ]}
        actions={
          <Link to={`/bookings`} state={{ preselectResourceId: id }}>
            <Button type="button">Book this resource</Button>
          </Link>
        }
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

      <div className="mb-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setRangeDays(1)}>
          1 day
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setRangeDays(7)}>
          7 days
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setRangeDays(30)}>
          30 days
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {schedule.length === 0 && (
              <p className="p-6 text-center text-slate-500">No bookings in this range.</p>
            )}
            {schedule.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium text-slate-900">{row.label}</p>
                  <p className="text-sm text-slate-600">
                    {row.startTime} → {row.endTime}
                  </p>
                </div>
                <Badge
                  tone={
                    row.status === 'APPROVED' ? 'success' : row.status === 'PENDING' ? 'warning' : 'default'
                  }
                >
                  {row.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
