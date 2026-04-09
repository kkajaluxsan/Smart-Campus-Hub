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

export default function AdminApprovals() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [resFilter, setResFilter] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState('');
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
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((b) => b.id)));
    }
  };

  const bulkApprove = async () => {
    if (selected.size === 0) return;
    setError('');
    try {
      await adminBookings.bulkApprove({ bookingIds: [...selected] });
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
    try {
      await adminBookings.bulkReject({ bookingIds: [...selected], reason: reason || null });
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
    <div>
      <PageHeader
        title="Booking approvals"
        description="Review pending bookings and approve or reject in bulk."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Approvals' }]}
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <Input
                label="Filter by resource name"
                value={resFilter}
                onChange={(e) => setResFilter(e.target.value)}
                placeholder="e.g. Auditorium"
              />
            </div>
            <Button type="button" variant="secondary" onClick={toggleAll}>
              {selected.size === filtered.length ? 'Clear selection' : 'Select all visible'}
            </Button>
            <Button type="button" onClick={bulkApprove} disabled={selected.size === 0}>
              Approve selected ({selected.size})
            </Button>
            <Button type="button" variant="danger" onClick={bulkReject} disabled={selected.size === 0}>
              Reject selected
            </Button>
          </div>

          {loading && <p className="text-slate-500">Loading…</p>}

          <Table>
            <thead>
              <tr>
                <Th className="w-10"></Th>
                <Th>Resource</Th>
                <Th>Requester</Th>
                <Th>When</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <Td>
                    <input
                      type="checkbox"
                      checked={selected.has(b.id)}
                      onChange={() => toggle(b.id)}
                      className="rounded border-slate-300"
                    />
                  </Td>
                  <Td className="font-medium text-slate-900">{b.resourceName}</Td>
                  <Td className="text-slate-600">
                    <div className="font-medium text-slate-800">{b.userEmail}</div>
                    {(b.requesterStudentIndexNumber || b.requesterDepartment) && (
                      <div className="mt-0.5 text-xs text-slate-500">
                        {[b.requesterStudentIndexNumber, b.requesterDepartment && formatDepartment(b.requesterDepartment)]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    )}
                  </Td>
                  <Td className="text-slate-600 text-xs">
                    {b.startTime} → {b.endTime}
                  </Td>
                  <Td>
                    <Badge tone="warning">{b.status}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filtered.length === 0 && !loading && (
            <p className="text-center text-slate-500 py-8">No pending bookings match this filter.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
