import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AIStylist from './pages/AIStylist';
import Wardrobe from './pages/Wardrobe';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Search from './pages/Search';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center" style={{ height: '100vh', color: 'var(--muted)' }}>Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="stylist" element={<AIStylist />} />
        <Route path="wardrobe" element={<Wardrobe />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="search" element={<Search />} />
        <Route path="profile/:username" element={<Profile />} />
        <Route path="profile" element={<ProfileRedirect />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ProfileRedirect() {
  const { user } = useAuth();
  return user ? <Navigate to={`/profile/${user.username}`} replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              borderRadius: '8px',
              background: 'var(--white)',
              color: 'var(--ink)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
            },
            success: { iconTheme: { primary: '#c9a84c', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}