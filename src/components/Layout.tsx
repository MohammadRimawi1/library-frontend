import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, Menu, X, Bookmark, LayoutGrid, UserCog, PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

interface NavItem {
  to: string;
  label: string;
  icon: typeof BookOpen;
  roles?: Role[];
}

const navItems: NavItem[] = [
  { to: '/catalog', label: 'Catalog', icon: LayoutGrid },
  { to: '/reservations', label: 'My Reservations', icon: Bookmark, roles: ['BORROWER', 'LIBRARIAN', 'ADMIN'] },
  { to: '/librarian/items/new', label: 'Add Item', icon: PlusCircle, roles: ['LIBRARIAN', 'ADMIN'] },
  { to: '/librarian/reservations', label: 'Reservations', icon: BookOpen, roles: ['LIBRARIAN', 'ADMIN'] },
  { to: '/admin', label: 'Promote User', icon: UserCog, roles: ['ADMIN'] },
];

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNavItems = navItems.filter((item) => !item.roles || hasRole(...item.roles));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-paper-50">
      <header className="sticky top-0 z-40 border-b border-paper-200 bg-paper-50/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <NavLink to="/catalog" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-forest-600" strokeWidth={2} />
              <span className="font-serif text-xl font-semibold text-ink-800">Athenaeum</span>
            </NavLink>

            <nav className="hidden items-center gap-1 md:flex">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.to)
                        ? 'bg-forest-100 text-forest-700'
                        : 'text-ink-500 hover:bg-paper-100 hover:text-ink-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-sm font-semibold text-white">
                P
              </div>
              <div className="text-sm">
                <p className="font-medium text-ink-700">Preview User</p>
                <p className="text-xs text-ink-400">borrower</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost hidden md:inline-flex"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-ink-600 hover:bg-paper-100 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-paper-200 bg-paper-50 px-4 py-3 md:hidden animate-[slideDown_150ms_ease-out]">
            <div className="space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(item.to)
                        ? 'bg-forest-100 text-forest-700'
                        : 'text-ink-500 hover:bg-paper-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-terra-700 hover:bg-terra-50"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}