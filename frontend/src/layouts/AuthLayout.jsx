import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 overflow-hidden px-4 py-12">
      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <span className="text-3xl font-extrabold font-display bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-purple-300 transition duration-300">
              📝 BlogCMS
            </span>
          </Link>
          <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide uppercase">
            Creative Content Platform
          </p>
        </div>

        {/* Card containing nested route forms (Login/Register) */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]"></div>
          <Outlet />
        </div>

        {/* Footnote */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-slate-500 hover:text-indigo-400 transition-colors duration-200">
            &larr; Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
