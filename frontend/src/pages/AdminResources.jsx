import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { resources, audit } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Trash2, 
  History, 
  Settings, 
  MapPin, 
  Users, 
  ShieldCheck,
  Loader2,
  XCircle,
  AlertTriangle,
  LayoutGrid
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Table, Th, Td } from '../components/ui/Table';
import { cn } from '../utils/cn';

export default function AdminResourcesPage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    type: 'ROOM',
    capacity: '',
    location: '',
    status: 'AVAILABLE',
  });
  const [formErrors, setFormErrors] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: r }, { data: a }] = await Promise.all([
        resources.list({}),
        audit.list(),
      ]);
      setList(r);
      setLogs(a);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    load();
  }, [user, load]);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Resource name is required.';
    if (form.capacity && Number(form.capacity) < 0) {
      errs.capacity = 'Capacity cannot be negative.';
    }
    if (!form.location.trim()) errs.location = 'Location is required.';
    
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!validateForm()) return;

    try {
      await resources.create({
        name: form.name,
        type: form.type,
        capacity: form.capacity ? Number(form.capacity) : null,
        location: form.location,
        status: form.status,
      });
      setSuccessMsg('Resource created successfully.');
      setForm({
        name: '',
        type: 'ROOM',
        capacity: '',
        location: '',
        status: 'AVAILABLE',
      });
      setFormErrors({});
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) return;
    try {
      await resources.remove(id);
      setSuccessMsg('Resource deleted successfully.');
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <PageHeader
        title="Resource Management"
        description="Create campus resources, manage inventory, and monitor access history."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Admin Resources' }]}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Creation Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card glass className="animate-slide-up h-fit sticky top-24">
            <CardHeader>
              <div className="flex items-center gap-3 text-uni-blue mb-2">
                <div className="bg-uni-blue/10 p-2.5 rounded-xl">
                  <Plus size={20} />
                </div>
                <CardTitle className="text-xl">Create Resource</CardTitle>
              </div>
              <CardDescription>Add new assets to the university database.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={submit} className="space-y-5">
                <Input
                  label="Resource Name"
                  placeholder="e.g. Lab 402"
                  required
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    setFormErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  error={formErrors.name}
                />

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Type</label>
                  <div className="relative group">
                    <select
                      className="w-full rounded-2xl border border-slate-100 bg-white/50 px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all appearance-none hover:bg-white"
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    >
                      <option value="ROOM">ROOM</option>
                      <option value="LAB">LAB</option>
                      <option value="AUDITORIUM">AUDITORIUM</option>
                      <option value="EQUIPMENT">EQUIPMENT</option>
                    </select>
                    <LayoutGrid className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-uni-blue transition-colors" size={16} />
                  </div>
                </div>

                <Input
                  label="Capacity (Optional)"
                  type="number"
                  placeholder="e.g. 30"
                  value={form.capacity}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, capacity: e.target.value }));
                    setFormErrors((prev) => ({ ...prev, capacity: undefined }));
                  }}
                  error={formErrors.capacity}
                />

                <div className="relative group">
                  <Input
                    label="Location"
                    placeholder="e.g. Floor 2, Block B"
                    required
                    value={form.location}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, location: e.target.value }));
                      setFormErrors((prev) => ({ ...prev, location: undefined }));
                    }}
                    className="pl-10"
                    error={formErrors.location}
                  />
                  <MapPin className="absolute left-3.5 top-[38px] text-slate-300 group-focus-within:text-uni-blue transition-colors pointer-events-none" size={16} />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Initial Status</label>
                  <div className="relative group">
                    <select
                      className="w-full rounded-2xl border border-slate-100 bg-white/50 px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all appearance-none hover:bg-white"
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="UNAVAILABLE">UNAVAILABLE</option>
                    </select>
                    <Settings className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-uni-blue transition-colors" size={16} />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Register Resource
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Inventory & Audit */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <LayoutGrid size={20} className="text-uni-blue" />
                Active Inventory
              </h2>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                {list.length} Items
              </div>
            </div>

            {loading && list.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                <Loader2 className="animate-spin text-uni-blue" size={32} />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Scanning inventory...</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {list.map((r, i) => (
                  <Card key={r.id} className="group hover:shadow-soft-lg transition-all animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                           <ShieldCheck className="text-slate-400 group-hover:text-uni-blue transition-colors" size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none mb-1">{r.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {r.type} • {r.location}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(r.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete resource"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <History size={20} className="text-uni-blue" />
                Security Audit Log
              </h2>
            </div>
            
            <Card className="overflow-hidden animate-slide-up shadow-soft-xl">
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <thead>
                    <tr className="bg-slate-50 sticky top-0 z-10">
                      <Th className="py-4">Timestamp</Th>
                      <Th className="py-4">Responsible User</Th>
                      <Th className="py-4">Operation</Th>
                      <Th className="py-4">Transaction Details</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                        <Td className="py-4 text-xs font-bold text-slate-400">
                          {new Date(l.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </Td>
                        <Td className="py-4">
                          <div className="flex items-center gap-2 font-semibold text-slate-700">
                             <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px]">
                                {l.userEmail?.substring(0, 2).toUpperCase() || '??'}
                             </div>
                             {l.userEmail || '—'}
                          </div>
                        </Td>
                        <Td className="py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                            l.action.includes('CREATE') ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            l.action.includes('REJECT') || l.action.includes('DELETE') ? "bg-rose-50 text-rose-600 border-rose-100" :
                            "bg-blue-50 text-blue-600 border-blue-100"
                          )}>
                            {l.action}
                          </span>
                        </Td>
                        <Td className="py-4 text-xs font-medium text-slate-500 max-w-xs truncate">
                          {l.details || '—'}
                        </Td>
                      </tr>
                    ))}
                    {logs.length === 0 && !loading && (
                      <tr>
                        <Td colSpan={4} className="py-12 text-center">
                           <AlertTriangle className="mx-auto text-slate-200 mb-2" size={32} />
                           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No audit data available</p>
                        </Td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card>
          </section>
        </div>
      </div>

      {(error || successMsg) && (
        <div className="fixed bottom-8 right-8 z-[100] animate-slide-up max-w-sm">
           <div className={cn(
             "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 relative overflow-hidden",
             error ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
           )}>
              {error ? <XCircle size={24} /> : <ShieldCheck size={24} />}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                  {error ? 'System Alert' : 'Administrator Action'}
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
