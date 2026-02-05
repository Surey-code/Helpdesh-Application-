import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen } from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';

function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (search) params.append('search', search);

      const response = await api.get(`/kb?${params.toString()}`);
      setArticles(response.data);

      // Update categories only if we haven't set them yet or if we're viewing "All"
      if (!selectedCategory && !search) {
        setCategories([...new Set(response.data.map((a) => a.category))]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-200 rounded"></div>
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
        <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 uppercase italic">Knowledge Base</h1>
        <p className="text-brand-500 font-mono text-sm tracking-widest uppercase opacity-80">Browse helpful articles and guides</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <button
            onClick={() => fetchArticles()}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-brand-600 transition-colors z-10 cursor-pointer"
          >
            <Search size={18} />
          </button>
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchArticles()}
            className="input-field pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/kb/${article.id}`)}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-brand-500/10 rounded-lg">
                <BookOpen className="text-brand-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{article.title}</h3>
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                  {article.category}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
              {article.content.substring(0, 150)}...
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {format(new Date(article.createdAt), 'MMM dd, yyyy')}
            </p>
          </motion.div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-600">No articles found</p>
        </div>
      )}
    </div>
  );
}

export default KnowledgeBase;
