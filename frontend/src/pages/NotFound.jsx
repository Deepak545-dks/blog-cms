import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-md mx-auto">
        <span className="text-[120px] font-extrabold font-display leading-none bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          404
        </span>
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold font-display text-slate-200">Lost In Space</h2>
          <p className="text-sm text-slate-500">
            The page you are looking for has been moved, renamed, or does not exist in this portal.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-350 rounded-xl transition duration-200 shadow-md cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Return Home</span>
        </Link>
      </div>

      <footer className="py-6 border-t border-slate-900 text-center text-[10px] text-slate-500">
        <p>&copy; {new Date().getFullYear()} BlogCMS. System error index.</p>
      </footer>
    </div>
  );
};

export default NotFound;
