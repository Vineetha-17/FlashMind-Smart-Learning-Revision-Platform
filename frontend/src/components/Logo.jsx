import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', link = true }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const textClasses = {
    sm: 'text-lg font-bold',
    md: 'text-xl font-extrabold',
    lg: 'text-3xl font-extrabold',
    xl: 'text-4xl font-black',
  };

  const content = (
    <div className="flex items-center gap-3 select-none">
      <div className="relative group">
        {/* Soft neon background glow */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 opacity-75 blur-sm group-hover:opacity-100 transition duration-300"></div>
        <img
          src="/logo.jpg"
          alt="FlashMind Logo"
          className={`relative rounded-full object-cover border-2 border-slate-900 ${sizeClasses[size]}`}
          onError={(e) => {
            // fallback if image not found
            e.target.src = 'https://img.icons8.com/clouds/100/owl.png';
          }}
        />
      </div>
      <span className={`tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-indigo-100 to-pink-200 ${textClasses[size]}`}>
        Flash<span className="text-indigo-400">Mind</span>
      </span>
    </div>
  );

  if (link) {
    return <Link to="/">{content}</Link>;
  }

  return content;
}

