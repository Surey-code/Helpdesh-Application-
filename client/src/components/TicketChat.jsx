import { useState, useRef, useEffect } from 'react';
import { Send, Lock, Edit2, Trash2, X, Check, Bold, Italic, Smile, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

function TicketChat({ ticketId, comments: initialComments, onCommentAdded }) {
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('PUBLIC');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const { user } = useAuth();

  const canCreateInternal = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'MANAGER'].includes(user?.role);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await api.post(`/tickets/${ticketId}/comments`, {
        content: newComment,
        type: commentType,
      });

      setComments([...comments, response.data.comment]);
      setNewComment('');
      setCommentType('PUBLIC');
      toast.success('Comment added successfully');
      if (onCommentAdded) {
        onCommentAdded(response.data.comment);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const saveEdit = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      const response = await api.put(`/tickets/${ticketId}/comments/${commentId}`, {
        content: editContent,
      });

      setComments(comments.map((c) => (c.id === commentId ? response.data : c)));
      setEditingId(null);
      setEditContent('');
      toast.success('Comment updated');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const [deletingId, setDeletingId] = useState(null);

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/tickets/${ticketId}/comments/${deletingId}`);
      setComments(comments.filter((c) => c.id !== deletingId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  const insertFormatting = (prefix, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newComment.substring(start, end);
    const beforeText = newComment.substring(0, start);
    const afterText = newComment.substring(end);

    const newText = beforeText + prefix + selectedText + suffix + afterText;
    setNewComment(newText);

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText ? start + prefix.length + selectedText.length + suffix.length : start + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleBold = () => {
    insertFormatting('**', '**');
  };

  const handleItalic = () => {
    insertFormatting('*', '*');
  };

  const handleEmojiClick = (emojiObject) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = newComment.substring(0, start);
    const afterText = newComment.substring(start);

    const newText = beforeText + emojiObject.emoji + afterText;
    setNewComment(newText);
    setShowEmojiPicker(false);

    // Set cursor position after emoji
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emojiObject.emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Render markdown formatting (bold, italic)
  const renderMessage = (text) => {
    if (!text) return text;

    // Split by code-like patterns to avoid breaking them
    const parts = [];
    let lastIndex = 0;

    // Match **bold** and *italic* patterns
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }

      // Add formatted text
      if (match[1] !== undefined) {
        // Bold
        parts.push({ type: 'bold', content: match[1] });
      } else if (match[2] !== undefined) {
        // Italic
        parts.push({ type: 'italic', content: match[2] });
      }

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {comments.map((comment) => {
            const isInternal = comment.type === 'INTERNAL';
            const isOwn = comment.author.id === user?.id;

            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${isInternal
                    ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2 relative">
                    {comment.author.avatarUrl ? (
                      <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 bg-brand-600 dark:bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
                        {comment.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {comment.author.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    {isInternal && (
                      <Lock size={14} className="text-blue-600 dark:text-blue-500 ml-auto" />
                    )}

                    {!editingId && (isOwn || ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role)) && (
                      <div className={`flex gap-1 ${isInternal ? 'ml-2' : 'ml-auto'}`}>
                        <button
                          onClick={() => startEdit(comment)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-blue-400"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingId(comment.id)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-sm"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={cancelEdit}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={() => saveEdit(comment.id)}
                          className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600 dark:text-green-400"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {renderMessage(comment.content).map((part, idx) => {
                        if (part.type === 'bold') {
                          return <strong key={idx} className="font-bold">{part.content}</strong>;
                        } else if (part.type === 'italic') {
                          return <em key={idx} className="italic">{part.content}</em>;
                        } else {
                          return <span key={idx}>{part.content}</span>;
                        }
                      })}
                    </p>
                  )}

                  {isInternal && (
                    <p className="text-xs text-blue-600 dark:text-blue-500 mt-2 font-medium">
                      Internal Note
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        {canCreateInternal && (
          <div className="mb-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={commentType === 'INTERNAL'}
                onChange={(e) => setCommentType(e.target.checked ? 'INTERNAL' : 'PUBLIC')}
                className="rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700"
              />
              <span>Internal Note (only visible to agents/admins)</span>
            </label>
          </div>
        )}

        {/* Formatting Toolbar */}
        <div className="mb-2 flex items-center gap-1 relative">
          <button
            type="button"
            onClick={handleBold}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            title="Bold (wrap with **)"
          >
            <Bold size={18} />
          </button>
          <button
            type="button"
            onClick={handleItalic}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            title="Italic (wrap with *)"
          >
            <Italic size={18} />
          </button>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            title="Emoji"
          >
            <Smile size={18} />
          </button>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                width={350}
                height={400}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            rows={3}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-6 py-2 bg-brand-600 dark:bg-brand-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 self-end h-[86px]"
          >
            <Send size={18} />
            Send
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Comment?</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to delete this comment? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setDeletingId(null)}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TicketChat;
