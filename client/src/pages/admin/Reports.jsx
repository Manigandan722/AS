import { useState, useEffect } from 'react';
import { getReport } from '../../services/api';
import toast from 'react-hot-toast';

const fmtINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

const StatBox = ({ label, value, color = 'white' }) => {
  const colorMap = { gold: 'gold-text', green: 'text-green-400', red: 'text-red-400', blue: 'text-blue-400' };
  return (
    <div className="card text-center">
      <div className={`text-2xl font-bold mb-1 ${colorMap[color] || 'text-white'}`}>{value}</div>
      <div className="text-dark-400 text-xs">{label}</div>
    </div>
  );
};

export default function Reports() {
  const [type, setType] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = () => {
    setLoading(true);
    getReport({ type, date })
      .then(res => setReport(res.data.report))
      .catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReport(); }, [type, date]);

  const typeOptions = [
    { value: 'daily', label: '📅 Daily' },
    { value: 'weekly', label: '📆 Weekly' },
    { value: 'monthly', label: '🗓️ Monthly' },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-dark-400 text-sm">Business performance summary</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-dark-700 overflow-hidden">
            {typeOptions.map(opt => (
              <button key={opt.value} onClick={() => setType(opt.value)}
                className={`px-4 py-2 text-sm font-medium transition-all ${type === opt.value ? 'bg-gold-500 text-dark-900' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <input type="date" className="input w-40" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : report ? (
        <>
          {/* Period */}
          <div className="card bg-dark-700/50 text-center py-3">
            <p className="text-dark-400 text-sm">
              Period: <span className="text-white font-medium">{fmtDate(report.period?.start)}</span>
              {' '} → <span className="text-white font-medium">{fmtDate(report.period?.end)}</span>
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBox label="Loans Issued" value={report.loansIssued || 0} color="blue" />
            <StatBox label="Total Loan Amount" value={fmtINR(report.totalLoanAmount)} color="gold" />
            <StatBox label="Loans Closed" value={report.loansClosed || 0} />
            <StatBox label="Cash Collected" value={fmtINR(report.cashIn)} color="green" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBox label="Cash Out" value={fmtINR(report.cashOut)} color="red" />
            <StatBox label="Total Expenses" value={fmtINR(report.expenses)} color="red" />
            <StatBox label={report.profit >= 0 ? 'Net Profit' : 'Net Loss'} value={fmtINR(Math.abs(report.profit))} color={report.profit >= 0 ? 'green' : 'red'} />
            <StatBox label="Amount Closed" value={fmtINR(report.totalClosed)} color="blue" />
          </div>

          {/* Loans Issued */}
          {report.loans?.length > 0 && (
            <div className="card">
              <h3 className="text-white font-semibold mb-4">Loans Issued ({report.loans.length})</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Loan No.</th>
                      <th>Customer</th>
                      <th>Gold</th>
                      <th>Amount</th>
                      <th>Interest</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.loans.map(loan => (
                      <tr key={loan._id}>
                        <td className="text-gold-400 font-mono text-xs">{loan.loanNumber}</td>
                        <td className="text-white">{loan.customerName}</td>
                        <td className="text-dark-400 text-xs">{loan.goldType} {loan.goldWeight}g</td>
                        <td className="font-semibold text-white">{fmtINR(loan.loanAmount)}</td>
                        <td className="text-gold-400">{loan.interestRate}%</td>
                        <td className="text-dark-300">{fmtDate(loan.loanDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Closed Loans */}
          {report.closedLoans?.length > 0 && (
            <div className="card">
              <h3 className="text-white font-semibold mb-4">Loans Closed ({report.closedLoans.length})</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Loan No.</th>
                      <th>Customer</th>
                      <th>Loan Amount</th>
                      <th>Closed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.closedLoans.map(loan => (
                      <tr key={loan._id}>
                        <td className="text-gold-400 font-mono text-xs">{loan.loanNumber}</td>
                        <td className="text-white">{loan.customerName}</td>
                        <td className="font-semibold text-white">{fmtINR(loan.loanAmount)}</td>
                        <td className="text-dark-300">{fmtDate(loan.closedDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
