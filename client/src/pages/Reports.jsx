import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../utils/api';
import StatsCard from '../components/StatsCard';
import { Ticket, AlertCircle, Clock, CheckCircle } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#60a5fa', '#ef4444', '#8b5cf6'];

function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/dashboard?days=${timeRange}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!stats) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Tickets', stats.totalTickets],
      ['Open Tickets', stats.statusCounts?.OPEN || 0],
      ['In Progress', stats.statusCounts?.IN_PROGRESS || 0],
      ['SLA Breached', stats.slaBreachedCount],
      ['Avg Response Time (min)', stats.averageResponseTime ? Math.round(stats.averageResponseTime) : 0],
      ['Avg Resolution Time (min)', stats.averageResolutionTime ? Math.round(stats.averageResolutionTime) : 0],
      [''],
      ['Agent', 'Tickets Handled'],
      ...stats.agentPerformance.map(a => [a.name, a.ticketCount]),
      [''],
      ['Status Breakdown'],
      ...Object.entries(stats.statusCounts || {}).map(([s, c]) => [s, c]),
      [''],
      ['Priority Breakdown'],
      ...Object.entries(stats.priorityCounts || {}).map(([p, c]) => [p, c]),
    ];

    const csvString = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `report_${timeRange}days_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading && !stats) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statusData = Object.entries(stats.statusCounts || {}).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count,
  }));

  const priorityData = Object.entries(stats.priorityCounts || {}).map(([priority, count]) => ({
    name: priority,
    value: count,
  }));

  const filteredPerformance = (stats.agentPerformance || []).filter(agent => agent.ticketCount > 0);

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-800 dark:text-white mb-2 uppercase italic">Reports & Analytics</h1>
          <p className="text-brand-500 font-mono text-sm tracking-widest uppercase opacity-80">Comprehensive insights into ticket management</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${timeRange === days
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {days}D
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white text-xs font-bold uppercase transition-all group"
          >
            <Clock size={16} className="text-brand-500 group-hover:rotate-12 transition-transform" />
            Export CSV
          </button>
        </div>
      </motion.div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <StatsCard
          title="Total Tickets"
          value={stats.totalTickets || 0}
          icon={Ticket}
          color="brand"
        />
        <StatsCard
          title="Open Tickets"
          value={stats.statusCounts?.OPEN || 0}
          icon={AlertCircle}
          color="brand-light"
        />
        <StatsCard
          title="In Progress"
          value={stats.statusCounts?.IN_PROGRESS || 0}
          icon={Clock}
          color="brand"
        />
        <StatsCard
          title="SLA Breached"
          value={stats.slaBreachedCount || 0}
          icon={AlertCircle}
          color="red"
        />
        <StatsCard
          title="Avg Response"
          value={stats.averageResponseTime ? `${Math.round(stats.averageResponseTime)}m` : '0m'}
          icon={Clock}
          color="brand-light"
        />
        <StatsCard
          title="Avg Resolution"
          value={stats.averageResolutionTime ? `${Math.round(stats.averageResolutionTime)}m` : '0m'}
          icon={CheckCircle}
          color="brand"
        />
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Tickets by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} fontSize={12} />
              <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={12} />
              <Tooltip
                cursor={{ fill: '#2563eb', opacity: 0.1 }}
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#1e293b',
                  color: '#f1f5f9',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                itemStyle={{ color: '#2563eb' }}
                wrapperClassName="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-white"
              />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Tickets by Priority</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f1f5f9' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-xl overflow-hidden relative"
        >
          {/* Decorative background glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-8 relative">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-brand-500/10 rounded-xl">
                  <Ticket className="text-brand-500" size={24} />
                </div>
                User Performance Analysis
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-12">
                Real-time workload distribution across your team
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-300">Inactive</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={Math.max(400, (filteredPerformance.length) * 60)}>
            <BarChart
              data={filteredPerformance}
              layout="vertical"
              margin={{ left: 40, right: 60, top: 0, bottom: 0 }}
              barGap={10}
            >
              <defs>
                <linearGradient id="activeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="inactiveGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#f87171" stopOpacity={1} />
                </linearGradient>
                <filter id="shadow" x="0" y="0" width="200%" height="200%">
                  <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
                </filter>
              </defs>

              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" opacity={0.2} />
              <XAxis
                type="number"
                stroke="#64748b"
                axisLine={false}
                tickLine={false}
                fontSize={12}
                hide
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
                fontSize={13}
                width={140}
                tick={{ fill: 'currentColor', fontWeight: 500 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Agent Performance</p>
                        <p className="text-white font-bold text-lg">{data.name}</p>
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex justify-between gap-8">
                            <span className="text-slate-400 font-medium">Assigned Tickets</span>
                            <span className="text-brand-400 font-bold">{data.ticketCount}</span>
                          </div>
                          <div className="flex justify-between gap-8">
                            <span className="text-slate-400 font-medium">Status</span>
                            <span className={data.isActive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {data.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="ticketCount"
                radius={[0, 10, 10, 0]}
                barSize={32}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {filteredPerformance.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isActive ? 'url(#activeGradient)' : 'url(#inactiveGradient)'}
                    filter="url(#shadow)"
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

export default Reports;
