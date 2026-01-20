
import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface RankingViewProps {
  user: UserProfile;
  onClose: () => void;
}

interface RankEntry {
  name: string;
  level: number;
  xp: number;
  avatar_url: string;
}

const RankingView: React.FC<RankingViewProps> = ({ user, onClose }) => {
  const [rankingData, setRankingData] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      // Busca os 30 melhores jogadores baseados no Nível e depois no XP
      const { data, error } = await supabase
        .from('profiles')
        .select('name, level, xp, avatar_url')
        .order('level', { ascending: false })
        .order('xp', { ascending: false })
        .limit(30);

      if (error) throw error;
      if (data) setRankingData(data);
    } catch (err) {
      console.error("Erro ao carregar ranking:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
        <p className="font-cinzel text-yellow-500 tracking-widest text-xs uppercase animate-pulse">Consultando Hierarquia...</p>
      </div>
    );
  }

  // Pegamos os 3 primeiros para o pódio
  const topThree = rankingData.slice(0, 3);
  // O restante vai para a lista
  const theRest = rankingData.slice(3);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col pb-48 animate-in fade-in duration-500 overflow-x-hidden">
      <nav className="p-6 lg:px-12 flex items-center gap-6 z-50">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center glass rounded-full hover:bg-white/10 transition-all">
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <i className="fas fa-layer-group text-yellow-500 text-xl"></i>
            <h2 className="font-bold text-2xl tracking-tight uppercase font-cinzel">Hierarquia de Sabedoria</h2>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest">Top 30 Mestres do PaRDeS</p>
        </div>
      </nav>

      {/* Podium Area - Renderização Dinâmica baseada no Banco */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 mt-12 mb-12">
        {rankingData.length > 0 ? (
          <div className="flex items-end justify-center gap-4 lg:gap-12 w-full max-w-4xl">
            
            {/* 2º Lugar */}
            {topThree[1] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-12 duration-1000 delay-200">
                <div className="relative mb-4">
                   <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-slate-400 p-1 bg-slate-900 shadow-[0_0_30px_rgba(148,163,184,0.2)]">
                     <img src={topThree[1].avatar_url || 'https://i.pravatar.cc/150?u=2'} className="w-full h-full rounded-full object-cover" />
                   </div>
                   <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-slate-900 shadow-lg">
                     <span className="text-xs font-black">2</span>
                   </div>
                </div>
                <p className="font-bold text-sm lg:text-base text-white/90 truncate max-w-[100px]">{topThree[1].name}</p>
                <p className="text-yellow-500 text-xs font-black uppercase tracking-widest">Nível {topThree[1].level}</p>
                <div className="mt-4 w-20 lg:w-32 h-24 lg:h-32 bg-slate-800/40 rounded-t-xl border-x border-t border-white/5 flex flex-col items-center justify-center">
                   <span className="text-3xl font-bold text-slate-400/50 italic">2º</span>
                </div>
              </div>
            )}

            {/* 1º Lugar */}
            {topThree[0] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-20 duration-1000">
                <div className="relative mb-6">
                   <i className="fas fa-crown absolute -top-8 left-1/2 -translate-x-1/2 text-3xl text-yellow-500 animate-bounce"></i>
                   <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-full border-4 border-yellow-500 p-1 bg-slate-900 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                     <img src={topThree[0].avatar_url || 'https://i.pravatar.cc/150?u=1'} className="w-full h-full rounded-full object-cover" />
                   </div>
                   <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-slate-950 shadow-xl border-4 border-slate-950">
                     <i className="fas fa-star text-xs"></i>
                   </div>
                </div>
                <p className="font-bold text-lg text-white truncate max-w-[150px]">{topThree[0].name}</p>
                <p className="text-yellow-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <i className="fas fa-scroll text-xs"></i> Nível {topThree[0].level}
                </p>
                <div className="mt-4 w-28 lg:w-44 h-32 lg:h-48 bg-yellow-900/20 rounded-t-xl border-x border-t border-yellow-500/20 flex flex-col items-center justify-center">
                   <span className="text-5xl font-bold text-yellow-500 italic drop-shadow-lg">1º</span>
                </div>
              </div>
            )}

            {/* 3º Lugar */}
            {topThree[2] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-1000 delay-500">
                <div className="relative mb-4">
                   <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-orange-600/50 p-1 bg-slate-900 shadow-[0_0_30px_rgba(234,88,12,0.15)]">
                     <img src={topThree[2].avatar_url || 'https://i.pravatar.cc/150?u=3'} className="w-full h-full rounded-full object-cover" />
                   </div>
                   <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg">
                     <span className="text-xs font-black">3</span>
                   </div>
                </div>
                <p className="font-bold text-sm lg:text-base text-white/90 truncate max-w-[100px]">{topThree[2].name}</p>
                <p className="text-yellow-500 text-xs font-black uppercase tracking-widest">Nível {topThree[2].level}</p>
                <div className="mt-4 w-20 lg:w-32 h-16 lg:h-24 bg-orange-950/20 rounded-t-xl border-x border-t border-orange-900/10 flex flex-col items-center justify-center">
                   <span className="text-3xl font-bold text-orange-900/50 italic">3º</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center opacity-30 mt-20">
             <i className="fas fa-users-slash text-6xl mb-4"></i>
             <p className="uppercase tracking-widest text-xs">Nenhum mestre encontrado ainda</p>
          </div>
        )}
      </div>

      {/* Lista do Restante do Top 30 */}
      <div className="max-w-4xl mx-auto w-full px-6 space-y-4">
        {theRest.map((entry, index) => (
          <Card key={index} className="p-4 border-white/5 bg-slate-900/40 flex items-center justify-between hover:bg-slate-900/60 transition-all">
             <div className="flex items-center gap-6">
                <span className="text-white/20 font-black italic w-6 text-center">#{index + 4}</span>
                <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden">
                   <img src={entry.avatar_url || 'https://i.pravatar.cc/150'} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-white/90">{entry.name}</h4>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Discípulo do PaRDeS</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-yellow-500 font-black text-lg uppercase tracking-tighter leading-none">Nível {entry.level}</p>
                <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">{entry.xp} XP acumulado</p>
             </div>
          </Card>
        ))}
      </div>

      {/* Perfil do Próprio Usuário (Fixo no rodapé) */}
      <div className="fixed bottom-12 left-6 right-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-4xl animate-in slide-in-from-bottom-12 duration-700">
        <Card className="p-6 border-yellow-500/20 bg-slate-900/90 backdrop-blur-xl flex items-center justify-between shadow-2xl border-t-white/10">
          <div className="flex items-center gap-6">
             <div className="w-14 h-14 rounded-full border-2 border-yellow-500/30 p-0.5">
               <img src={user.avatarUrl || 'https://i.pravatar.cc/150'} className="w-full h-full rounded-full object-cover" />
             </div>
             <div>
               <h4 className="font-bold text-lg flex items-center gap-2">
                 {user.name}
                 {user.level >= 613 && <i className="fas fa-certificate text-yellow-500 text-xs"></i>}
               </h4>
               <p className="text-[10px] uppercase tracking-widest text-white/40">Sua Posição na Jornada</p>
             </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-yellow-500 font-black text-2xl uppercase tracking-tighter">
              <span className="text-xs opacity-50">NÍVEL</span>
              <span>{user.level}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/30 font-bold">
              <i className="fas fa-bolt text-[8px]"></i> {user.sparks} centelhas
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RankingView;
