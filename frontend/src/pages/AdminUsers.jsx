import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  UserCheck, 
  Loader2, 
  Calendar 
} from 'lucide-react';

const AdminUsers = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (userId === currentUser._id) {
      toast.error('You cannot change your own administrator privileges!');
      return;
    }

    try {
      const { data } = await api.put(`/admin/users/${userId}`, { role: nextRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: data.role } : u));
      toast.success(`Role updated to ${data.role} successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user privileges');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === currentUser._id) {
      toast.error('You cannot delete your own admin account!');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers(users.filter(u => u._id !== userId));
        toast.success('User account deleted');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-display text-slate-100 flex items-center space-x-2">
          <Users className="text-indigo-500" size={24} />
          <span>User Accounts Directory</span>
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">Manage user registration accounts, system privileges, and security roles.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
          <Loader2 size={36} className="animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Retrieving user profiles...</p>
        </div>
      ) : (
        <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800/80">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role / Privileges</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {users.map((u) => {
                  const isSelf = u._id === currentUser._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-900/10 transition-colors">
                      {/* Name & avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-300 overflow-hidden shadow">
                            {u.profileImage ? (
                              <img 
                                src={`http://localhost:5000${u.profileImage}`} 
                                alt={u.name} 
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              u.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 text-[9px] font-bold uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-400">{u.email}</span>
                      </td>

                      {/* Role Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRoleToggle(u._id, u.role)}
                          disabled={isSelf}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            u.role === 'admin'
                              ? 'bg-indigo-950/60 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <Shield size={12} className={u.role === 'admin' ? 'text-indigo-400' : 'text-slate-500'} />
                          <span className="capitalize">{u.role}</span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-slate-400">
                        <div className="flex items-center space-x-1.5">
                          <Calendar size={12} className="text-slate-500" />
                          <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            disabled={isSelf}
                            className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/30 hover:border-red-800 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Delete User Account"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
