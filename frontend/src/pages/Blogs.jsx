import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  ArrowRight, 
  Calendar, 
  User as UserIcon, 
  Loader2, 
  Sparkles,
  BookOpen,
  Tag,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

const Blogs = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamQuery = searchParams.get('search') || '';

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filters
  const [searchTerm, setSearchTerm] = useState(searchParamQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [categories, setCategories] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  // Sync state if navbar triggers search change
  useEffect(() => {
    setSearchTerm(searchParamQuery);
    setPage(1);
  }, [searchParamQuery]);

  // Fetch categories on mount
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

  // Fetch blogs on criteria change
  const fetchPublishedBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9, // Grid of 3x3 works beautifully
        search: searchTerm,
        category: selectedCategory,
        sort: sortOrder,
      };

      const { data } = await api.get('/blogs', { params });
      setBlogs(data.blogs || []);
      setTotalPages(data.totalPages || 1);
      setTotalBlogs(data.totalBlogs || 0);
    } catch (error) {
      console.error('Failed to load published blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishedBlogs();
  }, [page, selectedCategory, sortOrder, searchTerm]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ search: searchTerm });
  };

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="h-20 w-full flex items-center justify-between px-6 md:px-12 border-b border-slate-900/80 backdrop-blur-md z-10 sticky top-0 bg-slate-950/70">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-extrabold font-display bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            📝 BlogCMS
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-sm font-medium text-slate-400 hover:text-white transition duration-200">
            Home
          </Link>
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition duration-200 shadow-lg shadow-indigo-600/20"
            >
              Console
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition duration-200 shadow-lg shadow-indigo-600/20"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Content Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 z-10 space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight tracking-tight">
            Latest <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Articles</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Discover community guides, coding journals, and tech publications.
          </p>
        </div>

        {/* Search and Filters Layout */}
        <div className="bg-slate-900/40 p-5 border border-slate-800 rounded-2xl space-y-4 max-w-4xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search articles by title, tags or contents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Filters Selectors */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-slate-800/50">
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <SlidersHorizontal size={14} className="text-slate-500" />
              <span>Filter Parameters</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="px-3 py-1.5 bg-slate-950/60 border border-slate-800 text-slate-300 text-xs rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>

              {/* Sort Order Selector */}
              <select
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
                className="px-3 py-1.5 bg-slate-950/60 border border-slate-800 text-slate-300 text-xs rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Bar (Quick Select) */}
        {!loading && categories.length > 0 && (
          <div className="flex items-center justify-center flex-wrap gap-2 pb-4">
            <button
              onClick={() => handleCategorySelect('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition duration-200 cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition duration-200 cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
            <Loader2 size={36} className="animate-spin text-indigo-500" />
            <p className="text-sm font-medium tracking-wide">Loading published articles...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center border border-dashed border-slate-800 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl mx-auto mb-4">
              🔎
            </div>
            <h3 className="text-md font-bold font-display text-slate-300">No published posts</h3>
            <p className="text-slate-500 text-xs mt-1">Try refining your search terms or filter constraints.</p>
          </div>
        ) : (
          /* Cards Grid */
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <article 
                  key={blog._id} 
                  className="glass-card rounded-2xl overflow-hidden flex flex-col hover:border-slate-700/80 transition duration-300 group hover:translate-y-[-2px] shadow-xl"
                >
                  {/* Featured Image */}
                  <div className="h-48 overflow-hidden bg-slate-900 flex items-center justify-center relative border-b border-slate-900">
                    {blog.featuredImage ? (
                      <img 
                        src={blog.featuredImage.startsWith('http') ? blog.featuredImage : `http://localhost:5000${blog.featuredImage}`} 
                        alt={blog.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none'; // hide and show fallback
                        }}
                      />
                    ) : null}
                    {(!blog.featuredImage || blog.featuredImage === '') && (
                      <div className="flex flex-col items-center justify-center text-slate-600">
                        <BookOpen size={36} className="mb-2" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">No featured cover</span>
                      </div>
                    )}
                    {/* Category Pill */}
                    <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-md">
                      <Tag size={10} className="text-indigo-400" />
                      <span>{blog.category}</span>
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <Link to={`/blog/${blog.slug}`}>
                        <h3 className="text-lg font-bold font-display text-slate-200 group-hover:text-indigo-400 transition duration-200 line-clamp-2">
                          {blog.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>

                    {/* Metadata and Author */}
                    <div className="pt-4 border-t border-slate-900/80 flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs border border-indigo-500/20">
                          {blog.author?.profileImage ? (
                            <img 
                              src={blog.author.profileImage.startsWith('http') ? blog.author.profileImage : `http://localhost:5000${blog.author.profileImage}`} 
                              alt={blog.author.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : null}
                          {(!blog.author?.profileImage || blog.author.profileImage === '') && blog.author?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-300 truncate">{blog.author?.name || 'Writer'}</p>
                          <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                            <Calendar size={10} />
                            <span>{formatDate(blog.createdAt)}</span>
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/blog/${blog.slug}`}
                        className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-600/20 border border-indigo-900/30 rounded-lg transition duration-200"
                      >
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-6 border-t border-slate-900/85">
                <span className="text-xs text-slate-400 font-medium">
                  Showing page {page} of {totalPages} ({totalBlogs} articles)
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:hover:border-slate-800 rounded-lg text-slate-300 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
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
                    className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:hover:border-slate-800 rounded-lg text-slate-300 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 w-full border-t border-slate-900 text-center text-xs text-slate-500 z-10 bg-slate-950/50 mt-12">
        <p>&copy; {new Date().getFullYear()} BlogCMS Project Feed. Internship CRUD base.</p>
      </footer>
    </div>
  );
};

export default Blogs;
