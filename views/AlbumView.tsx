
import React, { useState, useEffect } from 'react';
import { Rarity, Sticker } from '../types';
import { supabase } from '../lib/supabase';
import { soundManager, SFX } from '../services/soundService';

interface AlbumViewProps {
  ownedIds: string[];
  userLevel: number;
  isAdmin?: boolean;
  onClose: () => void;
}

const RARITY_STYLES = {
  [Rarity.COMMON]: {
    border: 'border-slate-400',
    glow: 'shadow-[0_0_15px_rgba(148,163,184,0.3)]',
    text: 'text-slate-300',
    bg: 'bg-slate-900',
    gradient: 'from-slate-700 via-slate-900 to-slate-950'
  },
  [Rarity.RARE]: {
    border: 'border-blue-400',
    glow: 'shadow-[0_0_20px_rgba(96,165,250,0.5)]',
    text: 'text-blue-300',
    bg: 'bg-blue-950',
    gradient: 'from-blue-600 via-slate-900 to-slate-950'
  },
  [Rarity.EPIC]: {
    border: 'border-purple-500',
    glow: 'shadow-[0_0_25px_rgba(168,85,247,0.6)]',
    text: 'text-purple-300',
    bg: 'bg-purple-950',
    gradient: 'from-purple-600 via-slate-900 to-slate-950'
  },
  [Rarity.LEGENDARY]: {
    border: 'border-yellow-500',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.7)]',
    text: 'text-yellow-400',
    bg: 'bg-yellow-950',
    gradient: 'from-yellow-500 via-slate-900 to-slate-950'
  },
  [Rarity.MYTHIC]: {
    border: 'border-red-600',
    glow: 'shadow-[0_0_40px_rgba(220,38,38,0.8)]',
    text: 'text-red-500',
    bg: 'bg-red-950',
    gradient: 'from-red-600 via-slate-900 to-slate-950'
  }
};

const AlbumView: React.FC<AlbumViewProps> = ({ ownedIds, userLevel, isAdmin = false, onClose }) => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'TODAS'>('TODAS');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomedSticker, setZoomedSticker] = useState<Sticker | null>(null);

  useEffect(() => {
    fetchStickers();
  }, []);

  const fetchStickers = async () => {
    const { data } = await supabase.from('stickers').select('*').order('created_at'); // Ordenar por criação ou ID
    if (data) setStickers(data);
    setLoading(false);
  };

  const filteredStickers = selectedRarity === 'TODAS' 
    ? stickers 
    : stickers.filter(s => s.rarity === selectedRarity);

  const handleZoom = (sticker: Sticker) => {
    soundManager.play(SFX.CLICK);
    setZoomedSticker(sticker);
  };

  const closeZoom = () => {
    setZoomedSticker(null);
  };

  // Cálculo do progresso
  const totalStickers = stickers.length;
  const collectedCount = isAdmin ? totalStickers : ownedIds.length; // Admin vê como se tivesse tudo para a barra
  const progressPercentage = totalStickers > 0 ? (collectedCount / totalStickers) * 100 : 0;

  return (
    <div className="h-screen flex flex-col bg-[#050b14] overflow-hidden relative font-sans">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent opacity-50"></div>
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full"></div>
      </div>

      {/* HEADER */}
      <header className="px-8 py-6 flex flex-col md:flex-row items-center justify-between z-20 gap-6 border-b border-white/5 bg-[#050b14]/80 backdrop-blur-md">
        <div>
          <h2 className="font-cinzel text-3xl md:text-4xl text-[#e2d2a4] uppercase tracking-widest drop-shadow-md">
            {isAdmin ? "Arquivo Sagrado (Admin)" : "Arquivo Sagrado"}
          </h2>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mt-1">
            Visualização Total de Centelhas Colecionáveis
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {['TODAS', ...Object.values(Rarity)].map((r) => {
             const isActive = selectedRarity === r;
             let activeStyle = "border-white/20 text-white/50 hover:text-white hover:border-white/50";
             
             if (isActive) {
                if (r === 'TODAS') activeStyle = "border-[#e2d2a4] bg-[#e2d2a4]/10 text-[#e2d2a4] shadow-[0_0_15px_rgba(226,210,164,0.3)]";
                else if (r === Rarity.COMMON) activeStyle = "border-slate-400 bg-slate-400/10 text-slate-200 shadow-[0_0_15px_rgba(148,163,184,0.3)]";
                else if (r === Rarity.RARE) activeStyle = "border-blue-400 bg-blue-400/10 text-blue-200 shadow-[0_0_15px_rgba(96,165,250,0.3)]";
                else if (r === Rarity.EPIC) activeStyle = "border-purple-500 bg-purple-500/10 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]";
                else if (r === Rarity.LEGENDARY) activeStyle = "border-yellow-500 bg-yellow-500/10 text-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
                else if (r === Rarity.MYTHIC) activeStyle = "border-red-500 bg-red-500/10 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
             }

             return (
              <button
                key={r}
                onClick={() => setSelectedRarity(r as any)}
                className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border transition-all duration-300 ${activeStyle}`}
              >
                {r}
              </button>
             );
          })}
          <button onClick={onClose} className="ml-4 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      </header>

      {/* GRID DE FIGURINHAS */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar z-10">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-16 h-16 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 pb-20 justify-items-center">
            {filteredStickers.map(sticker => {
              const isUnlocked = isAdmin || userLevel >= 613 || ownedIds.includes(sticker.id);
              const style = RARITY_STYLES[sticker.rarity as Rarity] || RARITY_STYLES[Rarity.COMMON];
              
              return (
                <div 
                  key={sticker.id} 
                  onClick={() => isUnlocked && handleZoom(sticker)}
                  className={`relative group w-full aspect-[2/3] max-w-[240px] transition-all duration-500 ${isUnlocked ? 'cursor-pointer hover:-translate-y-2 hover:scale-105' : 'opacity-40 grayscale cursor-not-allowed'}`}
                >
                  {/* Borda Externa Brilhante (Frame) */}
                  <div className={`absolute -inset-[2px] rounded-[18px] bg-gradient-to-b ${style.gradient} opacity-70 group-hover:opacity-100 transition-opacity duration-500 ${isUnlocked ? style.glow : ''}`}></div>
                  
                  {/* Container Principal da Carta */}
                  <div className="absolute inset-0 bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10 flex flex-col">
                    
                    {/* Imagem */}
                    <div className="relative h-full w-full">
                      <img 
                        src={sticker.image_url} 
                        alt={sticker.name} 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      
                      {/* Gradiente Overlay no rodapé da imagem para texto */}
                      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                      
                      {/* Ícone de Cadeado se bloqueado */}
                      {!isUnlocked && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                           <i className="fas fa-lock text-3xl text-white/30"></i>
                         </div>
                      )}
                    </div>

                    {/* Área de Texto (Nome) */}
                    <div className="absolute bottom-0 w-full p-3 text-center border-t border-white/10 bg-black/40 backdrop-blur-sm">
                        <div className={`h-[1px] w-1/2 mx-auto bg-gradient-to-r from-transparent via-${style.border.replace('border-', '')} to-transparent mb-1 opacity-50`}></div>
                        <p className="font-cinzel text-xs md:text-sm font-bold text-[#e2d2a4] truncate drop-shadow-md">
                          {sticker.name}
                        </p>
                        {/* Joia da raridade */}
                        <div className={`w-1.5 h-1.5 mx-auto mt-1 rounded-full ${style.bg} ${style.glow}`}></div>
                    </div>

                    {/* Moldura Interna Decorativa */}
                    <div className={`absolute inset-[3px] border border-white/10 rounded-[13px] pointer-events-none`}></div>
                    <div className={`absolute inset-[0px] border-2 border-transparent group-hover:${style.border} rounded-2xl transition-colors duration-500 pointer-events-none opacity-50`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER / PROGRESS BAR */}
      <footer className="h-20 bg-[#02040a] border-t border-white/5 flex flex-col justify-center px-12 z-20">
         <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] text-[#e2d2a4] uppercase tracking-[0.2em] font-bold">Total de Figurinhas: <span className="text-white">{totalStickers}</span></span>
            <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">PaRDeS Archive</span>
         </div>
         <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
            <div 
              className="h-full bg-gradient-to-r from-[#8a6d3b] via-[#d4af37] to-[#fdf6d8] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            ></div>
            {/* Partículas de brilho na barra (simulado) */}
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 mix-blend-overlay"></div>
         </div>
      </footer>

      {/* ZOOM MODAL (LIGHTBOX) */}
      {zoomedSticker && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={closeZoom}
        >
          <div 
            className="relative w-full max-w-5xl flex flex-col md:flex-row items-center gap-8 md:gap-16"
            onClick={(e) => e.stopPropagation()}
          >
             {/* Imagem Ampliada */}
             <div className={`relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in slide-in-from-bottom-10 duration-500`}>
                <img 
                  src={zoomedSticker.image_url} 
                  className="w-full h-full object-cover" 
                  alt={zoomedSticker.name}
                />
                {/* Efeito de brilho de borda baseado na raridade */}
                <div className={`absolute inset-0 border-4 ${RARITY_STYLES[zoomedSticker.rarity as Rarity].border} opacity-50 rounded-2xl pointer-events-none mix-blend-overlay`}></div>
             </div>

             {/* Detalhes da Figurinha */}
             <div className="flex-1 text-center md:text-left space-y-6 animate-in slide-in-from-right-10 duration-700">
                <div>
                   <span className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border mb-4 ${RARITY_STYLES[zoomedSticker.rarity as Rarity].border} ${RARITY_STYLES[zoomedSticker.rarity as Rarity].text} bg-black/50`}>
                      {zoomedSticker.rarity}
                   </span>
                   <h2 className="font-cinzel text-4xl md:text-6xl text-[#e2d2a4] font-bold uppercase tracking-widest leading-none drop-shadow-lg">
                      {zoomedSticker.name}
                   </h2>
                </div>
                
                <div className="h-px w-24 bg-gradient-to-r from-[#e2d2a4] to-transparent mx-auto md:mx-0"></div>

                <p className="text-white/80 text-sm md:text-lg font-light leading-relaxed max-w-xl">
                   {zoomedSticker.description}
                </p>

                <div className="pt-4 opacity-50 text-[10px] uppercase tracking-[0.4em]">
                   Coleção Sagrada
                </div>
             </div>

             <button 
               className="absolute top-0 right-0 md:-top-12 md:-right-12 text-white/30 hover:text-white transition-colors p-4"
               onClick={closeZoom}
             >
                <i className="fas fa-times text-2xl"></i>
             </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AlbumView;
