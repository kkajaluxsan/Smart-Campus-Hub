import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDepartment, formatYearSemester } from '../constants/studentProfile';
import { tokens } from '../theme/tokens';

const navLink =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors no-underline';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const linkClass = ({ isActive }) =>
    `${navLink} ${
      isActive
        ? 'bg-white/10 text-white border-l-4 border-uni-gold pl-2'
        : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent pl-2'
    }`;

  const sidebar = (
    <>
      <div className="border-b border-[#1e3558] px-4 py-5">
        <Link to="/" className="flex items-center gap-3 no-underline" onClick={closeMobile}>
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-uni-gold text-sm font-bold text-[#15233f] shadow">
            {tokens.brand.short}
          </span>
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold leading-tight text-white">{tokens.brand.name}</div>
            <div className="truncate text-xs text-slate-400">{tokens.brand.tagline}</div>
          </div>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" onClick={closeMobile}>
        <SidebarNav linkClass={linkClass} user={user} />
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#15233f] shadow-lg lg:flex">{sidebar}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/50" aria-label="Close menu" onClick={closeMobile} />
          <div className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-[#15233f] shadow-xl">{sidebar}</div>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-portal">
          <div className="flex h-14 items-center justify-between gap-3 px-4">
            <button
              type="button"
              className="inline-flex rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-expanded={mobileOpen}
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">Signed in to campus portal</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden text-slate-600 sm:inline">
                <span className="font-medium text-slate-900">{user?.fullName}</span>
                <span className="text-slate-400"> · </span>
                <span className="text-slate-500">{user?.role}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950">
          <strong className="font-semibold">Campus notice:</strong> Use this portal for room bookings and maintenance
          requests. For emergencies, contact campus security.
        </div>

        <main className="flex-1 px-4 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>

        <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
          <p>
            {tokens.brand.tagline} ·{' '}
            <span className="text-slate-400">Accessibility</span>
            {' · '}
            <span className="text-slate-400">Privacy</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

function SidebarNav({ linkClass, user }) {
  return (
    <>
      <NavLink to="/" className={linkClass} end>
        Dashboard
      </NavLink>
      <NavLink to="/resources" className={linkClass}>
        Resources
      </NavLink>
      <NavLink to="/bookings" className={linkClass}>
        Bookings
      </NavLink>
      <NavLink to="/bookings/calendar" className={linkClass}>
        Booking calendar
      </NavLink>
      <NavLink to="/tickets" className={linkClass}>
        Service tickets
      </NavLink>
      <NavLink to="/notifications" className={linkClass}>
        Notifications
      </NavLink>
      {user?.role === 'ADMIN' && (
        <>
          <p className="mt-5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Administration</p>
          <NavLink to="/admin/resources" className={linkClass}>
            Manage resources
          </NavLink>
          <NavLink to="/admin/approvals" className={linkClass}>
            Booking approvals
          </NavLink>
        </>
      )}
      {user?.role === 'TECHNICIAN' && (
        <>
          <p className="mt-5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Technician</p>
          <NavLink to="/tech/workload" className={linkClass}>
            Workload
          </NavLink>
        </>
      )}
    </>
  );
}
