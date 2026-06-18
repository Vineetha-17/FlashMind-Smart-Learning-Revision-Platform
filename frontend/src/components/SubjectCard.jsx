import React from 'react';
import { BookOpen, Edit2, Trash2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SubjectCard({ 
  subject, 
  cardCount = 0, 
  memoryScore = 0, 
  onEdit, 
  onDelete 
}) {
  
  // Get color based on memory score
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getProgressBarColor = (score) => {
    if (score >= 80) return 'bg-emerald-500 glow-emerald';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Decorative top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-pink-500"></div>

      <div>
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
            {subject.subjectName}
          </h3>
          <div className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${getScoreColorClass(memoryScore)}`}>
            {memoryScore}% Health
          </div>
        </div>

        <p className="text-slate-400 text-sm mt-2 line-clamp-2 min-h-[40px]">
          {subject.description || 'No description provided.'}
        </p>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span>Memory Retention</span>
            <span>{memoryScore}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(memoryScore)}`}
              style={{ width: `${memoryScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          {cardCount} {cardCount === 1 ? 'card' : 'cards'}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(subject)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Edit Subject"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(subject._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Delete Subject"
          >
            <Trash2 size={16} />
          </button>
          <Link
            to={`/study-mode?subjectId=${subject._id}`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-indigo-400 hover:text-indigo-300 text-[11px] font-bold transition-all cursor-pointer"
            title="Study Concepts"
          >
            <GraduationCap size={12} />
            <span>Study</span>
          </Link>
          <Link
            to={`/revision?subjectId=${subject._id}`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/25 transition-all cursor-pointer"
            title="Spaced Repetition Review"
          >
            <BookOpen size={12} />
            <span>Revise</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
