import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { tech } from '../api/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Table, Th, Td } from '../components/ui/Table';

export default function TechWorkload() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError('');
      try {
        const { data: d } = await tech.workload();
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (user?.role !== 'TECHNICIAN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <PageHeader
        title="Technician workload"
        description="Open tickets assigned to you and SLA status."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Workload' }]}
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

      {data && (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase text-slate-500">Open assigned</p>
              <p className="text-3xl font-bold text-slate-900">{data.assignedOpenTickets}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase text-slate-500">SLA breached (open)</p>
              <p className="text-3xl font-bold text-red-700">{data.slaBreachedOpenTickets}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Resource</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th>SLA</Th>
              </tr>
            </thead>
            <tbody>
              {data?.tickets?.map((t) => (
                <tr key={t.id}>
                  <Td>
                    <Link to={`/tickets`} className="font-medium text-uni-blue">
                      #{t.id}
                    </Link>
                  </Td>
                  <Td>{t.resourceName}</Td>
                  <Td>{t.priority}</Td>
                  <Td>{t.status}</Td>
                  <Td>
                    {t.slaBreached ? (
                      <Badge tone="danger">Breached</Badge>
                    ) : (
                      <Badge tone="success">On track</Badge>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {data?.tickets?.length === 0 && <p className="py-8 text-center text-slate-500">No open assigned tickets.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
