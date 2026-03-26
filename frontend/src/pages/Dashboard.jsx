import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const cards = [
    {
      title: 'Resources',
      desc: 'Browse rooms, labs, auditoriums, and equipment.',
      to: '/resources',
      color: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30',
    },
    {
      title: 'Bookings',
      desc: 'Request time slots and pick auditorium seats.',
      to: '/bookings',
      color: 'from-sky-500/20 to-blue-600/10 border-sky-500/30',
    },
    {
      title: 'Tickets',
      desc: 'Report issues and track maintenance.',
      to: '/tickets',
      color: 'from-amber-500/20 to-orange-600/10 border-amber-500/30',
    },
    {
      title: 'Notifications',
      desc: 'Approvals, ticket updates, and comments.',
      to: '/notifications',
      color: 'from-violet-500/20 to-purple-600/10 border-violet-500/30',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">Welcome{user?.fullName ? `, ${user.fullName}` : ''}</h1>
      <p className="text-slate-400 mb-10">Choose an area to get started.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={`block rounded-2xl border bg-gradient-to-br p-6 hover:scale-[1.01] transition-transform ${c.color}`}
          >
            <h2 className="text-lg font-semibold text-white mb-2">{c.title}</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{c.desc}</p>
          </Link>
        ))}
      </div>
      {user?.role === 'ADMIN' && (
        <div className="mt-8 p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
          <h2 className="font-semibold text-white mb-2">Administration</h2>
          <p className="text-slate-400 text-sm mb-4">Manage campus resources and review audit logs.</p>
          <Link
            to="/admin/resources"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-white border border-slate-600"
          >
            Open admin console
          </Link>
        </div>
      )}
    </div>
  );
}
