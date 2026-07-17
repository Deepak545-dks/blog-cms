import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Loader2, 
  X, 
  Layers, 
  Globe, 
  Calendar 
} from 'lucide-react';

const PageBuilderList = () => {
  const navigate = useNavigate();

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
  });

  const fetchPages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/pages');
      setPages(data);
    } catch (err) {
      toast.error('Failed to load builder pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openCreateModal = () => {
    setFormData({ title: '', slug: '' });
    setError('');
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Page title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/pages', formData);
      toast.success('Page created successfully!');
      setModalOpen(false);
      // Navigate straight to the canvas builder for this page!
      navigate(`/dashboard/page-builder/edit/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create page');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete page "${title}"?`)) {
      try {
        await api.delete(`/pages/${id}`);
        setPages(pages.filter((p) => p._id !== id));
        toast.success('Page deleted successfully');
      } catch (err) {
        toast.error('Failed to delete page');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100">Page Builder Console</h2>
          <p className="text-slate-400 text-xs mt-0.5">Design custom landing pages and static website sections.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus size={16} />
          <span>Create New Page</span>
        </button>
      </div>

      {/* Pages Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
          <Loader2 size={36} className="animate-spin text-indigo-500" />
          <p className="text-sm font-medium tracking-wide">Loading page list...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl mx-auto mb-4">
            🎨
          </div>
          <h3 className="text-md font-bold font-display text-slate-300">No builder pages found</h3>
          <p className="text-slate-500 text-xs mt-1">Design your first landing layout by clicking the button above.</p>
        </div>
      ) : (
        <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800/80">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Slug / Link</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {pages.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-900/10 transition-colors">
                    {/* Title */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">{p.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Layout holds {p.layout?.length || 0} block elements</div>
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4">
                      <a 
                        href={`/page/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-xs font-semibold hover:bg-indigo-900/40 transition duration-200"
                      >
                        <Globe size={12} />
                        <span>/page/{p.slug}</span>
                      </a>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="text-slate-350 flex items-center space-x-1.5 text-xs">
                        <Calendar size={12} className="text-slate-500" />
                        <span>{formatDate(p.createdAt)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          to={`/dashboard/page-builder/edit/${p._id}`}
                          className="px-3 py-1.5 text-indigo-400 hover:text-white bg-indigo-950/20 border border-indigo-900/30 hover:border-indigo-800 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                          title="Edit Layout Canvas"
                        >
                          <Edit3 size={12} />
                          <span>Design Layout</span>
                        </Link>
                        
                        <a
                          href={`/page/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition"
                          title="View Live Site"
                        >
                          <Eye size={13} />
                        </a>

                        <button
                          onClick={() => handleDelete(p._id, p.title)}
                          className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/30 hover:border-red-800 rounded-lg transition cursor-pointer"
                          title="Delete Page"
                        >
                          <Trash2 size={13} />
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

      {/* Create Page Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl shadow-2xl relative overflow-hidden p-6 md:p-8 space-y-6">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 hover:bg-slate-900/80 border border-transparent hover:border-slate-800 rounded-lg transition"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-lg font-bold font-display text-slate-100">Create Builder Page</h3>
              <p className="text-slate-400 text-xs mt-0.5">Initialize a blank canvas page to design layouts.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Page Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Page Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. About Our Project"
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
                  disabled={isSubmitting}
                />
              </div>

              {/* Page Slug */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Custom Slug <span className="text-[10px] text-slate-500 font-medium">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none text-xs font-semibold font-mono">
                    /page/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="about-project"
                    className="w-full pl-[56px] pr-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition duration-200 text-sm font-mono"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating canvas...</span>
                  </>
                ) : (
                  <>
                    <Layers size={16} />
                    <span>Create Page & Launch Builder</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageBuilderList;
