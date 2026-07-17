import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight, Sparkles, Shield, Cpu, Code2 } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="h-20 w-full flex items-center justify-between px-6 md:px-12 border-b border-slate-900/80 backdrop-blur-md z-10 sticky top-0 bg-slate-950/70">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-extrabold font-display bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            📝 BlogCMS
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition duration-200 shadow-lg shadow-indigo-600/20"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition duration-200">
                Log In
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-semibold transition duration-200 shadow-lg shadow-indigo-500/20"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 z-10">
        <div className="max-w-3xl space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wider uppercase animate-pulse">
            <Sparkles size={14} />
            <span>Internship Project Foundation</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold font-display leading-tight tracking-tight">
            The Modern Foundation for <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Content Creators
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
            A production-ready content management system setup. Experience lightning fast dashboard management, advanced secure JWT authentication, and modular Node-Express architecture.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <Link 
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-xl shadow-indigo-600/25 flex items-center justify-center space-x-2 hover:scale-105 transition-all duration-300"
              >
                <span>Enter Admin Console</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link 
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-xl shadow-indigo-500/25 flex items-center justify-center space-x-2 hover:scale-105 transition-all duration-300"
                >
                  <span>Start Hosting for Free</span>
                  <ArrowRight size={18} />
                </Link>
                <Link 
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-800 transition duration-300"
                >
                  Explore Demo account
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Grid */}
        <section className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          {/* Card 1 */}
          <div className="glass-card p-8 rounded-2xl text-left hover:border-indigo-500/30 transition duration-300 group">
            <div className="w-12 h-12 bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <Shield size={22} />
            </div>
            <h3 className="text-lg font-bold font-display mb-2">Secure JWT Auth</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Uses cryptographically signed tokens (JWT) paired with bcrypt password hashing to safeguard endpoints and verify user identities.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-8 rounded-2xl text-left hover:border-purple-500/30 transition duration-300 group">
            <div className="w-12 h-12 bg-purple-950/80 border border-purple-500/30 text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <Cpu size={22} />
            </div>
            <h3 className="text-lg font-bold font-display mb-2">Modular Backend</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Built on Express.js with structured models, controllers, routers, and custom middleware handlers for clean file uploading and central error processing.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-8 rounded-2xl text-left hover:border-pink-500/30 transition duration-300 group">
            <div className="w-12 h-12 bg-pink-950/80 border border-pink-500/30 text-pink-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <Code2 size={22} />
            </div>
            <h3 className="text-lg font-bold font-display mb-2">Modern React Frontend</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              React + Vite utilizing Tailwind CSS v4 to deliver extremely fast compiles and a modern visual layout complete with toast notifications.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 w-full border-t border-slate-900 text-center text-xs text-slate-500 z-10 bg-slate-950/50">
        <p>&copy; {new Date().getFullYear()} BlogCMS Internship Project. Created with professional coding guidelines.</p>
      </footer>
    </div>
  );
};

export default Home;
