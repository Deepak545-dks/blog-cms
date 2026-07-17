import React, { lazy, Suspense, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Context
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

// Dynamic route code splitting via lazy loading
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Blogs = lazy(() => import('./pages/Blogs'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const CreateBlog = lazy(() => import('./pages/CreateBlog'));
const EditBlog = lazy(() => import('./pages/EditBlog'));
const MyBlogs = lazy(() => import('./pages/MyBlogs'));
const Categories = lazy(() => import('./pages/Categories'));
const Profile = lazy(() => import('./pages/Profile'));
const PageBuilderList = lazy(() => import('./pages/PageBuilderList'));
const PageBuilderCanvas = lazy(() => import('./pages/PageBuilderCanvas'));
const PublicPage = lazy(() => import('./pages/PublicPage'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminBlogs = lazy(() => import('./pages/AdminBlogs'));
const AdminPages = lazy(() => import('./pages/AdminPages'));
const AdminComments = lazy(() => import('./pages/AdminComments'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Error pages
const NotFound = lazy(() => import('./pages/NotFound'));
const ServerError = lazy(() => import('./pages/ServerError'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// Fallback loader component
const SuspenseLoader = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
    <Loader2 size={36} className="animate-spin text-indigo-500" />
  </div>
);

// Admin protection route check helper
const AdminRoute = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <SuspenseLoader />;
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

const App = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        {/* Toast notifications config */}
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'glass-panel text-slate-100 border border-slate-800',
            duration: 4000,
            style: {
              background: 'rgba(30, 41, 59, 0.9)',
              color: '#f8fafc',
              backdropFilter: 'blur(12px)',
            },
            success: {
              iconTheme: {
                primary: '#6366f1',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Router>
          <Suspense fallback={<SuspenseLoader />}>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<Home />} />

              {/* Public Blog & Page Builder Routes */}
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/page/:slug" element={<PublicPage />} />

              {/* Guest Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected Personal Dashboard Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/my-blogs" element={<MyBlogs />} />
                  <Route path="/dashboard/create-blog" element={<CreateBlog />} />
                  <Route path="/dashboard/edit-blog/:id" element={<EditBlog />} />
                  <Route path="/dashboard/categories" element={<Categories />} />
                  <Route path="/dashboard/profile" element={<Profile />} />
                  <Route path="/dashboard/page-builder" element={<PageBuilderList />} />
                  <Route path="/dashboard/page-builder/edit/:id" element={<PageBuilderCanvas />} />

                  {/* Protected Master Admin Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    <Route path="/dashboard/admin/users" element={<AdminUsers />} />
                    <Route path="/dashboard/admin/blogs" element={<AdminBlogs />} />
                    <Route path="/dashboard/admin/pages" element={<AdminPages />} />
                    <Route path="/dashboard/admin/comments" element={<AdminComments />} />
                    <Route path="/dashboard/admin/settings" element={<SettingsPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Explicit Error Pages */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/500" element={<ServerError />} />

              {/* Catch-all Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
