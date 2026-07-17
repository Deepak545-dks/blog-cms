import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
  Trash2, 
  Loader2, 
  ExternalLink,
  Calendar,
  User,
  BookOpen
} from 'lucide-react';

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/comments');
      setComments(data);
    } catch (err) {
      toast.error('Failed to load site comments list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to permanently delete this comment?')) {
      try {
        await api.delete(`/admin/comments/${commentId}`);
        setComments(comments.filter(c => c._id !== commentId));
        toast.success('Comment deleted successfully');
      } catch (err) {
        toast.error('Failed to delete comment');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100 flex items-center space-x-2">
          <MessageSquare className="text-indigo-500" size={24} />
          <span>Comments Moderation Panel</span>
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">Moderate and delete comments across all blogs to filter spam or offensive contents.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
          <Loader2 size={36} className="animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading comments index...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl mx-auto mb-4">
            💬
          </div>
          <h3 className="text-md font-bold font-display text-slate-350">No comments found</h3>
          <p className="text-slate-500 text-xs mt-1">There are no comments posted in the database.</p>
        </div>
      ) : (
        <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800/80">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Comment Content</th>
                  <th className="px-6 py-4">Target Blog</th>
                  <th className="px-6 py-4">Posted Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {comments.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-900/10 transition-colors">
                    {/* User profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-400 overflow-hidden">
                          {c.user?.profileImage ? (
                            <img 
                              src={`http://localhost:5000${c.user.profileImage}`} 
                              alt={c.user?.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            c.user?.name?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{c.user?.name || 'Anonymous'}</div>
                          <div className="text-[10px] text-slate-500">{c.user?.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Content */}
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-slate-300 break-words leading-relaxed">{c.content}</p>
                    </td>

                    {/* Blog link */}
                    <td className="px-6 py-4">
                      {c.blog ? (
                        <a 
                          href={`/blog/${c.blog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          <BookOpen size={12} />
                          <span className="truncate max-w-[120px]">{c.blog.title}</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-slate-500 text-xs italic">Deleted post</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <Calendar size={12} className="text-slate-500" />
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/30 hover:border-red-800 rounded-lg transition cursor-pointer"
                          title="Delete Comment"
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
    </div>
  );
};

export default AdminComments;
