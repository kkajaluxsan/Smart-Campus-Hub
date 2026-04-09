import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokens } from '../theme/tokens';
import Button from '../components/ui/Button';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentIndexNumber, setStudentIndexNumber] = useState('');
  const [academicYear, setAcademicYear] = useState('1');
  const [semester, setSemester] = useState('1');
  const [department, setDepartment] = useState('IT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          fullName,
          studentIndexNumber: studentIndexNumber.trim(),
          academicYear: Number(academicYear),
          semester: Number(semester),
          department,
        });
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-100 via-white to-slate-100">
      <div className="border-b border-slate-200 bg-[#15233f] py-4 text-center">
        <p className="text-sm font-semibold tracking-wide text-white">{tokens.brand.tagline}</p>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-uni-gold text-lg font-bold text-[#15233f] shadow">
              {tokens.brand.short}
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">{tokens.brand.name}</h1>
            <p className="text-slate-600 text-sm mt-1">Sign in with your campus account</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-portal">
            <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
              <button
                type="button"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'login' ? 'bg-white text-uni-blue shadow-sm' : 'text-slate-600'
                }`}
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'register' ? 'bg-white text-uni-blue shadow-sm' : 'text-slate-600'
                }`}
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Full name</label>
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-uni-blue focus:outline-none focus:ring-2 focus:ring-uni-blue/20"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-uni-blue focus:outline-none focus:ring-2 focus:ring-uni-blue/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-uni-blue focus:outline-none focus:ring-2 focus:ring-uni-blue/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
              </Button>
            </form>
            <p className="mt-6 text-center text-slate-500 text-xs">
              Demo: admin@campus.edu / admin123 · user@campus.edu / user123
            </p>
          </div>
          <p className="text-center mt-6 text-slate-600 text-sm">
            <Link to="/" className="text-uni-blue no-underline hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
