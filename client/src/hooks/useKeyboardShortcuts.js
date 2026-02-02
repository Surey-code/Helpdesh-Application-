import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useKeyboardShortcuts = (onSearchOpen) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onSearchOpen?.();
        return;
      }

      // Don't trigger shortcuts when typing in inputs
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Ctrl+N or Cmd+N for new ticket (only for customers)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && user?.role === 'CUSTOMER') {
        e.preventDefault();
        navigate('/tickets/new');
        return;
      }

      // Ctrl+D or Cmd+D for dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        navigate('/');
        return;
      }

      // Ctrl+T or Cmd+T for tickets
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        navigate('/tickets');
        return;
      }

      // Ctrl+R or Cmd+R for reports (only for admins/managers)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === 'r' &&
        ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role)
      ) {
        e.preventDefault();
        navigate('/reports');
        return;
      }

      // Ctrl+K or Cmd+K for knowledge base
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !e.shiftKey) {
        e.preventDefault();
        navigate('/knowledge-base');
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, user, onSearchOpen]);
};
