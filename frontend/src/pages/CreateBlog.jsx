import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Image as ImageIcon, Loader2, ArrowLeft, Save, Plus } from 'lucide-react';

const CreateBlog = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    tags: '',
    status: 'Draft',
  });

  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  // Fetch categories from database on load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    fetchCategories();
  }, []);


  // Quill editor configurations
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link',
    'image',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, featuredImage: 'Image size must be less than 2MB' });
        return;
      }
      setFeaturedImage(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.featuredImage) {
        setErrors({ ...errors, featuredImage: '' });
      }
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.title.trim()) tempErrors.title = 'Title is required';
    if (!formData.excerpt.trim()) tempErrors.excerpt = 'Excerpt is required';
    if (!formData.category) tempErrors.category = 'Category is required';
    if (!content.trim() || content === '<p><br></p>') tempErrors.content = 'Content is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please correct the validation errors');
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('excerpt', formData.excerpt);
    data.append('content', content);
    data.append('category', formData.category);
    data.append('tags', formData.tags);
    data.append('status', formData.status);
    if (featuredImage) {
      data.append('featuredImage', featuredImage);
    }

    try {
      await api.post('/blogs', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Blog post created successfully!');
      navigate('/dashboard/my-blogs');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create blog post';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link
            to="/dashboard/my-blogs"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-xl transition duration-200"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100">Create New Post</h2>
            <p className="text-slate-400 text-xs mt-0.5">Write and format a new blog entry using rich text.</p>
          </div>
        </div>
      </div>

      {/* Editor Form Card */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Fields (Left/Middle Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 md:p-8 space-y-5">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Post Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter title here..."
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition duration-200 ${
                  errors.title ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
                }`}
                disabled={isSubmitting}
              />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
            </div>

            {/* Excerpt */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Excerpt / Summary</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="3"
                placeholder="Provide a brief summary of the post..."
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition duration-200 ${
                  errors.excerpt ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
                }`}
                disabled={isSubmitting}
              ></textarea>
              {errors.excerpt && <p className="text-xs text-red-400 mt-1">{errors.excerpt}</p>}
            </div>

            {/* Content (Quill Editor) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Rich Content Body</label>
              <div className={`rounded-xl overflow-hidden bg-slate-900/30 border transition duration-200 ${
                errors.content ? 'border-red-500/50' : 'border-slate-800 focus-within:border-indigo-500'
              }`}>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  placeholder="Draft your thoughts here..."
                  className="bg-transparent text-slate-200"
                />
              </div>
              {errors.content && <p className="text-xs text-red-400 mt-1">{errors.content}</p>}
            </div>
          </div>
        </div>

        {/* Sidebar Settings (Right Column) */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold font-display text-slate-300 pb-2 border-b border-slate-800/80">Publishing Settings</h3>

            {/* Status Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 focus:outline-none transition duration-200"
                disabled={isSubmitting}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>

            {/* Category Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-slate-900/50 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition duration-200 ${
                  errors.category ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select Category...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category}</p>}
            </div>

            {/* Tags Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="tech, guide, setup"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition duration-200"
                disabled={isSubmitting}
              />
            </div>

            {/* Featured Image Uploader */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Featured Image</label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-48 flex items-center justify-center bg-slate-900/50">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedImage(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => document.getElementById('featuredImage').click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition duration-200 bg-slate-900/20 hover:bg-slate-900/40 ${
                      errors.featuredImage ? 'border-red-500/50 hover:border-red-500' : 'border-slate-800 hover:border-indigo-500/50'
                    }`}
                  >
                    <ImageIcon className="text-slate-500 mb-2" size={28} />
                    <span className="text-xs text-slate-400 font-medium">Click to select image</span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, WEBP (Max 2MB)</span>
                  </div>
                )}
                <input
                  type="file"
                  id="featuredImage"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              {errors.featuredImage && <p className="text-xs text-red-400 mt-1">{errors.featuredImage}</p>}
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating post...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Blog Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;
