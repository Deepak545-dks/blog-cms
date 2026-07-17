import React, { useState, useEffect, useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';

import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User, 
  ChevronDown,
  Bell,
  PlusCircle,
  BookOpen,
  Search,
  Tag,
  LayoutGrid,
  MessageSquare,
  Sun,
  Moon
} from 'lucide-react';


const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const location = useLocation();
  const navigate = useNavigate();

  // Handle dark / light theme toggling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const adminNavItems = [
    { name: 'Analytics', path: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Users Directory', path: '/dashboard/admin/users', icon: Users },
    { name: 'Manage Blogs', path: '/dashboard/admin/blogs', icon: BookOpen },
    { name: 'Manage Pages', path: '/dashboard/admin/pages', icon: FileText },
    { name: 'Manage Comments', path: '/dashboard/admin/comments', icon: MessageSquare },
    { name: 'Site Settings', path: '/dashboard/admin/settings', icon: Settings },
  ];


  const handleNavSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Blog', path: '/dashboard/create-blog', icon: PlusCircle },
    { name: 'My Blogs', path: '/dashboard/my-blogs', icon: BookOpen },
    { name: 'Categories', path: '/dashboard/categories', icon: Tag },
    { name: 'Page Builder', path: '/dashboard/page-builder', icon: LayoutGrid },
    { name: 'Profile', path: '/dashboard/profile', icon: User },
  ];


  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* MOBILE SIDEBAR DRAWERS / OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR CONTAINER */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-slate-800/80 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* SIDEBAR HEADER */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold font-display bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              📝 {settings.siteName || 'BlogCMS'}
            </span>
          </Link>

          <button 
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* SIDEBAR NAVIGATION LINKS */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.disabled ? '#' : item.path}
                onClick={() => {
                  if (item.disabled) return;
                  setSidebarOpen(false);
                }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-indigo-300 border-l-4 border-indigo-500 font-medium' 
                    : item.disabled
                    ? 'text-slate-600 cursor-not-allowed opacity-50'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-100'} />
                <span>{item.name}</span>
                {item.disabled && (
                  <span className="ml-auto text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ADMIN SIDEBAR LINKS SECTION */}
        {user && user.role === 'admin' && (
          <div className="px-4 pb-6 border-t border-slate-900/60 pt-4 space-y-1">
            <p className="px-4 text-[9px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">Admin Console</p>
            {adminNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition duration-200 group text-xs ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600/25 to-purple-600/25 text-indigo-300 border-l-4 border-indigo-500 font-semibold' 
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-indigo-400' : 'text-slate-550'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}


        {/* SIDEBAR FOOTER - LOGGED IN USER MINIMIZED CARD */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white border border-indigo-400/20 shadow-md">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none'; // hide broken image and show initial letter fallback
                  }}
                />
              ) : null}
              {(!user?.profileImage || user.profileImage === '') && user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize truncate font-medium">Role: {user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 glass-panel border-b border-slate-800/80 flex items-center justify-between px-6 z-30">
          
          {/* Mobile hamburger menu button */}
          <button 
            className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Quick info or Breadcrumb */}
          <div className="hidden lg:flex items-center space-x-2 text-sm text-slate-400 font-medium">
            <span>Home</span>
            <span className="text-slate-600">/</span>
            <span className="text-indigo-400 capitalize">{location.pathname.replace('/dashboard/', '').replace('/', '') || 'Dashboard'}</span>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleNavSearchSubmit} className="hidden md:flex items-center relative max-w-xs w-full ml-4">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search public articles..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition duration-200"
            />
          </form>

          {/* User Profile dropdown & Notifications */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl transition duration-200 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification bell placeholder */}
            <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl transition duration-200 relative">
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
              <Bell size={18} />
            </button>


            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800/40 transition duration-200 border border-transparent hover:border-slate-800"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm">
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {(!user?.profileImage || user.profileImage === '') && user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">{user?.name}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 rounded-xl glass-panel border border-slate-800 shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold truncate">{user?.email}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2 transition duration-200 mt-1"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT SCROLLABLE VIEW */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950/40">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
