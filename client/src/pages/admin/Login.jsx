import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="AS Gold Loan Logo" className="h-24 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
        </div>

        <div className="card border-dark-600">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                id="admin-email"
                type="email"
                className="input"
                placeholder="admin@asnk.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                id="admin-password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> Logging in...</>
              ) : 'Login to Admin Panel'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-dark-700/50 rounded-xl text-center">
            <p className="text-dark-400 text-xs">Default credentials:</p>
            <p className="text-dark-300 text-xs mt-1">Email: <span className="text-gold-400">admin@asnk.com</span></p>
            <p className="text-dark-300 text-xs">Password: <span className="text-gold-400">Admin@123</span></p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-dark-500 text-sm hover:text-gold-400 transition-colors">← Back to Website</Link>
        </div>
      </div>
    </div>
  );
}
