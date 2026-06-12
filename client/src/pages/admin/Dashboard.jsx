import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../services/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import { Wallet, Coins, CheckCircle, Lock, ArrowDownToLine, ArrowUpFromLine, TrendingUp, PlusCircle, Receipt, LineChart as ChartIcon } from 'lucide-react';

const fmt = (n) => {
  if (!n && n !== 0) return '₹0';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
};

const fmtFull = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-xs">
        <p className="text-dark-400 mb-2">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {fmtFull(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({ label, value, sub, color = 'gold', icon: Icon }) {
  const colors = {
    gold: 'border-gold-500/30 bg-gold-500/5',
    green: 'border-green-500/30 bg-green-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
    red: 'border-red-500/30 bg-red-500/5',
    teal: 'border-teal-500/30 bg-teal-500/5',
  };
  const textColors = { gold: 'gold-text', green: 'text-green-400', blue: 'text-blue-400', purple: 'text-purple-400', red: 'text-red-400', teal: 'text-teal-400' };

  return (
    <div className={`card border ${colors[color]} hover:scale-[1.02] transition-transform duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-${color}-400`}><Icon className="w-6 h-6" /></span>
        {sub && <span className="text-xs text-dark-500 bg-dark-700 px-2 py-0.5 rounded-full">{sub}</span>}
      </div>
      <div className={`text-2xl font-bold mb-1 ${textColors[color]}`}>{value}</div>
      <div className="text-dark-400 text-sm">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const d = data || {};

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 text-sm mt-0.5">Welcome to AS Nagai Adagu Kadai Admin</p>
        </div>
        <Link to="/admin/loans/new" className="btn-gold text-sm py-2 px-4">+ New Loan</Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Available Cash" value={fmt(d.availableCash)} color="gold" />
        <StatCard icon={Coins} label="Total Loans" value={d.totalLoans || 0} color="blue" />
        <StatCard icon={CheckCircle} label="Active Loans" value={d.activeLoans || 0} color="green" />
        <StatCard icon={Lock} label="Closed Loans" value={d.closedLoans || 0} color="purple" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={ArrowDownToLine} label="Today's Collections" value={fmt(d.todayCollections)} color="teal" sub="Today" />
        <StatCard icon={ArrowUpFromLine} label="Today's Expenses" value={fmt(d.todayExpenses)} color="red" sub="Today" />
        <StatCard icon={TrendingUp} label="Monthly Profit" value={fmt(d.monthlyProfit)} color="gold" sub="This Month" />
      </div>

      {/* Loan Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Daily Loans', d.loanStats?.daily, 'blue'],
          ['Weekly Loans', d.loanStats?.weekly, 'teal'],
          ['Monthly Loans', d.loanStats?.monthly, 'green'],
          ['Outstanding', d.loanStats?.outstanding, 'gold'],
        ].map(([label, val, color]) => (
          <div key={label} className="card text-center">
            <div className={`text-xl font-bold mb-1 ${color === 'gold' ? 'gold-text' : `text-${color}-400`}`}>{fmt(val)}</div>
            <div className="text-dark-400 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cash Flow Trend */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4">Cash Flow — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.cashFlowTrend || []} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Bar dataKey="cashIn" name="Cash In" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cashOut" name="Cash Out" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Net Cash Line */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4">Net Cash Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={(d.cashFlowTrend || []).map(d => ({ ...d, net: d.cashIn - d.cashOut }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="net" name="Net Cash" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/admin/loans/new', label: 'New Loan', icon: PlusCircle },
            { to: '/admin/cashflow', label: 'Add Cash', icon: Wallet },
            { to: '/admin/expenses', label: 'Add Expense', icon: Receipt },
            { to: '/admin/reports', label: 'View Reports', icon: ChartIcon },
          ].map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className="flex flex-col items-center gap-2 p-4 bg-dark-700 hover:bg-dark-600 rounded-xl transition-colors text-center group">
              <span className="text-gold-400 group-hover:scale-110 transition-transform"><Icon className="w-6 h-6" /></span>
              <span className="text-dark-300 text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
