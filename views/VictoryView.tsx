
import React, { useEffect, useState } from 'react';
import { soundManager, SFX } from '../services/soundService';

interface VictoryViewProps {
  xpEarned: number;
  sparksEarned: number;
  onContinue: () => void;
  onReplay: () => void;
}

const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];

const VictoryView: React.FC<VictoryViewProps> = ({ xpEarned, sparksEarned, onContinue, onReplay }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    soundManager.play(SFX.VICTORY);
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#010514] overflow-hidden flex flex-col items-center justify-between py-16 px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.1)_0%,_transparent_70%)] opacity-50"></div>
        <div className="absolute top-[15%] right-[8%] text-pink-500 opacity-60 animate-bounce">
           <i className="fas fa-menorah text-[100px] drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]"></i>
        </div>
        <div className="absolute top-[45%] left-[2%] text-yellow-500 opacity-30">
           <i className="fas fa-menorah text-6xl"></i>
        </div>
        {HEBREW_LETTERS.map((letter, i) => (
          <span 
            key={i} 
            className="absolute text-yellow-500/20 font-serif text-3xl animate-pulse select-none"
            style={{
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 95}%`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `rotate(${Math.random() * 40 - 20}deg)`
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      <h1 className="relative z-10 font-cinzel text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#fdf6d8] via-[#d4af37] to-[#8a6d3b] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-700 uppercase tracking-widest text-center">
        PARABÉNS!
      </h1>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-72 h-72 flex items-center justify-center">
          <div className="absolute inset-0 bg-yellow-400/20 blur-[120px] animate-pulse rounded-full"></div>
          <img 
            src="https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/public/Portoes%20do%20PaRDeS/victory_scroll.png" 
            alt="Torah Scroll" 
            className="w-full h-auto drop-shadow-[0_0_50px_rgba(234,179,8,0.8)] animate-in slide-in-from-bottom-20 duration-1000"
            onError={(e) => {
              (e.target as any).src = "https://cdn-icons-png.flaticon.com/512/3253/3253013.png";
            }}
          />
        </div>
      </div>

      <div className={`relative z-10 w-full max-w-[340px] transition-all duration-1000 delay-500 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <div className="bg-[#0a1226]/95 border-[2px] border-[#d4af37]/40 rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
          <div className="absolute top-4 left-4 text-white/10 text-[10px]"><i className="fas fa-diamond"></i></div>
          <div className="absolute top-4 right-4 text-white/10 text-[10px]"><i className="fas fa-diamond"></i></div>
          <div className="absolute bottom-4 left-4 text-white/10 text-[10px]"><i className="fas fa-diamond"></i></div>
          <div className="absolute bottom-4 right-4 text-white/10 text-[10px]"><i className="fas fa-diamond"></i></div>

          <div className="flex justify-around items-start mb-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-300 via-blue-500 to-blue-800 p-0.5 shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-white/20">
                <div className="w-full h-full rounded-full bg-slate-900/40 flex items-center justify-center">
                  <i className="fas fa-gem text-blue-300 text-3xl drop-shadow-[0_0_10px_rgba(147,197,253,0.8)]"></i>
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">+{xpEarned}</p>
                <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">XP</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 via-purple-600 to-purple-900 p-0.5 shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-white/20">
                <div className="w-full h-full rounded-full bg-slate-900/40 flex items-center justify-center">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-t from-purple-500 to-white/40 blur-[1px]"></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">+{sparksEarned}</p>
                <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Centelhas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[340px] flex flex-col gap-6 z-20">
        <button 
          onClick={() => { soundManager.play(SFX.CLICK); onContinue(); }}
          className="w-full py-5 rounded-full bg-gradient-to-b from-[#fdf6d8] via-[#d4af37] to-[#8a6d3b] text-[#2c1e05] font-black uppercase tracking-[0.4em] text-lg shadow-[0_0_40px_rgba(212,175,55,0.6)] border-b-[4px] border-[#5d4a1b] hover:scale-[1.03] transition-all duration-300 animate-shimmer"
        >
          CONTINUAR
        </button>
        <button 
          onClick={() => { soundManager.play(SFX.CLICK); onReplay(); }}
          className="w-full py-4 rounded-full glass border-[2px] border-white/30 text-white font-bold uppercase tracking-[0.4em] text-sm hover:bg-white/10 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          REPLAY
        </button>
      </div>
    </div>
  );
};

export default VictoryView;
