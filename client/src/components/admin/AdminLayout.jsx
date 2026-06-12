import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/loans', icon: '🪙', label: 'Loans' },
  { to: '/admin/customers', icon: '👥', label: 'Customers' },
  { to: '/admin/cashflow', icon: '💸', label: 'Cash Flow' },
  { to: '/admin/expenses', icon: '🧾', label: 'Expenses' },
  { to: '/admin/reports', icon: '📈', label: 'Reports' },
  { to: '/admin/messages', icon: '✉️', label: 'Messages' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-dark-900 border-r border-dark-700 flex flex-col flex-shrink-0`}>
        {/* Logo */}
        <div className={`flex items-center justify-center p-4 border-b border-dark-700`}>
          <img src="/logo.png" alt="AS Gold Loan Logo" className={`${sidebarOpen ? 'h-10' : 'h-8'} object-contain transition-all`} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                  : 'text-dark-400 hover:bg-dark-700 hover:text-white'
                } ${!sidebarOpen && 'justify-center'}`
              }
            >
              <span className="text-lg flex-shrink-0">{icon}</span>
              {sidebarOpen && label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className={`p-3 border-t border-dark-700 ${!sidebarOpen && 'flex justify-center'}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-dark-900 font-bold text-xs">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">{user?.name}</div>
                <div className="text-dark-500 text-xs truncate">{user?.email}</div>
              </div>
              <button onClick={handleLogout} title="Logout" className="text-dark-500 hover:text-red-400 transition-colors p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} title="Logout" className="text-dark-500 hover:text-red-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-dark-900 border-b border-dark-700 px-6 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-dark-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-dark-400 text-xs">System Active</span>
          </div>
          <div className="text-dark-400 text-xs">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
