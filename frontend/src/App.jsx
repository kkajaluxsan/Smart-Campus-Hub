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

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="resources" element={<Resources />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="auditorium/:resourceId" element={<AuditoriumPage />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="admin/resources" element={<AdminResources />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
