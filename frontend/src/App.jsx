import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Bookings from './pages/Bookings';
import AuditoriumPage from './pages/AuditoriumPage';
import Tickets from './pages/Tickets';
import Notifications from './pages/Notifications';
import AdminResources from './pages/AdminResources';
import BookingCalendar from './pages/BookingCalendar';
import AdminApprovals from './pages/AdminApprovals';
import ResourceSchedule from './pages/ResourceSchedule';
import TechWorkload from './pages/TechWorkload';
import CompleteProfile from './pages/CompleteProfile';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  const { isAuthenticated } = useAuth();

  return (
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
  );
}

export default App;
