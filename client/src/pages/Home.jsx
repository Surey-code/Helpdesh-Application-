import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Ticket, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import DataTable from '../components/DataTable';
import api from '../utils/api';

function Home() {
    const { user } = useAuth();
    const [recentTickets, setRecentTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        try {
            if (['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT'].includes(user?.role)) {
                const response = await api.get('/reports/dashboard');
                // We only care about recent tickets for Home
                setRecentTickets(response.data.recentTickets || []);
            } else {
                // For customers, fetch their tickets
                const response = await api.get('/tickets');
                setRecentTickets(response.data.slice(0, 10));
            }
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
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

    return (
        <div className="p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 uppercase italic">Nexus Core</h1>
                <p className="text-brand-500 font-mono text-sm tracking-widest uppercase opacity-80">Welcome back, {user?.name}!</p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
                <Link to="/tickets/new" className="p-4 bg-brand-50/10 dark:bg-brand-900/10 hover:bg-brand-100/20 rounded-xl transition-colors border border-brand-500/20 flex flex-col items-center justify-center gap-2 group text-center">
                    <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Ticket size={20} />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">New Ticket</span>
                </Link>
                <Link to="/knowledge-base" className="p-4 bg-brand-50/10 dark:bg-brand-900/10 hover:bg-brand-100/20 rounded-xl transition-colors border border-brand-500/20 flex flex-col items-center justify-center gap-2 group text-center">
                    <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <CheckCircle size={20} />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Knowledge Base</span>
                </Link>
                <Link to="/tickets" className="p-4 bg-brand-50/10 dark:bg-brand-900/10 hover:bg-brand-100/20 rounded-xl transition-colors border border-brand-500/20 flex flex-col items-center justify-center gap-2 group text-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Clock size={20} />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Check Status</span>
                </Link>
                <Link to="/profile" className="p-4 bg-brand-50/10 dark:bg-brand-900/10 hover:bg-brand-100/20 rounded-xl transition-colors border border-brand-500/20 flex flex-col items-center justify-center gap-2 group text-center">
                    <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <AlertCircle size={20} />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">My Profile</span>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Tickets</h2>
                    <Link
                        to="/tickets"
                        className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                    >
                        View all →
                    </Link>
                </div>
                <DataTable
                    data={recentTickets}
                    columns={[
                        { key: 'subject', label: 'Subject' },
                        { key: 'status', label: 'Status' },
                        { key: 'priority', label: 'Priority' },
                        { key: 'createdAt', label: 'Created' },
                    ]}
                    onRowClick={(row) => window.location.href = `/tickets/${row.id}`}
                />
            </motion.div>
        </div>
    );
}

export default Home;
