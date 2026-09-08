import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogPage from './pages/CatalogPage';
import ItemDetailPage from './pages/ItemDetailPage';
import MyReservationsPage from './pages/MyReservationsPage';
import CreateItemPage from './pages/CreateItemPage';
import LibrarianReservationsPage from './pages/LibrarianReservationsPage';
import AdminPage from './pages/AdminPage';


function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/catalog" element={<Layout><CatalogPage /></Layout>} />
      <Route path="/catalog/:id" element={<Layout><ItemDetailPage /></Layout>} />
      <Route path="/reservations" element={<Layout><MyReservationsPage /></Layout>} />
      <Route path="/librarian/items/new" element={<Layout><CreateItemPage /></Layout>} />
      <Route path="/librarian/reservations" element={<Layout><LibrarianReservationsPage /></Layout>} />
      <Route path="/admin" element={<Layout><AdminPage /></Layout>} />
      <Route path="/" element={<Navigate to="/catalog" replace />} />
      <Route path="*" element={<Navigate to="/catalog" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;