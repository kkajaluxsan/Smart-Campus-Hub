import { useEffect, useState } from 'react';
import { 
  Wrench, 
  Plus, 
  AlertTriangle, 
  MessageSquare, 
  Image as ImageIcon, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  User,
  Send,
  Loader2,
  Paperclip,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { tickets, resources } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { downloadWithAuth } from '../utils/downloadWithAuth';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { cn } from '../utils/cn';

export default function TicketsPage() {
  const { user: currentUser } = useAuth();
  const [list, setList] = useState([]);
  const [resList, setResList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [newTicket, setNewTicket] = useState({
    resourceId: '',
    description: '',
    priority: 'MEDIUM',
  });
  const [commentText, setCommentText] = useState({});

  const load = async () => {
    setError('');
    try {
      const [{ data: t }, { data: r }] = await Promise.all([tickets.list(), resources.list({})]);
      setList(t);
      setResList(r);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      await tickets.create({
        resourceId: Number(newTicket.resourceId),
        description: newTicket.description,
        priority: newTicket.priority,
      });
      setNewTicket({ resourceId: '', description: '', priority: 'MEDIUM' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await tickets.update(id, { status });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const assignTech = async (id) => {
    const tid = window.prompt('Technician user id (e.g. from seeded tech user)');
    if (!tid) return;
    try {
      await tickets.assign(id, Number(tid));
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const addComment = async (ticketId) => {
    const text = commentText[ticketId];
    if (!text?.trim()) return;
    try {
      await tickets.addComment(ticketId, { content: text });
      setCommentText((c) => ({ ...c, [ticketId]: '' }));
      await load();
      setExpanded(ticketId);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const uploadFile = async (ticketId, file) => {
    if (!file) return;
    try {
      await tickets.uploadAttachment(ticketId, file);
      await load();
      setExpanded(ticketId);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const editComment = async (ticketId, comment) => {
    const next = window.prompt('Edit comment', comment.content);
    if (next == null) return;
    try {
      await tickets.updateComment(ticketId, comment.id, { content: next });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const deleteComment = async (ticketId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await tickets.deleteComment(ticketId, commentId);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return <Badge tone="success">{status}</Badge>;
      case 'OPEN':
        return <Badge tone="warning">{status}</Badge>;
      case 'REJECTED':
        return <Badge tone="danger">{status}</Badge>;
      default:
        return <Badge tone="info">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-rose-600 bg-rose-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <PageHeader
        title="Service Tickets"
        description="Report facility issues and track maintenance work across campus."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Tickets' }]}
      />

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* New Ticket Form */}
        <Card glass className="lg:col-span-1 animate-slide-up h-fit sticky top-24">
          <CardHeader>
            <div className="flex items-center gap-3 text-uni-blue mb-2">
              <div className="bg-uni-blue/10 p-2.5 rounded-xl">
                <Plus size={20} />
              </div>
              <CardTitle className="text-xl">New Ticket</CardTitle>
            </div>
            <CardDescription>Detail the issue for our technical team.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={createTicket} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Resource</label>
                <div className="relative">
                  <select
                    required
                    className="w-full rounded-2xl border border-slate-100 bg-white/50 px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all appearance-none"
                    value={newTicket.resourceId}
                    onChange={(e) => setNewTicket((t) => ({ ...t, resourceId: e.target.value }))}
                  >
                    <option value="">Select Resource...</option>
                    {resList.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                 <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Priority</label>
                 <div className="grid grid-cols-2 gap-2">
                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTicket((t) => ({ ...t, priority: p }))}
                        className={cn(
                          "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border",
                          newTicket.priority === p 
                            ? "bg-uni-blue border-uni-blue text-white shadow-md scale-105" 
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Issue Description</label>
                <textarea
                  required
                  placeholder="Describe what's wrong..."
                  className="min-h-[120px] w-full rounded-2xl border border-slate-100 bg-white/50 px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket((t) => ({ ...t, description: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Submit Report
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Tickets</h2>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              {list.length} Records Found
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
              <Loader2 className="animate-spin text-uni-blue" size={32} />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Tickets...</p>
            </div>
          )}

          {!loading && list.length === 0 && (
             <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle2 className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">System Nominal</h3>
              <p className="text-slate-500 mt-2 font-medium">No open service tickets reported.</p>
            </div>
          )}

          {list.map((t, i) => (
            <Card 
              key={t.id} 
              className={cn(
                "group overflow-hidden transition-all duration-500 animate-slide-up",
                expanded === t.id ? "ring-2 ring-uni-blue shadow-soft-2xl" : "hover:shadow-soft-lg"
              )}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 p-6 text-left"
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl transition-all group-hover:scale-110",
                    getPriorityColor(t.priority)
                  )}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-slate-400">#{t.id}</span>
                      {getStatusBadge(t.status)}
                      {t.slaBreached && (
                        <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-1">
                           <Clock size={10} /> SLA Breached
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 line-clamp-1">{t.resourceName}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Priority</p>
                    <p className={cn("text-xs font-bold", getPriorityColor(t.priority).split(' ')[0])}>{t.priority}</p>
                  </div>
                  <div className={cn(
                    "p-2 rounded-xl transition-all",
                    expanded === t.id ? "bg-uni-blue text-white shadow-lg" : "bg-slate-50 text-slate-400"
                  )}>
                    {expanded === t.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </button>

              {expanded === t.id && (
                <div className="border-t border-slate-100 bg-slate-50/30 p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <ImageIcon size={14} /> Incident Overview
                        </p>
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                           <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{t.description}</p>
                        </div>
                      </div>

                      {t.slaDueAt && (
                        <div className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border",
                          t.slaBreached ? "bg-rose-50 border-rose-100 text-rose-800" : "bg-blue-50 border-blue-100 text-blue-800"
                        )}>
                          <Clock size={18} />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Resolution Target</p>
                            <p className="font-bold">{new Date(t.slaDueAt).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                         {(currentUser?.role === 'ADMIN' || currentUser?.role === 'TECHNICIAN') && (
                          <div className="space-y-2">
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Management</p>
                             <div className="flex flex-wrap gap-2">
                                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => updateStatus(t.id, s)}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all hover:border-slate-300 active:scale-95"
                                  >
                                    {s.replace('_', ' ')}
                                  </button>
                                ))}
                             </div>
                             {currentUser?.role === 'ADMIN' && (
                               <Button 
                                variant="secondary" 
                                size="sm" 
                                className="w-full mt-2"
                                onClick={() => assignTech(t.id)}
                               >
                                Assign Technician
                               </Button>
                             )}
                          </div>
                         )}

                         <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Paperclip size={14} /> Attachments
                            </p>
                            <div className="space-y-3">
                               <input
                                  type="file"
                                  id={`file-${t.id}`}
                                  className="hidden"
                                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                                  onChange={(e) => uploadFile(t.id, e.target.files?.[0])}
                                />
                                <label 
                                  htmlFor={`file-${t.id}`}
                                  className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-uni-blue hover:text-uni-blue transition-all cursor-pointer bg-white/50"
                                >
                                  <Plus size={18} />
                                  <span className="text-xs font-bold uppercase tracking-widest">Add Evidence</span>
                                </label>
                                
                                <ul className="space-y-2">
                                  {(t.attachments || []).map((a) => (
                                    <li key={a.id}>
                                      <button
                                        onClick={() => downloadWithAuth(a.downloadUrl, a.originalFilename)}
                                        className="flex items-center justify-between w-full p-3 rounded-xl bg-white border border-slate-100 group/file hover:border-uni-blue transition-all"
                                      >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <ImageIcon className="text-slate-300 group-hover/file:text-uni-blue shrink-0" size={14} />
                                          <span className="text-xs font-bold text-slate-600 truncate">{a.originalFilename}</span>
                                        </div>
                                        <ExternalLink size={12} className="text-slate-300" />
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <MessageSquare size={14} /> Activity Feed
                    </p>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                      {(t.comments || []).map((c) => (
                        <div key={c.id} className="relative pl-6">
                           <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-100 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                           </div>
                           <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2 group/comment">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                   <User size={10} /> {c.userEmail}
                                </div>
                                {c.userId === currentUser?.userId && (
                                  <div className="flex gap-3 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                    <button onClick={() => editComment(t.id, c)} className="text-[10px] font-bold text-uni-blue hover:underline uppercase">Edit</button>
                                    <button onClick={() => deleteComment(t.id, c.id)} className="text-[10px] font-bold text-rose-500 hover:underline uppercase">Delete</button>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm font-medium text-slate-700 leading-relaxed">{c.content}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="relative flex items-center gap-2 bg-white rounded-[2rem] p-2 border border-slate-100 shadow-lg group-focus-within:ring-4 ring-uni-blue/10 transition-all">
                       <div className="bg-slate-50 p-2.5 rounded-full text-slate-400 ml-1">
                          <MessageSquare size={18} />
                       </div>
                       <input
                          className="flex-1 bg-transparent px-2 py-2 text-sm font-medium text-slate-900 focus:outline-none placeholder:text-slate-300"
                          placeholder="Type your message..."
                          value={commentText[t.id] || ''}
                          onChange={(e) => setCommentText((m) => ({ ...m, [t.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && addComment(t.id)}
                        />
                        <button
                          onClick={() => addComment(t.id)}
                          className="bg-uni-blue text-white p-2.5 rounded-full hover:bg-uni-indigo transition-all shadow-md active:scale-90"
                        >
                          <Send size={18} />
                        </button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-8 right-8 z-[100] animate-slide-up">
           <div className="bg-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <XCircle size={24} />
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-70">System Error</p>
                <p className="text-sm font-bold">{error}</p>
              </div>
              <button onClick={() => setError('')} className="ml-4 p-1 hover:bg-white/20 rounded-lg">
                <XCircle size={20} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
