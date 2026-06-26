import { useState, useEffect } from 'react';
import { dashboardService, subjectService } from '../services/api';
import SubjectCard from '../components/SubjectCard';
import { 
  Plus, 
  Flame, 
  Award, 
  Brain, 
  BookOpen, 
  CheckCircle,
  HelpCircle,
  X,
  AlertCircle,
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Subject Form State (for Create/Edit CRUD)
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const getBadgeLabel = (xp = 0) => {
    if (xp >= 300) return 'Legendary Scholar';
    if (xp >= 180) return 'Flash Scholar';
    if (xp >= 80) return 'Rising Mind';
    return 'New Learner';
  };

  const getBadgeText = (xp = 0) => {
    if (xp >= 300) return 'You are mastering every review session and making learning feel effortless.';
    if (xp >= 180) return 'Your streak is strong and your study momentum is on fire.';
    if (xp >= 80) return 'A dedicated learner building powerful memory habits.';
    return 'Kick off your learning journey with consistency and curiosity.';
  };

  // Fetch Dashboard Stats & Subjects
  const fetchDashboardData = async () => {
    try {
      setError('');
      const response = await dashboardService.getDashboard();
      setData(response.data);
      
      // Update local storage user profile with latest XP and Streak if changed
      const localUser = JSON.parse(localStorage.getItem('flashmind_user') || '{}');
      if (response.data.user.xp !== localUser.xp || response.data.user.streak !== localUser.streak) {
        localUser.xp = response.data.user.xp;
        localUser.streak = response.data.user.streak;
        localStorage.setItem('flashmind_user', JSON.stringify(localUser));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingSubject(null);
    setSubjectName('');
    setDescription('');
    setFormError('');
    setShowFormModal(true);
  };

  const handleOpenEditModal = (subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.subjectName);
    setDescription(subject.description || '');
    setFormError('');
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    if (!subjectName.trim()) {
      setFormError('Subject name is required.');
      setFormLoading(false);
      return;
    }

    try {
      if (editingSubject) {
        // Edit Subject
        await subjectService.update(editingSubject._id, { subjectName, description });
      } else {
        // Create Subject
        await subjectService.create({ subjectName, description });
      }
      setShowFormModal(false);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error saving subject.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject? All associated flashcards will be permanently deleted!')) {
      try {
        setLoading(true);
        await subjectService.delete(id);
        fetchDashboardData();
      } catch (err) {
        console.error(err);
        alert('Failed to delete subject. Please try again.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome, {data?.user?.name || 'Scholar'}!
          </h1>
          <p className="text-slate-400 mt-1">
            Track your memory strength and review your subject decks.
          </p>
        </div>

        {/* Create Subject CTA */}
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/15 hover:shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <Plus size={18} />
          <span>New Subject Deck</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
        
        {/* Stat 1: Study Streak */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-orange-500/5 rounded-bl-full flex items-center justify-center text-orange-500/20">
            <Flame size={48} className="fill-orange-500/5" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Flame size={24} className="fill-orange-400/25" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{data?.user?.streak || 0} Days</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Study Streak</div>
          </div>
        </div>

        {/* Stat 2: Total Cards */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-bl-full flex items-center justify-center text-indigo-500/20">
            <BookOpen size={48} />
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{data?.stats?.totalCards || 0}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Cards Created</div>
          </div>
        </div>

        {/* Stat 3: Cards Mastered */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full flex items-center justify-center text-emerald-500/20">
            <CheckCircle size={48} />
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{data?.stats?.masteredCards || 0}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Cards Mastered</div>
          </div>
        </div>

        {/* Stat 4: Memory Health */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-pink-500/5 rounded-bl-full flex items-center justify-center text-pink-500/20">
            <Brain size={48} />
          </div>
          <div className="h-12 w-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Brain size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{data?.stats?.overallMemoryScore || 0}%</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Memory Score</div>
          </div>
        </div>

        {/* Stat 5: Total Quizzes */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/5 rounded-bl-full flex items-center justify-center text-cyan-500/20">
            <HelpCircle size={48} />
          </div>
          <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <HelpCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{data?.stats?.totalQuizzes || 0}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Quizzes Run</div>
          </div>
        </div>

        {/* Stat 6: Average Score */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 rounded-bl-full flex items-center justify-center text-amber-500/20">
            <Award size={48} />
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{data?.stats?.avgQuizScore || 0}%</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Avg Score</div>
          </div>
        </div>

      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 p-6 mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Achievement Badge</p>
            <div className="mt-3 text-2xl font-black text-white">{getBadgeLabel(data?.user?.xp)}</div>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">{getBadgeText(data?.user?.xp)}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
            <Award size={18} className="text-amber-300" />
            <span>{data?.user?.xp || 0} XP · {data?.user?.streak || 0} day streak</span>
          </div>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Your Subject Decks</h2>
        <p className="text-slate-400 text-sm mt-1">Select a deck to review, or use the actions to edit your cards.</p>
      </div>

      {data?.subjectProgress?.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center max-w-xl mx-auto mt-8">
          <div className="h-16 w-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-6">
            <HelpCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-white">No Subject Decks Yet</h3>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Create your first subject deck to start adding manual flashcards or generating flashcards instantly with Gemini AI.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-600/15 transition-all cursor-pointer"
          >
            Create Your First Subject
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.subjectProgress?.map((prog) => {
            const rawSubj = {
              _id: prog.subjectId,
              subjectName: prog.subjectName,
              description: data?.subjectProgress?.find(s => s.subjectId === prog.subjectId)?.description || 'Decks for revisions.'
            };
            return (
              <SubjectCard
                key={prog.subjectId}
                subject={rawSubj}
                cardCount={prog.totalCards}
                memoryScore={prog.memoryScore}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteSubject}
              />
            );
          })}
        </div>
      )}

      {/* CRUD Subject Modals */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold text-white tracking-tight">
              {editingSubject ? 'Edit Subject Deck' : 'Create Subject Deck'}
            </h3>

            {formError && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Machine Learning, DBMS, Java"
                  className="block w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="Summary or syllabus notes..."
                  className="block w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-3 px-4 border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
