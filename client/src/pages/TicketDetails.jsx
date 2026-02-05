import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Paperclip, User, Calendar, AlertCircle, Clock, History, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import TicketChat from '../components/TicketChat';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

const statusColors = {
  OPEN: 'text-emerald-600 dark:text-emerald-400',
  IN_PROGRESS: 'text-blue-600 dark:text-blue-400',
  WAITING: 'text-indigo-600 dark:text-indigo-400',
  RESOLVED: 'text-slate-600 dark:text-slate-400',
  CLOSED: 'text-slate-500 dark:text-slate-500',
};

const priorityColors = {
  LOW: 'text-slate-500',
  MEDIUM: 'text-blue-600 dark:text-blue-400',
  HIGH: 'text-blue-600 dark:text-blue-400',
  URGENT: 'text-red-600 dark:text-red-400',
};

function CountdownTimer({ targetDate, isBreached, isResolved }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    if (isResolved && !isBreached) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const difference = target - now;

      if (difference <= 0 || isBreached) {
        setTimeLeft('SLA Breached');
        setIsCritical(true);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      if (hours < 1) setIsCritical(true);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [targetDate, isBreached, isResolved]);

  if (isResolved && !isBreached) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-sm shadow-sm transition-all",
      isCritical ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900/50" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50"
    )}>
      <Clock size={16} className={cn(isCritical && "animate-pulse")} />
      <span>{timeLeft}</span>
    </div>
  );
}

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('conversation');
  const [agents, setAgents] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    fetchTicket();
    if (['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role)) {
      fetchAgents();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'history') fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id]);

  const fetchTicket = async () => {
    try {
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('Failed to fetch ticket');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await api.get('/users');
      setAgents(response.data.filter((u) => ['AGENT', 'ADMIN'].includes(u.role)));
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await api.get(`/tickets/${id}/events`);
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching ticket history:', error);
      toast.error('Failed to load ticket history');
    } finally {
      setEventsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/tickets/${id}`, { status: newStatus });
      setTicket({ ...ticket, status: newStatus });
      toast.success('Ticket status updated');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAssignAgent = async (agentId) => {
    try {
      await api.put(`/tickets/${id}`, { assignedAgentId: agentId || null });
      await fetchTicket();
      toast.success('Agent assigned successfully');
    } catch (error) {
      console.error('Error assigning agent:', error);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await api.put(`/tickets/${id}`, { priority: newPriority });
      setTicket({ ...ticket, priority: newPriority });
      toast.success('Ticket priority updated');
    } catch (error) {
      console.error('Error updating priority:', error);
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

  if (!ticket) {
    return null;
  }

  const canEdit = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'MANAGER'].includes(user?.role);
  const canAssign = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role);

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft size={20} />
          Back to Tickets
        </button>

        <div className="glass-card p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{ticket.subject}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{ticket.customer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {ticket.sla && (
                <CountdownTimer
                  targetDate={new Date(new Date(ticket.createdAt).getTime() + ticket.sla.resolutionTimeMinutes * 60000)}
                  isBreached={ticket.slaBreached}
                  isResolved={ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'}
                />
              )}
              <span
                className={cn(
                  'text-sm font-semibold',
                  statusColors[ticket.status]
                )}
              >
                {ticket.status.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold',
                  priorityColors[ticket.priority]
                )}
              >
                {ticket.priority.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
              </span>
            </div>
          </div>

          <p className="text-slate-700 dark:text-slate-300 mb-6 whitespace-pre-wrap">{ticket.description}</p>

          {canEdit && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                <div className="relative">
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="input-field pr-10 appearance-none bg-none"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING">Waiting</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                <div className="relative">
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className="input-field pr-10 appearance-none bg-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                </div>
              </div>
              {canAssign && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assign Agent</label>
                  <div className="relative">
                    <select
                      value={ticket.assignedAgentId || ''}
                      onChange={(e) => handleAssignAgent(e.target.value)}
                      className="input-field pr-10 appearance-none bg-none"
                    >
                      <option value="">Unassigned</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="glass-card">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('conversation')}
                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'conversation'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                Conversation
              </button>
              <button
                onClick={() => setActiveTab('attachments')}
                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'attachments'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Attachments ({ticket.attachments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'history'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                History
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'conversation' && (
              <div style={{ height: '600px' }}>
                <TicketChat
                  ticketId={id}
                  comments={ticket.comments}
                  onCommentAdded={fetchTicket}
                />
              </div>
            )}

            {activeTab === 'attachments' && (
              <div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                      await api.post(`/attachments/${id}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      toast.success('File uploaded successfully');
                      await fetchTicket();
                    } catch (error) {
                      console.error('Error uploading file:', error);
                    }
                  }}
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 btn-primary cursor-pointer mb-4"
                >
                  <Paperclip size={18} />
                  Upload File
                </label>

                <div className="space-y-2">
                  {ticket.attachments?.length > 0 ? (
                    ticket.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Paperclip size={20} className="text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{attachment.fileName}</p>
                            <p className="text-sm text-slate-500">
                              {format(new Date(attachment.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <a
                          href={`http://localhost:5000${attachment.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Download
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8">No attachments</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {eventsLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-14 bg-slate-200 rounded" />
                    ))}
                  </div>
                ) : events.length === 0 ? (
                  <p className="text-slate-500 text-center py-10">No history yet</p>
                ) : (
                  <ol className="relative border-s border-slate-200 dark:border-slate-700 ms-3 space-y-6">
                    {events.map((ev) => {
                      let meta = {};
                      try {
                        meta = ev.meta ? JSON.parse(ev.meta) : {};
                      } catch {
                        meta = {};
                      }

                      const when = format(new Date(ev.createdAt), 'MMM dd, yyyy HH:mm');

                      const titleByType = {
                        TICKET_CREATED: 'Ticket created',
                        STATUS_CHANGED: 'Status updated',
                        PRIORITY_CHANGED: 'Priority updated',
                        ASSIGNED: 'Assigned',
                        UNASSIGNED: 'Unassigned',
                        COMMENT_ADDED: 'Comment added',
                        ATTACHMENT_ADDED: 'Attachment added',
                      };

                      const iconByType = {
                        TICKET_CREATED: History,
                        STATUS_CHANGED: Clock,
                        PRIORITY_CHANGED: AlertCircle,
                        ASSIGNED: User,
                        UNASSIGNED: User,
                        COMMENT_ADDED: History,
                        ATTACHMENT_ADDED: Paperclip,
                      };

                      const Icon = iconByType[ev.type] || History;

                      const detail = (() => {
                        if (ev.type === 'STATUS_CHANGED') return `${meta.from ?? ''} → ${meta.to ?? ''}`;
                        if (ev.type === 'PRIORITY_CHANGED') return `${meta.from ?? ''} → ${meta.to ?? ''}`;
                        if (ev.type === 'ASSIGNED') return meta.to ? 'Assigned to an agent' : 'Assigned';
                        if (ev.type === 'UNASSIGNED') return 'Removed assignment';
                        if (ev.type === 'COMMENT_ADDED') return meta.commentType ? `${meta.commentType} comment` : 'Comment';
                        if (ev.type === 'TICKET_CREATED') return meta.priority ? `Priority: ${meta.priority}` : '';
                        return '';
                      })();

                      return (
                        <li key={ev.id} className="ms-6">
                          <span className={cn(
                            "absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-brand-600",
                            ev.type === 'COMMENT_ADDED' && meta.commentType === 'PRIVATE_NOTE'
                              ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30'
                              : 'bg-blue-50 border border-blue-200 text-brand-600'
                          )}>
                            <Icon size={14} />
                          </span>
                          <div className="glass-card p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                  {titleByType[ev.type] || ev.type}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {ev.actor?.name ? `${ev.actor.name} • ` : ''}{when}
                                </p>
                                {detail ? (
                                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 flex items-center gap-2">
                                    {detail}
                                    {ev.type === 'COMMENT_ADDED' && meta.commentType === 'PRIVATE_NOTE' && (
                                      <Lock size={14} className="text-blue-600 dark:text-blue-500 ml-auto" />
                                    )}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default TicketDetails;
