import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { LayoutDashboard, Coins, Users, ArrowRightLeft, Receipt, LineChart, Mail, LogOut, Menu, Shield } from 'lucide-react';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/loans', icon: Coins, label: 'Loans' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/cashflow', icon: ArrowRightLeft, label: 'Cash Flow', adminOnly: true },
  { to: '/admin/expenses', icon: Receipt, label: 'Expenses', adminOnly: true },
  { to: '/admin/reports', icon: LineChart, label: 'Reports', adminOnly: true },
  { to: '/admin/messages', icon: Mail, label: 'Messages' },
  { to: '/admin/users', icon: Shield, label: 'System Users', adminOnly: true },
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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-30 ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-16'} transition-transform md:transition-all duration-300 glass-nav border-r flex flex-col flex-shrink-0 shadow-2xl`}>
        {/* Logo */}
        <div className={`flex items-center justify-center p-4 border-b border-dark-700`}>
          <img src="/logo.png" alt="AS Gold Loan Logo" className={`${sidebarOpen ? 'h-10' : 'h-8'} object-contain transition-all`} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.filter(item => !item.adminOnly || user?.role === 'admin').map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                  ? 'bg-gradient-to-r from-gold-500/20 to-transparent text-gold-400 border-l-4 border-gold-500 shadow-glow-gold'
                  : 'text-dark-400 hover:bg-dark-700/50 hover:text-white hover:translate-x-1'
                } ${!sidebarOpen && 'justify-center border-l-0'}`
              }
            >
              <span className="flex-shrink-0"><Icon className="w-5 h-5" /></span>
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
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} title="Logout" className="text-dark-500 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header 
          data-aos="fade-down"
          className="glass-nav border-b px-6 py-4 flex items-center gap-4 z-10 shadow-lg">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-dark-400 hover:text-white transition-transform hover:scale-110 active:scale-95">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3 bg-dark-800/50 px-3 py-1.5 rounded-full border border-dark-700/50">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </div>
            <span className="text-dark-300 text-xs font-medium tracking-wide">System Active</span>
          </div>
          <div className="text-dark-400 text-xs font-medium hidden sm:block bg-dark-800/50 px-3 py-1.5 rounded-full border border-dark-700/50">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
