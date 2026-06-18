import React, { useState } from 'react';
import { RefreshCw, Check, AlertTriangle, Edit3, Trash2 } from 'lucide-react';

export default function FlashcardCard({ 
  card, 
  onReview, 
  onEdit, 
  onDelete,
  showControls = true 
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  const handleReviewClick = (e, rating) => {
    e.stopPropagation(); // prevent flipping card when clicking rating button
    setIsFlipped(false); // reset flip state for next card
    setUserAnswer(''); // clear input for next card
    if (onReview) {
      onReview(card._id, rating);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(card);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(card._id);
    }
  };

  const handleCheckAnswer = (e) => {
    e.stopPropagation();
    setIsFlipped(true);
  };

  // Get difficulty badge color
  const getDiffBadge = (diff) => {
    if (diff === 'easy') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (diff === 'hard') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  return (
    <div 
      className="perspective-1000 w-full h-[320px] group"
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* ================= FRONT SIDE (Question & Input) ================= */}
        <div className="absolute inset-0 w-full h-full backface-hidden glass-panel rounded-2xl p-6 flex flex-col justify-between border border-slate-800 bg-slate-900/30">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Recall Testing</span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getDiffBadge(card.difficulty)}`}>
                {card.difficulty}
              </span>
              <button 
                onClick={handleEditClick} 
                className="p-1 rounded text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                title="Edit Flashcard"
              >
                <Edit3 size={14} />
              </button>
              <button 
                onClick={handleDeleteClick} 
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Delete Flashcard"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="text-center py-2">
            <h4 className="text-base font-bold text-slate-100 px-4 leading-relaxed">
              {card.question}
            </h4>
          </div>

          {/* User Input Blanks Box */}
          <div className="flex-grow flex flex-col justify-center px-4" onClick={(e) => e.stopPropagation()}>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here from memory before flipping..."
              rows="3"
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500/60 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 text-xs focus:ring-1 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Submit Button to Flip */}
          <div className="pt-2">
            <button
              onClick={handleCheckAnswer}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={12} className="animate-spin-slow" />
              <span>Check Answer</span>
            </button>
          </div>

        </div>

        {/* ================= BACK SIDE (Compare Answer) ================= */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 glass-panel rounded-2xl p-6 flex flex-col justify-between border border-indigo-500/25 bg-slate-900/95 glow-indigo">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Recall Comparison</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleEditClick} 
                className="p-1 rounded text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
              >
                <Edit3 size={14} />
              </button>
              <button 
                onClick={handleDeleteClick} 
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Split Answer View */}
          <div className="flex-grow flex flex-col justify-between py-2 text-left space-y-4 overflow-y-auto">
            
            {/* Correct Answer */}
            <div className="px-4">
              <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">
                Correct Answer
              </span>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-text mt-1">
                {card.answer}
              </p>
            </div>

            {/* What they wrote */}
            <div className="px-4 border-t border-slate-800/80 pt-3">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                Your Typed Response
              </span>
              <p className="text-xs text-slate-400 italic leading-relaxed whitespace-pre-wrap select-text mt-1">
                {userAnswer.trim() ? userAnswer : "(No answer typed)"}
              </p>
            </div>

          </div>

          {/* Spaced Repetition Buttons */}
          {showControls ? (
            <div className="flex gap-3 pt-2">
              <button
                onClick={(e) => handleReviewClick(e, 'hard')}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-bold transition-all shadow-sm cursor-pointer"
              >
                <AlertTriangle size={14} />
                <span>Hard (1d)</span>
              </button>
              <button
                onClick={(e) => handleReviewClick(e, 'easy')}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-bold transition-all shadow-sm cursor-pointer"
              >
                <Check size={14} />
                <span>Easy (4d)</span>
              </button>
            </div>
          ) : (
            <div 
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium py-1 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Flip back to Question</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
