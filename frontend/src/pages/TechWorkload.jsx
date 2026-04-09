import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { tech } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { 
  Wrench, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ListChecks, 
  Loader2, 
  TrendingUp,
  MapPin,
  ArrowUpRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Table, Th, Td } from '../components/ui/Table';
import { cn } from '../utils/cn';

export default function TechWorkload() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: d } = await tech.workload();
      setData(d);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (user?.role !== 'TECHNICIAN') {
    return <Navigate to="/" replace />;
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-rose-600';
      case 'HIGH': return 'text-orange-600';
      case 'MEDIUM': return 'text-amber-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <PageHeader
        title="Technical Workload"
        description="Monitor assignments, track resolution targets, and manage open service tickets."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Workload' }]}
        actions={
          <Button variant="outline" onClick={load} disabled={loading} size="sm">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
            Refresh Stats
          </Button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-rose-100 bg-rose-50 text-rose-800 animate-slide-up">
          <AlertCircle size={18} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {data && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card glass className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 animate-slide-up animate-stagger-1 border-blue-100/50">
            <CardContent className="p-6">
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-uni-blue/5 opacity-50 transition-transform group-hover:scale-110"></div>
              <div className="inline-flex p-3 rounded-2xl mb-4 bg-uni-blue/10 text-uni-blue">
                <ListChecks size={24} strokeWidth={2.5} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Open Assigned</p>
              <p className="mt-1 text-4xl font-black text-slate-900">{data.assignedOpenTickets}</p>
            </CardContent>
          </Card>

          <Card glass className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 animate-slide-up animate-stagger-2 border-rose-100/50">
            <CardContent className="p-6">
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-rose-500/5 opacity-50 transition-transform group-hover:scale-110"></div>
              <div className="inline-flex p-3 rounded-2xl mb-4 bg-rose-50 text-rose-600">
                <AlertCircle size={24} strokeWidth={2.5} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">SLA Breached</p>
              <p className="mt-1 text-4xl font-black text-rose-600">{data.slaBreachedOpenTickets}</p>
            </CardContent>
          </Card>

          <Card glass className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 animate-slide-up animate-stagger-3 border-emerald-100/50">
            <CardContent className="p-6">
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-emerald-500/5 opacity-50 transition-transform group-hover:scale-110"></div>
              <div className="inline-flex p-3 rounded-2xl mb-4 bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={24} strokeWidth={2.5} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Healthy Queue</p>
              <p className="mt-1 text-4xl font-black text-emerald-600">
                {Math.max(0, data.assignedOpenTickets - data.slaBreachedOpenTickets)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="animate-slide-up animate-stagger-2 shadow-soft-xl overflow-hidden border-slate-100">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-lg">Assigned Tickets</CardTitle>
                    <CardDescription>Live tracking of your active technical task queue.</CardDescription>
                </div>
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <ListChecks size={20} />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr className="bg-slate-50/30">
                  <Th className="py-4 pl-8">Ticket Info</Th>
                  <Th className="py-4">Affected Asset</Th>
                  <Th className="py-4 text-center">Priority</Th>
                  <Th className="py-4">Current Status</Th>
                  <Th className="py-4 pr-8 text-right">SLA Target</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data?.tickets?.map((t) => (
                  <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                    <Td className="py-5 pl-8">
                      <Link to={`/tickets`} className="group/link flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover/link:text-uni-blue group-hover/link:bg-uni-blue/5 transition-all">
                           #{t.id}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover/link:text-uni-blue transition-colors flex items-center gap-1.5">
                            Details <ArrowUpRight size={14} className="opacity-0 group-hover/link:opacity-100 -translate-x-1 group-hover/link:translate-x-0 transition-all"/>
                          </p>
                        </div>
                      </Link>
                    </Td>
                    <Td className="py-5">
                      <div className="flex items-center gap-2">
                         <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400">
                           <MapPin size={14} />
                         </div>
                         <span className="font-semibold text-slate-700">{t.resourceName}</span>
                      </div>
                    </Td>
                    <Td className="py-5 text-center">
                       <span className={cn("text-[10px] font-black uppercase tracking-widest", getPriorityColor(t.priority))}>
                         {t.priority}
                       </span>
                    </Td>
                    <Td className="py-5">
                       <Badge tone={t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'success' : 'warning'}>
                         {t.status.replace('_', ' ')}
                       </Badge>
                    </Td>
                    <Td className="py-5 pr-8 text-right">
                      {t.slaBreached ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-widest">
                           <AlertCircle size={12} /> Breached
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                           <CheckCircle2 size={12} /> On Track
                        </div>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-white">
               <Loader2 className="animate-spin text-uni-blue" size={32} />
               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-4">Synchronizing Tasks...</p>
            </div>
          )}

          {(!data || data.tickets?.length === 0) && !loading && (
            <div className="text-center py-24 bg-white">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle2 className="text-emerald-400" size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">System Nominal</h3>
              <p className="text-slate-500 mt-2 font-medium">No open tickets assigned to your queue.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
