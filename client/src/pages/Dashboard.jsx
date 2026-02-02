import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Ticket, AlertCircle, Clock, CheckCircle, Users, UserCheck, UserX } from 'lucide-react';
import { motion } from 'framer-motion';
import StatsCard from '../components/StatsCard';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  const AGENT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#06b6d4', '#10b981'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT'].includes(user?.role)) {
        const response = await api.get('/reports/dashboard');
        setStats(response.data);
        setAgentPerformance(response.data.agentPerformance || []);
      } else if (user?.role === 'CUSTOMER') {
        // Fetch customer's own tickets for dashboard
        const ticketsResponse = await api.get('/tickets');
        const tickets = ticketsResponse.data || []; // API returns array directly, not { tickets: [...] }

        // Calculate customer-specific stats
        const customerStats = {
          totalTickets: tickets.length,
          statusCounts: {
            OPEN: tickets.filter(t => t.status === 'OPEN').length,
            IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
            RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
            CLOSED: tickets.filter(t => t.status === 'CLOSED').length,
          },
          priorityCounts: {
            LOW: tickets.filter(t => t.priority === 'LOW').length,
            MEDIUM: tickets.filter(t => t.priority === 'MEDIUM').length,
            HIGH: tickets.filter(t => t.priority === 'HIGH').length,
            URGENT: tickets.filter(t => t.priority === 'URGENT').length,
          },
          recentTickets: tickets.slice(0, 5),
        };
        setStats(customerStats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (agentId, currentStatus) => {
    try {
      await api.put(`/users/${agentId}`, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update user status');
    }
  };

  if (loading) {
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

  const isManager = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 uppercase italic">Quantum Gateway</h1>
        <p className="text-brand-500 font-mono text-sm tracking-widest uppercase opacity-80">Welcome back, {user?.name}!</p>
      </motion.div>

      {isManager && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Tickets"
              value={stats.totalTickets || 0}
              icon={Ticket}
              color="brand"
              delay={0.1}
            />
            <StatsCard
              title="Open Tickets"
              value={stats.statusCounts?.OPEN || 0}
              icon={AlertCircle}
              color="brand-light"
              delay={0.2}
            />
            <StatsCard
              title="In Progress"
              value={stats.statusCounts?.IN_PROGRESS || 0}
              icon={Clock}
              color="brand"
              delay={0.3}
            />
            <StatsCard
              title="SLA Breached"
              value={stats.slaBreachedCount || 0}
              icon={AlertCircle}
              color="red"
              delay={0.4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tickets by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={Object.entries(stats.statusCounts || {}).map(([status, count]) => ({ status: status.replace('_', ' '), count }))}>
                  <defs>
                    <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
                  <XAxis dataKey="status" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} fontSize={11} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '12px' }}
                    itemStyle={{ color: '#2563eb' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorStatus)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tickets by Priority</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={Object.entries(stats.priorityCounts || {}).map(([priority, count]) => ({ priority, count }))}>
                  <defs>
                    <linearGradient id="colorPriority" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
                  <XAxis dataKey="priority" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} fontSize={11} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPriority)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tickets by Agent</h2>
                {isSuperAdmin && (
                  <Link to="/users" className="text-brand-500 hover:text-brand-400 text-xs font-mono uppercase tracking-widest">
                    Manage →
                  </Link>
                )}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={agentPerformance.filter(a => a.ticketCount > 0)}>
                  <defs>
                    <linearGradient id="colorAgent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} fontSize={10} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '12px' }}
                    itemStyle={{ color: '#8b5cf6' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ticketCount"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAgent)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </>
      )}

      {/* Agent Dashboard */}
      {user?.role === 'AGENT' && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="My Assigned"
              value={stats.totalTickets || 0}
              icon={Ticket}
              color="brand"
              delay={0.1}
            />
            <StatsCard
              title="Open"
              value={stats.statusCounts?.OPEN || 0}
              icon={AlertCircle}
              color="brand-light"
              delay={0.2}
            />
            <StatsCard
              title="In Progress"
              value={stats.statusCounts?.IN_PROGRESS || 0}
              icon={Clock}
              color="brand"
              delay={0.3}
            />
            <StatsCard
              title="Resolved"
              value={stats.statusCounts?.RESOLVED || 0}
              icon={CheckCircle}
              color="green"
              delay={0.4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Assigned Tickets by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={Object.entries(stats.statusCounts || {}).map(([status, count]) => ({ status: status.replace('_', ' '), count }))}>
                  <defs>
                    <linearGradient id="colorStatusAgent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
                  <XAxis dataKey="status" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} fontSize={11} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '12px' }}
                    itemStyle={{ color: '#2563eb' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorStatusAgent)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tickets by Priority</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={Object.entries(stats.priorityCounts || {}).map(([priority, count]) => ({ priority, count }))}>
                  <defs>
                    <linearGradient id="colorPriorityAgent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
                  <XAxis dataKey="priority" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} fontSize={11} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPriorityAgent)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </>
      )}

      {/* Customer Dashboard */}
      {user?.role === 'CUSTOMER' && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="My Tickets"
              value={stats.totalTickets || 0}
              icon={Ticket}
              color="brand"
              delay={0.1}
            />
            <StatsCard
              title="Open"
              value={stats.statusCounts?.OPEN || 0}
              icon={AlertCircle}
              color="brand-light"
              delay={0.2}
            />
            <StatsCard
              title="In Progress"
              value={stats.statusCounts?.IN_PROGRESS || 0}
              icon={Clock}
              color="brand"
              delay={0.3}
            />
            <StatsCard
              title="Resolved"
              value={stats.statusCounts?.RESOLVED || 0}
              icon={CheckCircle}
              color="green"
              delay={0.4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">My Tickets by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={Object.entries(stats.statusCounts || {}).map(([status, count]) => ({ status: status.replace('_', ' '), count }))}>
                  <defs>
                    <linearGradient id="colorStatusCustomer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
                  <XAxis dataKey="status" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} fontSize={11} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '12px' }}
                    itemStyle={{ color: '#2563eb' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorStatusCustomer)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">My Tickets by Priority</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={Object.entries(stats.priorityCounts || {}).map(([priority, count]) => ({ priority, count }))}>
                  <defs>
                    <linearGradient id="colorPriorityCustomer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
                  <XAxis dataKey="priority" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} fontSize={11} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPriorityCustomer)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Recent Tickets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Tickets</h2>
              <Link to="/tickets" className="text-brand-500 hover:text-brand-400 text-xs font-mono uppercase tracking-widest">
                View All →
              </Link>
            </div>
            {stats.recentTickets && stats.recentTickets.length > 0 ? (
              <div className="space-y-3">
                {stats.recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                    className="block p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{ticket.subject}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{ticket.description}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No tickets yet. <Link to="/new-ticket" className="text-brand-500 hover:underline">Create your first ticket</Link></p>
            )}
          </motion.div>
        </>
      )}


    </div>
  );
}

export default Dashboard;
