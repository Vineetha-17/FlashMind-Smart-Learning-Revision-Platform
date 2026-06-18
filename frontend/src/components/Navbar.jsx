import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { 
  Flame, 
  Award, 
  LogOut, 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  Shield, 
  Menu, 
  X,
  User as UserIcon,
  Folders,
  GraduationCap,
  HelpCircle,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ theme = 'dark', toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem('flashmind_token');

  // Load user data
  useEffect(() => {
    if (token) {
      try {
        const userStr = localStorage.getItem('flashmind_user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setUser(null);
    }
  }, [token, location]);

  const handleLogout = () => {
    localStorage.removeItem('flashmind_token');
    localStorage.removeItem('flashmind_user');
    setUser(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const getBadgeForXp = (xp = 0) => {
    if (xp >= 300) return { label: 'Legendary Scholar' };
    if (xp >= 180) return { label: 'Flash Scholar' };
    if (xp >= 80) return { label: 'Rising Mind' };
    return { label: 'New Learner' };
  };

  useEffect(() => {
    if (profileOpen) {
      setProfileOpen(false);
    }
  }, [location.pathname]);

  const linkClass = (path) => `
    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
    ${isActive(path) 
      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' 
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }
  `;

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center mr-8">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'student' ? (
                  <>
                    <Link to="/subjects" className={linkClass('/subjects')}>
                      <Folders size={16} />
                      <span>Subjects</span>
                    </Link>
                    <Link to="/study-mode" className={linkClass('/study-mode')}>
                      <GraduationCap size={16} />
                      <span>Study Mode</span>
                    </Link>
                    <Link to="/revision" className={linkClass('/revision')}>
                      <BookOpen size={16} />
                      <span>Revision Mode</span>
                    </Link>
                    <Link to="/quiz" className={linkClass('/quiz')}>
                      <HelpCircle size={16} />
                      <span>Practice Quiz</span>
                    </Link>
                    <Link to="/create-cards" className={linkClass('/create-cards')}>
                      <PlusCircle size={16} />
                      <span>Create Cards</span>
                    </Link>
                  </>
                ) : (
                  <Link to="/admin" className={linkClass('/admin')}>
                    <Shield size={16} />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold animate-pulse-slow">
                      <Flame size={14} className="fill-orange-400" />
                      <span>{user.streak || 0} Streak</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                      <Award size={14} />
                      <span>{user.xp || 0} XP</span>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen((open) => !open)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/95 border border-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition"
                      aria-label="Open profile menu"
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 text-xs font-bold text-white">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                      <span>{user.name}</span>
                      <ChevronDown size={16} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/95 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-200 font-semibold">
                              {user.name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                              <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-900/80 px-3 py-2 text-sm text-slate-300">
                              <span>Streak</span>
                              <span className="text-amber-300">{user.streak || 0} days</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-900/80 px-3 py-2 text-sm text-slate-300">
                              <span>Badge</span>
                              <span className="text-emerald-300">{getBadgeForXp(user.xp).label}</span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={toggleTheme}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-indigo-500 hover:text-white transition-colors"
                              aria-label="Toggle light or dark mode"
                            >
                              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                            <span className="text-xs text-slate-400">Toggle theme</span>
                          </div>
                        </div>
                        <div className="border-t border-slate-800/80 px-3 py-3">
                          <Link
                            to={user.role === 'admin' ? '/admin' : '/profile'}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-200 hover:bg-slate-900/80 transition"
                          >
                            <LayoutDashboard size={16} />
                            {user.role === 'admin' ? 'Admin Panel' : 'Profile'}
                          </Link>
                          <button
                            onClick={() => {
                              setProfileOpen(false);
                              handleLogout();
                            }}
                            className="mt-2 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10 transition text-left"
                          >
                            <LogOut size={16} />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {user && user.role === 'student' && (
              <div className="flex items-center gap-1.5 mr-3 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold">
                <Flame size={12} className="fill-orange-400" />
                <span>{user.streak || 0}</span>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-900 px-2 pt-2 pb-4 space-y-1">
          {user ? (
            <>
              {user.role === 'student' ? (
                <>
                  <Link
                    to="/subjects"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Folders size={18} />
                    <span>Subjects</span>
                  </Link>
                  <Link
                    to="/study-mode"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <GraduationCap size={18} />
                    <span>Study Mode</span>
                  </Link>
                  <Link
                    to="/revision"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <BookOpen size={18} />
                    <span>Revision Mode</span>
                  </Link>
                  <Link
                    to="/quiz"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <HelpCircle size={18} />
                    <span>Practice Quiz</span>
                  </Link>
                  <Link
                    to="/create-cards"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <PlusCircle size={18} />
                    <span>Create Cards</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Shield size={18} />
                  <span>Admin Panel</span>
                </Link>
              )}

              {user.role === 'student' && (
                <div className="flex items-center gap-4 px-3 py-3 border-t border-b border-slate-900 my-2">
                  <div className="flex items-center gap-1 text-orange-400 text-sm font-semibold">
                    <Flame size={16} className="fill-orange-400" />
                    <span>{user.streak || 0} Day Streak</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
                    <Award size={16} />
                    <span>{user.xp || 0} XP</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs border border-slate-800 bg-slate-900/80 text-slate-200 hover:border-indigo-500 hover:text-white transition"
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-base font-medium text-rose-400 hover:bg-rose-500/10 text-left cursor-pointer"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center px-4 py-2.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-center text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-center text-sm font-semibold shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

