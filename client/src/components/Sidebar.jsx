import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  FileText,
  Users,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  Home,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';

const menuItems = {
  SUPER_ADMIN: [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tickets', label: 'Tickets', icon: Ticket },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/knowledge-base', label: 'Knowledge Base', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
  ],
  ADMIN: [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tickets', label: 'Tickets', icon: Ticket },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/knowledge-base', label: 'Knowledge Base', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
  ],
  MANAGER: [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tickets', label: 'Tickets', icon: Ticket },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/knowledge-base', label: 'Knowledge Base', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
  ],
  AGENT: [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tickets', label: 'Tickets', icon: Ticket },
    { path: '/knowledge-base', label: 'Knowledge Base', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
  ],
  CUSTOMER: [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tickets', label: 'My Tickets', icon: Ticket },
    { path: '/knowledge-base', label: 'Knowledge Base', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
  ],
};

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const items = menuItems[user?.role] || [];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? '256px' : '80px',
        }}
        className="hidden lg:flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen fixed left-0 top-0 z-40 transition-colors duration-200"
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <motion.div
            initial={false}
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <h1 className="text-xl font-bold text-brand-600 dark:text-brand-500">Helpdesk</h1>
          </motion.div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">

          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center rounded-xl transition-all duration-200 group
                  ${isOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'}
                  ${isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                `}
              >
                <Icon size={24} className="shrink-0" />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {
          user?.role === 'CUSTOMER' && (
            <div className="p-4 border-t border-slate-200">
              <Link
                to="/tickets/new"
                className="flex items-center gap-3 px-4 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                <Plus size={20} />
                <motion.span
                  initial={false}
                  animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  New Ticket
                </motion.span>
              </Link>
            </div>
          )
        }

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className={`flex items-center mb-2 ${isOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'}`}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full border-2 border-brand-500 object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{user?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 rounded-xl transition-all w-full ${isOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'}`}
          >
            <LogOut size={22} className="shrink-0" />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap font-medium"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h1 className="text-xl font-bold text-brand-600 dark:text-brand-500">Helpdesk</h1>
            </div>
            <nav className="p-4 space-y-2">

              {items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-500 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            {user?.role === 'CUSTOMER' && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <Link
                  to="/tickets/new"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                  <Plus size={20} />
                  <span>New Ticket</span>
                </Link>
              </div>
            )}
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white font-medium shrink-0">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors w-full"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )
        }
      </AnimatePresence>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
          />
        )}
      </AnimatePresence>

      {/* Spacer for desktop sidebar */}
      <div className="hidden lg:block" style={{ width: isOpen ? '256px' : '80px' }} />
    </>
  );
}

export default Sidebar;
