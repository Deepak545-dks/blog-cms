import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Mail, 
  FileText, 
  Globe, 
  Lock, 
  Tag, 
  MessageSquare, 
  Loader2, 
  Plus, 
  ArrowRight 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalCategories: 0,
    totalComments: 0,
  });

  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch user stats
        const statsRes = await api.get('/blogs/stats');
        setStats(statsRes.data);

        // Fetch recent blogs
        const blogsRes = await api.get('/blogs/my-blogs', {
          params: { page: 1, limit: 3 }
        });
        setRecentBlogs(blogsRes.data.blogs || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Personalized Welcome Header */}
      <section className="glass-card p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Glow behind */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-2xl border-2 border-indigo-500/20 shadow-lg">
            {user?.profileImage ? (
              <img 
                src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`} 
                alt={user.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            {(!user?.profileImage || user.profileImage === '') && user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100">Welcome, {user?.name}!</h2>
              <span className="bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} />
                <span>Active Session</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1 flex items-center gap-1.5">
              <Mail size={12} className="text-slate-500" />
              <span>{user?.email}</span>
            </p>
            <p className="text-slate-400 text-xs mt-1 flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-500" />
              <span>Registered on: {formatDate(user?.createdAt)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-start gap-2 md:text-right border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Access Permission</div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold capitalize flex items-center gap-1">
            <ShieldCheck size={14} />
            <span>{user?.role} Access Granted</span>
          </span>
        </div>
      </section>

      {/* Statistics Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-3">
          <Loader2 size={30} className="animate-spin text-indigo-500" />
          <p className="text-xs font-medium tracking-wide">Crunching dashboard statistics...</p>
        </div>
      ) : (
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Total Blogs */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-3.5 col-span-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Blogs</p>
              <p className="text-xl font-extrabold text-slate-100 mt-0.5">{stats.totalBlogs}</p>
            </div>
          </div>

          {/* Card 2: Published */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-3.5 col-span-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Globe size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Published</p>
              <p className="text-xl font-extrabold text-slate-100 mt-0.5">{stats.publishedBlogs}</p>
            </div>
          </div>

          {/* Card 3: Drafts */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-3.5 col-span-1">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Drafts</p>
              <p className="text-xl font-extrabold text-slate-100 mt-0.5">{stats.draftBlogs}</p>
            </div>
          </div>

          {/* Card 4: Categories */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-3.5 col-span-1">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Tag size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Categories</p>
              <p className="text-xl font-extrabold text-slate-100 mt-0.5">{stats.totalCategories}</p>
            </div>
          </div>

          {/* Card 5: Comments */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 flex items-center space-x-3.5 col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Comments</p>
              <p className="text-xl font-extrabold text-slate-100 mt-0.5">{stats.totalComments}</p>
            </div>
          </div>

        </section>
      )}

      {/* Main dashboard content grids: Quick Actions & Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Blogs written */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-slate-300">My Recent Posts</h3>
            <Link to="/dashboard/my-blogs" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition">
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-8 text-center text-slate-500 text-xs">
              Loading recent articles...
            </div>
          ) : recentBlogs.length === 0 ? (
            <div className="glass-card border border-slate-800/80 rounded-2xl p-8 text-center space-y-3">
              <p className="text-slate-400 text-xs">You haven't written any posts yet.</p>
              <Link
                to="/dashboard/create-blog"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
              >
                <Plus size={12} />
                <span>Write Your First Post</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBlogs.map((blog) => (
                <div key={blog._id} className="glass-card border border-slate-800/60 hover:border-indigo-500/20 p-4 rounded-xl flex items-center justify-between gap-4 transition duration-200">
                  <div className="space-y-1 max-w-[70%]">
                    <h4 className="font-semibold text-slate-200 text-sm truncate">{blog.title}</h4>
                    <p className="text-xs text-slate-500 truncate">{blog.excerpt || 'No description preview available.'}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                      <span className="text-indigo-400 font-medium">/{blog.category}</span>
                      <span>•</span>
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${
                    blog.status === 'Published' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {blog.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-sm font-bold font-display text-slate-300">Quick Operations</h3>
          <div className="glass-card border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <Link
              to="/dashboard/create-blog"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold transition"
            >
              <span>✍️ Write a Blog Article</span>
              <ArrowRight size={12} className="text-slate-500" />
            </Link>
            
            <Link
              to="/dashboard/categories"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold transition"
            >
              <span>🏷️ Manage Category Folders</span>
              <ArrowRight size={12} className="text-slate-500" />
            </Link>

            <Link
              to="/dashboard/profile"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold transition"
            >
              <span>👤 Edit Account details</span>
              <ArrowRight size={12} className="text-slate-500" />
            </Link>

            <Link
              to="/blogs"
              className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/30 hover:border-indigo-800 text-xs text-indigo-300 font-semibold transition"
            >
              <span>🌐 Go to Public Portal</span>
              <ArrowRight size={12} className="text-indigo-400" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
