import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Calendar, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle,
  FileText,
  Globe,
  Lock as LockIcon
} from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef();

  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // Stats state
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
  });

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  // Load stats and dashboard details
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        const { data } = await api.get('/blogs/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to load user stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
      setProfileError('');
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    setPasswordError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileError('Display Name is required');
      return;
    }

    setIsSubmittingProfile(true);
    const data = new FormData();
    data.append('name', name);
    if (profileImage) {
      data.append('profileImage', profileImage);
    }

    try {
      const res = await api.put('/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Update local storage representation
      const storedUser = JSON.parse(localStorage.getItem('blog_cms_user') || '{}');
      const updatedUser = { ...storedUser, name: res.data.name, profileImage: res.data.profileImage };
      localStorage.setItem('blog_cms_user', JSON.stringify(updatedUser));
      
      toast.success('Profile details updated!');
      // Force page refresh to update navbar/context representation
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100">User Profile</h2>
        <p className="text-slate-400 text-xs mt-0.5">Customize your public credentials, change passwords, and monitor stats.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Summary & Stats */}
        <div className="space-y-6 lg:col-span-1">
          {/* User Card */}
          <div className="glass-card rounded-2xl p-6 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            
            <div className="flex flex-col items-center">
              {/* Profile Image Display */}
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-3xl border-2 border-slate-800 shadow-xl mb-4 relative group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : user?.profileImage ? (
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
                {(!imagePreview && (!user?.profileImage || user.profileImage === '')) && user?.name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-bold font-display text-slate-200">{user?.name}</h3>
              <p className="text-xs text-slate-400 font-medium capitalize mt-0.5">{user?.role}</p>
            </div>

            <div className="pt-4 border-t border-slate-900/80 text-left space-y-3">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Mail size={14} className="text-slate-500" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Calendar size={14} className="text-slate-500" />
                <span>Joined {formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Stats Box */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Writing Statistics</h4>
            
            {isLoadingStats ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-indigo-500" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-lg font-extrabold text-indigo-400 block">{stats.totalBlogs}</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Total</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-lg font-extrabold text-emerald-400 block">{stats.publishedBlogs}</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Live</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-lg font-extrabold text-amber-400 block">{stats.draftBlogs}</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Drafts</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Edit Forms */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Edit Profile Form */}
          <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-md font-bold font-display text-slate-200 pb-2 border-b border-slate-800/80">Account Details</h3>
            
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              
              {/* Profile Image Select */}
              <div className="flex items-center space-x-4">
                <div className="relative group w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : user?.profileImage ? (
                    <img 
                      src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`} 
                      alt={user?.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {(!imagePreview && (!user?.profileImage || user.profileImage === '')) && <ImageIcon className="text-slate-600" size={20} />}
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition duration-200 cursor-pointer"
                  >
                    Change Picture
                  </button>
                  <p className="text-[10px] text-slate-500">Max size of 2MB. JPG, PNG, WEBP.</p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Display Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Display Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setProfileError('');
                    }}
                    placeholder="Full Name"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
                    disabled={isSubmittingProfile}
                  />
                </div>
              </div>

              {profileError && <p className="text-xs text-red-400 font-semibold">{profileError}</p>}

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition duration-200 flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                disabled={isSubmittingProfile}
              >
                {isSubmittingProfile ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-md font-bold font-display text-slate-200 pb-2 border-b border-slate-800/80">Change Password</h3>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Current Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
                    disabled={isSubmittingPassword}
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
                    disabled={isSubmittingPassword}
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    placeholder="Re-type new password"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none transition duration-200 text-sm"
                    disabled={isSubmittingPassword}
                  />
                </div>
              </div>

              {passwordError && <p className="text-xs text-red-400 font-semibold">{passwordError}</p>}

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition duration-200 flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                disabled={isSubmittingPassword}
              >
                {isSubmittingPassword ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <LockIcon size={14} />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
