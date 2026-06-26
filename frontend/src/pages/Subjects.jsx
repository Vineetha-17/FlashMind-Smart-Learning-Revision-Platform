import { useState, useEffect, useCallback } from 'react';
import { subjectService, dashboardService } from '../services/api';
import SubjectCard from '../components/SubjectCard';
import { 
  Plus,
  AlertCircle,
  X,
  PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Subjects() {
  const [subjectsProgress, setSubjectsProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchSubjects = useCallback(async () => {
    try {
      setError('');
      // Get subject progress details which contains counts and memory score
      const response = await dashboardService.getDashboard();
      setSubjectsProgress(response.data.subjectProgress || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch subject decks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setSubjectName('');
    setDescription('');
    setFormError('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (subject) => {
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
        await subjectService.update(editingSubject._id, { subjectName, description });
      } else {
        await subjectService.create({ subjectName, description });
      }
      setShowFormModal(false);
      fetchSubjects();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject? All associated flashcards will be permanently deleted!')) {
      try {
        setLoading(true);
        await subjectService.delete(id);
        fetchSubjects();
      } catch (err) {
        console.error(err);
        setError('Failed to delete subject.');
        setLoading(false);
      }
    }
  };

  if (loading && subjectsProgress.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Manage Subject Decks
          </h1>
          <p className="text-slate-400 mt-1">
            Create subjects, modify details, and configure decks for AI active recall.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/15 hover:shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <Plus size={18} />
          <span>New Subject Deck</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {subjectsProgress.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center max-w-xl mx-auto mt-12">
          <PlusCircle size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">No Decks Found</h3>
          <p className="text-slate-400 text-sm mt-2">
            You don't have any subjects configured yet. Create one to begin generating flashcards.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-md cursor-pointer"
          >
            Create Subject Deck
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectsProgress.map((prog) => {
            const rawSubj = {
              _id: prog.subjectId,
              subjectName: prog.subjectName,
              description: prog.description || 'Decks for revisions.'
            };
            return (
              <div key={prog.subjectId} className="relative group">
                <SubjectCard
                  subject={rawSubj}
                  cardCount={prog.totalCards}
                  memoryScore={prog.memoryScore}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteSubject}
                />
                
                {/* Additional quick actions overlay on card hover */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Link
                    to={`/create-cards?subjectId=${prog.subjectId}`}
                    className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-slate-900 transition-all flex items-center gap-1 shadow-md opacity-0 group-hover:opacity-100"
                    title="Add cards"
                  >
                    <Plus size={12} />
                    <span>Add Cards</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CRUD Modal Form */}
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
                  placeholder="e.g. DBMS, ML, Java"
                  className="block w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="Summary or syllabus topics..."
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
