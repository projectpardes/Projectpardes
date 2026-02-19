
import React, { useState, useEffect } from 'react';
import { UserProfile, PortalType } from '../types';
import { PORTAL_DATA, PORTAL_THEMES } from '../constants';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { soundManager, SFX } from '../services/soundService';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../lib/supabase';

interface DashboardProps {
  user: UserProfile;
  parasha?: any;
  currentTrack?: any;
  allMerits: any[];
  onStartJourney: (portal: PortalType) => void;
  setView: (v: any) => void;
  isAdmin: boolean;
  checkUnlock: (type: PortalType) => boolean;
}

// Helper fora do componente para evitar recriação
const base64ToBlob = (base64: string, mimeType: string) => {
  try {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
  } catch (e) {
    console.error("Erro ao converter base64:", e);
    return null;
  }
};

const Dashboard: React.FC<DashboardProps> = ({ user, parasha, currentTrack, allMerits, onStartJourney, setView, isAdmin, checkUnlock }) => {
  // Cálculo de XP para próximo nível
  const currentLevelXP = Math.floor(100 * Math.pow(user.level, 1.8));
  const progressPercent = Math.min(100, (user.xp / currentLevelXP) * 100);

  const profileWallpaper = user.avatarUrl || "https://picsum.photos/seed/profile_wallpaper/800/400";
  const parashaBanner = parasha?.banner_url || 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=1440';
  const parashaVideo = parasha?.video_url;

  const activeMeritIds = (user.featuredMerits && user.featuredMerits.length > 0) 
    ? user.featuredMerits 
    : (user.merits || []).slice(0, 5);

  const [currentMeritIndex, setCurrentMeritIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Estado para controlar qual portal está sendo regenerado
  const [regeneratingPortal, setRegeneratingPortal] = useState<PortalType | null>(null);

  useEffect(() => {
    if (activeMeritIds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentMeritIndex(prev => (prev + 1) % activeMeritIds.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeMeritIds]);

  const handlePortalClick = (portal: PortalType) => {
    soundManager.play(SFX.PAPER);
    onStartJourney(portal);
  };

  const navigate = (v: any) => {
    soundManager.play(SFX.CLICK);
    setView(v);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erro ao ativar tela cheia: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Função Admin para regenerar imagem do portal
  const handleRegeneratePortalImage = async (e: React.MouseEvent, type: PortalType) => {
    e.stopPropagation(); // Impede entrar no portal ao clicar no botão admin
    e.preventDefault();
    
    if (!window.confirm(`ADMIN: Deseja gerar uma nova imagem via IA para o portal ${type}? A imagem atual será substituída.`)) return;

    setRegeneratingPortal(type);
    
    // Prompts idênticos ao AdminDashboard para consistência
    const PROMPTS: Record<string, { filename: string, prompt: string }> = {
        [PortalType.NOAHIDE]: { filename: 'portal_noahide.png', prompt: 'A majestic ancient stone tablet floating, engraved with 7 glowing laws in hebrew numbers, ethereal atmosphere, high fantasy item, 3d render, transparent background, isolated, magical glow.' },
        [PortalType.PSHAT]: { filename: 'portal_pshat.png', prompt: 'A golden ancient Torah scroll open, floating, glowing with divine light, simple and literal, high fantasy item, 3d render, transparent background, isolated, magical glow.' },
        [PortalType.REMEZ]: { filename: 'portal_remez.png', prompt: 'A mystical magnifying glass revealing floating glowing Hebrew letters and numbers, blue aura, high fantasy item, 3d render, transparent background, isolated, magical glow.' },
        [PortalType.DRASH]: { filename: 'portal_drash.png', prompt: 'A royal purple crown with storytelling elements, parables, magical aura, high fantasy item, 3d render, transparent background, isolated, magical glow.' },
        [PortalType.SOD]: { filename: 'portal_sod.png', prompt: 'A mysterious emerald green key with Kabbalistic symbols, glowing intense light, secret wisdom, high fantasy item, 3d render, transparent background, isolated, magical glow.' },
    };

    const config = PROMPTS[type];
    if (!config) {
        alert("Configuração de prompt não encontrada para este portal.");
        setRegeneratingPortal(null);
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: config.prompt }] },
            config: { imageConfig: { aspectRatio: "3:4" } }
        });

        let base64Data = '';
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    base64Data = `data:image/png;base64,${part.inlineData.data}`;
                    break;
                }
            }
        }

        if (base64Data) {
            const blob = base64ToBlob(base64Data, 'image/png');
            if (!blob) throw new Error("Falha na conversão da imagem.");

            const { error } = await supabase.storage
                .from('images')
                .upload(config.filename, blob, { upsert: true, contentType: 'image/png' });
            
            if (error) throw error;

            soundManager.play(SFX.VICTORY);
            alert(`Imagem do portal ${type} atualizada com sucesso! Recarregue a página para ver a mudança (Cache do navegador pode segurar a imagem antiga por alguns minutos).`);
        } else {
            throw new Error("IA não retornou imagem.");
        }

    } catch (err: any) {
        console.error(err);
        soundManager.play(SFX.ERROR);
        alert(`Erro ao gerar imagem: ${err.message}`);
    } finally {
        setRegeneratingPortal(null);
    }
  };

  const currentMeritId = activeMeritIds[currentMeritIndex];
  const currentMerit = allMerits.find(m => m.id === currentMeritId);

  // Ordem de Exibição dos Portais
  const ORDERED_PORTALS = [
    PortalType.NOAHIDE,
    PortalType.PSHAT,
    PortalType.REMEZ,
    PortalType.DRASH,
    PortalType.SOD
  ];

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {/* Banner Principal Parasha */}
      <div className="relative h-[450px] w-full flex-shrink-0 cursor-pointer group" onClick={() => navigate('parasha-details')}>
        {parashaVideo ? (
          <div className="absolute inset-0 overflow-hidden">
             <video 
               src={parashaVideo} 
               autoPlay 
               loop 
               muted 
               playsInline 
               className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[3s] group-hover:scale-105" style={{ backgroundImage: `url('${parashaBanner}')` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20"></div>
          </div>
        )}
        
        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-20">
          <div>
            <h1 className="font-cinzel text-2xl font-bold text-yellow-500 tracking-tighter drop-shadow-lg">PORTÕES DO PARDES</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.3em]">Versão 3.0 Completa</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} 
              className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 text-white/70"
              title="Alternar Tela Cheia"
            >
              <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
            </button>

            <button onClick={(e) => { e.stopPropagation(); navigate('ranking'); }} className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 text-yellow-500 shadow-lg shadow-yellow-500/10">
              <i className="fas fa-trophy"></i>
            </button>
            {isAdmin && (
              <button onClick={(e) => { e.stopPropagation(); navigate('admin'); }} className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all border border-white/10">
                <i className="fas fa-cog text-white/70"></i>
              </button>
            )}
          </div>
        </div>

        <div className="absolute bottom-20 left-0 right-0 text-center pointer-events-none">
          <h2 className="text-7xl lg:text-9xl font-cinzel font-bold text-yellow-500 drop-shadow-2xl animate-in fade-in zoom-in duration-1000">{parasha?.name_he || 'שמות'}</h2>
          <div className="flex flex-col items-center gap-4 mt-2">
            <p className="text-2xl lg:text-3xl font-cinzel tracking-[0.3em] uppercase text-white/90">{parasha?.name_pt || 'Shemot'}</p>
            <div className="inline-block px-6 py-1.5 glass rounded-full text-[12px] uppercase tracking-[0.2em] text-white/70 border border-white/10">
              Parashá da Semana
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-24 relative z-20 space-y-16 pb-32 w-full">
        {/* SECTION: PERFIL & DESTAQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3 border-white/10 bg-slate-950 shadow-2xl overflow-hidden relative min-h-[380px] p-0 flex flex-col md:flex-row">
            <div 
              className="absolute inset-0 bg-slate-900 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105" 
              style={{ backgroundImage: `url('${profileWallpaper}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent"></div>
            </div>

            <div className="relative z-10 p-8 md:p-10 flex-1 flex flex-col justify-between w-full md:max-w-xl">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                      <p className="text-[10px] text-white/60 uppercase font-bold tracking-[0.2em]">Explorador da Sabedoria</p>
                    </div>
                    {user.supporter_tier && (
                      <div className="flex items-center gap-1.5 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/40 backdrop-blur-md animate-in slide-in-from-right-4 duration-1000">
                        <i className="fas fa-gem text-[10px] text-yellow-500 animate-pulse"></i>
                        <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500">{user.supporter_tier}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-5xl font-bold tracking-tight drop-shadow-lg">{user.name}</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-1.5 rounded-full border border-yellow-500/30 backdrop-blur-md">
                      <i className="fas fa-bolt text-yellow-500 text-xs"></i>
                      <span className="text-sm font-bold text-yellow-400">{user.sparks}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-1.5 rounded-full border border-red-500/30 backdrop-blur-md">
                      <i className="fas fa-heart text-red-500 text-xs"></i>
                      <span className="text-sm font-bold text-red-400">{user.hearts}/613</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                      <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Nível</span>
                      <span className="text-lg font-bold text-yellow-500">{user.level}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Progresso do Nível</span>
                      <span className="text-[10px] text-white/40 font-mono">{user.xp} XP</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950/50 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700 animate-shimmer rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(234,179,8,0.3)]" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <button onClick={() => navigate('shop')} className="flex-1 min-w-[120px] px-4 py-3 rounded-xl glass border-yellow-500/30 hover:bg-yellow-500/20 font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl group">
                  <i className="fas fa-store mr-2 text-yellow-500 group-hover:scale-125 transition-transform"></i> Loja
                </button>
                <button onClick={() => navigate('album')} className="flex-1 min-w-[120px] px-4 py-3 rounded-xl glass border-white/10 hover:bg-white/10 font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl">
                  <i className="fas fa-images mr-2 text-blue-400"></i> Álbum
                </button>
                <button onClick={() => navigate('achievements')} className="flex-1 min-w-[120px] px-4 py-3 rounded-xl glass border-white/10 hover:bg-white/10 font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl">
                  <i className="fas fa-medal mr-2 text-purple-400"></i> Méritos
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-0 border-white/5 bg-slate-900/60 backdrop-blur-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[380px] group">
            <div className="absolute top-6 inset-x-0 text-center z-10">
              <p className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.4em] drop-shadow-md">Méritos Ativos</p>
            </div>
            
            <div key={currentMeritIndex} className="relative flex flex-col items-center animate-in fade-in zoom-in duration-1000 p-8 pt-16">
              {currentMerit ? (
                <>
                  <div className="relative mb-6">
                    <div className="absolute -inset-8 bg-yellow-500/20 rounded-full blur-[40px] animate-pulse"></div>
                    <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-full border-4 border-yellow-500/30 p-1.5 glass shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                      <img 
                        src={currentMerit.image_url} 
                        alt={currentMerit.name} 
                        className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-950 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                      Selo de Glória
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <h5 className="font-cinzel text-xl font-bold text-white tracking-widest uppercase">{currentMerit.name}</h5>
                    <p className="text-[10px] text-white/40 uppercase font-medium tracking-tighter max-w-[200px] line-clamp-2 leading-tight mx-auto">
                      {currentMerit.description}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center opacity-20">
                  <i className="fas fa-medal text-5xl mb-4"></i>
                  <p className="text-[9px] uppercase tracking-widest">Nenhum Destaque</p>
                </div>
              )}
            </div>

            <div className="absolute bottom-6 flex gap-2">
              {activeMeritIds.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${currentMeritIndex === i ? 'w-6 bg-yellow-500' : 'w-2 bg-white/10'}`}
                ></div>
              ))}
            </div>
          </Card>
        </div>

        {/* SECTION: OS PORTAIS (RESTAURADO PARA GRID INDIVIDUAL) */}
        <div className="mt-12 mb-20 relative">
          
          <div className="text-center mb-16 relative z-10">
             <h2 className="font-cinzel text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#e2d2a4] via-[#d4af37] to-[#8a6d3b] uppercase tracking-widest drop-shadow-[0_2px_15px_rgba(234,179,8,0.3)]">
               Portais da Sabedoria
             </h2>
             <div className="flex items-center justify-center gap-4 mt-4 opacity-60">
                <div className="h-px w-20 bg-gradient-to-r from-transparent to-yellow-500"></div>
                <i className="fas fa-star-of-david text-yellow-500 text-xs"></i>
                <div className="h-px w-20 bg-gradient-to-l from-transparent to-yellow-500"></div>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 relative z-10 items-end">
             {ORDERED_PORTALS.map((type, index) => {
               const data = PORTAL_DATA[type];
               const isLocked = !checkUnlock(type);
               const theme = PORTAL_THEMES[type];
               
               // Efeito de delay na animação para criar uma "onda"
               const animDelay = `${index * 150}ms`;

               return (
                 <div 
                    key={type}
                    onClick={() => !isLocked && handlePortalClick(type)}
                    className={`
                       group relative flex flex-col items-center justify-end
                       transition-all duration-500 ease-out
                       ${isLocked ? 'cursor-not-allowed opacity-60 grayscale' : 'cursor-pointer hover:-translate-y-4'}
                    `}
                    style={{ animationDelay: animDelay }}
                 >
                    {/* Brilho de Fundo (Glow) - Pointer Events None para não bloquear botão */}
                    <div className={`
                       absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] 
                       rounded-full blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none
                       ${isLocked ? 'hidden' : theme.bg.replace('bg-', 'bg-')}
                    `}></div>

                    {/* Imagem do Portal (Flutuante) */}
                    <div className="relative w-full aspect-[3/4] flex items-end justify-center mb-6 pointer-events-none">
                       <img 
                          src={data.image} 
                          alt={type}
                          className={`
                             w-full h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]
                             transition-transform duration-700
                             ${isLocked ? '' : 'group-hover:scale-110 group-hover:drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]'}
                          `}
                       />
                       
                       {/* Cadeado se bloqueado */}
                       {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl backdrop-blur-[2px]">
                             <i className="fas fa-lock text-4xl text-white/50 drop-shadow-lg"></i>
                          </div>
                       )}
                    </div>

                    {/* Título e Status */}
                    <div className="text-center relative z-10 pointer-events-none">
                       <h3 className={`
                          font-cinzel text-xl lg:text-2xl font-bold tracking-[0.2em] uppercase mb-2
                          transition-colors duration-300
                          ${isLocked ? 'text-white/30' : 'text-[#e2d2a4] group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'}
                       `}>
                          {type === PortalType.NOAHIDE ? 'Sete Leis' : type}
                       </h3>
                       
                       <div className={`
                          h-0.5 w-0 group-hover:w-full mx-auto transition-all duration-500
                          bg-gradient-to-r from-transparent via-${theme.accent.split('-')[1]}-500 to-transparent
                       `}></div>
                       
                       {!isLocked && (
                          <p className="text-[9px] text-white/40 uppercase tracking-[0.3em] mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                             Entrar no Portal
                          </p>
                       )}
                       {isLocked && (
                          <p className="text-[9px] text-white/20 uppercase tracking-[0.1em] mt-1">
                             <i className="fas fa-lock mr-1"></i> Bloqueado
                          </p>
                       )}
                    </div>

                    {/* Botão Admin para Regenerar Imagem - Z-INDEX 100 e FINAL DO DOM */}
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={(e) => handleRegeneratePortalImage(e, type)}
                            className="absolute top-0 right-0 z-[100] p-3 bg-slate-900/90 hover:bg-blue-600/90 rounded-full text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/20 hover:border-blue-400 shadow-[0_0_20px_rgba(0,0,0,0.8)] cursor-pointer"
                            title={`ADMIN: Gerar Nova Imagem para ${type}`}
                        >
                            {regeneratingPortal === type ? (
                                <i className="fas fa-spinner fa-spin text-sm"></i>
                            ) : (
                                <i className="fas fa-wand-magic-sparkles text-sm"></i>
                            )}
                        </button>
                    )}
                 </div>
               );
             })}
          </div>

          {/* Elemento Decorativo de Fundo para unir os portais */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-yellow-500/5 to-transparent blur-3xl pointer-events-none rounded-full mx-12"></div>
        </div>

        {/* SECTION: FOOTER ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-white/10 pt-16">
           <div className="glass p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between group transition-all hover:bg-white/[0.03]">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-yellow-500/5 animate-pulse"></div>
                   <div className="flex items-end gap-[2px] h-6">
                      <div className="w-[3px] bg-yellow-500 animate-[pulse_1s_infinite_0.1s] rounded-full" style={{height: '100%'}}></div>
                      <div className="w-[3px] bg-yellow-500 animate-[pulse_1.2s_infinite_0.3s] rounded-full" style={{height: '60%'}}></div>
                      <div className="w-[3px] bg-yellow-500 animate-[pulse_0.8s_infinite_0.5s] rounded-full" style={{height: '85%'}}></div>
                      <div className="w-[3px] bg-yellow-500 animate-[pulse_1.1s_infinite_0.2s] rounded-full" style={{height: '40%'}}></div>
                   </div>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] mb-1">Frequência Sagrada</p>
                  <h6 className="text-sm font-bold text-white/90 truncate max-w-[200px]">🎵 {currentTrack?.name || 'Nigun de Shabat'}</h6>
                  <p className="text-[9px] text-yellow-500/50 uppercase font-bold tracking-widest mt-0.5">Nigunim Instrumentais</p>
                </div>
              </div>
              <div className="flex gap-3">
                 <button className="w-10 h-10 rounded-full glass border-white/5 flex items-center justify-center hover:bg-yellow-500 hover:text-slate-950 transition-all">
                    <i className="fas fa-play text-xs"></i>
                 </button>
              </div>
           </div>

           <div 
             onClick={() => window.open('https://wa.me/5551981079568', '_blank')} 
             className="relative overflow-hidden group cursor-pointer bg-gradient-to-br from-purple-600/20 via-slate-950 to-slate-950 p-7 rounded-[2.5rem] border border-purple-500/20 hover:border-purple-500/50 transition-all shadow-2xl shadow-purple-900/20"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-all"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center text-3xl text-purple-400 border border-purple-500/20 shadow-xl group-hover:scale-110 transition-transform">
                    <i className="fas fa-hand-holding-heart animate-bounce"></i>
                  </div>
                  <div>
                    <p className="text-[11px] text-purple-300 font-black uppercase tracking-[0.2em] mb-1 drop-shadow-md">Mandamento de Tsedaká</p>
                    <p className="text-2xl font-black text-white font-cinzel tracking-wider group-hover:text-purple-400 transition-colors">PIX: (51) 98107-9568</p>
                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1 italic">Ajude a manter as luzes acesas</p>
                  </div>
                </div>
              </div>
           </div>
        </div>

        <div className="flex flex-col items-center pt-20 space-y-8">
           <div className="flex items-center gap-8 opacity-20">
              <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-white"></div>
              <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-white"></div>
           </div>

           <div className="flex flex-col items-center gap-6 text-center">
              <div className="space-y-2">
                <p className="text-[11px] text-white/40 uppercase font-bold tracking-[0.4em]">Desenvolvido com devoção por</p>
                <h6 className="font-cinzel text-xl font-bold text-white/90 tracking-widest">Gustavo Bisconsini Lacerda Silva</h6>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
                 <a href="https://instagram.com/Portoesdopardes" target="_blank" className="flex items-center gap-3 text-white/30 hover:text-yellow-500 transition-all group">
                    <i className="fab fa-instagram text-lg group-hover:scale-125"></i>
                    <span className="text-[10px] uppercase font-black tracking-widest">@Portoesdopardes</span>
                 </a>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
