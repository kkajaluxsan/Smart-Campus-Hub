import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDepartment, formatYearSemester } from '../constants/studentProfile';
import { tokens } from '../theme/tokens';

const navLink =
  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 no-underline';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const linkClass = ({ isActive }) =>
    `${navLink} ${
      isActive
        ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 pl-2 shadow-sm'
        : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent pl-2'
    }`;

  const sidebar = (
    <>
      <div className="border-b border-white/5 px-4 py-5">
        <Link to="/" className="flex items-center gap-3 no-underline group" onClick={closeMobile}>
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl lg:flex">{sidebar}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-label="Close menu" onClick={closeMobile} />
          <div className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl">{sidebar}</div>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200/50 bg-white/80 backdrop-blur-md shadow-portal transition-all">
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
            <div className="min-w-0 max-w-[55vw] text-right text-xs text-slate-600 sm:max-w-none sm:text-sm">
              <span className="font-medium text-slate-900">{user?.fullName}</span>
              <span className="text-slate-400"> · </span>
              <span className="text-slate-500">{user?.role}</span>
              {user?.role === 'USER' &&
                (user?.studentIndexNumber ||
                  user?.department ||
                  (user?.academicYear != null && user?.semester != null)) && (
                  <span className="mt-0.5 block truncate text-slate-500" title={[
                    user.studentIndexNumber,
                    formatYearSemester(user.academicYear, user.semester),
                    formatDepartment(user.department),
                  ]
                    .filter(Boolean)
                    .join(' · ')}>
                    {[
                      user.studentIndexNumber,
                      formatYearSemester(user.academicYear, user.semester),
                      formatDepartment(user.department),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                )}
            </div>
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
