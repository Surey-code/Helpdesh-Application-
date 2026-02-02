import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';

function ArticleDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticle();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchArticle = async () => {
        try {
            const response = await api.get(`/kb/${id}`);
            setArticle(response.data);
        } catch (error) {
            console.error('Error fetching article:', error);
            navigate('/knowledge-base');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-800 rounded w-1/4"></div>
                    <div className="h-64 bg-slate-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (!article) return null;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <button
                    onClick={() => navigate('/knowledge-base')}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Knowledge Base
                </button>

                <div className="glass-card p-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-full text-sm font-medium">
                            {article.category}
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{article.title}</h1>

                    <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 text-sm mb-8 pb-8 border-b border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            {format(new Date(article.createdAt), 'MMMM dd, yyyy')}
                        </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                        {article.content.split('\n').map((paragraph, idx) => (
                            <p key={idx} className="mb-4 text-justify leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default ArticleDetails;
