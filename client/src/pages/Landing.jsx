import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Shield, Clock, Zap, CheckCircle, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Landing() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative selection:bg-teal-500 selection:text-white">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-500/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
                <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-slate-800/30 blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <MessageCircle className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        HelpDesk
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <Link
                            to="/home"
                            className="px-5 py-2.5 bg-white text-slate-900 rounded-full font-semibold text-sm hover:bg-brand-50 transition-all shadow-lg hover:shadow-brand-500/10 flex items-center gap-2"
                        >
                            <LayoutDashboard size={16} /> GO TO APP
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                LOGIN
                            </Link>
                            <Link
                                to="/login"
                                state={{ isRegister: true }}
                                className="px-5 py-2.5 bg-white text-slate-900 rounded-full font-semibold text-sm hover:bg-brand-50 transition-all shadow-lg hover:shadow-brand-500/10 flex items-center gap-2"
                            >
                                REGISTER <ArrowRight size={16} />
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-20 pb-32 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-6">
                            <Zap size={12} /> New Generation Support
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-8">
                            Support Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-600">
                                Customers
                            </span>{' '}
                            Better
                        </h1>
                        <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed">
                            Streamline your support workflow with our intelligent helpdesk via
                            email, chat, and self-service knowledge base. Experience the future of customer care.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            {user ? (
                                <Link
                                    to="/home"
                                    className="px-8 py-4 bg-gradient-to-r from-brand-500 to-blue-600 rounded-full font-bold text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105 transition-all flex items-center justify-center gap-2"
                                >
                                    <LayoutDashboard size={20} /> Go to Home
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        state={{ isRegister: true }}
                                        className="px-8 py-4 bg-gradient-to-r from-brand-500 to-blue-600 rounded-full font-bold text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105 transition-all flex items-center justify-center gap-2"
                                    >
                                        Start Free Trial
                                    </Link>
                                    <Link
                                        to="/login"
                                        state={{ isDemo: true }}
                                        className="px-8 py-4 bg-slate-800/50 border border-slate-700/50 rounded-full font-bold text-white hover:bg-slate-800 transition-all backdrop-blur-sm"
                                    >
                                        View Live Demo
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="mt-12 flex items-center gap-6 text-slate-500 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-brand-500" /> No credit card required
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-brand-500" /> 14-day free trial
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side Visuals (Glass Cards) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Main Glass Card */}
                        <div className="relative z-20 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <MessageCircle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Live Support</h3>
                                        <p className="text-xs text-slate-400">Active Now</p>
                                    </div>
                                </div>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-700`} />
                                    ))}
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-800 bg-brand-500 flex items-center justify-center text-[10px] font-bold">
                                        +5
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0" />
                                        <div className="space-y-2 w-full">
                                            <div className="h-2 w-1/4 bg-slate-700 rounded" />
                                            <div className="h-2 w-3/4 bg-slate-700/50 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Floating Action Button */}
                            <div className="absolute -right-6 -bottom-6 bg-gradient-to-br from-brand-400 to-blue-600 p-4 rounded-xl shadow-lg shadow-brand-500/30">
                                <Shield className="text-white w-8 h-8" />
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -top-10 -right-10 bg-slate-800/60 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-xl z-10"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <CheckCircle className="text-green-400 w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Ticket Resolved</p>
                                    <p className="font-bold text-white">#1024</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                            className="absolute -bottom-8 -left-8 bg-slate-800/60 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-xl z-30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Clock className="text-blue-400 w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Avg. Response</p>
                                    <p className="font-bold text-white">15 mins</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="mt-32 max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
                        <p className="text-slate-400">Powerful features to manage your customer support</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Ticket Management", icon: MessageCircle, desc: "Organize and prioritize support requests efficiently." },
                            { title: "Knowledge Base", icon: Shield, desc: "Self-service articles to help customers help themselves." },
                            { title: "SLA Automation", icon: Zap, desc: "Never miss a deadline with automated SLA tracking." }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-slate-800/20 border border-slate-700/50 hover:bg-slate-800/40 hover:border-brand-500/30 transition-all group">
                                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="text-brand-400 w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Landing;
