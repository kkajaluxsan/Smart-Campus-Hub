import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboard } from '../api/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError('');
      try {
        const { data } = await dashboard.summary();
        if (!cancelled) setSummary(data);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const roleLabel =
    user?.role === 'ADMIN'
      ? 'Administrator'
      : user?.role === 'TECHNICIAN'
        ? 'Technician'
        : 'Student / faculty';

  const quickLinks = [
    { title: 'Resources', desc: 'Search rooms, labs, and auditoriums.', to: '/resources', tone: 'border-emerald-200 bg-emerald-50/80' },
    { title: 'Bookings', desc: 'Request space and select auditorium seats.', to: '/bookings', tone: 'border-sky-200 bg-sky-50/80' },
    { title: 'Booking calendar', desc: 'Month, week, or day view; drag to book.', to: '/bookings/calendar', tone: 'border-indigo-200 bg-indigo-50/80' },
    { title: 'Service tickets', desc: 'Report maintenance issues and track work.', to: '/tickets', tone: 'border-amber-200 bg-amber-50/80' },
    { title: 'Notifications', desc: 'Approvals, assignments, and updates.', to: '/notifications', tone: 'border-violet-200 bg-violet-50/80' },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome${user?.fullName ? `, ${user.fullName}` : ''}`}
        description={`${roleLabel} · Use the shortcuts below to manage campus operations.`}
      />

      {error && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      )}

      {summary && (
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending bookings</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{summary.pendingBookings}</p>
              <p className="mt-1 text-xs text-slate-500">Awaiting action where applicable</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Open tickets</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{summary.openTickets}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unread notifications</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{summary.unreadNotifications}</p>
            </CardContent>
          </Card>
          <Card className="border-uni-blue/30 bg-uni-blue/5">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-uni-blue">Role</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{user?.role}</p>
              <Link to="/notifications" className="mt-2 inline-block text-sm text-uni-blue no-underline">
                View inbox →
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        {quickLinks.map((c) => (
          <Link key={c.to} to={c.to} className={`block rounded-xl border p-5 shadow-sm transition hover:shadow-md no-underline ${c.tone}`}>
            <h2 className="text-lg font-semibold text-slate-900">{c.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{c.desc}</p>
          </Link>
        ))}
      </div>

      {summary && (summary.upcomingBookings?.length > 0 || summary.priorityTickets?.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <CardTitle>Upcoming bookings</CardTitle>
              <CardDescription>Your next reserved time slots</CardDescription>
              <ul className="mt-4 space-y-3">
                {summary.upcomingBookings?.map((b) => (
                  <li key={b.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-3 text-sm last:border-0">
                    <span className="font-medium text-slate-900">{b.resourceName}</span>
                    <Badge tone={b.status === 'APPROVED' ? 'success' : 'warning'}>{b.status}</Badge>
                    <span className="w-full text-slate-500">
                      {b.startTime} → {b.endTime}
                    </span>
                  </li>
                ))}
              </ul>
              {(!summary.upcomingBookings || summary.upcomingBookings.length === 0) && (
                <p className="text-slate-500 text-sm">No upcoming bookings.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <CardTitle>Tickets needing attention</CardTitle>
              <CardDescription>High / critical first, then other open items</CardDescription>
              <ul className="mt-4 space-y-3">
                {summary.priorityTickets?.map((t) => (
                  <li key={t.id} className="border-b border-slate-100 pb-3 text-sm last:border-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">#{t.id}</span>
                      <Badge tone="info">{t.priority}</Badge>
                      {t.slaBreached && <Badge tone="danger">SLA</Badge>}
                    </div>
                    <p className="text-slate-600 mt-1 line-clamp-2">{t.description}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {user?.role === 'ADMIN' && (
        <Card className="mt-8 border-amber-200 bg-amber-50/50">
          <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Administration</CardTitle>
              <CardDescription>Resources, approvals, and audit trail</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/admin/resources">
                <Button type="button" variant="secondary">
                  Manage resources
                </Button>
              </Link>
              <Link to="/admin/approvals">
                <Button type="button">Booking approvals</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
