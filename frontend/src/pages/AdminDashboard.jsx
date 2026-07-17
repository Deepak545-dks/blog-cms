import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Users, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Activity, 
  Clock, 
  UserCheck, 
  Loader2, 
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const statsRes = await api.get('/admin/stats');
        const analyticsRes = await api.get('/admin/analytics');
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        toast.error('Failed to load administrative analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
        <Loader2 size={36} className="animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Aggregating Admin Console stats...</p>
      </div>
    );
  }

  // --- SVG CHART GENERATOR MATHS ---

  // 1. Line Chart: Blogs Created Per Month
  const renderLineChart = () => {
    const data = analytics?.blogsCreatedPerMonth || [];
    if (data.length === 0) return <div className="text-center text-slate-500 py-10 text-xs">No monthly data</div>;

    const width = 500;
    const height = 180;
    const padding = 30;

    const maxCount = Math.max(...data.map(d => d.count), 4);
    const getX = (index) => padding + (index * (width - padding * 2)) / (data.length - 1);
    const getY = (count) => height - padding - (count * (height - padding * 2)) / maxCount;

    // Build path line
    const points = data.map((d, i) => `${getX(i)},${getY(d.count)}`);
    const pathD = points.length > 0 ? `M ${points.join(' L ')}` : '';
    
    // Build gradient fill path
    const fillD = points.length > 0 
      ? `${pathD} L ${getX(data.length - 1)},${height - padding} L ${getX(0)},${height - padding} Z` 
      : '';

    return (
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * (height - padding * 2);
            const val = Math.round(maxCount * (1 - ratio));
            return (
              <g key={i}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  stroke="#1e293b" 
                  strokeWidth="1" 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={padding - 8} 
                  y={y + 4} 
                  fill="#64748b" 
                  fontSize="9" 
                  textAnchor="end"
                  className="font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Gradient Underfill */}
          {fillD && <path d={fillD} fill="url(#chartGradient)" />}

          {/* Main Draw Line */}
          {pathD && (
            <path 
              d={pathD} 
              fill="none" 
              stroke="#6366f1" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Dots on points */}
          {data.map((d, i) => (
            <g key={i} className="group/dot cursor-pointer">
              <circle 
                cx={getX(i)} 
                cy={getY(d.count)} 
                r="4.5" 
                fill="#f8fafc" 
                stroke="#4f46e5" 
                strokeWidth="2" 
              />
              {/* Tooltip on point count */}
              <text
                x={getX(i)}
                y={getY(d.count) - 10}
                fill="#818cf8"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-150"
              >
                {d.count}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {data.map((d, i) => (
            <text 
              key={i} 
              x={getX(i)} 
              y={height - 8} 
              fill="#64748b" 
              fontSize="9.5" 
              textAnchor="middle"
              className="font-semibold"
            >
              {d.month}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  // 2. Bar Chart: Horizontal Bar Chart showing stats counts
  const renderBarChart = (data = [], valueKey = '', labelKey = '', color = '#a78bfa') => {
    if (data.length === 0) return <div className="text-center text-slate-500 py-10 text-xs">No metrics data</div>;

    const maxVal = Math.max(...data.map(d => d[valueKey]), 1);

    return (
      <div className="space-y-3.5 py-2">
        {data.map((item, idx) => {
          const val = item[valueKey];
          const pct = Math.min((val / maxVal) * 100, 100);
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300 truncate max-w-[200px]" title={item[labelKey]}>
                  {item[labelKey]}
                </span>
                <span className="text-indigo-400 font-mono">{val}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                <div 
                  style={{ 
                    width: `${pct}%`,
                    backgroundColor: color 
                  }} 
                  className="h-full rounded-full transition-all duration-500 ease-out shadow"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100 flex items-center space-x-2">
          <TrendingUp className="text-indigo-500" size={24} />
          <span>System Analytics Panel</span>
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">Admin-only aggregate site statistics, audits, and performance indicators.</p>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Users */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
            <Users size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Users</div>
            <div className="text-2xl font-extrabold font-mono text-slate-100 mt-1">{stats?.totalUsers || 0}</div>
          </div>
        </div>

        {/* Total Blogs */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400">
            <BookOpen size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Blogs</div>
            <div className="text-2xl font-extrabold font-mono text-slate-100 mt-1">{stats?.totalBlogs || 0}</div>
          </div>
        </div>

        {/* Published Blogs */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
            <UserCheck size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Published</div>
            <div className="text-2xl font-extrabold font-mono text-slate-100 mt-1">{stats?.publishedBlogs || 0}</div>
          </div>
        </div>

        {/* Drafts */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Drafts</div>
            <div className="text-2xl font-extrabold font-mono text-slate-100 mt-1">{stats?.draftBlogs || 0}</div>
          </div>
        </div>

        {/* Total Pages */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <FileText size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pages</div>
            <div className="text-2xl font-extrabold font-mono text-slate-100 mt-1">{stats?.totalPages || 0}</div>
          </div>
        </div>

        {/* Total Comments */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-pink-400">
            <MessageSquare size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Comments</div>
            <div className="text-2xl font-extrabold font-mono text-slate-100 mt-1">{stats?.totalComments || 0}</div>
          </div>
        </div>
      </div>

      {/* Grid: Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart Panel */}
        <div className="lg:col-span-2 glass-panel border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Blogs Created Per Month</h3>
          <div className="pt-2">{renderLineChart()}</div>
        </div>

        {/* Bar Charts Panel */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-6 space-y-6">
          
          {/* Most Viewed */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
              <Eye size={12} className="text-indigo-400" />
              <span>Most Viewed Articles</span>
            </h3>
            {renderBarChart(analytics?.mostViewedBlogs, 'views', 'title', '#6366f1')}
          </div>

          {/* Most Commented */}
          <div className="space-y-3 pt-2 border-t border-slate-900">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
              <MessageSquare size={12} className="text-purple-400" />
              <span>Most Commented Articles</span>
            </h3>
            {renderBarChart(analytics?.mostCommentedBlogs, 'commentsCount', 'title', '#c084fc')}
          </div>

        </div>

      </div>

      {/* Grid: Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latest Registered Users */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-2">
            <Users size={14} className="text-indigo-400" />
            <span>Latest Registered Users</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-semibold uppercase">
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Email</th>
                  <th className="py-2.5">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {analytics?.newestUsers?.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/10">
                    <td className="py-3 font-semibold text-slate-200">{u.name}</td>
                    <td className="py-3 text-slate-400 font-mono">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                        u.role === 'admin' 
                          ? 'bg-indigo-950 border border-indigo-900 text-indigo-400' 
                          : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit / Recent Activity logs */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-2">
            <Activity size={14} className="text-purple-400" />
            <span>Recent Activity Logs</span>
          </h3>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
            {analytics?.recentActivity?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent actions logged</p>
            ) : (
              analytics?.recentActivity?.map((act, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs leading-relaxed">
                  <span className="text-lg leading-none pt-0.5">
                    {act.type === 'blog' ? '📝' : act.type === 'comment' ? '💬' : '🎨'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-200">{act.message}</p>
                    <time className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {new Date(act.time).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
