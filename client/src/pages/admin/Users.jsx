import { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser } from '../../services/api';
import toast from 'react-hot-toast';
import { Shield, Trash2, Plus, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getUsers()
      .then(res => setUsers(res.data.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return toast.error('Please fill all required fields');
    }
    
    setSaving(true);
    try {
      await createUser(form);
      toast.success('User created successfully');
      setForm({ name: '', email: '', password: '', role: 'staff' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) return toast.error("You cannot delete your own account");
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6 page-enter max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-gold-500" /> System Users
          </h1>
          <p className="text-dark-400 text-sm">Manage admins and staff accounts</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold flex items-center justify-center gap-2">
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Add New User</>}
        </button>
      </div>

      {/* Add User Form */}
      {showForm && (
        <div className="card animate-fade-in border-gold-500/30">
          <h2 className="text-lg font-semibold text-white mb-4">Create New User</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="label">Name</label>
              <input type="text" className="input" placeholder="User Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="email@asnk.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="staff">Staff (Limited Access)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>
            <div className="sm:col-span-2 md:col-span-4 flex justify-end mt-2">
              <button type="submit" disabled={saving} className="btn-gold w-full sm:w-auto">
                {saving ? 'Saving...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <UserCircle className="w-8 h-8 text-dark-500" />
                        <div>
                          <div className="text-white font-medium">{u.name} {u._id === currentUser.id && <span className="text-xs text-gold-400 ml-2">(You)</span>}</div>
                          <div className="text-dark-400 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td className="text-dark-300 text-sm">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="text-right">
                      {u._id !== currentUser.id && (
                        <button onClick={() => handleDelete(u._id)} className="text-dark-500 hover:text-red-400 transition-colors p-2" title="Delete User">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-dark-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
