import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subjectService, flashcardService, aiService } from '../services/api';
import { 
  Sparkles, 
  FileText, 
  Plus, 
  Check, 
  AlertCircle, 
  Upload
} from 'lucide-react';

export default function CreateCards() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultSubjectId = searchParams.get('subjectId') || '';

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultSubjectId);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual', 'topic', 'notes'
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Manual Form State
  const [manualQuestion, setManualQuestion] = useState('');
  const [manualAnswer, setManualAnswer] = useState('');

  // 2. Topic AI State
  const [aiTopic, setAiTopic] = useState('');

  // 3. Notes AI State
  const [notesText, setNotesText] = useState('');
  const [fileName, setFileName] = useState('');

  // Load user's subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectService.getAll();
        setSubjects(response.data);
        if (response.data.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(response.data[0]._id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load subjects. Please create a subject deck first.');
      } finally {
        setPageLoading(false);
      }
    };
    fetchSubjects();
  }, [selectedSubjectId]);

  // Handle local file text reading (.txt)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNotesText(event.target.result);
        setSuccess('Successfully read notes from text file!');
        setTimeout(() => setSuccess(''), 3000);
      };
      reader.readAsText(file);
    } else {
      // Mock pdf/doc extraction for other files
      setNotesText(`[Content extracted from ${file.name}]:\n\nThis is a mock note extraction for demonstrating ${file.name} content parsing. Add your study notes here or copy-paste them to generate flashcards!`);
      setSuccess(`Uploaded ${file.name}. Click 'Generate' to analyze.`);
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  // Submit Manual Card
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSubjectId) {
      setError('Please select or create a subject deck first.');
      return;
    }
    if (!manualQuestion.trim() || !manualAnswer.trim()) {
      setError('Please fill in both the question and answer.');
      return;
    }

    setLoading(true);
    try {
      await flashcardService.create({
        question: manualQuestion,
        answer: manualAnswer,
        subjectId: selectedSubjectId
      });
      setSuccess('Flashcard created successfully!');
      setManualQuestion('');
      setManualAnswer('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to create flashcard.');
    } finally {
      setLoading(false);
    }
  };

  // Submit AI Topic Generation
  const handleAiTopicSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSubjectId) {
      setError('Please select or create a subject deck first.');
      return;
    }
    if (!aiTopic.trim()) {
      setError('Please enter a topic name.');
      return;
    }

    setLoading(true);
    try {
      const response = await aiService.generate({
        topic: aiTopic,
        subjectId: selectedSubjectId
      });
      setSuccess(response.data.message || 'AI successfully generated 5 flashcards!');
      setAiTopic('');
      
      // Update XP in local user storage
      if (response.data.cards) {
        const localUser = JSON.parse(localStorage.getItem('flashmind_user') || '{}');
        localUser.xp = (localUser.xp || 0) + (response.data.isMock ? 10 : 25); // bonus XP!
        localStorage.setItem('flashmind_user', JSON.stringify(localUser));
      }

      setTimeout(() => {
        navigate(`/revision?subjectId=${selectedSubjectId}`);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to generate cards. Please check your internet or retry.');
    } finally {
      setLoading(false);
    }
  };

  // Submit AI Notes Generation
  const handleAiNotesSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSubjectId) {
      setError('Please select or create a subject deck first.');
      return;
    }
    if (!notesText.trim()) {
      setError('Please paste notes or upload a text file.');
      return;
    }

    setLoading(true);
    try {
      const response = await aiService.generate({
        notes: notesText,
        subjectId: selectedSubjectId
      });
      setSuccess(response.data.message || 'AI successfully generated flashcards from your notes!');
      setNotesText('');
      setFileName('');
      
      setTimeout(() => {
        navigate(`/revision?subjectId=${selectedSubjectId}`);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to generate cards from notes.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-left">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Create Flashcards
        </h1>
        <p className="text-slate-400 mt-1">
          Add revision cards manually or generate them instantly using Gemini AI.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
          <Check size={18} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left Options Form Panel */}
        <div className="md:col-span-8 glass-panel rounded-3xl p-6 border border-slate-800 space-y-6 relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-pink-500"></div>

          {/* Subject Deck Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Select Target Subject Deck
            </label>
            {subjects.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                No subjects found. Please create a subject in the dashboard first.
              </div>
            ) : (
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm cursor-pointer"
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.subjectName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Creation Mode Tabs */}
          <div className="border-b border-slate-800">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('manual')}
                className={`pb-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'manual' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Manual Creation
              </button>
              <button
                onClick={() => setActiveTab('topic')}
                className={`pb-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'topic' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Generate by Topic (AI)
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'notes' 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Upload Notes (AI)
              </button>
            </nav>
          </div>

          {/* Form Content depending on tab */}
          
          {/* TAB 1: MANUAL */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Question / Concept Name
                </label>
                <input
                  type="text"
                  required
                  value={manualQuestion}
                  onChange={(e) => setManualQuestion(e.target.value)}
                  placeholder="e.g. What is the Big O complexity of QuickSort?"
                  className="block w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Answer / Definition
                </label>
                <textarea
                  required
                  rows="4"
                  value={manualAnswer}
                  onChange={(e) => setManualAnswer(e.target.value)}
                  placeholder="e.g. O(n log n) in the best/average cases, and O(n^2) in the worst case when the pivot is chosen poorly."
                  className="block w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading || subjects.length === 0}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Create Flashcard</span>
              </button>
            </form>
          )}

          {/* TAB 2: AI TOPIC */}
          {activeTab === 'topic' && (
            <form onSubmit={handleAiTopicSubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3 text-slate-300 text-sm">
                <Sparkles size={20} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>
                  Enter any exam topic or subject module. Gemini AI will automatically generate 5 high-yield revision flashcards for your deck under strict academic guardrails.
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Study Topic
                </label>
                <input
                  type="text"
                  required
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Java OOP Polymorphism, ACID properties database, Neural Networks"
                  className="block w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading || subjects.length === 0}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={16} />
                <span>{loading ? 'AI is generating cards...' : 'Generate with Gemini AI'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: AI NOTES */}
          {activeTab === 'notes' && (
            <form onSubmit={handleAiNotesSubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3 text-slate-300 text-sm">
                <FileText size={20} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>
                  Paste lecture slides or drag-and-drop a note file. Gemini AI will digest the material under safe academic guardrails and build matching cards.
                </span>
              </div>

              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/40 rounded-xl p-6 text-center cursor-pointer transition-colors relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".txt"
                />
                <Upload size={32} className="text-slate-500 mx-auto mb-2.5" />
                <span className="block text-sm font-semibold text-slate-300">
                  {fileName ? `File Selected: ${fileName}` : 'Click to upload .txt files'}
                </span>
                <span className="block text-xs text-slate-500 mt-1">
                  (Or copy-paste your raw notes below)
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Lecture Notes / Summaries
                </label>
                <textarea
                  rows="6"
                  required
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Paste study notes, textbook pages, or transcripts..."
                  className="block w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading || subjects.length === 0}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={16} />
                <span>{loading ? 'Analyzing notes...' : 'Extract Flashcards with AI'}</span>
              </button>
            </form>
          )}

        </div>

        {/* Right Info mascot column */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 h-10 w-10 bg-indigo-500/5 rounded-bl-full"></div>
            <img
              src="/logo.jpg"
              alt="Mascot"
              className="h-28 w-28 rounded-2xl object-cover border border-slate-700/50 shadow-md mx-auto mb-4"
              onError={(e) => {
                e.target.src = 'https://img.icons8.com/clouds/100/owl.png';
              }}
            />
            <h4 className="text-base font-bold text-white">Gemini Pro Tip</h4>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Generating cards with AI extracts core definitions, keyword questions, and application scenarios. Your cards are stored in your subject deck and set to revise immediately!
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider text-left">Flashcard Guidelines</h4>
            <ul className="space-y-2 text-xs text-slate-400 text-left">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold mt-0.5">•</span>
                <span>Keep questions focused on a single key definition or concept.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold mt-0.5">•</span>
                <span>Answers should be brief to support quick flipping retention.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold mt-0.5">•</span>
                <span>Use active recall by trying to speak/think the answer before flipping!</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
