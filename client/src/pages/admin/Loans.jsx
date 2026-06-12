import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, Lock, Unlock, Trash2 } from 'lucide-react';
import { getLoans, approveLoan, rejectLoan, closeLoan, releaseGold, deleteLoan } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  Pending:  'badge badge-pending',
  Approved: 'badge badge-approved',
  Closed:   'badge badge-closed',
  Rejected: 'badge badge-rejected',
};

const fmtINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState('');
  const navigate = useNavigate();

  const fetchLoans = useCallback(() => {
    setLoading(true);
    getLoans({ search, status, page, limit: 15 })
      .then(res => { setLoans(res.data.loans); setTotalPages(res.data.pages); })
      .catch(() => toast.error('Failed to load loans'))
      .finally(() => setLoading(false));
  }, [search, status, page]);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const handleAction = async (id, action, data = {}) => {
    setActionLoading(id + action);
    try {
      if (action === 'approve') await approveLoan(id);
      else if (action === 'reject') await rejectLoan(id);
      else if (action === 'close') {
        const amt = prompt('Enter collection amount (₹):');
        if (!amt) return;
        await closeLoan(id, { collectionAmount: parseFloat(amt) });
      }
      else if (action === 'release') await releaseGold(id);
      else if (action === 'delete') {
        if (!confirm('Delete this loan? This cannot be undone.')) return;
        await deleteLoan(id);
      }
      toast.success('Action completed!');
      fetchLoans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="space-y-5 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Loan Management</h1>
          <p className="text-dark-400 text-sm">Manage all gold loans</p>
        </div>
        <Link to="/admin/loans/new" className="btn-gold text-sm py-2 px-4">+ New Loan</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="input sm:max-w-xs"
          placeholder="Search by name, mobile, Aadhaar, loan no..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="input sm:w-40" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Closed">Closed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Loan No.</th>
              <th>Customer</th>
              <th>Item</th>
              <th>Amount</th>
              <th>Rate</th>
              <th>Loan Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-12 text-dark-400">
                <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : loans.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-dark-400">No loans found</td></tr>
            ) : loans.map(loan => (
              <tr key={loan._id}>
                <td>
                  <button onClick={() => navigate(`/admin/loans/${loan._id}`)}
                    className="text-gold-400 font-mono text-xs hover:underline">{loan.loanNumber}</button>
                </td>
                <td>
                  <div className="font-medium text-white">{loan.customerName}</div>
                  <div className="text-dark-500 text-xs">{loan.mobile}</div>
                </td>
                <td>
                  <div>{loan.itemCategory === 'Silver' ? <span className="text-gray-400 font-medium text-xs border border-gray-600 rounded px-1 mr-1">Ag</span> : <span className="text-gold-400 font-medium text-xs border border-gold-600/50 rounded px-1 mr-1">Au</span>} {loan.goldType}</div>
                  <div className="text-dark-500 text-xs">{loan.goldWeight}g • {loan.goldPurity}</div>
                </td>
                <td className="font-semibold text-white">{fmtINR(loan.loanAmount)}</td>
                <td className="text-gold-400">{loan.interestRate}%</td>
                <td className="text-dark-300">{fmtDate(loan.loanDate)}</td>
                <td className="text-dark-300">{fmtDate(loan.dueDate)}</td>
                <td><span className={STATUS_BADGE[loan.status]}>{loan.status}</span></td>
                <td>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button onClick={() => navigate(`/admin/loans/${loan._id}`)}
                      title="View Details"
                      className="p-1.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    {loan.status === 'Pending' && <>
                      <button onClick={() => handleAction(loan._id, 'approve')}
                        disabled={!!actionLoading}
                        title="Approve"
                        className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleAction(loan._id, 'reject')}
                        disabled={!!actionLoading}
                        title="Reject"
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>}
                    {loan.status === 'Approved' && <>
                      <button onClick={() => handleAction(loan._id, 'close')}
                        disabled={!!actionLoading}
                        title="Close Loan"
                        className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-colors">
                        <Lock className="w-4 h-4" />
                      </button>
                    </>}
                    {loan.status === 'Closed' && !loan.goldReleased && (
                      <button onClick={() => handleAction(loan._id, 'release')}
                        disabled={!!actionLoading}
                        title="Release Item"
                        className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 transition-colors">
                        <Unlock className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleAction(loan._id, 'delete')}
                      title="Delete"
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 disabled:opacity-40 rounded-lg text-sm text-white transition-colors">← Prev</button>
          <span className="text-dark-400 text-sm">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 disabled:opacity-40 rounded-lg text-sm text-white transition-colors">Next →</button>
        </div>
      )}
    </div>
  );
}
