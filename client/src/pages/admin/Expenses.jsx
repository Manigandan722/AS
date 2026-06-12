import { useState, useEffect, useCallback } from 'react';
import { getExpenses, addExpense, deleteExpense } from '../../services/api';
import toast from 'react-hot-toast';

const fmtINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ expenseName: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(() => {
    setLoading(true);
    getExpenses()
      .then(res => {
        setExpenses(res.data.expenses);
        setTotal(res.data.expenses.reduce((s, e) => s + e.amount, 0));
      })
      .catch(() => toast.error('Failed to load expenses'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addExpense(form);
      toast.success('Expense added!');
      setShowForm(false);
      setForm({ expenseName: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      toast.success('Deleted');
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-5 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="text-dark-400 text-sm">Track shop expenses</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold text-sm py-2 px-4">
          {showForm ? '✕ Cancel' : '+ Add Expense'}
        </button>
      </div>

      {/* Total */}
      <div className="card border-red-500/30 bg-red-500/5 inline-block px-8">
        <div className="text-dark-400 text-xs mb-1">Total Expenses (all time)</div>
        <div className="text-red-400 font-bold text-2xl">{fmtINR(total)}</div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border-gold-500/20 animate-fade-in">
          <h3 className="text-white font-semibold mb-4">Add Expense</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Expense Name</label>
              <input className="input" placeholder="e.g. Electricity Bill" value={form.expenseName}
                onChange={e => setForm(f => ({ ...f, expenseName: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Amount (₹)</label>
              <input type="number" className="input" placeholder="0.00" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <input className="input" placeholder="Additional details..." value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={submitting} className="btn-gold px-8 py-2.5 text-sm">
                {submitting ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Expense Name</th>
              <th>Description</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10">
                <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-dark-400">No expenses found</td></tr>
            ) : expenses.map(exp => (
              <tr key={exp._id}>
                <td className="text-dark-300">{fmtDate(exp.date)}</td>
                <td className="text-white font-medium">{exp.expenseName}</td>
                <td className="text-dark-400 text-sm">{exp.description || '—'}</td>
                <td className="text-red-400 font-semibold">{fmtINR(exp.amount)}</td>
                <td>
                  <button onClick={() => handleDelete(exp._id)} className="text-dark-600 hover:text-red-400 transition-colors text-xs px-2 py-1">Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
