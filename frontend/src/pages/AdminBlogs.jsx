import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  Edit3, 
  Trash2, 
  Eye, 
  Loader2, 
  Check, 
  X, 
  Calendar,
  User
} from 'lucide-react';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllBlogs = async () => {
    try {
      setLoading(true);
      // Fetch list from standard get blogs endpoint with a high limit
      const { data } = await api.get('/blogs?limit=200');
      setBlogs(data.blogs || []);
    } catch (err) {
      toast.error('Failed to load system blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBlogs();
  }, []);

  const handleStatusToggle = async (blogId, currentStatus) => {
    const nextStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    try {
      await api.put(`/blogs/${blogId}`, { status: nextStatus });
      setBlogs(blogs.map(b => b._id === blogId ? { ...b, status: nextStatus } : b));
      toast.success(`Post status updated to ${nextStatus}`);
    } catch (err) {
      toast.error('Failed to update post status');
    }
  };

  const handleDelete = async (blogId, title) => {
    if (window.confirm(`Are you sure you want to delete blog post "${title}"?`)) {
      try {
        await api.delete(`/blogs/${blogId}`);
        setBlogs(blogs.filter(b => b._id !== blogId));
        toast.success('Blog article deleted successfully');
      } catch (err) {
        toast.error('Failed to delete blog article');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100 flex items-center space-x-2">
            <BookOpen className="text-indigo-500" size={24} />
            <span>Master Blog Articles Database</span>
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">Manage, review, publish, and delete any blog posts created on the CMS.</p>
        </div>
        <Link
          to="/dashboard/create-blog"
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-650/15"
        >
          <span>Write Blog Article</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
          <Loader2 size={36} className="animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Retrieving master blog articles list...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl mx-auto mb-4">
            📝
          </div>
          <h3 className="text-md font-bold font-display text-slate-350">No blog posts found</h3>
          <p className="text-slate-500 text-xs mt-1">There are no articles written in the database yet.</p>
        </div>
      ) : (
        <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800/80">
                  <th className="px-6 py-4">Title / Category</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {blogs.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-900/10 transition-colors">
                    {/* Title */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200 truncate max-w-xs">{b.title}</div>
                      <div className="inline-block px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500 text-[10px] mt-1 font-semibold">
                        {b.category}
                      </div>
                    </td>

                    {/* Author */}
                    <td className="px-6 py-4 text-xs text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <User size={12} className="text-slate-500" />
                        <span>{b.author?.name || 'Unknown'}</span>
                      </div>
                    </td>

                    {/* Views */}
                    <td className="px-6 py-4 font-mono text-xs text-slate-350">
                      {b.views || 0}
                    </td>

                    {/* Status Toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusToggle(b._id, b.status)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wide uppercase border transition cursor-pointer ${
                          b.status === 'Published'
                            ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/60'
                            : 'bg-amber-950/60 border-amber-500/30 text-amber-400 hover:bg-amber-900/60'
                        }`}
                      >
                        {b.status === 'Published' ? <Check size={10} /> : <X size={10} />}
                        <span>{b.status}</span>
                      </button>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <Calendar size={12} className="text-slate-500" />
                        <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          to={`/dashboard/edit-blog/${b._id}`}
                          className="p-1.5 text-indigo-400 hover:text-white bg-indigo-950/20 border border-indigo-900/30 hover:border-indigo-800 rounded-lg transition"
                          title="Edit Post"
                        >
                          <Edit3 size={12} />
                        </Link>
                        
                        <a
                          href={`/blog/${b.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition"
                          title="View Post"
                        >
                          <Eye size={12} />
                        </a>

                        <button
                          onClick={() => handleDelete(b._id, b.title)}
                          className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/30 hover:border-red-800 rounded-lg transition cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
