
import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { soundManager, SFX } from '../services/soundService';

interface AchievementsViewProps {
  user: UserProfile;
  isAdmin?: boolean;
  onClose: () => void;
  onUpdateUser: (updated: UserProfile) => void;
}

const AchievementsView: React.FC<AchievementsViewProps> = ({ user, isAdmin = false, onClose, onUpdateUser }) => {
  const [merits, setMerits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [tempFeatured, setTempFeatured] = useState<string[]>(user.featuredMerits || []);

  useEffect(() => {
    fetchMerits();
  }, []);

  const fetchMerits = async () => {
    const { data } = await supabase.from('merits').select('*').order('created_at');
    if (data) setMerits(data);
    setLoading(false);
  };

  const toggleSelectionMode = () => {
    soundManager.play(SFX.CLICK);
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      setTempFeatured(user.featuredMerits || []);
    }
  };

  const handleSelectMerit = (meritId: string) => {
    // Lógica de desbloqueio: Admin OU Nível 613 OU ID na lista de méritos conquistados
    const isOwned = isAdmin || user.level >= 613 || (user.merits || []).includes(meritId);
    
    if (!selectionMode || !isOwned) return;

    soundManager.play(SFX.PAPER);
    setTempFeatured(prev => {
      if (prev.includes(meritId)) {
        return prev.filter(id => id !== meritId);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, meritId];
    });
  };

  const handleSaveSelection = () => {
    soundManager.play(SFX.SUCCESS);
    onUpdateUser({
      ...user,
      featuredMerits: tempFeatured
    });
    setSelectionMode(false);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-2 glass rounded-lg hover:text-white transition-colors"><i className="fas fa-times"></i></button>
          <div>
            <h2 className="font-cinzel text-2xl tracking-widest text-purple-400">Galeria de Méritos</h2>
            <p className="text-[9px] text-white/30 uppercase tracking-widest">
              {user.level >= 613 ? "Mestre do PaRDeS: Acesso Total Liberado" : "Sua jornada de conquistas espirituais"}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {!selectionMode ? (
            <Button 
              variant="outline" 
              className="px-4 py-2 text-[10px] border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
              onClick={toggleSelectionMode}
            >
              <i className="fas fa-thumbtack mr-2"></i> Fixar no Perfil
            </Button>
          ) : (
            <div className="flex gap-2">
              <span className="self-center text-[10px] text-yellow-500 font-bold uppercase tracking-widest mr-4">
                Destaques: {tempFeatured.length}/5
              </span>
              <Button 
                variant="ghost" 
                className="px-4 py-2 text-[10px]"
                onClick={() => setSelectionMode(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="gold" 
                className="px-6 py-2 text-[10px]"
                onClick={handleSaveSelection}
              >
                Confirmar Escolha
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 pb-32 custom-scrollbar">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-20">
             <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : merits.map((ach) => {
          const isOwned = isAdmin || user.level >= 613 || (user.merits || []).includes(ach.id);
          const isFeatured = tempFeatured.includes(ach.id);
          
          return (
            <div 
              key={ach.id} 
              onClick={() => handleSelectMerit(ach.id)}
              className={`flex flex-col items-center gap-3 group animate-in zoom-in duration-500 transition-all ${isOwned ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
            >
              <div className="relative">
                {isFeatured && (
                  <div className="absolute -inset-4 bg-yellow-500/20 rounded-full blur-2xl animate-pulse"></div>
                )}
                
                <Card className={`w-24 h-24 lg:w-32 lg:h-32 rounded-full p-1.5 overflow-hidden transition-all duration-500 ${
                  isFeatured ? 'border-yellow-500 border-4 shadow-[0_0_30px_rgba(234,179,8,0.4)]' : 
                  isOwned ? 'border-purple-500/30 bg-slate-900/60' : 
                  'border-white/5 bg-black/40'
                }`}>
                  <img 
                    src={ach.image_url} 
                    alt={ach.name} 
                    className={`w-full h-full rounded-full object-cover transition-all duration-700 ${
                      isOwned ? 'grayscale-0' : 'grayscale opacity-20'
                    }`} 
                  />
                  
                  {selectionMode && isOwned && !isFeatured && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fas fa-plus text-white text-xl"></i>
                    </div>
                  )}
                </Card>

                {isFeatured && (
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full border-4 border-slate-950 flex items-center justify-center text-slate-950 shadow-xl z-20">
                    <i className="fas fa-check text-[10px] font-black"></i>
                  </div>
                )}
              </div>
              
              <div className="text-center max-w-[120px]">
                <p className={`text-[10px] font-black uppercase tracking-widest transition-colors leading-tight ${
                  isFeatured ? 'text-yellow-500' : 
                  isOwned ? 'text-purple-400' : 
                  'text-white/20'
                }`}>
                  {ach.name}
                </p>
                <p className={`text-[8px] mt-1 uppercase tracking-tighter transition-opacity leading-tight ${
                  isOwned ? 'text-white/40' : 'text-white/10'
                }`}>
                  {ach.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-6 bg-slate-900/50 border-t border-white/5 backdrop-blur-md flex justify-between items-center px-12">
        <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-bold">
          {user.level >= 613 ? "STATUS: CHACHAM (SÁBIO)" : `CONQUISTADOS: ${user.merits?.length || 0} / ${merits.length}`}
        </p>
        <div className="flex gap-4">
          <div className="w-10 h-10 border border-yellow-500/10 rounded-full flex items-center justify-center opacity-20">
            <i className="fas fa-feather-pointed text-yellow-500 animate-pulse"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsView;
