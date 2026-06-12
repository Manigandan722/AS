import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLoan } from '../../services/api';
import toast from 'react-hot-toast';
import { User, Coins, ClipboardList } from 'lucide-react';

const GOLD_TYPES = ['Necklace', 'Ring', 'Bangle', 'Chain', 'Earring', 'Bracelet', 'Anklet', 'Others'];
const SILVER_TYPES = ['Anklet', 'Chain', 'Ring', 'Plate', 'Coin', 'Others'];
const GOLD_PURITIES = ['24K (99.9%)', '22K (91.6%)', '18K (75%)', '14K (58.3%)', 'Other'];
const SILVER_PURITIES = ['99.9%', '92.5%', '80%', 'Other'];

const Field = ({ label, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
  </div>
);

export default function CreateLoan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '', mobile: '', aadhaar: '', address: '',
    itemCategory: 'Gold', goldType: 'Necklace', goldWeight: '', goldPurity: '22K (91.6%)', goldValue: '',
    loanAmount: '', interestRate: '', loanDate: new Date().toISOString().split('T')[0],
    dueDate: '', notes: '',
  });

  const s = (field) => (e) => {
    const val = e.target.value;
    setForm(prev => {
      const next = { ...prev, [field]: val };
      
      // Update default type and purity if category changes
      if (field === 'itemCategory') {
        if (val === 'Gold') {
          next.goldType = 'Necklace';
          next.goldPurity = '22K (91.6%)';
        } else if (val === 'Silver') {
          next.goldType = 'Anklet';
          next.goldPurity = '92.5%';
        }
      }

      // Auto-set interest rate
      if (field === 'loanAmount') {
        const amt = parseFloat(val);
        if (!isNaN(amt)) next.interestRate = amt < 10000 ? '3' : '2';
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createLoan(form);
      toast.success(`Loan ${res.data.loan.loanNumber} created!`);
      navigate('/admin/loans');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl page-enter">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-dark-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Loan</h1>
          <p className="text-dark-400 text-sm">Loan number will be auto-generated (ASNK-{new Date().getFullYear()}-XXXX)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" /> Customer Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Customer Name *">
              <input className="input" placeholder="Full name" value={form.customerName} onChange={s('customerName')} required />
            </Field>
            <Field label="Mobile Number *">
              <input className="input" placeholder="10-digit mobile" value={form.mobile} onChange={s('mobile')} required />
            </Field>
            <Field label="Aadhaar Number">
              <input className="input" placeholder="12-digit Aadhaar" value={form.aadhaar} onChange={s('aadhaar')} />
            </Field>
            <Field label="Address">
              <input className="input" placeholder="Full address" value={form.address} onChange={s('address')} />
            </Field>
          </div>
        </div>

        {/* Item Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Coins className="w-5 h-5 text-gold-400" /> Item Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Item Category *">
              <select className="input" value={form.itemCategory} onChange={s('itemCategory')} required>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
              </select>
            </Field>
            <Field label="Item Type *">
              <select className="input" value={form.goldType} onChange={s('goldType')} required>
                {(form.itemCategory === 'Silver' ? SILVER_TYPES : GOLD_TYPES).map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label={`${form.itemCategory} Weight (grams) *`}>
              <input type="number" step="0.01" className="input" placeholder="e.g. 10.5" value={form.goldWeight} onChange={s('goldWeight')} required />
            </Field>
            <Field label={`${form.itemCategory} Purity *`}>
              <select className="input" value={form.goldPurity} onChange={s('goldPurity')} required>
                {(form.itemCategory === 'Silver' ? SILVER_PURITIES : GOLD_PURITIES).map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label={`${form.itemCategory} Estimated Value (₹) *`}>
              <input type="number" className="input" placeholder="e.g. 45000" value={form.goldValue} onChange={s('goldValue')} required />
            </Field>
          </div>
        </div>

        {/* Loan Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-green-400" /> Loan Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Loan Amount (₹) *">
              <input type="number" className="input" placeholder="e.g. 25000" value={form.loanAmount} onChange={s('loanAmount')} required />
            </Field>
            <Field label="Interest Rate (% per month) *">
              <div className="relative">
                <input type="number" step="0.1" className="input" value={form.interestRate} onChange={s('interestRate')} required />
                {form.loanAmount && (
                  <span className="absolute right-3 top-3.5 text-gold-400 text-xs">
                    Auto: {parseFloat(form.loanAmount) < 10000 ? '3%' : '2%'}
                  </span>
                )}
              </div>
            </Field>
            <Field label="Loan Date *">
              <input type="date" className="input" value={form.loanDate} onChange={s('loanDate')} required />
            </Field>
            <Field label="Due Date *">
              <input type="date" className="input" value={form.dueDate} onChange={s('dueDate')} required />
            </Field>
          </div>

          {/* Preview */}
          {form.loanAmount && form.interestRate && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ['Monthly Interest', `₹${((parseFloat(form.loanAmount || 0) * parseFloat(form.interestRate || 0)) / 100).toLocaleString('en-IN')}`],
                ['Loan Amount', `₹${parseFloat(form.loanAmount || 0).toLocaleString('en-IN')}`],
                [`${form.itemCategory} Value`, `₹${parseFloat(form.goldValue || 0).toLocaleString('en-IN')}`],
              ].map(([label, val]) => (
                <div key={label} className="p-3 bg-dark-700 rounded-xl text-center">
                  <div className="text-dark-400 text-xs mb-1">{label}</div>
                  <div className="text-gold-400 font-bold">{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="card">
          <Field label="Notes (optional)">
            <textarea className="input" rows={3} placeholder="Any additional notes..." value={form.notes} onChange={s('notes')} />
          </Field>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-gold flex-1 text-base flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> Creating...</> : '✓ Create Loan'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-outline px-8">Cancel</button>
        </div>
      </form>
    </div>
  );
}
