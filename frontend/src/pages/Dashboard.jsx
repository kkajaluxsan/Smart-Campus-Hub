import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  CalendarCheck, 
  CalendarRange, 
  Wrench, 
  Bell, 
  ArrowRight,
  User,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { dashboard } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { formatDepartment, formatYearSemester } from '../constants/studentProfile';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { cn } from '../utils/cn';

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
        : 'Student / Faculty';

  const quickLinks = [
    { 
      title: 'Resources', 
      desc: 'Rooms, labs, auditoriums.', 
      to: '/resources', 
      icon: Search,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50'
    },
    { 
      title: 'Bookings', 
      desc: 'Request space & seats.', 
      to: '/bookings', 
      icon: CalendarCheck,
      color: 'text-sky-500',
      bg: 'bg-sky-50'
    },
    { 
      title: 'Calendar', 
      desc: 'Full schedule view.', 
      to: '/bookings/calendar', 
      icon: CalendarRange,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50'
    },
    { 
      title: 'Service', 
      desc: 'Report & track issues.', 
      to: '/tickets', 
      icon: Wrench,
      color: 'text-amber-500',
      bg: 'bg-amber-50'
    },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
        <PageHeader
          title={`Hello${user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''} 👋`}
          description={roleLabel}
          className="mb-0"
        />
        
        <Link to="/notifications" className="relative group">
          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md border border-slate-100 p-2 pr-4 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="bg-uni-blue/10 p-2.5 rounded-xl text-uni-blue">
              <Bell size={20} />
            </div>
            <div className="text-sm">
              <p className="font-bold text-slate-900 leading-none">Notifications</p>
              <p className="text-slate-500 text-xs mt-1">
                {summary?.unreadNotifications || 0} unread
              </p>
            </div>
          </div>
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-rose-100 bg-rose-50 text-rose-800 animate-slide-up">
          <AlertCircle size={18} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {user?.role === 'USER' && user?.authProvider === 'GOOGLE' && !user?.studentIndexNumber && (
        <Card glass className="border-amber-200 bg-amber-50/30 animate-slide-up">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100/50 p-2 rounded-lg text-amber-700">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">Complete your profile</p>
                <p className="text-xs text-amber-700">Add your academic details to unlock all features.</p>
              </div>
            </div>
            <Link to="/complete-profile">
              <Button size="sm" variant="secondary" className="bg-white border-amber-200 text-amber-700 hover:bg-amber-50">
                Finish →
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pending Bookings', value: summary?.pendingBookings || 0, icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50', delay: 'animate-stagger-1' },
          { label: 'Open Tickets', value: summary?.openTickets || 0, icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50', delay: 'animate-stagger-2' },
          { label: 'System Status', value: 'Live', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', delay: 'animate-stagger-3' },
          { label: 'Campus Access', value: user?.role === 'ADMIN' ? 'Full' : 'Standard', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', delay: 'animate-stagger-4' }
        ].map((stat, i) => (
          <Card key={i} glass className={cn("relative overflow-hidden group hover:-translate-y-1 animate-slide-up", stat.delay)}>
            <CardContent className="p-6">
              <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110", stat.bg)}></div>
              <div className={cn("inline-flex p-3 rounded-2xl mb-4", stat.bg, stat.color)}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quick Actions</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {quickLinks.map((link, i) => (
                <Link key={link.to} to={link.to} className={cn(
                  "group relative overflow-hidden glass-card rounded-[2rem] p-6 transition-all duration-500 hover:shadow-soft-xl hover:-translate-y-1 animate-slide-up",
                  i === 0 ? "animate-stagger-1" : i === 1 ? "animate-stagger-2" : i === 2 ? "animate-stagger-3" : "animate-stagger-4"
                )}>
                  <div className={cn("mb-4 inline-flex p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500", link.bg, link.color)}>
                    <link.icon size={28} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-uni-blue transition-colors">{link.title}</h3>
                  <p className="mt-2 text-sm font-medium text-slate-500 transition-colors leading-relaxed">{link.desc}</p>
                  <div className="mt-6 flex items-center text-xs font-bold text-uni-blue opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                    GO TO {link.title.toUpperCase()} <ArrowRight size={14} className="ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {summary && (summary.upcomingBookings?.length > 0 || summary.priorityTickets?.length > 0) && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card glass className="animate-slide-up animate-stagger-2">
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming</CardTitle>
                  <CardDescription>Your next reserved slots</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {summary.upcomingBookings?.map((b) => (
                    <div key={b.id} className="group relative flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">{b.resourceName}</p>
                        <p className="text-xs font-medium text-slate-400">{b.startTime.split('T')[0]} • {b.startTime.split('T')[1]?.slice(0, 5)}</p>
                      </div>
                      <Badge tone={b.status === 'APPROVED' ? 'success' : 'warning'}>
                        {b.status}
                      </Badge>
                    </div>
                  ))}
                  {(!summary.upcomingBookings || summary.upcomingBookings.length === 0) && (
                    <div className="text-center py-6">
                      <p className="text-sm font-medium text-slate-400">No scheduled bookings</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card glass className="animate-slide-up animate-stagger-3">
                <CardHeader>
                  <CardTitle className="text-lg">System Tickets</CardTitle>
                  <CardDescription>Items needing attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {summary.priorityTickets?.map((t) => (
                    <div key={t.id} className="p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400">#{t.id}</span>
                        <Badge tone="info" className="scale-90">{t.priority}</Badge>
                      </div>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{t.description}</p>
                    </div>
                  ))}
                  {(!summary.priorityTickets || summary.priorityTickets.length === 0) && (
                    <div className="text-center py-6">
                      <p className="text-sm font-medium text-slate-400">All clear!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="bg-gradient-to-br from-uni-blue to-uni-indigo text-white shadow-soft-xl border-none p-2 animate-slide-up animate-stagger-4 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="bg-white/20 w-fit p-3 rounded-2xl backdrop-blur-md mb-6">
                <ShieldCheck size={28} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Access Portal</p>
              <h3 className="text-3xl font-extrabold mt-2 tracking-tight">University Control</h3>
              <p className="mt-4 text-white/80 text-sm font-medium leading-relaxed">
                You are currently logged in with <span className="font-bold text-white">{roleLabel}</span> privileges. 
                Manage assets, schedules, and operations centrally.
              </p>
              
              <div className="mt-8 space-y-3">
                <Link to="/notifications" className="block text-center w-full bg-white text-uni-blue py-3 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0">
                  Open Control Center
                </Link>
                {user?.role === 'ADMIN' && (
                   <Link to="/admin/approvals" className="block text-center w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-3 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all">
                   Booking Management
                 </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {user?.role === 'USER' &&
            (user?.studentIndexNumber ||
              user?.department ||
              (user?.academicYear != null && user?.semester != null)) && (
              <Card glass className="animate-slide-up animate-stagger-4">
                <CardHeader className="pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Identification</p>
                  <CardTitle className="text-lg">Student Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-4 mt-2">
                    {user.studentIndexNumber && (
                      <div className="bg-slate-50/50 p-3 rounded-2xl">
                        <dt className="text-[10px] font-bold text-slate-400 uppercase">Index Number</dt>
                        <dd className="font-bold text-slate-900 mt-0.5">{user.studentIndexNumber}</dd>
                      </div>
                    )}
                    {(user.academicYear != null && user.semester != null) && (
                      <div className="bg-slate-50/50 p-3 rounded-2xl">
                        <dt className="text-[10px] font-bold text-slate-400 uppercase">Academic Session</dt>
                        <dd className="font-bold text-slate-900 mt-0.5">
                          {formatYearSemester(user.academicYear, user.semester)}
                        </dd>
                      </div>
                    )}
                    {user.department && (
                      <div className="bg-slate-50/50 p-3 rounded-2xl">
                        <dt className="text-[10px] font-bold text-slate-400 uppercase">Department</dt>
                        <dd className="font-bold text-slate-900 mt-0.5">{formatDepartment(user.department)}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}
