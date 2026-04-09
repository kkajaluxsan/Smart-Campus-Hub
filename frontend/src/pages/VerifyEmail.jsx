import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auth } from '../api/api';
import { tokens } from '../theme/tokens';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token. Open the link from your email.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await auth.verifyEmail(token);
        if (!cancelled) {
          setStatus('ok');
          setMessage(data.message || 'Email verified.');
        }
      } catch (e) {
        if (!cancelled) {
          setStatus('error');
          setMessage(e.response?.data?.message || e.message || 'Verification failed');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-100 via-white to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-portal">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-uni-gold text-lg font-bold text-[#15233f] shadow">
          {tokens.brand.short}
        </div>
        <h1 className="font-display text-xl font-bold text-slate-900">Email verification</h1>
        {status === 'loading' && <p className="mt-4 text-slate-600">Confirming your email…</p>}
        {status !== 'loading' && (
          <p className={`mt-4 text-sm ${status === 'ok' ? 'text-emerald-800' : 'text-red-800'}`}>{message}</p>
        )}
        <Link
          to="/login"
          className="mt-6 inline-block text-sm font-medium text-uni-blue no-underline hover:underline"
        >
          Go to sign in →
        </Link>
      </div>
    </div>
  );
}
