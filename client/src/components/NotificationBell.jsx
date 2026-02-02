import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const ref = useRef(null);
  const navigate = useNavigate();
  const pollMs = 30000;

  const badge = useMemo(() => (unread > 9 ? '9+' : unread), [unread]);

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const fetchUnread = async () => {
    try {
      const r = await api.get('/notifications/unread-count');
      setUnread(r.data.count || 0);
    } catch {
      // silent
    }
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      const r = await api.get('/notifications?limit=15');
      setItems(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnread();
    const id = setInterval(fetchUnread, pollMs);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (open) fetchList();
  }, [open]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, status: 'READ' })));
      toast.success('All notifications marked as read');
    } catch (e) {
      console.error(e);
    }
  };

  const openItem = async (n) => {
    try {
      if (n.status === 'UNREAD') {
        await api.patch(`/notifications/${n.id}/read`);
        setUnread((u) => Math.max(0, u - 1));
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, status: 'READ' } : x))
        );
      }
    } finally {
      if (n.ticketId) {
        setOpen(false);
        navigate(`/tickets/${n.ticketId}`);
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {badge}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="font-semibold text-slate-900">Notifications</div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-sm text-brand-600 hover:text-brand-500 inline-flex items-center gap-1"
                  >
                    <CheckCheck size={16} />
                    Mark all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-sm text-slate-500">Loading…</div>
              ) : items.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">No notifications</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {items.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => openItem(n)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${n.status === 'UNREAD' ? 'bg-blue-50/40' : ''
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {n.title}
                          </div>
                          <div className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                            {n.message}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {formatDistanceToNow(new Date(n.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                        {n.status === 'UNREAD' && (
                          <span className="mt-1 w-2 h-2 bg-brand-600 rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
