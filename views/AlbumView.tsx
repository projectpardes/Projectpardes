
import React, { useState, useEffect } from 'react';
import { RARITY_COLORS } from '../constants';
import { Card } from '../components/Card';
import { Rarity } from '../types';
import { supabase } from '../lib/supabase';

interface AlbumViewProps {
  ownedIds: string[];
  userLevel: number;
  isAdmin?: boolean;
  onClose: () => void;
}

const AlbumView: React.FC<AlbumViewProps> = ({ ownedIds, userLevel, isAdmin = false, onClose }) => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'TODAS'>('TODAS');
  const [stickers, setStickers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStickers();
  }, []);

  const fetchStickers = async () => {
    const { data } = await supabase.from('stickers').select('*').order('rarity');
    if (data) setStickers(data);
    setLoading(false);
  };

  const filteredStickers = selectedRarity === 'TODAS' 
    ? stickers 
    : stickers.filter(s => s.rarity === selectedRarity);

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <header className="p-8 lg:px-12 bg-slate-900/50 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 flex-shrink-0">
        <div>
          <h2 className="font-cinzel text-3xl tracking-widest text-yellow-500">
            {isAdmin ? "Arquivo Sagrado (Admin)" : "Álbum de Colecionáveis"}
          </h2>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-1">
            {isAdmin ? "Visualização total de centelhas colecionáveis" : "Coleção de Sabedoria Sagrada"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['TODAS', ...Object.values(Rarity)].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRarity(r as any)}
              className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                selectedRarity === r ? 'bg-white text-slate-950 border-white' : 'border-white/10 text-white/60 hover:border-white/30'
              }`}
            >
              {r}
            </button>
          ))}
          <button onClick={onClose} className="ml-4 p-3 glass rounded-xl hover:bg-white/10 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredStickers.map(sticker => {
              // Condição de "Desbloqueado": Admin OU Nível 613 OU Ter a figurinha
              const isUnlocked = isAdmin || userLevel >= 613 || ownedIds.includes(sticker.id);
              const rarityColor = RARITY_COLORS[sticker.rarity as Rarity] || RARITY_COLORS[Rarity.COMMON];
              
              return (
                <div key={sticker.id} className="group perspective">
                  <Card 
                    className={`aspect-[3/4] relative p-1 transition-all duration-500 transform-style-3d group-hover:rotate-y-12 ${!isUnlocked ? 'opacity-20 grayscale scale-95' : 'hover:scale-105 hover:z-10 shadow-2xl shadow-slate-900/50'}`}
                  >
                    <div className="relative h-full w-full rounded-xl overflow-hidden bg-slate-900">
                      <img src={sticker.image_url} alt={sticker.name} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 border-2 ${rarityColor} rounded-xl pointer-events-none`}></div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                      
                      <div className="absolute bottom-3 left-3 right-3 text-center">
                        <p className={`text-[8px] uppercase font-bold tracking-tighter mb-0.5 ${rarityColor.split(' ')[1]}`}>{sticker.rarity}</p>
                        <p className="text-xs font-bold leading-tight truncate">{sticker.name}</p>
                      </div>

                      {!isUnlocked && (
                         <div className="absolute inset-0 flex items-center justify-center">
                           <i className="fas fa-lock text-2xl text-white/10"></i>
                         </div>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="p-6 bg-slate-950 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[10px] font-bold uppercase text-white/40">
              {isAdmin ? `Total de Figurinhas: ${stickers.length}` : `Coleção: ${ownedIds.length} / ${stickers.length}`}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-white/20 uppercase tracking-[0.5em]">PaRDeS Archive</p>
      </footer>
    </div>
  );
};

export default AlbumView;
