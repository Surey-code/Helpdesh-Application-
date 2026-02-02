import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function NotificationsMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUnreadCount();
        // Poll for notifications every minute
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await api.get('/notifications/unread-count');
            setUnreadCount(data.count);
        } catch (err) {
            console.error('Failed to fetch unread count', err);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/notifications?limit=20');
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, status: 'READ' } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            toast.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/mark-all-read');
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, status: 'READ' }))
            );
            setUnreadCount(0);
            toast.success('All marked as read');
        } catch (err) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleNotificationClick = async (notification) => {
        if (notification.status === 'UNREAD') {
            await markAsRead(notification.id);
        }
        setIsOpen(false);

        if (notification.ticketId) {
            navigate(`/tickets/${notification.ticketId}`);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative p-2.5 rounded-xl transition-all duration-300
                    ${isOpen
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-brand-600 dark:hover:text-brand-500'
                    }
                `}
                title="Notifications"
            >
                <Bell size={20} className={unreadCount > 0 ? 'animate-tada' : ''} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-slate-800"></span>
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                    >
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-brand-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                    <Check size={14} /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 flex justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex gap-3 ${notification.status === 'UNREAD' ? 'bg-blue-50/30' : ''
                                                }`}
                                        >
                                            <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${notification.status === 'UNREAD' ? 'bg-brand-500' : 'bg-transparent'
                                                }`} />

                                            <div className="flex-1">
                                                <p className={`text-sm ${notification.status === 'UNREAD' ? 'font-semibold text-slate-900' : 'text-slate-700'
                                                    }`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-2">
                                                    {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                                                </p>
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

export default NotificationsMenu;
