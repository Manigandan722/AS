import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AOS from 'aos';

// Customer pages
import CustomerHome from './pages/customer/Home';
import ContactPage from './pages/customer/Contact';

// Admin pages
import Login from './pages/admin/Login';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Loans from './pages/admin/Loans';
import CreateLoan from './pages/admin/CreateLoan';
import LoanDetail from './pages/admin/LoanDetail';
import Customers from './pages/admin/Customers';
import CashFlow from './pages/admin/CashFlow';
import Expenses from './pages/admin/Expenses';
import Reports from './pages/admin/Reports';
import Messages from './pages/admin/Messages';
import Users from './pages/admin/Users';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

function RoleRoute({ role, children }) {
  const { user } = useAuth();
  if (user?.role !== role) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#f59e0b', secondary: '#0f172a' } },
          }}
        />
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<CustomerHome />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="loans" element={<Loans />} />
            <Route path="loans/new" element={<CreateLoan />} />
            <Route path="loans/:id" element={<LoanDetail />} />
            <Route path="customers" element={<Customers />} />
            <Route path="cashflow" element={<RoleRoute role="admin"><CashFlow /></RoleRoute>} />
            <Route path="expenses" element={<RoleRoute role="admin"><Expenses /></RoleRoute>} />
            <Route path="reports" element={<RoleRoute role="admin"><Reports /></RoleRoute>} />
            <Route path="users" element={<RoleRoute role="admin"><Users /></RoleRoute>} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
