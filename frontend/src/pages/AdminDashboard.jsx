import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { 
  ShieldAlert, 
  Users, 
  BookOpen, 
  Trash2, 
  AlertCircle,
  BrainCircuit
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminStats = async () => {
    try {
      setError('');
      const response = await adminService.getStats();
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Access Denied: You must be an administrator.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${name}"? This will cascade delete all their subject decks and flashcards!`)) {
      try {
        setLoading(true);
        await adminService.deleteUser(id);
        fetchAdminStats();
      } catch (err) {
        console.error(err);
        setError('Failed to delete user.');
        setLoading(false);
      }
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="text-indigo-400" />
            <span>Admin Platform Panel</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Overview of student engagement metrics, card creations, and active users.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Cards Grid */}
      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        
        {/* Total Users */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{data?.summary?.totalUsers || 0}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Students Registered</div>
          </div>
        </div>

        {/* Total Decks */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{data?.summary?.totalSubjects || 0}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Subject Decks Created</div>
          </div>
        </div>

        {/* Total Flashcards */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BrainCircuit size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{data?.summary?.totalFlashcards || 0}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Flashcards Stored</div>
          </div>
        </div>

      </div>

      {/* User Management Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Active Students</h2>
        <p className="text-slate-400 text-sm mt-1">Review student streaks, XP, card creation progress, and perform CRUD deletes.</p>
      </div>

      {data?.users?.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center max-w-xl mx-auto">
          <Users size={32} className="text-indigo-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No Registered Students Yet</h3>
          <p className="text-slate-400 text-xs mt-1.5">When students register, they will appear here in the platform management list.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
              <thead className="bg-slate-900/60 font-semibold text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Streak</th>
                  <th className="px-6 py-4">XP Points</th>
                  <th className="px-6 py-4">Subject Decks</th>
                  <th className="px-6 py-4">Flashcards</th>
                  <th className="px-6 py-4">Mastered (Easy)</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/10">
                {data?.users?.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{user.name}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-orange-400">🔥 {user.streak} days</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-emerald-400">⭐ {user.xp} XP</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-300">
                      {user.subjectsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-300">
                      {user.flashcardsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-emerald-400/80">
                      {user.masteredCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
