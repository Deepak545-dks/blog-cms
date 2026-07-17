import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, ArrowLeft, BookOpen, Globe } from 'lucide-react';

const PublicPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicPage = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/pages/slug/${slug}`);
        setPage(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Page not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicPage();
  }, [slug]);

  // Helper to parse YouTube link
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 size={36} className="animate-spin text-indigo-500" />
        <p className="text-sm font-medium tracking-wide">Loading custom layout...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-500/25 flex items-center justify-center text-red-400 text-3xl shadow-lg">
            ⚠️
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-200">Layout Not Found</h2>
            <p className="text-sm text-slate-500 max-w-sm">
              The page "/page/{slug}" does not exist or has been deleted from our database.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition duration-200 shadow-md"
          >
            <ArrowLeft size={14} />
            <span>Return to Landing</span>
          </Link>
        </div>
        <footer className="py-6 border-t border-slate-900 text-center text-[10px] text-slate-500">
          <p>&copy; {new Date().getFullYear()} BlogCMS Page Builder.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="h-20 w-full flex items-center justify-between px-6 md:px-12 border-b border-slate-900/80 backdrop-blur-md z-10 bg-slate-950/70 sticky top-0">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-extrabold font-display bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            📝 BlogCMS
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/blogs" className="text-sm font-medium text-slate-400 hover:text-white transition duration-200">
            Feed
          </Link>
          <Link 
            to="/login" 
            className="px-5 py-2 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold transition"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* RENDER CANVAS CONTAINER */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 z-10 space-y-6">
        {page.layout && page.layout.length > 0 ? (
          page.layout.map((block) => (
            <div key={block.id} className="w-full">
              {block.type === 'heading' && (
                <h2 
                  style={{ 
                    fontSize: block.fontSize || '32px', 
                    textAlign: block.align || 'center', 
                    color: block.color || '#f8fafc' 
                  }}
                  className="font-bold tracking-tight leading-tight w-full break-words"
                >
                  {block.text}
                </h2>
              )}

              {block.type === 'paragraph' && (
                <p 
                  style={{ 
                    fontSize: block.fontSize || '16px', 
                    color: block.color || '#cbd5e1',
                    textAlign: block.align || 'left'
                  }}
                  className="leading-relaxed w-full break-words whitespace-pre-line"
                >
                  {block.text}
                </p>
              )}

              {block.type === 'image' && (
                <div className="flex items-center justify-center overflow-hidden">
                  {block.url && (
                    <img 
                      src={block.url} 
                      alt="Visual layout block" 
                      style={{ 
                        width: block.width || '100%', 
                        height: block.height || 'auto',
                        borderRadius: block.borderRadius || '8px'
                      }}
                      className="object-cover max-w-full"
                    />
                  )}
                </div>
              )}

              {block.type === 'button' && (
                <div className="flex items-center justify-center">
                  <a
                    href={block.url || '#'}
                    style={{
                      backgroundColor: block.backgroundColor || '#6366f1',
                      color: block.textColor || '#ffffff',
                      borderRadius: block.borderRadius || '8px'
                    }}
                    className="px-6 py-2.5 font-semibold text-sm shadow-md block text-center min-w-[120px] max-w-xs transition hover:brightness-105"
                  >
                    {block.text || 'Submit'}
                  </a>
                </div>
              )}

              {block.type === 'divider' && (
                <div className="py-2.5">
                  <div 
                    style={{ 
                      backgroundColor: block.color || '#cbd5e1', 
                      height: block.height || '2px' 
                    }} 
                    className="w-full rounded"
                  />
                </div>
              )}

              {block.type === 'video' && (
                <div className="flex items-center justify-center">
                  {block.youtubeUrl && (
                    <div 
                      style={{ width: block.width || '100%' }}
                      className="aspect-video rounded-xl overflow-hidden border border-slate-900 shadow-xl"
                    >
                      <iframe
                        src={getYoutubeEmbedUrl(block.youtubeUrl)}
                        title="Embedded Video"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
              )}

              {block.type === 'spacer' && (
                <div style={{ height: block.height || '30px' }} className="w-full" />
              )}

              {block.type === 'quote' && (
                <blockquote 
                  style={{ borderLeftColor: block.color || '#6366f1' }}
                  className="border-l-4 pl-4 py-1.5 my-2 space-y-1.5 text-left"
                >
                  <p 
                    style={{ color: '#e2e8f0', fontSize: block.fontSize || '18px' }} 
                    className="italic font-medium leading-relaxed"
                  >
                    "{block.text}"
                  </p>
                  {block.author && (
                    <cite className="block text-xs font-semibold text-slate-400 not-italic">
                      — {block.author}
                    </cite>
                  )}
                </blockquote>
              )}
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-500 text-sm">
            This layout is empty.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 w-full border-t border-slate-900 text-center text-xs text-slate-500 z-10 bg-slate-950/50 mt-12 animate-fade-in">
        <p>&copy; {new Date().getFullYear()} {page.title} • Designed with BlogCMS Page Builder.</p>
      </footer>
    </div>
  );
};

export default PublicPage;
