import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import TechDashboard from './pages/TechDashboard';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const { user, profile } = useAuth();

  if (!user) return <Auth />;

  if (profile?.role === 'TECHNICIAN') {
    return <TechDashboard />;
  }

  if (profile?.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  return <StudentDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}