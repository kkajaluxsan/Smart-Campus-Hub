import { useEffect, useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Info,
  Check,
  Loader2
} from 'lucide-react';
import { notifications } from '../api/api';
import PageHeader from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';

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

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING': return <Clock className="text-sky-500" size={18} />;
      case 'TICKET': return <MessageSquare className="text-amber-500" size={18} />;
      case 'SYSTEM': return <Info className="text-indigo-500" size={18} />;
      default: return <Bell className="text-slate-500" size={18} />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader
        title="Notifications"
        description="Stay updated with your bookings, service tickets, and campus announcements."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Notifications' }]}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-uni-blue" size={40} />
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Syncing updates...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50 text-rose-800 text-sm font-medium animate-slide-up">
          {error}
        </div>
      )}

      {!loading && list.length === 0 && (
        <div className="text-center py-24 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 animate-slide-up">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Bell className="text-slate-300" size={32} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">All caught up!</h3>
          <p className="text-slate-500 mt-2 font-medium">You don't have any new notifications at the moment.</p>
        </div>
      )}

      <div className="space-y-4">
        {list.map((n, i) => (
          <Card 
            key={n.id} 
            glass={!n.read}
            className={cn(
              "group transition-all duration-300 border-l-4 animate-slide-up",
              n.read ? "border-l-slate-200 opacity-75" : "border-l-uni-blue shadow-soft-xl scale-[1.01]"
            )}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110",
                  n.read ? "bg-slate-100" : "bg-white shadow-sm"
                )}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className={cn(
                       "font-bold text-slate-900 transition-colors",
                       !n.read && "text-uni-blue"
                    )}>
                      {n.message}
                    </p>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-tight">
                    {n.type} ALERT
                  </p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => mark(n.id)}
                    className="ml-4 p-2 rounded-xl bg-uni-blue/10 text-uni-blue hover:bg-uni-blue hover:text-white transition-all shadow-sm active:scale-95"
                    title="Mark as read"
                  >
                    <Check size={18} strokeWidth={3} />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
