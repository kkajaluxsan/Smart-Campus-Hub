import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Resources = lazy(() => import('./pages/Resources'));
const Bookings = lazy(() => import('./pages/Bookings'));
const AuditoriumPage = lazy(() => import('./pages/AuditoriumPage'));
const Tickets = lazy(() => import('./pages/Tickets'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AdminResources = lazy(() => import('./pages/AdminResources'));
const BookingCalendar = lazy(() => import('./pages/BookingCalendar'));
const AdminApprovals = lazy(() => import('./pages/AdminApprovals'));
const ResourceSchedule = lazy(() => import('./pages/ResourceSchedule'));
const TechWorkload = lazy(() => import('./pages/TechWorkload'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));

function PageLoader() {
  return <div className="p-6 text-sm text-slate-600">Loading page...</div>;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="resources" element={<Resources />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/calendar" element={<BookingCalendar />} />
          <Route path="admin/approvals" element={<AdminApprovals />} />
          <Route path="resources/:id/schedule" element={<ResourceSchedule />} />
          <Route path="tech/workload" element={<TechWorkload />} />
          <Route path="auditorium/:resourceId" element={<AuditoriumPage />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="admin/resources" element={<AdminResources />} />
          <Route path="complete-profile" element={<CompleteProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
