import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const shortcuts = [
  { key: 'K', description: 'Open search / Quick actions', action: 'search' },
  { key: 'N', description: 'New ticket', action: 'new-ticket', roles: ['CUSTOMER'] },
  { key: 'D', description: 'Go to dashboard', action: 'dashboard' },
  { key: 'T', description: 'Go to tickets', action: 'tickets' },
  { key: 'R', description: 'Go to reports', action: 'reports', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
  { key: 'K', description: 'Knowledge base', action: 'kb' },
  { key: 'Esc', description: 'Close modals / Cancel', action: 'escape' },
];

function KeyboardShortcuts({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const filteredShortcuts = shortcuts.filter(
    (s) => !s.roles || s.roles.includes(user?.role)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Command size={24} className="text-brand-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {filteredShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <span className="text-slate-700">{shortcut.description}</span>
                    <kbd className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-700 shadow-sm">
                      {shortcut.key === 'K' ? 'Ctrl + K' : shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Press <kbd className="px-2 py-1 bg-slate-100 rounded text-xs">Esc</kbd> to close
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default KeyboardShortcuts;
