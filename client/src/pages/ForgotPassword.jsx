import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success('Reset link sent!');
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error('Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 relative transition-colors duration-200">
            <Link
                to="/"
                className="absolute top-4 left-4 p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:shadow-md transition-all text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-blue-400"
                title="Back to Home"
            >
                <Home size={24} />
            </Link>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700"
            >
                <Link to="/login" className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-blue-400 mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to Login
                </Link>

                {submitted ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            We have sent a password reset link to <strong className="text-slate-900 dark:text-white">{email}</strong>.
                        </p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-brand-600 font-medium hover:underline"
                        >
                            Didn't receive the email? Click to retry
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-blue-100 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Mail size={24} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Forgot Password?</h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                No worries, we'll send you reset instructions.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
}

export default ForgotPassword;
