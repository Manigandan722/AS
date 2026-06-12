import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../services/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AOS from 'aos';
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

function StatCard({ label, value, sub, color = 'gold', icon: Icon, delay = 0 }) {
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
    <div 
      data-aos="fade-up" data-aos-delay={delay}
      className={`card border relative overflow-hidden ${colors[color]} hover:scale-[1.03] hover:-translate-y-1 hover:shadow-glow-${color} transition-all duration-300`}>
      {/* Decorative gradient blur in background */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${colors[color].replace('border', 'bg').replace('bg', 'bg').split(' ')[0]} blur-2xl opacity-50 rounded-full`} />
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <span className={`p-2 rounded-xl bg-dark-800 border ${colors[color].split(' ')[0]} text-${color}-400 shadow-glass`}><Icon className="w-5 h-5" /></span>
        {sub && <span className="text-xs text-dark-400 bg-dark-800 border border-dark-700 px-2.5 py-1 rounded-full font-medium shadow-sm">{sub}</span>}
      </div>
      <div className={`text-3xl font-extrabold mb-1 tracking-tight ${textColors[color]} relative z-10`}>{value}</div>
      <div className="text-dark-400 text-sm font-medium relative z-10">{label}</div>
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

  useEffect(() => {
    if (!loading) {
      setTimeout(() => AOS.refresh(), 100);
    }
  }, [loading]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const d = data || {};

  return (
    <div className="space-y-8 page-enter pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4" data-aos="fade-down">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-dark-300 tracking-tight">Dashboard</h1>
          <p className="text-dark-400 text-sm mt-1 font-medium">Welcome to AS Nagai Adagu Kadai Admin Overview</p>
        </div>
        <Link to="/admin/loans/new" className="btn-gold text-sm py-2.5 px-5 flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Loan
        </Link>
      </div>

      {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard delay="0" icon={Wallet} label="Available Cash" value={fmt(d.availableCash)} color="gold" />
          <StatCard delay="100" icon={Coins} label="Total Loans" value={d.totalLoans || 0} color="blue" />
          <StatCard delay="200" icon={CheckCircle} label="Active Loans" value={d.activeLoans || 0} color="green" />
          <StatCard delay="300" icon={Lock} label="Closed Loans" value={d.closedLoans || 0} color="purple" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard delay="400" icon={ArrowDownToLine} label="Today's Collections" value={fmt(d.todayCollections)} color="teal" sub="Today" />
          <StatCard delay="500" icon={ArrowUpFromLine} label="Today's Expenses" value={fmt(d.todayExpenses)} color="red" sub="Today" />
          <StatCard delay="600" icon={TrendingUp} label="Monthly Profit" value={fmt(d.monthlyProfit)} color="gold" sub="This Month" />
        </div>

      {/* Loan Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">
        {[
          ['Daily Loans', d.loanStats?.daily, 'blue'],
          ['Weekly Loans', d.loanStats?.weekly, 'teal'],
          ['Monthly Loans', d.loanStats?.monthly, 'green'],
          ['Outstanding', d.loanStats?.outstanding, 'gold'],
        ].map(([label, val, color], idx) => (
          <div key={label} className={`card text-center relative overflow-hidden bg-gradient-to-br from-dark-800 to-dark-900/50 border-${color}-500/20 hover:border-${color}-500/50 transition-colors`}>
            <div className={`text-2xl font-black mb-1.5 ${color === 'gold' ? 'gold-text' : `text-${color}-400`}`}>{fmt(val)}</div>
            <div className="text-dark-400 text-xs font-semibold uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
        {/* Cash Flow Trend */}
        <div className="card glass relative overflow-hidden p-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Cash Flow — Last 7 Days
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.cashFlowTrend || []} barGap={6} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
              <Legend wrapperStyle={{ fontSize: 13, color: '#e2e8f0', paddingTop: '20px' }} iconType="circle" />
              <Bar dataKey="cashIn" name="Cash In" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="cashOut" name="Cash Out" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Net Cash Line */}
        <div className="card glass relative overflow-hidden p-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[80px] rounded-full pointer-events-none" />
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-gold-400" />
            Net Cash Trend
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={(d.cashFlowTrend || []).map(d => ({ ...d, net: d.cashIn - d.cashOut }))} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="net" name="Net Cash" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5, strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 7, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card glass border-dark-700/50 animate-fade-in">
        <h3 className="text-white font-bold mb-5 flex items-center gap-2">
          <span className="w-2 h-6 bg-gold-500 rounded-full inline-block" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: '/admin/loans/new', label: 'New Loan', icon: PlusCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { to: '/admin/cashflow', label: 'Add Cash', icon: Wallet, color: 'text-green-400', bg: 'bg-green-500/10' },
            { to: '/admin/expenses', label: 'Add Expense', icon: Receipt, color: 'text-red-400', bg: 'bg-red-500/10' },
            { to: '/admin/reports', label: 'View Reports', icon: ChartIcon, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map(({ to, label, icon: Icon, color, bg }) => (
            <Link key={to} to={to}
              className="flex flex-col items-center gap-3 p-5 bg-dark-800/80 hover:bg-dark-700 border border-dark-700/50 hover:border-dark-600 rounded-2xl transition-all shadow-sm hover:shadow-lg group">
              <span className={`p-3 rounded-2xl ${bg} ${color} group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 shadow-inner`}>
                <Icon className="w-6 h-6" />
              </span>
              <span className="text-dark-200 text-sm font-semibold group-hover:text-white transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
