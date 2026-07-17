import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { SettingsContext } from '../context/SettingsContext';
import toast from 'react-hot-toast';
import { 
  Settings, 
  Save, 
  Upload, 
  Loader2, 
  Globe, 
  Mail, 
  FileText, 
  Facebook, 
  Twitter, 
  Github, 
  Linkedin 
} from 'lucide-react';

const SettingsPage = () => {
  const { settings, refetchSettings, updateSettingsState } = useContext(SettingsContext);
  
  const [formData, setFormData] = useState({
    siteName: '',
    contactEmail: '',
    footerText: '',
    socialFacebook: '',
    socialTwitter: '',
    socialGithub: '',
    socialLinkedin: '',
  });

  const [siteLogo, setSiteLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [favicon, setFavicon] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || '',
        contactEmail: settings.contactEmail || '',
        footerText: settings.footerText || '',
        socialFacebook: settings.socialFacebook || '',
        socialTwitter: settings.socialTwitter || '',
        socialGithub: settings.socialGithub || '',
        socialLinkedin: settings.socialLinkedin || '',
      });
      if (settings.siteLogo) {
        setLogoPreview(`http://localhost:5000${settings.siteLogo}`);
      }
      if (settings.favicon) {
        setFaviconPreview(`http://localhost:5000${settings.favicon}`);
      }
    }
  }, [settings]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSiteLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFavicon(file);
      setFaviconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    if (siteLogo) submitData.append('siteLogo', siteLogo);
    if (favicon) submitData.append('favicon', favicon);

    try {
      const { data } = await api.put('/settings', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateSettingsState(data);
      toast.success('Site settings updated successfully!');
      refetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save site configurations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100 flex items-center space-x-2">
          <Settings className="text-indigo-500" size={24} />
          <span>Site Configurations & Branding</span>
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">Customize global site configurations, metadata, logos, and social media integrations.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core details */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6">
          <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">General Configurations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Site name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Globe size={13} className="text-indigo-400" />
                <span>Site Display Name</span>
              </label>
              <input
                type="text"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                placeholder="e.g. My Internship CMS"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 focus:outline-none transition text-sm font-semibold"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Mail size={13} className="text-indigo-400" />
                <span>Contact Email</span>
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="admin@blogcms.com"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 focus:outline-none transition text-sm font-mono"
                disabled={loading}
              />
            </div>

            {/* Footer Text */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText size={13} className="text-indigo-400" />
                <span>Footer Copyright Text</span>
              </label>
              <input
                type="text"
                name="footerText"
                value={formData.footerText}
                onChange={handleChange}
                placeholder="© 2026 BlogCMS. All rights reserved."
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 focus:outline-none transition text-sm"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Branding Assets (Logo/Favicon) */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6">
          <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Branding & Identity Assets</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Site Logo */}
            <div className="space-y-4 border border-slate-900 rounded-2xl p-5 bg-slate-950/20">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-350 uppercase">Site Header Logo</h4>
                <p className="text-[10px] text-slate-500">Displays on the main visitor headers.</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 overflow-hidden shadow">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-[10px]">No Logo</span>
                  )}
                </div>

                <label className="flex-1">
                  <span className="px-4 py-2 border border-slate-850 hover:border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer select-none">
                    <Upload size={13} />
                    <span>Upload Logo Image</span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

            {/* Favicon */}
            <div className="space-y-4 border border-slate-900 rounded-2xl p-5 bg-slate-950/20">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-350 uppercase">Browser Favicon</h4>
                <p className="text-[10px] text-slate-500">Site icon displaying inside browser tab headers.</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 overflow-hidden shadow">
                  {faviconPreview ? (
                    <img src={faviconPreview} alt="Favicon Preview" className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-[10px]">No Favicon</span>
                  )}
                </div>

                <label className="flex-1">
                  <span className="px-4 py-2 border border-slate-850 hover:border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer select-none">
                    <Upload size={13} />
                    <span>Upload Favicon File</span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Social Media Links */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6">
          <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Social Integrations</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Facebook */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center space-x-1.5">
                <Facebook size={12} className="text-blue-500" />
                <span>Facebook Link</span>
              </label>
              <input
                type="text"
                name="socialFacebook"
                value={formData.socialFacebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none transition font-mono"
                disabled={loading}
              />
            </div>

            {/* Twitter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center space-x-1.5">
                <Twitter size={12} className="text-sky-400" />
                <span>Twitter Link</span>
              </label>
              <input
                type="text"
                name="socialTwitter"
                value={formData.socialTwitter}
                onChange={handleChange}
                placeholder="https://twitter.com/..."
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none transition font-mono"
                disabled={loading}
              />
            </div>

            {/* Github */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center space-x-1.5">
                <Github size={12} className="text-slate-300" />
                <span>GitHub Repository</span>
              </label>
              <input
                type="text"
                name="socialGithub"
                value={formData.socialGithub}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none transition font-mono"
                disabled={loading}
              />
            </div>

            {/* Linkedin */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center space-x-1.5">
                <Linkedin size={12} className="text-indigo-400" />
                <span>LinkedIn Page</span>
              </label>
              <input
                type="text"
                name="socialLinkedin"
                value={formData.socialLinkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 focus:outline-none transition font-mono"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold cursor-pointer transition shadow-lg shadow-indigo-650/15"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Configuration Details</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default SettingsPage;
