import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Header from './components/Header/Header';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import CreatePost from './pages/Posts/CreatePost';
import EditPost from './pages/Posts/EditPost';
import PostDetail from './pages/Posts/PostDetail';
import Notifications from './pages/Notifications/Notifications';
import Search from './pages/Search/Search';
import AdminPanel from './pages/Admin/AdminPanel';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" /> : <Register />} 
          />
          <Route 
            path="/profile/:username" 
            element={<Profile />} 
          />
          <Route 
            path="/create" 
            element={user ? <CreatePost /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/edit/:id" 
            element={user ? <EditPost /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/post/:id" 
            element={<PostDetail />} 
          />
          <Route 
            path="/notifications" 
            element={user ? <Notifications /> : <Navigate to="/login" />} 
          />
          {user?.isAdmin && (
            <Route 
              path="/admin" 
              element={<AdminPanel />} 
            />
          )}
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;