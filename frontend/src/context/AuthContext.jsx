import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('blog_cms_token');
      if (token) {
        try {
          // Fetch current profile to verify token is valid
          const { data } = await api.get('/auth/profile');
          setUser(data);
        } catch (error) {
          console.error('Failed to verify token on mount:', error);
          localStorage.removeItem('blog_cms_token');
          localStorage.removeItem('blog_cms_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('blog_cms_token', data.token);
      localStorage.setItem('blog_cms_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        profileImage: data.profileImage,
        role: data.role,
        createdAt: data.createdAt,
      }));
      
      setUser(data);
      toast.success(`Welcome back, ${data.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Registration handler
  const register = async (formData) => {
    try {
      setLoading(true);
      // Since registration has an optional profile image, it should be sent as multipart/form-data
      const { data } = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      localStorage.setItem('blog_cms_token', data.token);
      localStorage.setItem('blog_cms_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        profileImage: data.profileImage,
        role: data.role,
        createdAt: data.createdAt,
      }));

      setUser(data);
      toast.success('Registration successful! Welcome aboard.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('blog_cms_token');
    localStorage.removeItem('blog_cms_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
