import { useState, useEffect, useCallback } from 'react';
import { getCashFlow, addCashFlow, deleteCashFlow } from '../../services/api';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const fmtINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const CATEGORIES = [
  'Loan Disbursement', 'Interest Collection', 'Loan Closure',
  'Additional Deposit', 'Shop Expense', 'Salary', 'Electricity Bill', 'Other'
];

export default function CashFlow() {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', startDate: '', endDate: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'in', amount: '', description: '', category: 'Other', date: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);
  const [totals, setTotals] = useState({ in: 0, out: 0 });

  const fetch = useCallback(() => {
    setLoading(true);
    getCashFlow(filter)
      .then(res => {
        setFlows(res.data.flows);
        const tin = res.data.flows.filter(f => f.type === 'in').reduce((s, f) => s + f.amount, 0);
        const tout = res.data.flows.filter(f => f.type === 'out').reduce((s, f) => s + f.amount, 0);
        setTotals({ in: tin, out: tout });
      })
      .catch(() => toast.error('Failed to load cash flow'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addCashFlow(form);
      toast.success('Cash entry added!');
      setShowForm(false);
      setForm({ type: 'in', amount: '', description: '', category: 'Other', date: new Date().toISOString().split('T')[0] });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await deleteCashFlow(id);
      toast.success('Deleted');
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-5 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cash Flow</h1>
          <p className="text-dark-400 text-sm">Track all cash in and out transactions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold text-sm py-2 px-4">
          {showForm ? '✕ Cancel' : '+ Add Entry'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card border-green-500/30 bg-green-500/5">
          <div className="text-dark-400 text-xs mb-1">Total Cash In</div>
          <div className="text-green-400 font-bold text-xl">{fmtINR(totals.in)}</div>
        </div>
        <div className="card border-red-500/30 bg-red-500/5">
          <div className="text-dark-400 text-xs mb-1">Total Cash Out</div>
          <div className="text-red-400 font-bold text-xl">{fmtINR(totals.out)}</div>
        </div>
        <div className="card border-gold-500/30 bg-gold-500/5">
          <div className="text-dark-400 text-xs mb-1">Net (filtered)</div>
          <div className={`font-bold text-xl ${totals.in - totals.out >= 0 ? 'text-gold-400' : 'text-red-400'}`}>
            {fmtINR(totals.in - totals.out)}
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card border-gold-500/20 animate-fade-in">
          <h3 className="text-white font-semibold mb-4">Add Cash Flow Entry</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Type</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, type: 'in' }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.type === 'in' ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-dark-700 border-dark-600 text-dark-400'}`}>
                  Cash In
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, type: 'out' }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.type === 'out' ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-dark-700 border-dark-600 text-dark-400'}`}>
                  Cash Out
                </button>
              </div>
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
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <input className="input" placeholder="Description..." value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-gold px-6 py-2.5 text-sm">
                {submitting ? 'Adding...' : 'Add Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="input w-36" value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
          <option value="">All Types</option>
          <option value="in">Cash In</option>
          <option value="out">Cash Out</option>
        </select>
        <input type="date" className="input w-40" value={filter.startDate} onChange={e => setFilter(f => ({ ...f, startDate: e.target.value }))} />
        <input type="date" className="input w-40" value={filter.endDate} onChange={e => setFilter(f => ({ ...f, endDate: e.target.value }))} />
        <button onClick={() => setFilter({ type: '', startDate: '', endDate: '' })} className="text-dark-400 hover:text-white text-sm transition-colors px-2">Reset</button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10">
                <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : flows.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-dark-400">No entries found</td></tr>
            ) : flows.map(f => (
              <tr key={f._id}>
                <td className="text-dark-300">{fmtDate(f.date)}</td>
                <td>
                  <span className={`badge ${f.type === 'in' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {f.type === 'in' ? '↑ Cash In' : '↓ Cash Out'}
                  </span>
                </td>
                <td className="text-dark-400 text-xs">{f.category}</td>
                <td className="text-dark-200 max-w-xs truncate">{f.description}</td>
                <td className={`font-semibold ${f.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                  {f.type === 'in' ? '+' : '-'}{fmtINR(f.amount)}
                </td>
                <td>
                  <button onClick={() => handleDelete(f._id)} title="Delete Entry" className="text-dark-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
