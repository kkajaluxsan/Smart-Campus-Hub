import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white hover:bg-white/5'
  }`;

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-white tracking-tight">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400 text-slate-950 flex items-center justify-center text-xs font-bold">
              SC
            </span>
            Smart Campus Hub
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" className={linkClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/resources" className={linkClass}>
              Resources
            </NavLink>
            <NavLink to="/bookings" className={linkClass}>
              Bookings
            </NavLink>
            <NavLink to="/tickets" className={linkClass}>
              Tickets
            </NavLink>
            <NavLink to="/notifications" className={linkClass}>
              Notifications
            </NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin/resources" className={linkClass}>
                Admin
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 hidden sm:inline">
              {user?.fullName} · <span className="text-slate-400">{user?.role}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>
      <footer className="border-t border-slate-800/80 py-6 text-center text-slate-600 text-sm">
        Smart Campus Operations Hub · Local campus resource management
      </footer>
    </div>
  );
}
