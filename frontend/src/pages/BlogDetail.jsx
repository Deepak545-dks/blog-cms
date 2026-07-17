import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  ArrowLeft, 

  Calendar, 
  User as UserIcon, 
  Loader2, 
  BookOpen, 
  Tag,
  Edit2,
  MessageSquare,
  Trash2,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import useSEO from '../hooks/useSEO';


const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);

  // SEO dynamic updates
  useSEO({
    title: blog ? blog.title : 'Loading Post...',
    description: blog ? blog.excerpt : 'Loading blog post detail page.',
    ogImage: blog?.featuredImage ? `http://localhost:5000${blog.featuredImage}` : undefined,
    canonicalUrl: blog ? `${window.location.origin}/blog/${blog.slug}` : undefined
  });

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);


  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/blogs/slug/${slug}`);
        setBlog(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load article');
        navigate('/blogs');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogDetail();
  }, [slug, navigate]);

  // Fetch comments once blog is loaded
  const fetchComments = async (blogId) => {
    try {
      setCommentsLoading(true);
      const { data } = await api.get(`/comments/blog/${blogId}`);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (blog?._id) {
      fetchComments(blog._id);
    }
  }, [blog?._id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setCommentSubmitting(true);
    try {
      await api.post('/comments', {
        blogId: blog._id,
        content: commentContent.trim(),
      });
      setCommentContent('');
      await fetchComments(blog._id);
      toast.success('Comment posted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete your comment?')) {
      try {
        await api.delete(`/comments/${commentId}`);
        setComments(comments.filter((c) => c._id !== commentId));
        toast.success('Comment deleted');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete comment');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 size={36} className="animate-spin text-indigo-500" />
        <p className="text-sm font-medium tracking-wide">Loading article content...</p>
      </div>
    );
  }

  if (!blog) return null;

  const isAuthor = user && (blog.author?._id === user._id || blog.author === user._id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="h-20 w-full flex items-center justify-between px-6 md:px-12 border-b border-slate-900/80 backdrop-blur-md z-10 bg-slate-950/70">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-extrabold font-display bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            📝 BlogCMS
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/blogs" className="text-sm font-medium text-slate-400 hover:text-white transition duration-200">
            Feed
          </Link>
          {isAuthor && (
            <Link
              to={`/dashboard/edit-blog/${blog._id}`}
              className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold border border-indigo-500/30 transition duration-200 flex items-center gap-1.5"
            >
              <Edit2 size={12} />
              <span>Edit Article</span>
            </Link>
          )}
        </div>
      </header>

      {/* Article Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 z-10 space-y-8">
        
        {/* Back Link */}
        <Link 
          to="/blogs" 
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Articles Feed</span>
        </Link>

        {/* Article Meta Header */}
        <div className="space-y-4">
          <span className="inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-300">
            <Tag size={10} />
            <span>{blog.category}</span>
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight tracking-tight text-slate-100">
            {blog.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-400 italic border-l-2 border-indigo-500 pl-4 font-light">
            {blog.excerpt}
          </p>

          {/* Author Block */}
          <div className="flex items-center space-x-3 pt-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm border border-indigo-500/20 shadow-md">
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
            <div>
              <p className="text-xs font-semibold text-slate-300">{blog.author?.name || 'Writer'}</p>
              <p className="text-[10px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
                <Calendar size={12} />
                <span>Published on {formatDate(blog.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Featured Image Banner */}
        {blog.featuredImage && (
          <div className="rounded-2xl overflow-hidden border border-slate-900 max-h-[380px] bg-slate-900/50 flex flex-col items-center justify-center shadow-xl relative w-full">
            {!imgLoaded && (
              <div className="w-full h-64 bg-slate-900 animate-pulse flex items-center justify-center text-xs text-slate-500 font-semibold font-mono">
                Loading featured image...
              </div>
            )}
            <img 
              src={blog.featuredImage.startsWith('http') ? blog.featuredImage : `http://localhost:5000${blog.featuredImage}`} 
              alt={blog.title} 
              className="w-full h-full object-cover"
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              style={{ display: imgLoaded ? 'block' : 'none' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                setImgLoaded(true);
              }}
            />
          </div>
        )}


        {/* Render HTML Body Content */}
        <div className="prose prose-invert max-w-none pt-4 pb-8 border-b border-slate-900">
          <div 
            dangerouslySetInnerHTML={{ __html: blog.content }} 
            className="rich-text-content space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed tracking-wide"
          />
        </div>

        {/* Tags Block */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="space-y-2 pt-2 pb-6 border-b border-slate-900/60">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {blog.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-xl font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center space-x-2 text-slate-300">
            <MessageSquare size={18} className="text-indigo-400" />
            <h3 className="text-lg font-bold font-display">
              Comments ({comments.length})
            </h3>
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handlePostComment} className="space-y-3">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Share your thoughts or leave feedback..."
                rows="3"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
                disabled={commentSubmitting}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={commentSubmitting || !commentContent.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {commentSubmitting && <Loader2 size={12} className="animate-spin" />}
                  <span>Post Comment</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-xs text-slate-400">
                You must be{' '}
                <Link to="/login" className="text-indigo-450 hover:text-indigo-400 font-semibold underline">
                  logged in
                </Link>{' '}
                to join the discussion and post a comment.
              </p>
            </div>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={24} className="animate-spin text-indigo-500" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => {
                const commentUser = comment.user || {};
                const isCommentOwner = user && (commentUser._id === user._id || commentUser === user._id);
                
                return (
                  <div
                    key={comment._id}
                    className="glass-card p-4 rounded-xl border border-slate-900/80 flex items-start justify-between gap-4 hover:border-slate-800/80 transition duration-150"
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs border border-indigo-500/20 shrink-0">
                        {commentUser.profileImage ? (
                          <img
                            src={commentUser.profileImage.startsWith('http') ? commentUser.profileImage : `http://localhost:5000${commentUser.profileImage}`}
                            alt={commentUser.name || 'User'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        {(!commentUser.profileImage || commentUser.profileImage === '') && (commentUser.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Content details */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-300">
                            {commentUser.name || 'Anonymous'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed break-words whitespace-pre-line">
                          {comment.content}
                        </p>
                      </div>
                    </div>

                    {isCommentOwner && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-slate-500 hover:text-red-400 p-1 hover:bg-red-500/10 border border-transparent hover:border-red-950/20 rounded-lg transition cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* Styled Rich Text Content Styling Inject */}
      <style>{`
        .rich-text-content h1 { font-size: 1.8em; font-weight: 800; font-family: 'Outfit', sans-serif; color: #f8fafc; margin-top: 1.2em; margin-bottom: 0.4em; }
        .rich-text-content h2 { font-size: 1.4em; font-weight: 700; font-family: 'Outfit', sans-serif; color: #f8fafc; margin-top: 1.2em; margin-bottom: 0.4em; }
        .rich-text-content h3 { font-size: 1.2em; font-weight: 600; font-family: 'Outfit', sans-serif; color: #f8fafc; margin-top: 1.2em; margin-bottom: 0.4em; }
        .rich-text-content p { color: #cbd5e1; margin-bottom: 0.8em; font-weight: 300; }
        .rich-text-content strong { color: #f8fafc; font-weight: 600; }
        .rich-text-content em { font-style: italic; color: #cbd5e1; }
        .rich-text-content u { text-decoration: underline; color: #cbd5e1; }
        .rich-text-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.8em; space-y: 0.2em; }
        .rich-text-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.8em; space-y: 0.2em; }
        .rich-text-content li { color: #cbd5e1; font-weight: 300; }
        .rich-text-content a { color: #6366f1; text-decoration: underline; transition: color 0.15s; }
        .rich-text-content a:hover { color: #818cf8; }
        .rich-text-content blockquote { border-left: 4px solid #4f46e5; padding-left: 1em; color: #94a3b8; font-style: italic; margin: 1.2em 0; }
        .rich-text-content img { border-radius: 12px; border: 1px solid #1e293b; max-width: 100%; height: auto; margin: 1em auto; display: block; }
      `}</style>

      {/* Footer */}
      <footer className="py-8 w-full border-t border-slate-900 text-center text-xs text-slate-500 z-10 bg-slate-950/50 mt-12">
        <p>&copy; {new Date().getFullYear()} BlogCMS Article Reader. Internship Layout.</p>
      </footer>
    </div>
  );
};

export default BlogDetail;
