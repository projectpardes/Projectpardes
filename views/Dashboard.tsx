
import React, { useState, useEffect } from 'react';
import { UserProfile, PortalType } from '../types';
import { PORTAL_DATA } from '../constants';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { soundManager, SFX } from '../services/soundService';

interface DashboardProps {
  user: UserProfile;
  parasha?: any;
  currentTrack?: any;
  allMerits: any[];
  onStartJourney: (portal: PortalType) => void;
  setView: (v: any) => void;
  isAdmin: boolean;
}

const PortalCard: React.FC<{
  type: PortalType;
  data: any;
  isLocked: boolean;
  onClick: () => void;
}> = ({ type, data, isLocked, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="flex flex-col items-center w-full"
      onMouseEnter={() => !isLocked && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`relative group w-full overflow-hidden rounded-3xl transition-all duration-500 ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:-translate-y-4 cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.6)]'}`}
        onClick={onClick}
        style={{ paddingBottom: '128%' }} /* Relação 25:32 */
      >
        {/* Fundo Desfocado para preencher o card sem vácuo visual */}
        <div className="absolute inset-0 w-full h-full bg-slate-900">
           <img 
              src={data.image} 
              alt="" 
              className="w-full h-full object-cover blur-xl opacity-30 scale-110" 
           />
        </div>

        {/* Camada de Mídia Principal: object-contain garante que NADA seja cortado */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center p-1">
          {!isLocked && isHovered && data.video ? (
            <video 
              src={data.video} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-contain animate-in fade-in duration-500 z-10"
            />
          ) : (
            <img 
              src={data.image} 
              alt={type} 
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 z-10" 
            />
          )}
        </div>
        
        {/* Overlay de Gradiente Suave para profundidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity duration-500 z-20"></div>
        
        {/* Estado Bloqueado */}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[2px] z-30">
            <i className="fas fa-lock text-4xl text-white/30 mb-3 animate-pulse"></i>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">Bloqueado Nível {data.unlockLevel}</span>
          </div>
        )}

        {/* Brilho de Borda */}
        {!isLocked && (
          <div className="absolute inset-0 border-2 border-white/0 group-hover:border-yellow-500/20 rounded-3xl transition-all duration-500 pointer-events-none z-40"></div>
        )}
      </div>

      {/* Título e Descrição abaixo do Portal */}
      <div className="mt-5 text-center w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
         <h5 className="font-cinzel text-lg font-bold text-yellow-500/90 tracking-[0.2em] uppercase mb-1 drop-shadow-md">
           {type === PortalType.NOAHIDE ? '7 Leis' : type}
         </h5>
         <p className="text-[9px] text-white/40 font-medium leading-relaxed tracking-wide px-4 italic line-clamp-2">
           {data.description}
         </p>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user, parasha, currentTrack, allMerits, onStartJourney, setView, isAdmin }) => {
  const currentLevelXP = Math.floor(Math.pow(user.level, 1.7) * 100);
  const progressPercent = Math.min(100, (user.xp / currentLevelXP) * 100);

  const profileWallpaper = user.avatarUrl || "https://picsum.photos/seed/profile_wallpaper/800/400";
  const parashaBanner = parasha?.banner_url || 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=1440';
  const parashaVideo = parasha?.video_url;

  const activeMeritIds = (user.featuredMerits && user.featuredMerits.length > 0) 
    ? user.featuredMerits 
    : (user.merits || []).slice(0, 5);

  const [currentMeritIndex, setCurrentMeritIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const currentMeritId = activeMeritIds[currentMeritIndex];
  const currentMerit = allMerits.find(m => m.id === currentMeritId);

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
            {/* Botão Tela Cheia */}
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
            {/* Ícone Admin Estritamente Protegido */}
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Perfil e Progresso - Avatar preenchendo o fundo como papel de parede */}
          <Card className="lg:col-span-3 border-white/10 bg-slate-950 shadow-2xl overflow-hidden relative min-h-[380px] p-0 flex flex-col md:flex-row">
            {/* O Avatar preenche todo o fundo (Wallpaper style) */}
            <div 
              className="absolute inset-0 bg-slate-900 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105" 
              style={{ backgroundImage: `url('${profileWallpaper}')` }}
            >
              {/* Gradiente refinado para garantir legibilidade mantendo a arte visível */}
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
                      <span className="text-sm font-bold text-red-400">{user.hearts}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                      <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Nível</span>
                      <span className="text-lg font-bold text-yellow-500">{user.level}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Progresso do Nível</span>
                      <span className="text-[10px] text-white/40 font-mono">{user.xp} / {currentLevelXP} XP</span>
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

          {/* Slider de Méritos (Destaques) */}
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

        {/* Portais do PaRDeS e 7 Leis */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-8 mb-16 w-full max-w-6xl">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
            <h4 className="font-cinzel text-3xl tracking-[0.2em] text-white/90 whitespace-nowrap uppercase text-center drop-shadow-lg">Portais da Sabedoria</h4>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 w-full max-w-[1300px] mx-auto justify-items-center">
            {Object.entries(PORTAL_DATA).map(([type, data]) => {
              const portalType = type as PortalType;
              const isLocked = user.level < data.unlockLevel;
              return (
                <PortalCard 
                  key={type}
                  type={portalType}
                  data={data}
                  isLocked={isLocked}
                  onClick={() => !isLocked && handlePortalClick(portalType)}
                />
              );
            })}
          </div>
        </div>

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
