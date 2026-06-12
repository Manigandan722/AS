import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLoan, approveLoan, rejectLoan, closeLoan, releaseGold, updateLoan } from '../../services/api';
import toast from 'react-hot-toast';
import { User, Coins, ClipboardList, StickyNote } from 'lucide-react';

const STATUS_BADGE = {
  Pending:  'badge badge-pending',
  Approved: 'badge badge-approved',
  Closed:   'badge badge-closed',
  Rejected: 'badge badge-rejected',
};

const fmtINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const Row = ({ label, value, accent }) => (
  <div className="flex justify-between items-start py-2 border-b border-dark-700 last:border-0">
    <span className="text-dark-400 text-sm">{label}</span>
    <span className={`text-sm font-medium text-right max-w-[60%] ${accent ? 'gold-text font-bold text-base' : 'text-white'}`}>{value}</span>
  </div>
);

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const fetchLoan = () => {
    setLoading(true);
    getLoan(id)
      .then(res => setLoan(res.data.loan))
      .catch(() => toast.error('Loan not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoan(); }, [id]);

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      if (action === 'approve') await approveLoan(id);
      else if (action === 'reject') await rejectLoan(id);
      else if (action === 'close') {
        const amt = prompt(`Enter collection amount (₹): Loan Amount: ₹${loan.loanAmount}`);
        if (!amt) return;
        await closeLoan(id, { collectionAmount: parseFloat(amt) });
      }
      else if (action === 'release') await releaseGold(id);
      toast.success('Done!');
      fetchLoan();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!loan) return (
    <div className="text-center py-20 text-dark-400">
      Loan not found. <button onClick={() => navigate(-1)} className="text-gold-400 underline ml-2">Go back</button>
    </div>
  );

  const monthlyInterest = (loan.loanAmount * loan.interestRate) / 100;

  return (
    <div className="max-w-4xl page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-dark-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold gold-text font-mono">{loan.loanNumber}</h1>
              <span className={STATUS_BADGE[loan.status]}>{loan.status}</span>
              {loan.goldReleased && <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30">Item Released</span>}
            </div>
            <p className="text-dark-400 text-sm mt-0.5">Loan Details</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {loan.status === 'Pending' && <>
            <button onClick={() => handleAction('approve')} disabled={!!actionLoading}
              className="bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              {actionLoading === 'approve' ? '...' : '✓ Approve'}
            </button>
            <button onClick={() => handleAction('reject')} disabled={!!actionLoading}
              className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              {actionLoading === 'reject' ? '...' : '✗ Reject'}
            </button>
          </>}
          {loan.status === 'Approved' && (
            <button onClick={() => handleAction('close')} disabled={!!actionLoading}
              className="bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              {actionLoading === 'close' ? '...' : '🔒 Close Loan'}
            </button>
          )}
          {loan.status === 'Closed' && !loan.goldReleased && (
            <button onClick={() => handleAction('release')} disabled={!!actionLoading}
              className="bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              {actionLoading === 'release' ? '...' : '🔓 Release Item'}
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-blue-400" /> Customer</h2>
          <Row label="Name" value={loan.customerName} />
          <Row label="Mobile" value={loan.mobile} />
          <Row label="Aadhaar" value={loan.aadhaar || '—'} />
          <Row label="Address" value={loan.address || '—'} />
        </div>

        {/* Item Info */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Coins className="w-5 h-5 text-gold-400" /> Item Details</h2>
          <Row label="Item Type" value={`${loan.itemCategory ? loan.itemCategory + ' ' : ''}${loan.goldType}`} />
          <Row label="Weight" value={`${loan.goldWeight} grams`} />
          <Row label="Purity" value={loan.goldPurity} />
          <Row label="Estimated Value" value={fmtINR(loan.goldValue)} accent />
        </div>

        {/* Loan Info */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-green-400" /> Loan Details</h2>
          <Row label="Loan Amount" value={fmtINR(loan.loanAmount)} accent />
          <Row label="Interest Rate" value={`${loan.interestRate}% per month`} />
          <Row label="Monthly Interest" value={fmtINR(monthlyInterest)} />
          <Row label="Loan Date" value={fmtDate(loan.loanDate)} />
          <Row label="Due Date" value={fmtDate(loan.dueDate)} />
          {loan.closedDate && <Row label="Closed Date" value={fmtDate(loan.closedDate)} />}
        </div>

        {/* Notes */}
        <div className="card">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><StickyNote className="w-5 h-5 text-purple-400" /> Notes & Timeline</h2>
          <div className="text-dark-400 text-sm mb-4">{loan.notes || 'No notes added.'}</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-dark-500">
              <span className="w-2 h-2 bg-gold-500 rounded-full" />
              Created: {fmtDate(loan.createdAt)}
            </div>
            <div className="flex items-center gap-2 text-xs text-dark-500">
              <span className="w-2 h-2 bg-dark-500 rounded-full" />
              Updated: {fmtDate(loan.updatedAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
