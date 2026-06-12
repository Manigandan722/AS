import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers, getCustomerLoans } from '../../services/api';
import toast from 'react-hot-toast';
import { MousePointerClick } from 'lucide-react';

const fmtINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
const STATUS_BADGE = { Pending: 'badge badge-pending', Approved: 'badge badge-approved', Closed: 'badge badge-closed', Rejected: 'badge badge-rejected' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedLoans, setSelectedLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const navigate = useNavigate();

  const fetch = useCallback(() => {
    setLoading(true);
    getCustomers({ search })
      .then(res => setCustomers(res.data.customers))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const selectCustomer = async (c) => {
    setSelected(c);
    setLoansLoading(true);
    try {
      const res = await getCustomerLoans(c._id);
      setSelectedLoans(res.data.loans);
    } catch {
      setSelectedLoans([]);
    } finally {
      setLoansLoading(false);
    }
  };

  return (
    <div className="space-y-5 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Customer Search</h1>
        <p className="text-dark-400 text-sm">Search by name, mobile, or Aadhaar</p>
      </div>

      <input className="input max-w-md" placeholder="Search customers..." value={search}
        onChange={e => setSearch(e.target.value)} />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Customer list */}
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-dark-400 text-sm">No customers found</div>
          ) : customers.map(c => (
            <button key={c._id} onClick={() => selectCustomer(c)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selected?._id === c._id ? 'bg-gold-500/10 border-gold-500/40' : 'bg-dark-800 border-dark-700 hover:border-dark-500'}`}>
              <div className="font-medium text-white">{c.name}</div>
              <div className="text-dark-400 text-sm">{c.mobile}</div>
              {c.aadhaar && <div className="text-dark-500 text-xs mt-0.5">Aadhaar: {c.aadhaar}</div>}
            </button>
          ))}
        </div>

        {/* Loan history panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-white font-semibold text-lg">{selected.name}</h2>
                  <p className="text-dark-400 text-sm">{selected.mobile} • {selected.address || 'No address'}</p>
                </div>
                <span className="text-dark-500 text-xs">{selectedLoans.length} loan(s)</span>
              </div>
              {loansLoading ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : selectedLoans.length === 0 ? (
                <div className="text-center py-8 text-dark-400 text-sm">No loans found for this customer</div>
              ) : (
                <div className="space-y-3">
                  {selectedLoans.map(loan => (
                    <div key={loan._id} className="p-4 bg-dark-700 rounded-xl hover:bg-dark-600 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/loans/${loan._id}`)}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gold-400 font-mono text-sm font-bold">{loan.loanNumber}</span>
                        <span className={STATUS_BADGE[loan.status]}>{loan.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white font-semibold">{fmtINR(loan.loanAmount)}</span>
                        <span className="text-dark-400">{loan.goldType} • {loan.goldWeight}g</span>
                        <span className="text-dark-500">{fmtDate(loan.loanDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center h-48 text-dark-500">
              <MousePointerClick className="w-10 h-10 mb-3 text-dark-400" />
              <p>Select a customer to view their loan history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
