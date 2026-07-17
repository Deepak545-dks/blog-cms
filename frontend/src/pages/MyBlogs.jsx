import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Globe, 
  Lock, 
  Loader2,
  Calendar,
  Tag,
  AlertTriangle
} from 'lucide-react';

const MyBlogs = () => {
  const navigate = useNavigate();
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categories, setCategories] = useState([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  // Fetch categories on load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch blogs based on query parameters
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
      };
      
      const { data } = await api.get('/blogs/my-blogs', { params });
      
      setBlogs(data.blogs);
      setTotalPages(data.totalPages);
      setTotalBlogs(data.totalBlogs);
    } catch (error) {
      toast.error('Failed to load your blog posts');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when page or status/category filters change
  useEffect(() => {
    fetchBlogs();
  }, [page, statusFilter, categoryFilter, searchTerm]);

  // Format date nicely
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Toggle publish status handler
  const handlePublishToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    try {
      const { data } = await api.put(`/blogs/${id}`, { status: nextStatus });
      setBlogs(blogs.map((b) => (b._id === id ? { ...b, status: data.status } : b)));
      toast.success(`Post is now marked as ${data.status}!`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Delete post handler
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.delete(`/blogs/${id}`);
        setBlogs(blogs.filter((b) => b._id !== id));
        toast.success('Blog post deleted successfully');
      } catch (error) {
        toast.error('Failed to delete blog post');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100">My Blogs</h2>
          <p className="text-slate-400 text-xs mt-0.5">Manage, edit, publish, or delete your posts.</p>
        </div>
        <Link
          to="/dashboard/create-blog"
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus size={16} />
          <span>Write New Post</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40 p-4 border border-slate-800 rounded-2xl">
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 rounded-xl text-slate-300 focus:outline-none transition duration-200 text-sm cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published Only</option>
            <option value="Draft">Drafts Only</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 rounded-xl text-slate-300 focus:outline-none transition duration-200 text-sm cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
          <Loader2 size={36} className="animate-spin text-indigo-500" />
          <p className="text-sm font-medium tracking-wide">Loading your posts database...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800">

          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl mx-auto mb-4">
            📂
          </div>
          <h3 className="text-md font-bold font-display text-slate-300">No matching posts found</h3>
          <p className="text-slate-500 text-xs mt-1">Try expanding your search parameters or write a new post.</p>
        </div>
      ) : (
        <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800/80">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date Created</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-slate-900/20 transition-colors">
                    {/* Title */}
                    <td className="px-6 py-4 max-w-xs md:max-w-md">
                      <div className="font-semibold text-slate-200 truncate">{blog.title}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{blog.excerpt}</div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                        <Tag size={10} className="text-slate-500" />
                        <span>{blog.category}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="text-slate-300 flex items-center space-x-1.5 text-xs">
                        <Calendar size={12} className="text-slate-500" />
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handlePublishToggle(blog._id, blog.status)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition duration-200 border cursor-pointer ${
                          blog.status === 'Published'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                        }`}
                        title="Click to toggle status"
                      >
                        {blog.status === 'Published' ? (
                          <>
                            <Globe size={12} />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <Lock size={12} />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        {blog.status === 'Published' && (
                          <Link
                            to={`/blog/${blog.slug}`}
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition"
                            title="View Public Post"
                          >
                            <Eye size={14} />
                          </Link>
                        )}
                        <Link
                          to={`/dashboard/edit-blog/${blog._id}`}
                          className="p-1.5 text-indigo-400 hover:text-indigo-300 bg-indigo-950/20 border border-indigo-900/30 hover:border-indigo-800 rounded-lg transition"
                          title="Edit Post"
                        >
                          <Edit3 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(blog._id, blog.title)}
                          className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/30 hover:border-red-800 rounded-lg transition cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-950/20 rounded-b-2xl">
              <span className="text-xs text-slate-400 font-medium">
                Showing Page {page} of {totalPages} ({totalBlogs} total articles)
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:hover:border-slate-800 text-xs text-slate-300 rounded-lg transition duration-200 cursor-pointer disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition duration-200 cursor-pointer ${
                      page === pNum
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:hover:border-slate-800 text-xs text-slate-300 rounded-lg transition duration-200 cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBlogs;
