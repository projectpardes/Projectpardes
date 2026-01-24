
import React, { useState, useEffect } from 'react';
import { Sticker, Rarity } from '../types';
import { RARITY_COLORS } from '../constants';
import { soundManager, SFX } from '../services/soundService';
import { Button } from './Button';

interface StickerRewardPopupProps {
  sticker: Sticker;
  onClose: () => void;
}

export const StickerRewardPopup: React.FC<StickerRewardPopupProps> = ({ sticker, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const rarityColor = RARITY_COLORS[sticker.rarity];

  useEffect(() => {
    // Tocar som baseado na raridade
    let sound = SFX.UNROLL;
    if (sticker.rarity === Rarity.EPIC) sound = SFX.SUCCESS;
    if (sticker.rarity === Rarity.LEGENDARY || sticker.rarity === Rarity.MYTHIC) sound = SFX.VICTORY;
    
    soundManager.play(sound);

    // Auto flip após delay
    const timer = setTimeout(() => setIsFlipped(true), 1500);
    return () => clearTimeout(timer);
  }, [sticker.rarity]);

  const getRarityGlow = () => {
    switch(sticker.rarity) {
      case Rarity.COMMON: return 'shadow-[0_0_40px_rgba(148,163,184,0.3)]';
      case Rarity.RARE: return 'shadow-[0_0_50px_rgba(56,189,248,0.4)]';
      case Rarity.EPIC: return 'shadow-[0_0_60px_rgba(168,85,247,0.5)]';
      case Rarity.LEGENDARY: return 'shadow-[0_0_70px_rgba(234,179,8,0.6)]';
      case Rarity.MYTHIC: return 'shadow-[0_0_100px_rgba(239,68,68,0.7)]';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 ${getRarityGlow().split(' ')[0].replace('shadow', 'bg')}`}></div>
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-center gap-8 animate-in zoom-in slide-in-from-bottom-20 duration-700">
        <div className="text-center space-y-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500">Nova Conquista Desbloqueada!</h2>
          <h3 className="font-cinzel text-3xl font-bold text-white uppercase tracking-widest drop-shadow-lg">
            {isFlipped ? sticker.name : 'O Que Será?...'}
          </h3>
        </div>

        <div 
          className="relative w-64 h-80 perspective group cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`relative w-full h-full transition-all duration-1000 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Verso da Carta */}
            <div className="absolute inset-0 backface-hidden bg-slate-900 border-4 border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-8 shadow-2xl overflow-hidden">
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/padded-cells.png')]"></div>
               <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-scroll text-4xl text-yellow-500/20 animate-pulse"></i>
               </div>
               <div className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">PaRDeS Archive</div>
            </div>

            {/* Frente da Carta */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 rounded-[2rem] p-1 shadow-2xl overflow-hidden">
              <div className={`h-full w-full rounded-[1.8rem] border-4 ${rarityColor} overflow-hidden flex flex-col relative`}>
                <img src={sticker.image_url} alt={sticker.name} className="flex-1 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="p-4 relative z-10 text-center bg-slate-950/60 backdrop-blur-md">
                   <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${rarityColor.split(' ')[1]}`}>{sticker.rarity}</p>
                   <p className="text-[11px] font-bold text-white/90 leading-tight">{sticker.description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`absolute -inset-4 rounded-[2.5rem] blur-2xl -z-10 transition-opacity duration-1000 ${isFlipped ? 'opacity-100' : 'opacity-0'} ${getRarityGlow()}`}></div>
        </div>

        {isFlipped && (
          <div className="flex flex-col gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Button variant="gold" className="w-full py-5 text-xs tracking-[0.3em]" onClick={onClose}>
              COLOCAR NO ÁLBUM
            </Button>
            <p className="text-[9px] text-white/30 text-center uppercase tracking-widest">
              Esta figurinha foi adicionada à sua coleção permanente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
