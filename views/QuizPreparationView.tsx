
import React, { useState } from 'react';
import { PortalType, UserProfile } from '../types';
import { PORTAL_THEMES } from '../constants';

interface QuizPreparationViewProps {
  user: UserProfile;
  portal: PortalType;
  onBack: () => void;
  onStart: (limit: number) => void;
}

const QuizPreparationView: React.FC<QuizPreparationViewProps> = ({ user, portal, onBack, onStart }) => {
  const [limit, setLimit] = useState(10);
  const theme = PORTAL_THEMES[portal];

  const options = [10, 25, 50];

  return (
    <div className="min-h-screen flex flex-col animate-in fade-in duration-1000 overflow-hidden relative bg-[#020617]">
      {/* Background Decorativo e Místico */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none animate-pulse delay-700"></div>

      {/* Header Mobile Style */}
      <header className="flex items-center justify-between px-8 pt-12 mb-8 relative z-50">
        <button 
          onClick={onBack} 
          className="flex items-center space-x-3 text-slate-400 hover:text-white transition-all group px-4 py-2 glass rounded-full border-white/5"
        >
          <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Voltar</span>
        </button>
        
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <i 
                key={i} 
                className={`fas fa-heart transition-all duration-700 ${
                  i < user.hearts 
                  ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' 
                  : 'text-white/5'
                }`}
              ></i>
            ))}
          </div>
          <div className="bg-slate-950/60 border border-yellow-500/30 rounded-full px-5 py-2 flex items-center space-x-3 shadow-2xl backdrop-blur-2xl">
            <i className="fas fa-bolt text-yellow-500 text-sm animate-pulse"></i>
            <span className="font-cinzel font-bold text-yellow-500 tracking-tighter text-lg">{user.sparks}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 mt-12 w-full flex-1 flex flex-col justify-center relative z-10 pb-20">
        <div className="text-center mb-20 space-y-6">
          <h1 className="font-cinzel text-6xl font-black tracking-widest uppercase text-white drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            {portal} <span className="text-yellow-500">-</span> 
            <span className="text-white/60 text-2xl block mt-4 font-normal tracking-[0.2em] opacity-80">
              {portal === PortalType.PSHAT ? 'Literal' : portal === PortalType.REMEZ ? 'Alusivo' : portal === PortalType.DRASH ? 'Interpretativo' : 'Secreto'}
            </span>
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mx-auto rounded-full"></div>
          <p className="text-slate-500 font-medium italic text-base tracking-wide leading-relaxed">Quantas perguntas deseja responder em sua jornada?</p>
        </div>

        {/* Grade de Opções Estilizada */}
        <div className="grid grid-cols-3 gap-5 mb-24">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => setLimit(opt)}
              className={`relative overflow-hidden group rounded-[2.5rem] p-8 flex flex-col items-center justify-center transition-all duration-700 border-2 backdrop-blur-3xl transform active:scale-90 ${
                limit === opt 
                ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_50px_rgba(234,179,8,0.3)] scale-110 z-10' 
                : 'border-white/5 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/60'
              }`}
            >
              <span className={`font-cinzel text-5xl font-black mb-2 transition-all duration-500 ${limit === opt ? 'text-white drop-shadow-lg' : 'text-slate-600 group-hover:text-slate-400'}`}>{opt}</span>
              <span className={`text-[9px] uppercase tracking-[0.3em] font-black transition-all duration-500 ${limit === opt ? 'text-yellow-500' : 'text-slate-700'}`}>Questões</span>
              
              {limit === opt && (
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 via-transparent to-transparent pointer-events-none"></div>
              )}
            </button>
          ))}
        </div>

        {/* Botão de Ação Místico */}
        <div className="flex flex-col items-center gap-8">
          <button 
            onClick={() => onStart(limit)}
            className="w-full relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-cinzel font-black py-8 rounded-3xl text-2xl tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-5 shadow-2xl">
              <i className="fas fa-play text-sm group-hover:translate-x-2 transition-transform"></i>
              <span>Iniciar Quiz</span>
            </div>
          </button>
          
          <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-1000 delay-500">
            <div className="flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full border border-white/5 backdrop-blur-md">
               <i className="fas fa-info-circle text-yellow-500/60 text-xs"></i>
               <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black">
                Gasto: <span className="text-yellow-500">{limit}</span> Centelhas por tentativa
               </p>
            </div>
          </div>
        </div>
      </main>

      {/* Decoração Inferior Inspirada no Layout do Castelo */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center space-x-8 text-slate-800 opacity-20 select-none pointer-events-none">
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-slate-700"></div>
        <div className="flex flex-col items-center gap-2">
          <i className="fas fa-fort-awesome text-3xl"></i>
          <span className="text-[8px] font-black uppercase tracking-[0.5em]">Portões do PaRDeS</span>
        </div>
        <div className="w-24 h-[1px] bg-gradient-to-l from-transparent to-slate-700"></div>
      </div>
    </div>
  );
};

export default QuizPreparationView;
