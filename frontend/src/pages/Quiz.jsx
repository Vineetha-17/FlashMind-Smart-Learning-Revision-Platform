import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectService, aiService, quizService } from '../services/api';
import { 
  Award, 
  Brain, 
  HelpCircle, 
  Play, 
  Sparkles, 
  AlertCircle, 
  History, 
  Check, 
  X, 
  ArrowLeft,
  Calendar,
  RotateCcw,
  LayoutDashboard
} from 'lucide-react';

export default function Quiz() {
  const navigate = useNavigate();
  
  // Page modes: 'setup' | 'loading' | 'active' | 'result'
  const [mode, setMode] = useState('setup');
  
  // Data lists
  const [subjects, setSubjects] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Setup selections
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [topic, setTopic] = useState('');
  
  // Quiz active states
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // idx: selectedOptionText
  const [quizScore, setQuizScore] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [userXp, setUserXp] = useState(0);
  
  // UI states
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [quizGenerating, setQuizGenerating] = useState(false);
  const [error, setError] = useState('');
  const [quizError, setQuizError] = useState('');

  // Load subjects and history on mount
  useEffect(() => {
    fetchSubjects();
    fetchHistory();
  }, []);

  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const res = await subjectService.getAll();
      setSubjects(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedSubjectId(res.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subject decks.');
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await quizService.getHistory();
      setHistory(res.data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStartQuiz = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      setQuizError('Please select a subject.');
      return;
    }
    if (!topic.trim()) {
      setQuizError('Please specify a topic.');
      return;
    }

    try {
      setQuizError('');
      setQuizGenerating(true);
      setMode('loading');
      
      const response = await aiService.generateQuiz({
        subjectId: selectedSubjectId,
        topic: topic.trim()
      });

      const generatedQuestions = response.data.quiz;
      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setCurrentQuestionIdx(0);
        setSelectedAnswers({});
        setMode('active');
      } else {
        throw new Error('No questions received. Please try again.');
      }
    } catch (err) {
      console.error('Error starting quiz:', err);
      setQuizError(err.response?.data?.message || 'Error generating quiz. Please check your guardrails and try again.');
      setMode('setup');
    } finally {
      setQuizGenerating(false);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIdx]: option
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Calculate Score
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score += 1;
      }
    });

    try {
      setMode('loading');
      const payload = {
        subjectId: selectedSubjectId,
        score,
        totalQuestions: questions.length,
        topic: topic.trim()
      };
      
      const res = await quizService.saveScore(payload);
      
      setQuizScore(score);
      setXpGained(res.data.xpGained || 0);
      setUserXp(res.data.userXp || 0);
      
      // Update local storage user profile with latest XP if available
      const localUser = JSON.parse(localStorage.getItem('flashmind_user') || '{}');
      if (res.data.userXp) {
        localUser.xp = res.data.userXp;
        localStorage.setItem('flashmind_user', JSON.stringify(localUser));
      }
      
      setMode('result');
      fetchHistory(); // reload history
    } catch (err) {
      console.error('Error submitting score:', err);
      setQuizError('Failed to save your score, but here are your results.');
      setQuizScore(score);
      setXpGained(score * 20); // fallback local calc
      setMode('result');
    }
  };

  const handleReset = () => {
    setTopic('');
    setQuestions([]);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizError('');
    setMode('setup');
  };

  // Helper for progress percentage
  const progressPercent = questions.length > 0 
    ? Math.round(((Object.keys(selectedAnswers).length) / questions.length) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Title */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Brain className="text-indigo-400" />
            <span>Practice Quiz</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate customized academic multiple choice tests powered by AI.
          </p>
        </div>
        {mode !== 'setup' && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Exit Quiz</span>
          </button>
        )}
      </div>

      {/* ERROR MESSAGE BAR */}
      {quizError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">Error: </span>
            {quizError}
          </div>
        </div>
      )}

      {/* 1. SETUP MODE */}
      {mode === 'setup' && (
        <div className="grid md:grid-cols-3 gap-8 text-left">
          {/* Setup Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" />
                <span>Configure AI Quiz</span>
              </h2>

              {subjectsLoading ? (
                <div className="h-20 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : subjects.length === 0 ? (
                <div className="p-6 text-center border border-slate-800 bg-slate-900/40 rounded-xl space-y-4">
                  <HelpCircle size={32} className="text-slate-400 mx-auto" />
                  <h3 className="font-semibold text-white">No Subjects Found</h3>
                  <p className="text-xs text-slate-400">You need to create a subject deck before generating a quiz.</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleStartQuiz} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">
                      Target Subject Deck
                    </label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="block w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm cursor-pointer"
                    >
                      {subjects.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.subjectName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">
                      Enter Topic for Quiz
                    </label>
                    <input
                      type="text"
                      required
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Encapsulation, SQL Joins, Supervised Learning"
                      className="block w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    />
                    <p className="text-slate-500 text-xs mt-1.5">
                      Enter academic topics. Off-topic, proper names, or gossip inputs will be rejected by our guardrails.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={quizGenerating}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/25 cursor-pointer disabled:opacity-50"
                  >
                    <Play size={16} className="fill-white" />
                    <span>Generate AI Quiz</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* History Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 h-full flex flex-col">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <History size={18} className="text-indigo-400" />
                <span>Quiz History</span>
              </h2>

              {historyLoading ? (
                <div className="flex-grow flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-800 rounded-xl">
                  <Award size={28} className="text-slate-500 mb-2" />
                  <p className="text-xs text-slate-400">No quizzes completed yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {history.slice(0, 5).map((q) => (
                    <div key={q._id} className="p-3 border border-slate-800 bg-slate-900/40 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-200 truncate max-w-[100px]">{q.topic}</span>
                        <span className="font-black text-indigo-400 shrink-0">{q.score}/{q.totalQuestions}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>{q.subjectId?.subjectName || 'Deleted Subject'}</span>
                        <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
                          +{q.score * 20} XP
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-500 pt-0.5 flex items-center gap-1">
                        <Calendar size={10} />
                        <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {history.length > 5 && (
                    <p className="text-center text-[10px] text-slate-400 pt-2 font-medium">
                      Showing last 5 quizzes
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. LOADING STATE */}
      {mode === 'loading' && (
        <div className="glass-panel p-16 rounded-3xl border border-slate-800 text-center space-y-6">
          <div className="relative h-24 w-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
            <Brain size={40} className="text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Generating Quiz Questions...</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
              Our AI is reviewing academic concepts to prepare 5 multiple-choice questions for you.
            </p>
          </div>
        </div>
      )}

      {/* 3. ACTIVE QUIZ PLAY-MODE */}
      {mode === 'active' && questions.length > 0 && (
        <div className="space-y-6 text-left">
          {/* Progress and status */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-black">
                {currentQuestionIdx + 1}
              </div>
              <div>
                <div className="text-sm font-bold text-white">Question {currentQuestionIdx + 1} of {questions.length}</div>
                <div className="text-[10px] text-slate-400">Topic: {topic}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3 sm:w-1/2">
              <div className="flex-grow h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-black text-slate-300">
                {Math.round(((currentQuestionIdx + 1) / questions.length) * 100)}%
              </span>
            </div>
          </div>

          {/* Question Box */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {questions[currentQuestionIdx].question}
            </h3>

            {/* Options list */}
            <div className="grid gap-3 pt-2">
              {questions[currentQuestionIdx].options.map((option, oIdx) => {
                const isSelected = selectedAnswers[currentQuestionIdx] === option;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleOptionSelect(option)}
                    className={`
                      w-full py-4 px-5 rounded-xl border text-left text-sm font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer
                      ${isSelected 
                        ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-600/5' 
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }
                    `}
                  >
                    <span>{option}</span>
                    <div className={`
                      h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ml-4
                      ${isSelected 
                        ? 'border-indigo-400 bg-indigo-500 text-slate-950' 
                        : 'border-slate-800'
                      }
                    `}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIdx === 0}
              className="px-5 py-3 rounded-xl border border-slate-800 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              Previous
            </button>

            {currentQuestionIdx < questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswers[currentQuestionIdx]}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/25 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length < questions.length}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-500/25 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                Submit Answers
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. RESULT MODE */}
      {mode === 'result' && (
        <div className="space-y-8 text-left">
          {/* Header completion card */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-bl-full flex items-center justify-center text-emerald-500/20">
              <Award size={96} className="fill-emerald-500/5" />
            </div>

            <div className="space-y-4 max-w-md text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wide">
                <Award size={14} />
                <span>Quiz Complete</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {quizScore === questions.length 
                  ? 'Perfect Score! Exceptional Work!' 
                  : quizScore >= 3 
                  ? 'Great Job! Keep Learning!' 
                  : 'Good Attempt! Study more and try again!'}
              </h2>
              <p className="text-slate-400 text-sm">
                You scored <span className="font-bold text-white">{quizScore} out of {questions.length}</span> correct answers on <span className="font-semibold text-slate-200">"{topic}"</span>.
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-sm">
                  +{xpGained} XP Boost
                </div>
                {userXp > 0 && (
                  <div className="text-xs text-slate-400">
                    Your current total: <span className="font-semibold text-slate-200">{userXp} XP</span>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Ring Score Card */}
            <div className="relative h-36 w-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="stroke-slate-900"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="stroke-emerald-500 transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 58}
                  strokeDashoffset={2 * Math.PI * 58 * (1 - quizScore / questions.length)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{quizScore}/{questions.length}</span>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Correct</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/15 hover:shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Take Another Quiz</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300 hover:text-white font-bold text-sm transition-all cursor-pointer"
            >
              <LayoutDashboard size={16} />
              <span>Back to Dashboard</span>
            </button>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Review Questions</h3>
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userSelection = selectedAnswers[idx];
                const isCorrect = userSelection === q.correctAnswer;
                
                return (
                  <div 
                    key={idx}
                    className={`
                      glass-panel p-6 rounded-2xl border transition-colors
                      ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}
                    `}
                  >
                    <div className="flex items-start gap-3 justify-between">
                      <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                        Q{idx + 1}: {q.question}
                      </h4>
                      <div className={`
                        h-6 w-6 rounded-full flex items-center justify-center shrink-0 ml-4
                        ${isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}
                      `}>
                        {isCorrect ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                      </div>
                    </div>

                    <div className="grid gap-2 mt-4 text-xs font-semibold">
                      {q.options.map((opt, oIdx) => {
                        const optIsSelected = userSelection === opt;
                        const optIsCorrect = q.correctAnswer === opt;
                        
                        let optionStyle = 'border-slate-800 bg-slate-900/30 text-slate-400';
                        if (optIsCorrect) {
                          optionStyle = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
                        } else if (optIsSelected && !isCorrect) {
                          optionStyle = 'border-rose-500/30 bg-rose-500/10 text-rose-300';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`p-3 rounded-lg border flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {optIsCorrect && (
                              <span className="text-[10px] uppercase font-bold text-emerald-400">Correct Answer</span>
                            )}
                            {optIsSelected && !isCorrect && (
                              <span className="text-[10px] uppercase font-bold text-rose-400">Your Choice</span>
                            )}
                            {optIsSelected && isCorrect && (
                              <span className="text-[10px] uppercase font-bold text-emerald-400">Your Choice</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
