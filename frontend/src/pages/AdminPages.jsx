import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Trash2, 
  Edit3, 
  Eye, 
  Loader2, 
  Globe, 
  Calendar,
  User 
} from 'lucide-react';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllPages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/pages');
      setPages(data);
    } catch (err) {
      toast.error('Failed to load system builder pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPages();
  }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete page "${title}"?`)) {
      try {
        await api.delete(`/pages/${id}`);
        setPages(pages.filter((p) => p._id !== id));
        toast.success('Page layout deleted successfully');
      } catch (err) {
        toast.error('Failed to delete page');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100 flex items-center space-x-2">
          <FileText className="text-indigo-500" size={24} />
          <span>Master Builder Pages Console</span>
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">Manage, preview, inspect and delete any drag & drop canvas pages created by all users.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
          <Loader2 size={36} className="animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Retrieving master pages index...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl mx-auto mb-4">
            🎨
          </div>
          <h3 className="text-md font-bold font-display text-slate-350">No builder pages found</h3>
          <p className="text-slate-500 text-xs mt-1">There are no canvas pages currently registered in the database.</p>
        </div>
      ) : (
        <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800/80">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Author</th>
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
                      <div className="text-[10px] text-slate-500 mt-0.5">Holds {p.layout?.length || 0} layout blocks</div>
                    </td>

                    {/* Author */}
                    <td className="px-6 py-4 text-xs text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <User size={12} className="text-slate-500" />
                        <span>{p.author?.name || 'Unknown'}</span>
                      </div>
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
                      <div className="text-slate-400 flex items-center space-x-1.5 text-xs">
                        <Calendar size={12} className="text-slate-500" />
                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          to={`/dashboard/page-builder/edit/${p._id}`}
                          className="px-3 py-1.5 text-indigo-400 hover:text-white bg-indigo-950/20 border border-indigo-900/30 hover:border-indigo-800 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                          title="Design Layout"
                        >
                          <Edit3 size={12} />
                          <span>Design Layout</span>
                        </Link>
                        
                        <a
                          href={`/page/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition"
                          title="View Live Page"
                        >
                          <Eye size={12} />
                        </a>

                        <button
                          onClick={() => handleDelete(p._id, p.title)}
                          className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/30 hover:border-red-800 rounded-lg transition cursor-pointer"
                          title="Delete Page Layout"
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

export default AdminPages;
