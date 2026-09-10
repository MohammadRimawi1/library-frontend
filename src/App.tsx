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
import { AdminUsersPage } from '@/pages/AdminUsersPage';
import { DeleteUserPage } from '@/pages/DeleteUserPage';
import type { Role } from '@/types';

function homePathFor(role: Role | undefined): string {
  if (role === 'ADMIN') return '/admin';
  return '/catalog';
}

function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  const { isAuthenticated, hasRole, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasRole(...roles)) {
    return <Navigate to={homePathFor(user?.role)} replace />;
  }

  return <Layout>{children}</Layout>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={homePathFor(user?.role)} replace />;
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

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={homePathFor(user?.role)} replace />;
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
          <ProtectedRoute roles={['BORROWER', 'LIBRARIAN']}>
            <CatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/catalog/:id"
        element={
          <ProtectedRoute roles={['BORROWER', 'LIBRARIAN']}>
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
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/delete"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <DeleteUserPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
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