import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationsMenu from './NotificationsMenu';
import { useTheme } from '../contexts/ThemeContext';

function Layout() {
  const { theme } = useTheme();

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 ${theme === 'dark' ? 'dark' : ''}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header for Mobile/Notifications */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0 z-10 transition-colors duration-200">
          <div className="flex items-center gap-4 md:hidden">
            {/* Mobile menu trigger could go here */}
            <span className="font-bold text-xl text-brand-600 dark:text-brand-500">Helpdesk</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <NotificationsMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
