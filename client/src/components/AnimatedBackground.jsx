import React from 'react';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  MessageSquare, 
  Users, 
  CheckCircle, 
  Server, 
  ShieldCheck 
} from 'lucide-react';

// Configuration for the floating icons (The "Tickets" and "Data")
const floatingIcons = [
  { Icon: Ticket, color: "text-blue-400", delay: 0 },
  { Icon: MessageSquare, color: "text-indigo-400", delay: 2 },
  { Icon: Users, color: "text-cyan-400", delay: 4 },
  { Icon: CheckCircle, color: "text-green-400", delay: 6 },
  { Icon: Server, color: "text-slate-400", delay: 8 },
  { Icon: ShieldCheck, color: "text-emerald-400", delay: 10 },
];

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50">
      
      {/* LAYER 1: The Technical Grid (Represents Infrastructure) */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* LAYER 2: Ambient Gradient Orbs (Represents "Active" Status) */}
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div 
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-0 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />

      {/* LAYER 3: Floating "Workflow" Icons (Represents Tickets/Process) */}
      <div className="absolute inset-0">
        {floatingIcons.map((item, index) => (
          <FloatingElement key={index} {...item} />
        ))}
        
        {/* Generate some random extra particles for "Data Dust" */}
        {[...Array(6)].map((_, i) => (
            <DataParticle key={`p-${i}`} delay={i * 1.5} />
        ))}
      </div>
      
      {/* Overlay to fade bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
    </div>
  );
};

// Sub-component for individual floating icons
const FloatingElement = ({ Icon, color, delay }) => {
  const randomX = Math.random() * 90; // Random horizontal position
  
  return (
    <motion.div
      initial={{ y: "110vh", x: `${randomX}vw`, opacity: 0, scale: 0.5 }}
      animate={{ 
        y: "-10vh", 
        opacity: [0, 1, 1, 0], 
        scale: [0.8, 1, 1, 0.8],
        rotate: [0, 10, -10, 0] 
      }}
      transition={{ 
        duration: 15 + Math.random() * 10, 
        repeat: Infinity,
        delay: delay,
        ease: "linear"
      }}
      className={`absolute ${color}`}
    >
      <Icon size={48} strokeWidth={1.5} opacity={0.2} />
    </motion.div>
  );
};

// Sub-component for small data dots
const DataParticle = ({ delay }) => {
  const randomX = Math.random() * 100;
  return (
    <motion.div
      initial={{ y: "100vh", x: `${randomX}vw`, opacity: 0 }}
      animate={{ y: "-10vh", opacity: [0, 0.6, 0] }}
      transition={{ 
        duration: 8 + Math.random() * 5, 
        repeat: Infinity, 
        delay: delay, 
        ease: "linear" 
      }}
      className="absolute w-2 h-2 bg-slate-300 rounded-full"
    />
  );
};

export default AnimatedBackground;