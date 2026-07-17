import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  RotateCw, 
  Eye, 
  EyeOff, 
  Type, 
  AlignLeft, 
  Image as ImageIcon, 
  MousePointer, 
  Minimize2, 
  Video, 
  Maximize2, 
  Quote, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Settings, 
  Layers, 
  Loader2, 
  Check, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

const PageBuilderCanvas = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [page, setPage] = useState(null);
  const [layout, setLayout] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // History Undo/Redo States
  const [history, setHistory] = useState({
    past: [],
    future: []
  });

  const [isDirty, setIsDirty] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');

  // Available draggable block definitions
  const AVAILABLE_BLOCKS = [
    { 
      type: 'heading', 
      name: 'Heading', 
      icon: Type, 
      defaults: { text: 'Welcome to Our Website', fontSize: '32px', align: 'center', color: '#f8fafc' } 
    },
    { 
      type: 'paragraph', 
      name: 'Paragraph', 
      icon: AlignLeft, 
      defaults: { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut ut lacinia elit. In congue sodales tincidunt.', fontSize: '16px', color: '#cbd5e1', align: 'left' } 
    },
    { 
      type: 'image', 
      name: 'Image', 
      icon: ImageIcon, 
      defaults: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', width: '100%', height: 'auto', borderRadius: '16px' } 
    },
    { 
      type: 'button', 
      name: 'Button', 
      icon: MousePointer, 
      defaults: { text: 'Get Started Today', url: '#', backgroundColor: '#6366f1', textColor: '#ffffff', borderRadius: '12px' } 
    },
    { 
      type: 'divider', 
      name: 'Divider', 
      icon: Minimize2, 
      defaults: { color: '#334155', height: '2px' } 
    },
    { 
      type: 'video', 
      name: 'Video', 
      icon: Video, 
      defaults: { youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', width: '100%' } 
    },
    { 
      type: 'spacer', 
      name: 'Spacer', 
      icon: Maximize2, 
      defaults: { height: '40px' } 
    },
    { 
      type: 'quote', 
      name: 'Quote', 
      icon: Quote, 
      defaults: { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs', color: '#a78bfa', fontSize: '20px' } 
    }
  ];

  // Helper to parse YouTube links into embed links
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  // Load page on mount
  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/pages/${id}`);
        setPage(data);
        setLayout(data.layout || []);
        setHistory({ past: [], future: [] }); // Reset history on first load
        setIsDirty(false);
      } catch (err) {
        toast.error('Failed to load page layout data');
        navigate('/dashboard/page-builder');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [id, navigate]);

  // Push to history state stack
  const updateLayoutState = (newLayout, shouldMarkDirty = true) => {
    setHistory(prev => ({
      past: [...prev.past, layout],
      future: []
    }));
    setLayout(newLayout);
    if (shouldMarkDirty) {
      setIsDirty(true);
      setAutoSaveStatus('Unsaved changes');
    }
  };

  // History Operations
  const handleUndo = () => {
    if (history.past.length === 0) return;
    const newPast = [...history.past];
    const previous = newPast.pop();
    
    setHistory({
      past: newPast,
      future: [layout, ...history.future]
    });
    setLayout(previous);
    setIsDirty(true);
    setAutoSaveStatus('Unsaved changes');
  };

  const handleRedo = () => {
    if (history.future.length === 0) return;
    const newFuture = [...history.future];
    const next = newFuture.shift();

    setHistory({
      past: [...history.past, layout],
      future: newFuture
    });
    setLayout(next);
    setIsDirty(true);
    setAutoSaveStatus('Unsaved changes');
  };

  // Save changes to database API
  const handleSavePage = async (showToast = true) => {
    setIsSaving(true);
    setAutoSaveStatus('Saving changes...');
    try {
      await api.put(`/pages/${id}`, { layout });
      setIsDirty(false);
      setAutoSaveStatus('All changes saved');
      if (showToast) {
        toast.success('Page layout saved successfully!');
      }
    } catch (err) {
      setAutoSaveStatus('Failed to auto-save');
      if (showToast) {
        toast.error('Failed to save layout');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-Save background timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (isDirty) {
        handleSavePage(false);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(timer);
  }, [isDirty, layout]);

  // Add block helper (via drag-drop drop, or sidebar click)
  const handleAddBlock = (type) => {
    const blockDef = AVAILABLE_BLOCKS.find(b => b.type === type);
    if (!blockDef) return;

    const newBlock = {
      id: 'block_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      type,
      ...blockDef.defaults
    };

    updateLayoutState([...layout, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  // Duplicate Block
  const handleDuplicateBlock = (e, block) => {
    e.stopPropagation();
    const duplicated = {
      ...block,
      id: 'block_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
    };
    const index = layout.findIndex(b => b.id === block.id);
    if (index === -1) return;

    const newLayout = [...layout];
    newLayout.splice(index + 1, 0, duplicated);
    updateLayoutState(newLayout);
    setSelectedBlockId(duplicated.id);
  };

  // Delete Block
  const handleDeleteBlock = (e, blockId) => {
    e.stopPropagation();
    const newLayout = layout.filter(b => b.id !== blockId);
    updateLayoutState(newLayout);
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  // Re-ordering blocks
  const handleMoveBlock = (e, index, direction) => {
    e.stopPropagation();
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === layout.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newLayout = [...layout];
    
    // Swap elements
    const temp = newLayout[index];
    newLayout[index] = newLayout[targetIndex];
    newLayout[targetIndex] = temp;

    updateLayoutState(newLayout);
  };

  // Update specific block settings property
  const handleUpdateBlockProperty = (key, value) => {
    const newLayout = layout.map(b => {
      if (b.id === selectedBlockId) {
        return { ...b, [key]: value };
      }
      return b;
    });
    // For fast text typing or color slide updates, we update layout directly but might bypass pushing 20 separate states on keystroke
    setLayout(newLayout);
    setIsDirty(true);
    setAutoSaveStatus('Unsaved changes');
  };

  // Handle when text focus ends (push history snapshot on blur)
  const handleCommitHistory = () => {
    setHistory(prev => ({
      past: [...prev.past, layout],
      future: []
    }));
  };

  const selectedBlock = layout.find(b => b.id === selectedBlockId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 size={36} className="animate-spin text-indigo-500" />
        <p className="text-sm font-medium tracking-wide">Initializing Page Designer...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden -mx-6">
      
      {/* 1. TOP BUILDER BAR */}
      <div className="h-14 glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-3">
          <Link 
            to="/dashboard/page-builder" 
            className="p-1.5 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h3 className="text-sm font-bold text-slate-200">{page?.title}</h3>
            <p className="text-[10px] text-indigo-400 font-mono">/page/{page?.slug}</p>
          </div>
        </div>

        {/* History & Action controls */}
        <div className="flex items-center space-x-3">
          {/* Saved Status Indicator */}
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded-lg">
            {autoSaveStatus}
          </span>

          <div className="flex items-center space-x-1 border-r border-slate-800/60 pr-3">
            <button
              onClick={handleUndo}
              disabled={history.past.length === 0}
              className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              title="Undo change"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={handleRedo}
              disabled={history.future.length === 0}
              className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              title="Redo change"
            >
              <RotateCw size={14} />
            </button>
          </div>

          {/* Preview Toggle */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center space-x-1.5 cursor-pointer ${
              previewMode 
                ? 'bg-indigo-650 border-indigo-500 text-white hover:bg-indigo-600' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            {previewMode ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{previewMode ? 'Edit Mode' : 'Live Preview'}</span>
          </button>

          {/* Manual Save */}
          <button
            onClick={() => handleSavePage(true)}
            disabled={isSaving}
            className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-md shadow-indigo-650/15 cursor-pointer"
          >
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span>Save Design</span>
          </button>
        </div>
      </div>

      {/* 2. BUILDER CANVAS LAYOUT */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBARS PANEL: Draggable Elements (LEFT) */}
        {!previewMode && (
          <aside className="w-64 glass-panel border-r border-slate-800/80 p-5 flex flex-col gap-4 overflow-y-auto shrink-0 z-10">
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Drag Blocks</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Drag blocks onto drop canvas or click to append.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {AVAILABLE_BLOCKS.map(block => {
                const IconComp = block.icon;
                return (
                  <div
                    key={block.type}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', block.type)}
                    onClick={() => handleAddBlock(block.type)}
                    className="flex flex-col items-center justify-center p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-indigo-500/30 hover:bg-slate-900/90 text-slate-300 hover:text-indigo-400 cursor-grab active:cursor-grabbing transition duration-150 select-none group"
                  >
                    <IconComp size={18} className="mb-2 group-hover:scale-105 transition" />
                    <span className="text-[10px] font-bold tracking-wide">{block.name}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-auto border-t border-slate-900 pt-4 flex items-center space-x-2 text-[10px] text-slate-500">
              <Sparkles size={12} className="text-indigo-500" />
              <span>Mobile friendly: Tap triggers click-to-add.</span>
            </div>
          </aside>
        )}

        {/* WORKSPACE DROPPABLE CANVAS (CENTER) */}
        <div 
          className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-950/60 relative"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('text/plain');
            if (type) handleAddBlock(type);
          }}
        >
          {/* Subtle grid backdrop for visual aid */}
          {!previewMode && (
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.25] pointer-events-none"></div>
          )}

          <div className={`w-full max-w-2xl min-h-[500px] flex flex-col gap-4 relative z-10 transition-all duration-300 ${
            previewMode ? 'py-6 px-4 bg-slate-900/20 border border-slate-900 rounded-2xl' : 'border border-dashed border-slate-850 p-6 rounded-2xl bg-slate-950/40'
          }`}>
            
            {/* Empty canvas banner */}
            {layout.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-500 min-h-[300px]">
                <Layers className="text-slate-700 animate-pulse mb-3" size={32} />
                <p className="text-xs font-semibold">Drop Zone / Designer Canvas</p>
                <p className="text-[10px] mt-1 max-w-[200px]">Drag blocks here or click elements from the sidebar to start structuring.</p>
              </div>
            )}

            {/* Layout loop */}
            {layout.map((block, index) => {
              const isSelected = block.id === selectedBlockId;
              
              return (
                <div
                  key={block.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!previewMode) setSelectedBlockId(block.id);
                  }}
                  className={`relative group transition-all duration-150 rounded-xl ${
                    previewMode 
                      ? 'border border-transparent' 
                      : `border p-3.5 hover:border-slate-750/80 bg-slate-900/30 ${
                          isSelected ? 'border-indigo-500 bg-slate-900/50 shadow-lg ring-1 ring-indigo-500/20' : 'border-slate-850'
                        }`
                  }`}
                >
                  
                  {/* DESIGNER ELEMENT FRAMES CONTROLS OVERLAYS */}
                  {!previewMode && (
                    <div className="absolute -top-3.5 right-4 bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 items-center space-x-1.5 shadow-md flex opacity-0 group-hover:opacity-100 transition-opacity z-10 select-none">
                      {/* Move Up */}
                      <button 
                        onClick={(e) => handleMoveBlock(e, index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30 transition cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp size={10} />
                      </button>
                      {/* Move Down */}
                      <button 
                        onClick={(e) => handleMoveBlock(e, index, 'down')}
                        disabled={index === layout.length - 1}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30 transition cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown size={10} />
                      </button>
                      {/* Duplicate */}
                      <button 
                        onClick={(e) => handleDuplicateBlock(e, block)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition cursor-pointer"
                        title="Duplicate Element"
                      >
                        <Copy size={10} />
                      </button>
                      {/* Delete */}
                      <button 
                        onClick={(e) => handleDeleteBlock(e, block.id)}
                        className="p-1 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded transition cursor-pointer"
                        title="Delete Element"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}

                  {/* ELEMENT DYNAMIC SWITCH RENDER */}
                  <div>
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
                        {block.url ? (
                          <img 
                            src={block.url} 
                            alt="Visual block" 
                            style={{ 
                              width: block.width || '100%', 
                              height: block.height || 'auto',
                              borderRadius: block.borderRadius || '8px'
                            }}
                            className="object-cover max-w-full"
                          />
                        ) : (
                          <div className="w-full py-8 border border-dashed border-slate-800 flex flex-col items-center text-slate-500 rounded-lg">
                            <ImageIcon size={24} className="mb-1" />
                            <span className="text-[10px]">No image URL defined</span>
                          </div>
                        )}
                      </div>
                    )}

                    {block.type === 'button' && (
                      <div className="flex items-center justify-center">
                        <a
                          href={block.url || '#'}
                          onClick={(e) => previewMode && e.preventDefault()}
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
                        {block.youtubeUrl ? (
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
                        ) : (
                          <div className="w-full py-8 border border-dashed border-slate-800 flex flex-col items-center text-slate-500 rounded-lg">
                            <Video size={24} className="mb-1" />
                            <span className="text-[10px]">Provide YouTube Video link</span>
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

                </div>
              );
            })}

          </div>
        </div>

        {/* SIDEBARS PANEL: Edit Block Settings (RIGHT) */}
        {!previewMode && selectedBlock && (
          <aside className="w-72 glass-panel border-l border-slate-800/80 p-5 flex flex-col gap-5 overflow-y-auto shrink-0 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-900/80">
              <div className="flex items-center space-x-1.5 text-slate-350">
                <Settings size={14} className="text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Block Settings</h4>
              </div>
              <button 
                onClick={() => setSelectedBlockId(null)}
                className="text-slate-500 hover:text-slate-200"
              >
                <X size={14} />
              </button>
            </div>

            {/* Editing settings inputs depending on selected block */}
            <div className="space-y-4">
              
              {/* Type tag */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Element Type</span>
                <span className="px-2 py-0.5 bg-indigo-950 border border-indigo-900 text-indigo-300 rounded text-[10px] font-mono capitalize">
                  {selectedBlock.type}
                </span>
              </div>

              {/* HEADING PROPERTIES EDIT */}
              {selectedBlock.type === 'heading' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Heading Text</label>
                    <textarea
                      value={selectedBlock.text}
                      onChange={(e) => handleUpdateBlockProperty('text', e.target.value)}
                      onBlur={handleCommitHistory}
                      rows="3"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Font Size</label>
                    <select
                      value={selectedBlock.fontSize}
                      onChange={(e) => handleUpdateBlockProperty('fontSize', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="18px">Small (18px)</option>
                      <option value="24px">Medium (24px)</option>
                      <option value="32px">Large (32px)</option>
                      <option value="48px">Extra Large (48px)</option>
                      <option value="60px">Jumbo (60px)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Alignment</label>
                    <select
                      value={selectedBlock.align || 'center'}
                      onChange={(e) => handleUpdateBlockProperty('align', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Text Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={selectedBlock.color || '#f8fafc'}
                        onChange={(e) => handleUpdateBlockProperty('color', e.target.value)}
                        onBlur={handleCommitHistory}
                        className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedBlock.color || '#f8fafc'}
                        onChange={(e) => handleUpdateBlockProperty('color', e.target.value)}
                        onBlur={handleCommitHistory}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* PARAGRAPH PROPERTIES EDIT */}
              {selectedBlock.type === 'paragraph' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Body Content</label>
                    <textarea
                      value={selectedBlock.text}
                      onChange={(e) => handleUpdateBlockProperty('text', e.target.value)}
                      onBlur={handleCommitHistory}
                      rows="6"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none transition leading-relaxed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Font Size</label>
                    <select
                      value={selectedBlock.fontSize}
                      onChange={(e) => handleUpdateBlockProperty('fontSize', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="12px">Extra Small (12px)</option>
                      <option value="14px">Small (14px)</option>
                      <option value="16px">Regular (16px)</option>
                      <option value="18px">Large (18px)</option>
                      <option value="20px">Extra Large (20px)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Alignment</label>
                    <select
                      value={selectedBlock.align || 'left'}
                      onChange={(e) => handleUpdateBlockProperty('align', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={selectedBlock.color || '#cbd5e1'}
                        onChange={(e) => handleUpdateBlockProperty('color', e.target.value)}
                        onBlur={handleCommitHistory}
                        className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedBlock.color || '#cbd5e1'}
                        onChange={(e) => handleUpdateBlockProperty('color', e.target.value)}
                        onBlur={handleCommitHistory}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* IMAGE PROPERTIES EDIT */}
              {selectedBlock.type === 'image' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Image URL</label>
                    <input
                      type="text"
                      value={selectedBlock.url}
                      onChange={(e) => handleUpdateBlockProperty('url', e.target.value)}
                      onBlur={handleCommitHistory}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Width</label>
                    <input
                      type="text"
                      value={selectedBlock.width}
                      placeholder="e.g. 100%, 300px"
                      onChange={(e) => handleUpdateBlockProperty('width', e.target.value)}
                      onBlur={handleCommitHistory}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Height</label>
                    <input
                      type="text"
                      value={selectedBlock.height}
                      placeholder="e.g. auto, 200px"
                      onChange={(e) => handleUpdateBlockProperty('height', e.target.value)}
                      onBlur={handleCommitHistory}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Border Radius</label>
                    <select
                      value={selectedBlock.borderRadius}
                      onChange={(e) => handleUpdateBlockProperty('borderRadius', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="0px">None (0px)</option>
                      <option value="8px">Small (8px)</option>
                      <option value="16px">Medium (16px)</option>
                      <option value="24px">Large (24px)</option>
                      <option value="9999px">Rounded Pill (9999px)</option>
                    </select>
                  </div>
                </>
              )}

              {/* BUTTON PROPERTIES EDIT */}
              {selectedBlock.type === 'button' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Button Text</label>
                    <input
                      type="text"
                      value={selectedBlock.text}
                      onChange={(e) => handleUpdateBlockProperty('text', e.target.value)}
                      onBlur={handleCommitHistory}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Target URL</label>
                    <input
                      type="text"
                      value={selectedBlock.url}
                      onChange={(e) => handleUpdateBlockProperty('url', e.target.value)}
                      onBlur={handleCommitHistory}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-250 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">BG Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={selectedBlock.backgroundColor || '#6366f1'}
                        onChange={(e) => handleUpdateBlockProperty('backgroundColor', e.target.value)}
                        onBlur={handleCommitHistory}
                        className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedBlock.backgroundColor || '#6366f1'}
                        onChange={(e) => handleUpdateBlockProperty('backgroundColor', e.target.value)}
                        onBlur={handleCommitHistory}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Text Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={selectedBlock.textColor || '#ffffff'}
                        onChange={(e) => handleUpdateBlockProperty('textColor', e.target.value)}
                        onBlur={handleCommitHistory}
                        className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedBlock.textColor || '#ffffff'}
                        onChange={(e) => handleUpdateBlockProperty('textColor', e.target.value)}
                        onBlur={handleCommitHistory}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Border Radius</label>
                    <select
                      value={selectedBlock.borderRadius}
                      onChange={(e) => handleUpdateBlockProperty('borderRadius', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="0px">Square (0px)</option>
                      <option value="6px">Mini (6px)</option>
                      <option value="12px">Rounded (12px)</option>
                      <option value="9999px">Pill (9999px)</option>
                    </select>
                  </div>
                </>
              )}

              {/* DIVIDER PROPERTIES EDIT */}
              {selectedBlock.type === 'divider' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Thickness</label>
                    <select
                      value={selectedBlock.height}
                      onChange={(e) => handleUpdateBlockProperty('height', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="1px">1px</option>
                      <option value="2px">2px</option>
                      <option value="4px">4px</option>
                      <option value="8px">8px</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Divider Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={selectedBlock.color || '#334155'}
                        onChange={(e) => handleUpdateBlockProperty('color', e.target.value)}
                        onBlur={handleCommitHistory}
                        className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedBlock.color || '#334155'}
                        onChange={(e) => handleUpdateBlockProperty('color', e.target.value)}
                        onBlur={handleCommitHistory}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* VIDEO PROPERTIES EDIT */}
              {selectedBlock.type === 'video' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">YouTube Video URL</label>
                    <input
                      type="text"
                      value={selectedBlock.youtubeUrl}
                      onChange={(e) => handleUpdateBlockProperty('youtubeUrl', e.target.value)}
                      onBlur={handleCommitHistory}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none text-[11px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Width</label>
                    <input
                      type="text"
                      value={selectedBlock.width}
                      placeholder="e.g. 100%, 500px"
                      onChange={(e) => handleUpdateBlockProperty('width', e.target.value)}
                      onBlur={handleCommitHistory}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none font-mono"
                    />
                  </div>
                </>
              )}

              {/* SPACER PROPERTIES EDIT */}
              {selectedBlock.type === 'spacer' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Spacer Height</label>
                    <select
                      value={selectedBlock.height}
                      onChange={(e) => handleUpdateBlockProperty('height', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer font-mono"
                    >
                      <option value="10px">10px</option>
                      <option value="20px">20px</option>
                      <option value="30px">30px</option>
                      <option value="40px">40px</option>
                      <option value="60px">60px</option>
                      <option value="100px">100px</option>
                    </select>
                  </div>
                </>
              )}

              {/* QUOTE PROPERTIES EDIT */}
              {selectedBlock.type === 'quote' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Quote Text</label>
                    <textarea
                      value={selectedBlock.text}
                      onChange={(e) => handleUpdateBlockProperty('text', e.target.value)}
                      onBlur={handleCommitHistory}
                      rows="3"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Author Citation</label>
                    <input
                      type="text"
                      value={selectedBlock.author}
                      onChange={(e) => handleUpdateBlockProperty('author', e.target.value)}
                      onBlur={handleCommitHistory}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Font Size</label>
                    <select
                      value={selectedBlock.fontSize}
                      onChange={(e) => handleUpdateBlockProperty('fontSize', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="14px">Small (14px)</option>
                      <option value="18px">Medium (18px)</option>
                      <option value="20px">Large (20px)</option>
                      <option value="24px">Extra Large (24px)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Accent Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={selectedBlock.color || '#6366f1'}
                        onChange={(e) => handleUpdateBlockProperty('color', e.target.value)}
                        onBlur={handleCommitHistory}
                        className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedBlock.color || '#6366f1'}
                        onChange={(e) => handleUpdateBlockProperty('color', e.target.value)}
                        onBlur={handleCommitHistory}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

            </div>
          </aside>
        )}

      </div>
    </div>
  );
};

export default PageBuilderCanvas;
