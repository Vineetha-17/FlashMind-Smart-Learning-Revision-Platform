import { Link } from 'react-router-dom';
import { BrainCircuit, Activity, Zap, Flame, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

export default function Landing() {
  const token = localStorage.getItem('flashmind_token');

  return (
    <div className="min-h-screen bg-gradient-mesh flex flex-col justify-between">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 flex-grow">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="md:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide uppercase">
              <Sparkles size={12} className="text-indigo-400" />
              <span>AI-Powered Revision</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Master Any Subject.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Forget Nothing.
              </span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl leading-relaxed max-w-xl">
              FlashMind uses Gemini AI to instantly generate active-recall flashcards from any topic or notes. Set your revision on autopilot with smart spaced repetition.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {token ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen size={18} />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Start Learning Free</span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white font-bold transition-all cursor-pointer"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Pitch */}
            <div className="pt-6 border-t border-slate-900 flex gap-8">
              <div>
                <div className="text-2xl font-bold text-white">Instant</div>
                <div className="text-slate-400 text-sm">AI Card Generation</div>
              </div>
              <div className="h-10 w-px bg-slate-900"></div>
              <div>
                <div className="text-2xl font-bold text-white">4x Faster</div>
                <div className="text-slate-400 text-sm">Concept Retention</div>
              </div>
            </div>
          </div>

          {/* Right Mascot Showcase Column */}
          <div className="md:col-span-5 flex justify-center relative select-none">
            <div className="absolute -inset-4 rounded-full bg-indigo-500/10 blur-3xl opacity-60"></div>
            <div className="relative glass-panel p-8 rounded-3xl border border-slate-800 max-w-sm flex flex-col items-center text-center shadow-2xl">
              {/* Glowing ring */}
              <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-tr from-indigo-500/50 to-pink-500/20 opacity-40 blur-[1px]"></div>
              
              <img 
                src="/logo.jpg" 
                alt="FlashMind Owl Mascot" 
                className="w-56 h-56 rounded-2xl object-cover shadow-lg border border-slate-700/50 mb-6 transform hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://img.icons8.com/clouds/200/owl.png';
                }}
              />
              
              <h3 className="text-xl font-bold text-white">Meet Ollie!</h3>
              <p className="text-slate-400 text-sm mt-2">
                Our AI Mascot helps you stay on track, rewards your streaks, and keeps your memory health at 100%!
              </p>
              
              <div className="mt-4 flex gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-semibold border border-orange-500/15 flex items-center gap-1">
                  <Flame size={12} className="fill-orange-400" />
                  <span>Streaks</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/15 flex items-center gap-1">
                  <Zap size={12} />
                  <span>XP Boost</span>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Grid */}
        <section className="mt-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Built for High-Performance Learning</h2>
            <p className="text-slate-400 mt-3">
              Traditional cramming fails. FlashMind keeps your knowledge intact using science-backed revision workflows.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left hover:border-slate-700/80 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <BrainCircuit size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">AI Flashcard Generator</h3>
              <p className="text-slate-400 text-sm mt-2.5">
                Enter any topic or paste lecture notes, and Gemini Pro builds interactive decks in seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left hover:border-slate-700/80 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-5">
                <Activity size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Active Recall Flipping</h3>
              <p className="text-slate-400 text-sm mt-2.5">
                Self-test before revealing answers. Build stronger neural connections by recalling concepts actively.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left hover:border-slate-700/80 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Memory Health Score</h3>
              <p className="text-slate-400 text-sm mt-2.5">
                Instantly spot your weak areas. See progress scores per subject and revise the cards you are forgetting.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left hover:border-slate-700/80 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <Flame size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Gamified Streak tracking</h3>
              <p className="text-slate-400 text-sm mt-2.5">
                Earn XP for studying, level up, and keep your daily streak alive. Consistency is key to long-term memory.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950 py-8 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 FlashMind. Built with the MERN stack and Gemini AI.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400">Terms</a>
            <a href="#" className="hover:text-slate-400">Privacy</a>
            <a href="#" className="hover:text-slate-400">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
