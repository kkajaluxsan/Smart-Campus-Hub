import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { adminBookings, bookings } from '../api/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { Table, Th, Td } from '../components/ui/Table';
import { formatDepartment } from '../constants/studentProfile';
import { 
  Users, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  ListChecks,
  Loader2,
  Clock
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function AdminApprovals() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [resFilter, setResFilter] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await bookings.list();
      setList(data);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = useMemo(
    () => list.filter((b) => b.status === 'PENDING'),
    [list]
  );

  const filtered = useMemo(() => {
    if (!resFilter.trim()) return pending;
    return pending.filter((b) =>
      String(b.resourceName || '').toLowerCase().includes(resFilter.toLowerCase())
    );
  }, [pending, resFilter]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((b) => b.id)));
    }
  };

  const bulkApprove = async () => {
    if (selected.size === 0) return;
    setError('');
    setSuccessMsg('');
    try {
      await adminBookings.bulkApprove({ bookingIds: [...selected] });
      setSuccessMsg(`Successfully approved ${selected.size} booking(s).`);
      setSelected(new Set());
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const bulkReject = async () => {
    if (selected.size === 0) return;
    const reason = window.prompt('Reason (optional)') || '';
    setError('');
    setSuccessMsg('');
    try {
      await adminBookings.bulkReject({ bookingIds: [...selected], reason: reason || null });
      setSuccessMsg(`Successfully rejected ${selected.size} booking(s).`);
      setSelected(new Set());
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader
        title="Booking Approvals"
        description="Review pending reservations and systematically approve or reject them."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Approvals' }]}
      />

      <Card className="hover:shadow-md transition-shadow animate-slide-up">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row items-end gap-4 lg:gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
            <div className="w-full lg:w-72">
              <div className="relative group">
                <Input
                  label="Filter by Resource"
                  value={resFilter}
                  onChange={(e) => setResFilter(e.target.value)}
                  placeholder="e.g. Auditorium..."
                  className="pl-10 h-10"
                />
                <Filter className="absolute left-3.5 top-[38px] text-slate-400 group-focus-within:text-uni-blue transition-colors pointer-events-none" size={16} />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full lg:w-auto gap-3 flex-1 lg:justify-end mt-4 lg:mt-0 pt-0">
               <Button type="button" variant="secondary" onClick={toggleAll} disabled={filtered.length === 0} className="h-10">
                 {selected.size === filtered.length && filtered.length > 0 ? 'Clear Selection' : 'Select All Visible'}
               </Button>
               <Button 
                type="button" 
                variant="primary" 
                onClick={bulkApprove} 
                disabled={selected.size === 0}
                className="h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 border-none shadow-emerald-500/25"
               >
                 <CheckCircle2 size={18} />
                 Approve Selected ({selected.size})
               </Button>
               <Button 
                type="button" 
                variant="danger" 
                onClick={bulkReject} 
                disabled={selected.size === 0}
                className="h-10"
               >
                 <XCircle size={18} />
                 Reject Selected
               </Button>
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
            {loading ? (
               <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-slate-50/30">
                  <Loader2 className="animate-spin text-uni-blue" size={32} />
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Compiling Pending Requests...</p>
               </div>
            ) : filtered.length === 0 ? (
               <div className="text-center py-20 bg-slate-50/50">
                 <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <ListChecks className="text-slate-300" size={32} strokeWidth={1.5} />
                 </div>
                 <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">All Caught Up</h3>
                 <p className="text-slate-500 mt-2 font-medium">No pending bookings matching your filter.</p>
               </div>
            ) : (
                <Table>
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <Th className="w-12 text-center py-4">
                        <input
                          type="checkbox"
                          checked={selected.size === filtered.length && filtered.length > 0}
                          onChange={toggleAll}
                          className="h-4 w-4 rounded-md border-slate-300 text-uni-blue focus:ring-uni-blue/30 cursor-pointer"
                        />
                      </Th>
                      <Th className="py-4">Resource</Th>
                      <Th className="py-4">Requester Details</Th>
                      <Th className="py-4">Schedule</Th>
                      <Th className="py-4">Status</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((b) => (
                      <tr key={b.id} className={cn("hover:bg-slate-50/50 transition-colors", selected.has(b.id) ? "bg-blue-50/20" : "")}>
                        <Td className="text-center py-4">
                          <input
                            type="checkbox"
                            checked={selected.has(b.id)}
                            onChange={() => toggle(b.id)}
                            className="h-4 w-4 rounded-md border-slate-300 text-uni-blue focus:ring-uni-blue/30 cursor-pointer"
                          />
                        </Td>
                        <Td className="py-4">
                          <div className="flex items-center gap-3">
                             <div className={cn("p-2 rounded-lg", selected.has(b.id) ? "bg-uni-blue/10" : "bg-slate-100")}>
                                <MapPin size={16} className={cn(selected.has(b.id) ? "text-uni-blue" : "text-slate-400")} />
                             </div>
                             <span className="font-bold text-slate-900">{b.resourceName}</span>
                          </div>
                        </Td>
                        <Td className="py-4">
                          <div className="flex items-start gap-2 text-slate-800 font-semibold mb-1 w-full max-w-xs break-all">
                             <Users size={14} className="mt-1 text-slate-400 shrink-0" />
                             <span className="truncate">{b.userEmail}</span>
                          </div>
                          {(b.requesterStudentIndexNumber || b.requesterDepartment) && (
                            <div className="ml-5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md inline-flex">
                              {[b.requesterStudentIndexNumber, b.requesterDepartment && formatDepartment(b.requesterDepartment)]
                                .filter(Boolean)
                                .join(' · ')}
                            </div>
                          )}
                        </Td>
                        <Td className="py-4">
                          <div className="flex flex-col gap-1 text-xs font-semibold text-slate-600 bg-slate-50/50 p-2 rounded-xl border border-slate-100 w-fit">
                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400"/> {b.startTime}</span>
                            <span className="text-slate-400 pl-[18px]">→ {b.endTime}</span>
                          </div>
                        </Td>
                        <Td className="py-4">
                          <Badge tone="warning" className="shadow-sm">{b.status}</Badge>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {(error || successMsg) && (
        <div className="fixed bottom-8 right-8 z-[100] animate-slide-up max-w-sm">
           <div className={cn(
             "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 relative overflow-hidden",
             error ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
           )}>
              {error ? <XCircle size={24} /> : <CheckCircle2 size={24} />}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                  {error ? 'Action Failed' : 'Action Success'}
                </p>
                <p className="text-sm font-bold mt-0.5">{error || successMsg}</p>
              </div>
              <button 
                onClick={() => { setError(''); setSuccessMsg(''); }} 
                className="ml-auto p-1.5 hover:bg-white/20 rounded-xl transition-colors"
              >
                <XCircle size={18} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
