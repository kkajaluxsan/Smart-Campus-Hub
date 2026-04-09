import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { parseISO } from 'date-fns';
import { resources } from '../api/api';
import PageHeader from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Calendar as CalendarIcon, Clock, XCircle, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

export default function ResourceSchedule() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resource, setResource] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
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
      } finally {
        if (!cancelled) setLoading(false);
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
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader
        title={resource ? `Schedule: ${resource.name}` : 'Resource schedule'}
        description="Confirmed and pending bookings taking place in the selected window."
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

      <div className="flex flex-wrap gap-2 animate-slide-up">
        <Button variant="secondary" size="sm" onClick={() => setRangeDays(1)}>
          1 day
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setRangeDays(7)}>
          7 days
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setRangeDays(30)}>
          30 days
        </Button>
      </div>

      <Card className="animate-slide-up hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin text-uni-blue" size={32} />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Scanning schedule...</p>
              </div>
            )}
            
            {!loading && schedule.length === 0 && (
              <div className="text-center py-20 bg-slate-50/50">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CalendarIcon className="text-slate-300" size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Schedule Clear</h3>
                <p className="text-slate-500 mt-2 font-medium">No bookings found in this range.</p>
              </div>
            )}
            
            {!loading && schedule.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-4 px-8 py-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50 hidden sm:block">
                     <CalendarIcon className="text-uni-blue" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg leading-none mb-2">{row.label}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <Clock size={14} className="text-slate-400" />
                      {row.startTime} <span className="text-slate-300">→</span> {row.endTime}
                    </div>
                  </div>
                </div>
                <Badge
                  tone={
                    row.status === 'APPROVED' ? 'success' : row.status === 'PENDING' ? 'warning' : 'default'
                  }
                  className="shrink-0"
                >
                  {row.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="fixed bottom-8 right-8 z-[100] animate-slide-up">
           <div className="bg-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <XCircle size={24} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Error Loading Schedule</p>
                <p className="text-sm font-bold mt-0.5">{error}</p>
              </div>
              <button onClick={() => setError('')} className="ml-auto p-1.5 hover:bg-white/20 rounded-xl transition-colors">
                <XCircle size={18} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
