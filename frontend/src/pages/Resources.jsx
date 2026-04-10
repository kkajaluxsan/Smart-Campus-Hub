import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resources } from '../api/api';
import { 
  Search, 
  MapPin, 
  Users, 
  Settings, 
  Calendar, 
  LayoutGrid,
  Loader2,
  XCircle,
  Filter
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { cn } from '../utils/cn';

export default function Resources() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    minCapacity: '',
    maxCapacity: '',
    location: '',
    q: '',
    sortBy: 'name',
    sortDir: 'asc',
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.minCapacity) params.minCapacity = Number(filters.minCapacity);
      if (filters.maxCapacity) params.maxCapacity = Number(filters.maxCapacity);
      if (filters.location) params.location = filters.location;
      if (filters.q) params.q = filters.q;
      params.sortBy = filters.sortBy;
      params.sortDir = filters.sortDir;
      const { data } = await resources.list(params);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE': return <Badge tone="success">{status}</Badge>;
      case 'MAINTENANCE': return <Badge tone="warning">{status}</Badge>;
      case 'UNAVAILABLE': return <Badge tone="danger">{status}</Badge>;
      default: return <Badge tone="default">{status}</Badge>;
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'ROOM': return <LayoutGrid size={20} />;
      case 'LAB': return <Settings size={20} />;
      case 'AUDITORIUM': return <Users size={20} />;
      case 'EQUIPMENT': return <Settings size={20} />;
      default: return <LayoutGrid size={20} />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader
        title="Campus Resources"
        description="Search and discover rooms, labs, auditoriums, and equipment available for booking."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Resources' }]}
      />

      <Card glass className="animate-slide-up">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-end gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 flex-1 w-full">
              <Input
                label="Keyword"
                placeholder="Name or location"
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              />

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Type</label>
                <div className="relative group">
                  <select
                    className="w-full h-[46px] rounded-2xl border border-slate-100 bg-white/50 px-4 py-2 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all appearance-none hover:bg-white"
                    value={filters.type}
                    onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                  >
                    <option value="">Any Type</option>
                    <option value="ROOM">Room</option>
                    <option value="LAB">Lab</option>
                    <option value="AUDITORIUM">Auditorium</option>
                    <option value="EQUIPMENT">Equipment</option>
                  </select>
                  <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-uni-blue transition-colors" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Status</label>
                <div className="relative group">
                  <select
                    className="w-full h-[46px] rounded-2xl border border-slate-100 bg-white/50 px-4 py-2 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all appearance-none hover:bg-white"
                    value={filters.status}
                    onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="">Any Status</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                  <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-uni-blue transition-colors" size={16} />
                </div>
              </div>

              <Input
                label="Min Capacity"
                type="number"
                min="0"
                placeholder="0"
                value={filters.minCapacity}
                onChange={(e) => setFilters((f) => ({ ...f, minCapacity: e.target.value }))}
              />

              <Input
                label="Max Capacity"
                type="number"
                min="0"
                placeholder="0"
                value={filters.maxCapacity}
                onChange={(e) => setFilters((f) => ({ ...f, maxCapacity: e.target.value }))}
              />

              <div className="relative group">
                <Input
                  label="Location"
                  placeholder="Building or Floor..."
                  value={filters.location}
                  onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
                  className="pl-10"
                />
                <MapPin className="absolute left-3.5 top-[38px] text-slate-300 group-focus-within:text-uni-blue transition-colors pointer-events-none" size={16} />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Sort By</label>
                <select
                  className="w-full h-[46px] rounded-2xl border border-slate-100 bg-white/50 px-4 py-2 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all"
                  value={filters.sortBy}
                  onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
                >
                  <option value="name">Name</option>
                  <option value="capacity">Capacity</option>
                  <option value="location">Location</option>
                  <option value="type">Type</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Direction</label>
                <select
                  className="w-full h-[46px] rounded-2xl border border-slate-100 bg-white/50 px-4 py-2 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all"
                  value={filters.sortDir}
                  onChange={(e) => setFilters((f) => ({ ...f, sortDir: e.target.value }))}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <Button
                type="button"
                onClick={load}
                className="h-[46px] min-w-[120px] w-full lg:w-auto"
              >
                <Search size={18} />
                Search
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setFilters({
                    type: '',
                    status: '',
                    minCapacity: '',
                    maxCapacity: '',
                    location: '',
                    q: '',
                    sortBy: 'name',
                    sortDir: 'asc',
                  });
                }}
                className="h-[46px] min-w-[120px] w-full lg:w-auto"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
          <Loader2 className="animate-spin text-uni-blue" size={32} />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Finding Resources...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-rose-100 bg-rose-50 text-rose-800 animate-slide-up">
          <XCircle size={18} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {!loading && list.length === 0 && (
        <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Search className="text-slate-300" size={32} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">No results found</h3>
          <p className="text-slate-500 mt-2 font-medium">Try adjusting your filters to find more resources.</p>
        </div>
      )}

      <div className="grid gap-4">
        {list.map((r, i) => (
          <Card 
            key={r.id} 
            className="group overflow-hidden transition-all duration-500 animate-slide-up hover:shadow-soft-lg"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl transition-all group-hover:scale-110",
                    r.status === 'AVAILABLE' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {getResourceIcon(r.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-none mb-2">{r.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1.5 opacity-70">
                        <Badge tone="default" className="text-[10px] py-0 px-1.5 uppercase font-black">{r.type}</Badge>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-300" />
                        {r.location}
                      </span>
                      {r.capacity != null && (
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="text-slate-300" />
                          Capacity: {r.capacity}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        {getStatusBadge(r.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link to={`/resources/${r.id}/schedule`}>
                    <Button variant="secondary" size="sm">
                       <Calendar size={14} /> Schedule
                    </Button>
                  </Link>

                  {r.type === 'AUDITORIUM' && (
                    <Link to={`/auditorium/${r.id}`} state={{ resourceName: r.name }}>
                      <Button variant="outline" size="sm" className="border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300">
                        Seat Map
                      </Button>
                    </Link>
                  )}

                  <Link to="/bookings" state={{ preselectResourceId: r.id }}>
                    <Button variant="primary" size="sm">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
