import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { type ReactNode, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CatalogPage } from '@/pages/CatalogPage';
import { ItemDetailPage } from '@/pages/ItemDetailPage';
import { MyReservationsPage } from '@/pages/MyReservationsPage';
import { CreateItemPage } from '@/pages/CreateItemPage';
import { LibrarianReservationsPage } from '@/pages/LibrarianReservationsPage';
import { AdminPage } from '@/pages/AdminPage';
import type { Role } from '@/types';


function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasRole(...roles)) {
    return <Navigate to="/catalog" replace />;
  }

  return <Layout>{children}</Layout>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/catalog" replace />;
  }
  return <>{children}</>;
}

function SessionGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;
    const checkToken = () => {
      const token = localStorage.getItem('athenaeum_token');
      if (!token && mounted) {
        logout();
      }
    };

    checkToken();

    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('auth:expired', handleAuthExpired);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkToken();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [isAuthenticated, logout]);

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/catalog"
        element={
          <ProtectedRoute>
            <CatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/catalog/:id"
        element={
          <ProtectedRoute>
            <ItemDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations"
        element={
          <ProtectedRoute roles={['BORROWER']}>
            <MyReservationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/librarian/items/new"
        element={
          <ProtectedRoute roles={['LIBRARIAN']}>
            <CreateItemPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/librarian/reservations"
        element={
          <ProtectedRoute roles={['LIBRARIAN']}>
            <LibrarianReservationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/catalog" replace />} />
      <Route path="*" element={<Navigate to="/catalog" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionGuard>
          <AppRoutes />
        </SessionGuard>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
