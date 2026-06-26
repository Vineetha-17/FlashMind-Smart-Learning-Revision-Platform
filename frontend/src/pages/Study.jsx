import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { subjectService, flashcardService } from '../services/api';
import FlashcardCard from '../components/FlashcardCard';
import { 
  BookOpen, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Award,
  AlertCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Study() {
  const [searchParams] = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId') || '';

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search, Filter, Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'due', 'hard'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'difficulty'

  // Pagination / Active Card Deck View State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [xpNotice, setXpNotice] = useState(0);

  // Edit Card Dialog State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectService.getAll();
        setSubjects(response.data);

        if (initialSubjectId) {
          setSelectedSubjectId(initialSubjectId);
        } else if (response.data.length > 0) {
          setSelectedSubjectId(response.data[0]._id);
        }
      } catch (err) {
        console.error(err);
        setError('Error loading subjects.');
      }
    };
    fetchSubjects();
  }, [initialSubjectId]);

  const fetchFlashcards = useCallback(async () => {
    if (!selectedSubjectId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await flashcardService.getAll(selectedSubjectId);
      setFlashcards(response.data);
      setCurrentCardIndex(0); // reset index
    } catch (err) {
      console.error(err);
      setError('Failed to fetch flashcards for this subject.');
    } finally {
      setLoading(false);
    }
  }, [selectedSubjectId]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Handle flashcard review rating (spaced repetition API)
  const handleReview = async (cardId, rating) => {
    try {
      const response = await flashcardService.review(cardId, rating);
      const gained = response.data.xpGained;
      
      // Flash XP notice
      setXpNotice(gained);
      setTimeout(() => setXpNotice(0), 2500);

      // Update local XP tracking in storage
      const localUser = JSON.parse(localStorage.getItem('flashmind_user') || '{}');
      localUser.xp = response.data.userXp;
      localStorage.setItem('flashmind_user', JSON.stringify(localUser));

      // Refresh cards list to reflect updated nextReviewDate
      fetchFlashcards();
    } catch (err) {
      console.error(err);
      alert('Error saving review score.');
    }
  };

  // Handle Edit Flashcard (CRUD)
  const handleOpenEdit = (card) => {
    setEditingCard(card);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);

    if (!editQuestion.trim() || !editAnswer.trim()) {
      setEditError('Question and Answer are required.');
      setEditLoading(false);
      return;
    }

    try {
      await flashcardService.update(editingCard._id, {
        question: editQuestion,
        answer: editAnswer,
      });
      setShowEditModal(false);
      fetchFlashcards();
    } catch (err) {
      console.error(err);
      setEditError('Error saving changes.');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete Flashcard (CRUD)
  const handleDeleteCard = async (id) => {
    if (window.confirm('Delete this flashcard permanently?')) {
      try {
        await flashcardService.delete(id);
        fetchFlashcards();
      } catch (err) {
        console.error(err);
        alert('Failed to delete card.');
      }
    }
  };

  // --- Filtering and Sorting Logic ---
  const filteredCards = flashcards
    .filter((card) => {
      // 1. Search Query Match
      const matchesSearch = 
        card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // 2. Spaced Repetition status filters
      if (filterMode === 'due') {
        const isDue = new Date(card.nextReviewDate) <= new Date();
        return isDue;
      }
      if (filterMode === 'hard') {
        return card.difficulty === 'hard';
      }

      return true;
    })
    .sort((a, b) => {
      // 3. Sorting
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'difficulty') {
        const diffWeight = { hard: 3, medium: 2, easy: 1 };
        return (diffWeight[b.difficulty] || 0) - (diffWeight[a.difficulty] || 0);
      }
      // default: newest
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const activeCard = filteredCards[currentCardIndex];

  const handleNextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-left">
      
      {/* Header Deck Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="text-indigo-400" />
            <span>Spaced Revision Mode</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Revise flashcards using active recall. Rate your memory as Easy/Hard to schedule revisions.
          </p>
        </div>

        {/* Dropdown deck selector */}
        {subjects.length > 0 && (
          <div className="w-full md:w-64">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm cursor-pointer"
            >
              {subjects.map((subj) => (
                <option key={subj._id} value={subj._id}>
                  {subj.subjectName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Floating XP Rewards Alert */}
      {xpNotice > 0 && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-bold shadow-lg animate-bounce">
          <Award size={18} />
          <span>+{xpNotice} XP study reward!</span>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center max-w-xl mx-auto mt-12">
          <CheckCircle size={48} className="text-indigo-400 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white">No decks to study</h3>
          <p className="text-slate-400 text-sm mt-2">
            Create a subject deck and add some flashcards before loading Study Mode.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-md cursor-pointer"
          >
            Create Subject Deck
          </Link>
        </div>
      ) : (
        <>
          {/* Controls Bar: Search / Filter / Sort */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-4 mb-8 grid md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search card content..."
                className="block w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-xs"
              />
            </div>

            {/* Filter Tabs */}
            <div className="md:col-span-5 flex bg-slate-950 p-1 rounded-xl border border-slate-900">
              <button
                onClick={() => { setFilterMode('all'); setCurrentCardIndex(0); }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'all' 
                    ? 'bg-slate-900 text-white border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Cards
              </button>
              <button
                onClick={() => { setFilterMode('due'); setCurrentCardIndex(0); }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                  filterMode === 'due' 
                    ? 'bg-slate-900 text-white border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Due Today
              </button>
              <button
                onClick={() => { setFilterMode('hard'); setCurrentCardIndex(0); }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'hard' 
                    ? 'bg-slate-900 text-white border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Weak (Hard)
              </button>
            </div>

            {/* Sort Select */}
            <div className="md:col-span-3 flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-xs cursor-pointer"
              >
                <option value="newest">Recently Added</option>
                <option value="oldest">Oldest</option>
                <option value="difficulty">Difficulty Rating</option>
              </select>
            </div>

          </div>

          {/* Active Card Viewer */}
          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center max-w-xl mx-auto mt-4">
              <CheckCircle size={40} className="text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">
                {filterMode === 'due' ? 'No cards due today!' : 'No cards match filters.'}
              </h3>
              <p className="text-slate-400 text-xs mt-1.5">
                {filterMode === 'due' 
                  ? 'All caught up! Revisit other cards or add new ones to generate flashcards.' 
                  : 'Try typing a different keyword or resetting study filters.'}
              </p>
              
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  to={`/create-cards?subjectId=${selectedSubjectId}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create/AI Gen Cards</span>
                </Link>
                {filterMode !== 'all' && (
                  <button
                    onClick={() => { setFilterMode('all'); setSearchQuery(''); }}
                    className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Pagination/Status Info */}
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-400 font-bold">
                    Card {currentCardIndex + 1}
                  </span>
                  <span>of {filteredCards.length}</span>
                </div>
                <div>
                  Next review scheduled on:{' '}
                  <span className="text-slate-300">
                    {new Date(activeCard.nextReviewDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Flashcard Component */}
              <FlashcardCard
                key={activeCard._id}
                card={activeCard}
                onReview={handleReview}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteCard}
                showControls={true}
              />

              {/* Deck Navigation Buttons */}
              <div className="flex justify-between gap-4">
                <button
                  onClick={handlePrevCard}
                  disabled={currentCardIndex === 0}
                  className="flex-1 py-3 border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleNextCard}
                  disabled={currentCardIndex === filteredCards.length - 1}
                  className="flex-1 py-3 border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>

            </div>
          )}
        </>
      )}

      {/* CRUD Edit Card Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold text-white tracking-tight text-left">
              Edit Flashcard
            </h3>

            {editError && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <AlertCircle size={16} />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  required
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Answer
                </label>
                <textarea
                  required
                  rows="4"
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 px-4 border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
