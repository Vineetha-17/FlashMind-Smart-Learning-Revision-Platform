import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Revision from './pages/Study';
import StudyMode from './pages/StudyMode';
import CreateCards from './pages/CreateCards';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Quiz from './pages/Quiz';

export default function App() {
  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('flashmind_theme') || 'dark';
    }
    return 'dark';
  });

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('flashmind_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--app-bg)] text-[color:var(--text-primary)]">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      {/* Route Content Area */}
      <div className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
 
          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute adminOnly={false} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/study-mode" element={<StudyMode />} />
            <Route path="/revision" element={<Revision />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/create-cards" element={<CreateCards />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

