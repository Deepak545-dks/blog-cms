import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2, FolderPlus, Loader2, X, Tag, FileText } from 'lucide-react';

const Categories = () => {
  const { user } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories on load
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || '' });
    setError('');
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Edit category
        const { data } = await api.put(`/categories/${editingCategory._id}`, formData);
        setCategories(categories.map((c) => (c._id === editingCategory._id ? data : c)));
        toast.success('Category updated successfully');
      } else {
        // Add category
        const { data } = await api.post('/categories', formData);
        setCategories([...categories, data]);
        toast.success('Category created successfully');
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await api.delete(`/categories/${id}`);
        setCategories(categories.filter((c) => c._id !== id));
        toast.success('Category deleted successfully');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const isUserAdmin = user && user.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100">Category Management</h2>
          <p className="text-slate-400 text-xs mt-0.5">Manage tags and categories used to organize articles.</p>
        </div>
        {/* Only admins can manage categories, or users in general internship setup, let's permit everyone inside dashboard but denote role checks */}
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
          <Loader2 size={36} className="animate-spin text-indigo-500" />
          <p className="text-sm font-medium tracking-wide">Loading categories feed...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl mx-auto mb-4">
            🏷️
          </div>
          <h3 className="text-md font-bold font-display text-slate-300">No categories found</h3>
          <p className="text-slate-500 text-xs mt-1">Add your first category tag to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-slate-700/80 transition duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                  <Tag size={12} />
                  <span>/{cat.slug}</span>
                </span>
                <h3 className="text-lg font-bold font-display text-slate-200">{cat.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-900/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">
                  Created {new Date(cat.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-600/20 border border-indigo-900/30 rounded-lg transition cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id, cat.name)}
                    className="p-1.5 text-red-400 hover:text-white hover:bg-red-600/20 border border-red-900/30 rounded-lg transition cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
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
              <h3 className="text-lg font-bold font-display text-slate-100">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                {editingCategory ? 'Update category fields.' : 'Register a new catalog category tag.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. React Programming"
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
                  disabled={isSubmitting}
                />
              </div>

              {/* Category Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe category contents..."
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
                  disabled={isSubmitting}
                ></textarea>
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
                    <span>Saving changes...</span>
                  </>
                ) : (
                  <>
                    <FolderPlus size={16} />
                    <span>{editingCategory ? 'Update Details' : 'Create Category'}</span>
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

export default Categories;
