import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import DataTable from '../components/DataTable';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);

      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/tickets?${params.toString()}`);
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-96 bg-slate-200 rounded"></div>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 uppercase italic">Ticket Management</h1>
            <p className="text-brand-500 font-mono text-sm tracking-widest uppercase opacity-80">Manage and track all support tickets</p>
          </div>
          {user?.role === 'CUSTOMER' && (
            <button
              onClick={() => navigate('/tickets/new')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              New Ticket
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <button
              onClick={() => fetchTickets()}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-brand-600 transition-colors z-10 cursor-pointer"
            >
              <Search size={18} />
            </button>
            <input
              type="text"
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING">Waiting</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="input-field"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </motion.div>

      <DataTable
        data={tickets}
        columns={[
          { key: 'subject', label: 'Subject' },
          { key: 'status', label: 'Status' },
          { key: 'priority', label: 'Priority' },
          { key: user?.role === 'CUSTOMER' ? 'assignedAgent' : 'customer', label: user?.role === 'CUSTOMER' ? 'Assigned To' : 'Customer' },
          { key: 'createdAt', label: 'Created' },
          { key: 'slaBreached', label: 'SLA' },
        ]}
        onRowClick={(row) => navigate(`/tickets/${row.id}`)}
      />
    </div>
  );
}

export default Tickets;
