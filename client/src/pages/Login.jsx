import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, User, ChevronDown, MessageCircle, Zap, Network, Ticket, Home } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function Login() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (location.state?.isRegister) {
      setIsLogin(false);
    } else if (location.state?.isDemo) {
      setIsLogin(true);
      setFormData(prev => ({
        ...prev,
        email: 'demo@helpdesk.com',
        password: 'demo_password_123',
        role: 'MANAGER' // Show Manager role for demo
      }));
      toast('Demo credentials pre-filled!', {
        icon: '🚀',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  }, [location.state]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Advanced Helpdesk-themed animations
  const ticketCards = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      rotation: Math.random() * 20 - 10,
      delay: Math.random() * 3,
      duration: 15 + Math.random() * 10,
      priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'][Math.floor(Math.random() * 4)],
    }));
  }, []);

  const networkNodes = useMemo(() => {
    const nodes = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    // Create connections between nearby nodes
    const connections = [];
    nodes.forEach((node, i) => {
      nodes.slice(i + 1).forEach((otherNode, j) => {
        const distance = Math.sqrt(
          Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
        );
        if (distance < 30 && connections.length < 15) {
          connections.push({
            from: node,
            to: otherNode,
            id: `conn-${i}-${j}`,
          });
        }
      });
    });
    return { nodes, connections };
  }, []);

  const chatBubbles = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 8 + Math.random() * 4,
      size: 40 + Math.random() * 60,
    }));
  }, []);

  const dataStreams = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      endX: Math.random() * 100,
      endY: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
    }));
  }, []);

  const circuitPatterns = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      rotation: Math.random() * 360,
      delay: Math.random() * 2,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        login(response.data.user, response.data.token);
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        login(response.data.user, response.data.token);
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Force light mode for login page
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => {
      // Restore theme preference when leaving login page
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" style={{ backgroundColor: '#f8fafc' }}>
      {/* Advanced Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Link
          to="/"
          className="absolute top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors text-slate-600 hover:text-brand-600"
          title="Back to Home"
        >
          <Home size={24} />
        </Link>
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Network Connection Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {networkNodes.connections.map((conn) => (
          <motion.line
            key={conn.id}
            x1={`${conn.from.x}%`}
            y1={`${conn.from.y}%`}
            x2={`${conn.to.x}%`}
            y2={`${conn.to.y}%`}
            stroke="url(#connectionGradient)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {/* Network Nodes */}
      {networkNodes.nodes.map((node) => (
        <motion.div
          key={`node-${node.id}`}
          className="absolute w-3 h-3 rounded-full bg-blue-600/20 border border-blue-400/60"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: node.delay,
            ease: 'easeInOut',
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-400"
            animate={{
              scale: [1, 2, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: node.delay,
            }}
          />
        </motion.div>
      ))}

      {/* Floating Ticket Cards */}
      {ticketCards.map((ticket) => {
        const priorityColors = {
          LOW: 'from-green-400/20 to-green-500/20',
          MEDIUM: 'from-blue-400/20 to-blue-500/20',
          HIGH: 'from-blue-400/20 to-blue-500/20',
          URGENT: 'from-red-400/20 tshadow-brand-500/20',
        };

        return (
          <motion.div
            key={`ticket-${ticket.id}`}
            className={`absolute bg-gradient-to-br ${priorityColors[ticket.priority]} backdrop-blur-sm border border-white/20 rounded-lg shadow-lg`}
            style={{
              width: '120px',
              height: '80px',
              left: `${ticket.left}%`,
              top: `${ticket.top}%`,
              transform: `rotate(${ticket.rotation}deg)`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              rotate: [ticket.rotation, ticket.rotation + 5, ticket.rotation],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: ticket.duration,
              repeat: Infinity,
              delay: ticket.delay,
              ease: 'easeInOut',
            }}
          >
            <div className="p-2 h-full flex flex-col justify-between">
              <div className="flex items-center gap-1">
                <Ticket className="w-3 h-3 text-blue-600/60" />
                <span className="text-[8px] font-semibold text-slate-700/60">#{1000 + ticket.id}</span>
              </div>
              <div className="text-[7px] text-slate-600/50 truncate">Support Request</div>
              <div className={`text-[6px] px-1 py-0.5 rounded ${ticket.priority === 'URGENT' ? 'bg-brand-500/20' : 'bg-blue-500/30'} text-slate-700/60 w-fit`}>
                {ticket.priority}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Chat Bubbles */}
      {chatBubbles.map((bubble) => (
        <motion.div
          key={`bubble-${bubble.id}`}
          className="absolute rounded-full bg-blue-400/15 backdrop-blur-sm border border-blue-300/20 flex items-center justify-center"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
            top: `${bubble.top}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            delay: bubble.delay,
            ease: 'easeInOut',
          }}
        >
          <MessageCircle className="w-4 h-4 text-blue-500/40" />
        </motion.div>
      ))}

      {/* Data Stream Particles */}
      {dataStreams.map((stream) => (
        <motion.div
          key={`stream-${stream.id}`}
          className="absolute w-1 h-1 rounded-full bg-blue-400/60"
          style={{
            left: `${stream.startX}%`,
            top: `${stream.startY}%`,
          }}
          animate={{
            left: [`${stream.startX}%`, `${stream.endX}%`],
            top: [`${stream.startY}%`, `${stream.endY}%`],
            opacity: [0, 1, 1, 0],
            scale: [0, 1.5, 1.5, 0],
          }}
          transition={{
            duration: stream.duration,
            repeat: Infinity,
            delay: stream.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Circuit Board Patterns */}
      {circuitPatterns.map((circuit) => (
        <motion.svg
          key={`circuit-${circuit.id}`}
          className="absolute opacity-10"
          style={{
            left: `${circuit.left}%`,
            top: `${circuit.top}%`,
            width: '200px',
            height: '200px',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            rotate: [circuit.rotation, circuit.rotation + 360],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            delay: circuit.delay,
            ease: 'linear',
          }}
        >
          <path
            d="M 20 20 L 80 20 L 80 80 L 20 80 Z M 100 40 L 180 40 M 100 60 L 180 60"
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="20" cy="20" r="3" fill="#3b82f6" />
          <circle cx="80" cy="80" r="3" fill="#3b82f6" />
        </motion.svg>
      ))}

      {/* Animated Tech Grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
          animate={{
            backgroundPosition: ['0 0', '60px 60px'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Pulsing Energy Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-400/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Data Flow Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" style={{ zIndex: 1 }}>
        {Array.from({ length: 8 }, (_, i) => (
          <motion.path
            key={`flow-${i}`}
            d={`M ${20 + i * 10} 0 Q ${50 + i * 5} ${50 + i * 10} ${80 + i * 5} 100`}
            stroke="#3b82f6"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {/* Floating Icons - Helpdesk Related */}
      {[
        { icon: Zap, delay: 0, duration: 6, left: 15, top: 20 },
        { icon: Network, delay: 1, duration: 8, left: 85, top: 30 },
        { icon: MessageCircle, delay: 2, duration: 7, left: 10, top: 70 },
        { icon: Ticket, delay: 1.5, duration: 9, left: 90, top: 75 },
      ].map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={`icon-${i}`}
            className="absolute text-blue-400/20"
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              delay: item.delay,
              ease: 'easeInOut',
            }}
          >
            <Icon size={32} />
          </motion.div>
        );
      })}

      {/* Animated Status Indicators */}
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div
          key={`status-${i}`}
          className="absolute w-2 h-2 rounded-full bg-green-400/60"
          style={{
            left: `${20 + i * 15}%`,
            top: `${10 + (i % 2) * 80}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6],
            boxShadow: [
              '0 0 0 0 rgba(34, 197, 94, 0.4)',
              '0 0 0 10px rgba(34, 197, 94, 0)',
              '0 0 0 0 rgba(34, 197, 94, 0.4)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 glass-card p-8 w-full max-w-md shadow-2xl backdrop-blur-xl bg-white border border-slate-200"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-600 to-blue-600 rounded-full mb-4 shadow-lg"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <LogIn className="text-white" size={32} />
            </motion.div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2"
          >
            Helpdesk
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-600"
          >
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field pl-10 transition-all"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: isLogin ? 0.5 : 0.6 }}
          >
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              </motion.div>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field pl-10 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: isLogin ? 0.6 : 0.7 }}
          >
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              </motion.div>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field pl-10 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex justify-end mt-1">
              {isLogin && (
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </Link>
              )}
            </div>
          </motion.div>

          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                </motion.div>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input-field pl-10 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: isLogin ? 0.7 : 0.8 }}
          >
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </label>
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 z-10" size={18} />
              </motion.div>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <motion.select
                whileFocus={{ scale: 1.02 }}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-field pl-10 pr-10 appearance-none cursor-pointer bg-white transition-all"
                required
              >
                <option value="CUSTOMER">Customer</option>
                <option value="AGENT">Agent</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </motion.select>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-primary py-3 disabled:opacity-50 relative overflow-hidden"
          >
            <motion.span
              className="relative z-10"
              animate={loading ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 1.5, repeat: loading ? Infinity : 0 }}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
            </motion.span>
            {!loading && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 text-center"
        >
          <motion.button
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'CUSTOMER' });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
