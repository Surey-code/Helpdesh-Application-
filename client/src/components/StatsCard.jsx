import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const StatsCard = ({ title, value, icon: Icon, color, delay }) => {
  return (
    <div
      className="glass-card p-6 relative overflow-hidden group hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Background Glow */}
      <div className={cn(
        "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
        color === "brand" && "bg-brand-500",
        color === "brand-light" && "bg-brand-300",
        color === "yellow" && "bg-brand-300",
        color === "red" && "bg-red-500",
        color === "green" && "bg-green-500",
      )} />

      <div className="relative z-10 font-bold">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{title}</h3>
        <div className="text-3xl text-slate-900 dark:text-white">{value}</div>
      </div>

      {/* Icon in bottom right */}
      {Icon && (
        <div className={cn(
          "absolute -bottom-4 -right-4 bg-opacity-10 p-4 rounded-full transform rotate-12 group-hover:scale-110 transition-transform duration-300",
          color === "brand" && "text-brand-500",
          color === "brand-light" && "text-brand-300",
          color === "yellow" && "text-brand-300",
          color === "red" && "text-red-500",
          color === "green" && "text-green-500",
        )}>
          <Icon size={64} strokeWidth={1.5} className="opacity-20" />
        </div>
      )}
    </div>
  );
};

export default StatsCard;