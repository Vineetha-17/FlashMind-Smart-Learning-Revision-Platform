import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { subjectService, flashcardService } from '../services/api';
import { 
  Search,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  HelpCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Globe,
  BookOpen
} from 'lucide-react';

export default function StudyMode() {
  const [searchParams] = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId') || '';

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

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

  // Fetch flashcards for selected subject
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
      setCurrentCardIndex(0);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch flashcards for study.');
    } finally {
      setLoading(false);
    }
  }, [selectedSubjectId]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Filter cards by search query
  const filteredCards = flashcards.filter((card) => {
    return (
      card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeCard = filteredCards[currentCardIndex];

  // Heuristic detailed concept breakdown based on QA
  const getConceptExplanation = (q, a) => {
    const lowerQ = q.toLowerCase();
    
    if (lowerQ.includes('encapsulation')) {
      return "Encapsulation restricts direct access to some of an object's components, which is a key concept in Object-Oriented Programming. By wrapping fields in private declarations and exposing them through getter and setter methods, you enforce control, enhance code security, and prevent data corruption by external classes.";
    }
    if (lowerQ.includes('inheritance')) {
      return "Inheritance promotes code reuse by letting a child class inherit methods, attributes, and behaviors from a parent class. In Java, this is done using the 'extends' keyword. It simplifies code maintenance and allows polymorphism through method overriding.";
    }
    if (lowerQ.includes('polymorphism')) {
      return "Polymorphism means 'many forms'. It allows classes to have different behaviors under a unified interface. Compile-time polymorphism is achieved via method overloading (same name, different arguments), while Runtime polymorphism is achieved via method overriding (parent method rewritten in child).";
    }
    if (lowerQ.includes('jvm')) {
      return "The Java Virtual Machine (JVM) acts as an execution engine that runs Java bytecode. By compiling code into neutral bytecode rather than machine-specific instructions, Java achieves its famous 'Write Once, Run Anywhere' (WORA) cross-platform compatibility.";
    }
    if (lowerQ.includes('supervised')) {
      return "Supervised learning models are trained using labeled training datasets, where each input record maps to a known correct target output. The algorithm iteratively makes predictions on the data and adjusts its parameters until model accuracy is optimized.";
    }
    if (lowerQ.includes('acid')) {
      return "ACID is a set of properties that guarantee database transactions are processed reliably. Atomicity ensures all-or-nothing completion, Consistency maintains database rules, Isolation processes transactions concurrently without interference, and Durability guarantees committed data survives system crashes.";
    }

    // Generic detailed concept summary
    return `This concept focuses on "${q}". To master this topic, understand its definition: "${a}". It represents a key building block in the subject, commonly evaluated in technical reviews and exams. Understanding how it operates, its practical use cases, and how it connects with surrounding subject topics is essential for solidifying your foundational knowledge.`;
  };

  const handleNext = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  // Curated resource link helpers
  const getYoutubeLink = (query) => {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent('how to learn ' + query)}`;
  };

  const getGoogleLink = (query) => {
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-left">
      
      {/* Header Deck Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="text-indigo-400 h-8 w-8" />
            <span>Interactive Study Mode</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Deep dive into subject concepts, watch video tutorials, and search reference guides.
          </p>
        </div>

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

      {subjects.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center max-w-xl mx-auto mt-12">
          <CheckCircle size={48} className="text-indigo-400 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white">No Decks to Study</h3>
          <p className="text-slate-400 text-sm mt-2">
            Create a subject deck and add some flashcards to load Study Mode.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-md cursor-pointer"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-4 mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentCardIndex(0); }}
                placeholder="Search concepts in this deck..."
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Core Content */}
          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center max-w-xl mx-auto">
              <HelpCircle size={40} className="text-indigo-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">No Concepts Found</h3>
              <p className="text-slate-400 text-sm mt-2">
                This subject deck is empty or no concepts match your search criteria.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  to={`/create-cards?subjectId=${selectedSubjectId}`}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create Flashcards (AI/Manual)</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Concept Core Card */}
              <div className="md:col-span-8 space-y-6">
                
                {/* Concept Main Card */}
                <div className="glass-panel rounded-3xl p-8 border border-indigo-500/20 shadow-2xl relative overflow-hidden bg-gradient-to-b from-slate-900/30 to-slate-900/80">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-indigo-400"></div>
                  
                  {/* Status Indicator */}
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-indigo-400 mb-6">
                    <span>Active Concept Card</span>
                    <span>{currentCardIndex + 1} of {filteredCards.length}</span>
                  </div>

                  {/* Concept Question */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/15 text-indigo-300">
                      Concept Key Question
                    </span>
                    <h3 className="text-2xl font-extrabold text-white leading-snug tracking-tight pt-2">
                      {activeCard.question}
                    </h3>
                  </div>

                  {/* Separator line */}
                  <div className="h-px bg-slate-800/80 my-6"></div>

                  {/* Concept Definition (Answer) */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/15 text-emerald-300">
                      Core Explanation / Definition
                    </span>
                    <p className="text-slate-200 text-base leading-relaxed whitespace-pre-wrap select-text pt-2">
                      {activeCard.answer}
                    </p>
                  </div>

                  {/* Detailed Context Breakdown */}
                  <div className="mt-8 pt-6 border-t border-slate-800/60 space-y-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/15 text-purple-300">
                      Deep Dive Concept Notes
                    </span>
                    <p className="text-slate-400 text-sm leading-relaxed select-text pt-2">
                      {getConceptExplanation(activeCard.question, activeCard.answer)}
                    </p>
                  </div>

                </div>

                {/* Deck Navigation Controls */}
                <div className="flex justify-between gap-4">
                  <button
                    onClick={handlePrev}
                    disabled={currentCardIndex === 0}
                    className="flex-1 py-3.5 border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white disabled:opacity-30 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous Concept</span>
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentCardIndex === filteredCards.length - 1}
                    className="flex-1 py-3.5 border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white disabled:opacity-30 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Next Concept</span>
                    <ChevronRight size={16} />
                  </button>
                </div>

              </div>

              {/* Right Column: Dynamic Resource References */}
              <div className="md:col-span-4 space-y-6">
                
                {/* Resources Card */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 relative overflow-hidden bg-slate-900/10">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500 to-rose-500"></div>
                  
                  <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles size={16} className="text-pink-400" />
                    <span>Video & Web Tutorials</span>
                  </h4>
                  
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Watch structured lessons or lookup articles addressing this concept.
                  </p>

                  <div className="space-y-3 pt-2">
                    {/* YouTube Search Link */}
                    <a
                      href={getYoutubeLink(activeCard.question)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-md shadow-rose-600/10 hover:shadow-rose-500/25 transition-all text-center cursor-pointer"
                    >
                      <svg className="h-5 w-5 fill-white flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.388.51a3.003 3.003 0 0 0-2.11 2.108C0 8.025 0 12 0 12s0 3.975.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.863.51 9.388.51 9.388.51s7.524 0 9.388-.51a3.003 3.003 0 0 0 2.11-2.108C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span>Watch YouTube Tutorials</span>
                    </a>

                    {/* Google Search Link */}
                    <a
                      href={getGoogleLink(activeCard.question)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white text-sm font-bold transition-all text-center"
                    >
                      <Globe size={16} />
                      <span>Search on Google</span>
                    </a>
                  </div>
                </div>

                {/* Spaced Repetition Link shortcut */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 text-center space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">Ready to self-test?</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Switch to **Revision Mode** to test your recall with spaced repetition intervals.
                  </p>
                  <Link
                    to={`/revision?subjectId=${selectedSubjectId}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-600/10 border border-indigo-500/25 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-bold transition-all"
                  >
                    <BookOpen size={14} />
                    <span>Enter Revision Mode</span>
                  </Link>
                </div>

              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
}
