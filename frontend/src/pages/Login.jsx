import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Hash, 
  BookOpen, 
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { auth as authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../constants/studentProfile';
import { tokens } from '../theme/tokens';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { cn } from '../utils/cn';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function Login() {
  const { login, register, loginWithGoogle } = useAuth();
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
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const navigateAfterAuth = (data) => {
    if (data?.role === 'USER' && !data.studentIndexNumber && data.authProvider === 'GOOGLE') {
      navigate('/complete-profile', { replace: true });
      return;
    }
    navigate(from, { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setRegisterSuccess('');
    setLoading(true);
    try {
      if (mode === 'register') {
        const data = await register({
          email,
          password,
          fullName,
          studentIndexNumber: studentIndexNumber.trim(),
          academicYear: Number(academicYear),
          semester: Number(semester),
          department,
        });
        setRegisterSuccess(
          data?.message || 'Verification link sent! Check your email to activate your account.'
        );
        setMode('login');
        setPassword('');
        return;
      }
      const data = await login(email, password);
      navigateAfterAuth(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setError('');
    setRegisterSuccess('');
    setResendLoading(true);
    try {
      await authApi.resendVerification({ email, password });
      setRegisterSuccess('A new verification link has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not resend');
    } finally {
      setResendLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    const cred = credentialResponse.credential;
    if (!cred) return;
    setError('');
    if (mode === 'register') {
      if (!fullName.trim() || !studentIndexNumber.trim()) {
        setError('Please provide your full name and index number before signing up with Google.');
        return;
      }
    }
    setLoading(true);
    try {
      const data =
        mode === 'register'
          ? await loginWithGoogle({
              credential: cred,
              fullName: fullName.trim(),
              studentIndexNumber: studentIndexNumber.trim(),
              academicYear: Number(academicYear),
              semester: Number(semester),
              department,
            })
          : await loginWithGoogle({ credential: cred });
      navigateAfterAuth(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* Left Side: Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-uni-navy overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-uni-blue/20 to-transparent"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-uni-blue/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-uni-indigo/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        <Link to="/" className="relative z-10 flex items-center gap-3 group">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10 group-hover:scale-110 transition-transform">
            <LogIn className="text-white" size={24} />
          </div>
          <span className="text-xl font-display font-black text-white tracking-tighter uppercase">
            {tokens.brand.name}
          </span>
        </Link>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-5xl font-display font-black text-white leading-tight tracking-tighter animate-slide-up">
            Your Campus, <br />
            <span className="text-uni-blue">Intelligently</span> Managed.
          </h2>
          <p className="text-lg text-slate-400 font-medium leading-relaxed animate-slide-up animate-stagger-1">
            Access resources, manage bookings, and stay updated with your campus operations in one unified portal.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-8 animate-slide-up animate-stagger-2">
            {[
              { label: 'Resources', desc: 'Centralized access' },
              { label: 'Bookings', desc: 'Real-time scheduling' },
              { label: 'Support', desc: 'Ticketing system' },
              { label: 'Status', desc: 'Live operations' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-sm p-4 rounded-2xl">
                <p className="text-white font-bold text-sm">{item.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">
            &copy; 2024 University Operations Hub
          </p>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 animate-fade-in relative">
        <div className="absolute top-8 left-8 lg:hidden">
           <Link to="/" className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-uni-blue transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-slate-500 font-medium">
              {mode === 'login' 
                ? 'Sign in to access your dashboard' 
                : 'Join the campus operations hub today'}
            </p>
          </div>

          <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit mx-auto md:mx-0">
            <button
              onClick={() => { setMode('login'); setError(''); setRegisterSuccess(''); }}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                mode === 'login' ? "bg-white text-uni-blue shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LogIn size={16} /> Login
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setRegisterSuccess(''); }}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                mode === 'register' ? "bg-white text-uni-blue shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <UserPlus size={16} /> Register
            </button>
          </div>

          {registerSuccess && (
            <div className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-800 animate-slide-up">
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
              <p className="text-sm font-medium leading-relaxed">{registerSuccess}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5 animate-slide-up animate-stagger-1">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <Input
                    label="Index Number"
                    placeholder="IT2024001"
                    value={studentIndexNumber}
                    onChange={(e) => setStudentIndexNumber(e.target.value)}
                    required
                    maxLength={64}
                    hint="Official student ID"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Year</label>
                    <select
                      className="w-full rounded-2xl border border-slate-100 bg-white/50 px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      required
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Semester</label>
                    <select
                      className="w-full rounded-2xl border border-slate-100 bg-white/50 px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      required
                    >
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Department</label>
                  <select
                    className="w-full rounded-2xl border border-slate-100 bg-white/50 px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-uni-blue/10 focus:border-uni-blue outline-none transition-all"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="example@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {error && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-rose-100 bg-rose-50 text-rose-800 animate-fade-in">
                <AlertCircle size={16} />
                <p className="text-xs font-bold leading-none">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>

            {mode === 'login' && (
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                <p className="text-xs font-bold text-slate-800">Verification issues?</p>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                  If you didn't receive your activation link, check your spam or click below:
                </p>
                <button
                  type="button"
                  onClick={resendVerification}
                  disabled={resendLoading || !email.trim() || !password}
                  className="text-xs font-bold text-uni-blue hover:underline disabled:opacity-40 disabled:no-underline transition-all"
                >
                  {resendLoading ? 'Requesting...' : 'Resend link →'}
                </button>
              </div>
            )}
          </form>

          {googleClientId && (
            <div className="space-y-6 animate-slide-up animate-stagger-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]"><span className="bg-white px-4 text-slate-400">Social Sign In</span></div>
              </div>

              <div className="flex justify-center transition-opacity hover:opacity-90">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => setError('Google sign-in was cancelled or failed')}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text={mode === 'login' ? 'signin_with' : 'signup_with'}
                  shape="circle"
                  width="100%"
                />
              </div>
            </div>
          )}

          <div className="pt-4 text-center space-y-4 animate-slide-up animate-stagger-3">
            <p className="text-[10px] font-medium text-slate-400 italic">
              Demo: admin@campus.edu / admin123 • user@campus.edu / user123
            </p>
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-uni-blue transition-colors">
              <ArrowLeft size={14} /> Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
