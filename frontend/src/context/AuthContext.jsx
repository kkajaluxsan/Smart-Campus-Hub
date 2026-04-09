import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth as authApi } from '../api/api';

const AuthContext = createContext(null);

function mapUserFromApi(data) {
  if (!data) return null;
  return {
    userId: data.userId,
    email: data.email,
    fullName: data.fullName,
    role: data.role,
    studentIndexNumber: data.studentIndexNumber ?? null,
    academicYear: data.academicYear ?? null,
    semester: data.semester ?? null,
    department: data.department ?? null,
    authProvider: data.authProvider ?? 'LOCAL',
    emailVerified: data.emailVerified === true,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  /** Refresh profile from server (index, year, semester, department) */
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await authApi.me();
        if (!cancelled) setUser(mapUserFromApi(data));
      } catch {
        /* session invalid or offline */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    setToken(data.token);
    setUser(mapUserFromApi(data));
    return data;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    return data;
  };

  const loginWithGoogle = async (payload) => {
    const body = typeof payload === 'string' ? { credential: payload } : payload;
    const { data } = await authApi.google(body);
    setToken(data.token);
    setUser(mapUserFromApi(data));
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await authApi.updateProfile(payload);
    setUser(mapUserFromApi(data));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      register,
      loginWithGoogle,
      updateProfile,
      logout,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
