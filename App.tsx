
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { UserProfile, PortalType, Sticker, Rarity, PortalStats } from './types';
import { PORTAL_THEMES, PORTAL_DATA } from './constants';
import { soundManager, SFX } from './services/soundService';
import { pickSticker, getRewardType } from './services/stickerService';
import Dashboard from './views/Dashboard';
import QuizView from './views/QuizView';
import AlbumView from './views/AlbumView';
import AchievementsView from './views/AchievementsView';
import AdminDashboard from './views/AdminDashboard';
import ShopView from './views/ShopView';
import AvatarCreationView from './views/AvatarCreationView';
import ParashaDetailsView from './views/ParashaDetailsView';
import RankingView from './views/RankingView';
import QuizPreparationView from './views/QuizPreparationView';
import AuthView from './views/AuthView';
import { StickerRewardPopup } from './components/StickerRewardPopup';

type ViewState = 'dashboard' | 'quiz' | 'album' | 'achievements' | 'admin' | 'shop' | 'avatar-creation' | 'parasha-details' | 'ranking' | 'quiz-prep';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedPortal, setSelectedPortal] = useState<PortalType>(PortalType.PSHAT);
  const [questionLimit, setQuestionLimit] = useState(10);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentParasha, setCurrentParasha] = useState<any>(null);
  const [allMerits, setAllMerits] = useState<any[]>([]);
  const [allStickers, setAllStickers] = useState<Sticker[]>([]);
  const [pendingSticker, setPendingSticker] = useState<Sticker | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [trackIndex, setTrackIndex] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  
  // Estado inicial do usuário com PortalStats
  const [user, setUser] = useState<UserProfile>({
    name: "Explorador",
    level: 1,
    xp: 0,
    sparks: 50,
    hearts: 10,
    merits: [],
    featuredMerits: [],
    stickers: [],
    lastLevelRewarded: 0,
    portalStats: {
      [PortalType.NOAHIDE]: { questionsAnswered: 0, correctAnswers: 0 },
      [PortalType.PSHAT]: { questionsAnswered: 0, correctAnswers: 0 },
      [PortalType.REMEZ]: { questionsAnswered: 0, correctAnswers: 0 },
      [PortalType.DRASH]: { questionsAnswered: 0, correctAnswers: 0 },
      [PortalType.PARASHA]: { questionsAnswered: 0, correctAnswers: 0 },
      [PortalType.SOD]: { questionsAnswered: 0, correctAnswers: 0 }
    }
  });

  const currentTrack = playlist.length > 0 ? playlist[trackIndex] : null;

  // Lógica de XP Exponencial
  const calculateNextLevelXP = (level: number) => {
    // Fórmula exponencial suave: Base * (Level ^ 1.8)
    // Nível 1: ~100 xp
    // Nível 10: ~6300 xp
    // Nível 613: Muito alto
    return Math.floor(100 * Math.pow(level, 1.8));
  };

  const shuffleArray = (array: any[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  useEffect(() => {
    const fetchMusicForView = async () => {
      let category = 'Dashboard';
      if (view === 'ranking') category = 'Ranking';
      if (view === 'quiz' || view === 'quiz-prep') category = 'Quiz';
      if (view === 'album') category = 'Álbum';
      if (view === 'shop') category = 'Loja';
      if (view === 'avatar-creation') category = 'Abertura';
      if (view === 'admin') category = 'Dashboard';

      const { data } = await supabase.from('nigunim')
        .select('*')
        .eq('category', category)
        .eq('is_active', true);
      
      if (data && data.length > 0) {
        setPlaylist(shuffleArray(data));
        setTrackIndex(0);
      } else {
        setPlaylist([]);
      }
    };

    if (session) fetchMusicForView();
  }, [view, session]);

  const handleTrackEnded = () => {
    if (playlist.length > 1) {
      setTrackIndex((prev) => (prev + 1) % playlist.length);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    const unlockAudio = () => {
      soundManager.init();
      setAudioUnlocked(true);
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    return () => window.removeEventListener('click', unlockAudio);
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current && audioUnlocked && currentTrack) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});
    }
  }, [currentTrack, trackIndex, audioUnlocked]);

  const checkAdminStatus = (email?: string) => {
    const adminEmails = [
      'gustavo@pardes.com', 
      'admin@admin.com', 
      'gustavolacerda.bsi@gmail.com',
      'projectpardes@gmail.com'
    ];
    return email ? adminEmails.includes(email.toLowerCase()) : false;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        setIsAdmin(checkAdminStatus(session.user.email));
      }
      fetchCurrentParasha();
      fetchAllMerits();
      fetchStickers();
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        setIsAdmin(checkAdminStatus(session.user.email));
      } else {
        setView('dashboard');
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchStickers = async () => {
    const { data } = await supabase.from('stickers').select('*');
    if (data) setAllStickers(data);
  };

  const fetchAllMerits = async () => {
    const { data } = await supabase.from('merits').select('*');
    if (data) setAllMerits(data);
  };

  const fetchCurrentParasha = async () => {
    const { data } = await supabase.from('parashiot').select('*').eq('is_current', true).maybeSingle();
    if (data) setCurrentParasha(data);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      // Garantir estrutura de portalStats se não existir no banco
      const defaultStats = {
        [PortalType.NOAHIDE]: { questionsAnswered: 0, correctAnswers: 0 },
        [PortalType.PSHAT]: { questionsAnswered: 0, correctAnswers: 0 },
        [PortalType.REMEZ]: { questionsAnswered: 0, correctAnswers: 0 },
        [PortalType.DRASH]: { questionsAnswered: 0, correctAnswers: 0 },
        [PortalType.PARASHA]: { questionsAnswered: 0, correctAnswers: 0 },
        [PortalType.SOD]: { questionsAnswered: 0, correctAnswers: 0 }
      };

      setUser({
        name: data.name,
        level: data.level,
        xp: data.xp,
        sparks: data.sparks,
        hearts: data.hearts,
        merits: data.merits || [],
        featuredMerits: data.featured_merits || [],
        stickers: data.stickers || [],
        lastLevelRewarded: data.last_level_rewarded || 0,
        avatarUrl: data.avatar_url,
        supporter_tier: data.supporter_tier,
        portalStats: data.portal_stats || defaultStats
      });
      if (!data.avatar_url) setView('avatar-creation');
    } else if (error && error.code === 'PGRST116') {
      setView('avatar-creation');
    }
  };

  const syncProfile = async (updatedUser: UserProfile) => {
    if (!session?.user?.id) return;
    
    const payload: any = {
      id: session.user.id,
      name: updatedUser.name,
      level: updatedUser.level,
      xp: updatedUser.xp,
      sparks: updatedUser.sparks,
      hearts: updatedUser.hearts,
      merits: updatedUser.merits || [],
      featured_merits: updatedUser.featuredMerits || [],
      stickers: updatedUser.stickers || [],
      last_level_rewarded: updatedUser.lastLevelRewarded || 0,
      avatar_url: updatedUser.avatarUrl,
      portal_stats: updatedUser.portalStats,
      updated_at: new Date().toISOString()
    };

    try {
      await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.error("Exceção na sincronização:", e);
    }
  };

  const addXP = (amount: number, portal: PortalType, correctCount: number) => {
    setUser(prev => {
      const maxLevel = 613;
      let newLevel = prev.level;
      let newXP = prev.xp + amount;
      let nextLevelXP = calculateNextLevelXP(newLevel);
      let newHearts = prev.hearts;
      
      // Level Up Logic
      while (newXP >= nextLevelXP && newLevel < maxLevel) {
        newXP -= nextLevelXP;
        newLevel++;
        nextLevelXP = calculateNextLevelXP(newLevel);
        newHearts = Math.min(613, newHearts + 1); // Ganha 1 vida por nível
        soundManager.play(SFX.VICTORY);

        const rewardType = getRewardType(newLevel);
        if (rewardType && (prev.lastLevelRewarded || 0) < newLevel) {
          const sticker = pickSticker(newLevel, allStickers, prev.stickers);
          if (sticker) setPendingSticker(sticker);
        }
      }
      
      // Atualizar estatísticas do portal
      const currentStats = prev.portalStats?.[portal] || { questionsAnswered: 0, correctAnswers: 0 };
      const newStats = {
        ...prev.portalStats,
        [portal]: {
            questionsAnswered: currentStats.questionsAnswered + questionLimit, // Assumindo que terminou o quiz
            correctAnswers: currentStats.correctAnswers + correctCount
        }
      };

      const updated = { 
          ...prev, 
          xp: newXP, 
          level: newLevel, 
          hearts: newHearts, 
          lastLevelRewarded: newLevel,
          portalStats: newStats
      };
      
      syncProfile(updated);
      return updated;
    });
  };

  const consumeHeart = () => {
    setUser(prev => {
        const updated = { ...prev, hearts: Math.max(0, prev.hearts - 1) };
        syncProfile(updated);
        return updated;
    });
  };

  const handleStartQuiz = (limit: number) => {
    if (user.hearts <= 0) {
        soundManager.play(SFX.ERROR);
        alert("Você está sem corações! Aguarde ou adquira na loja.");
        return;
    }
    consumeHeart();
    setQuestionLimit(limit);
    setView('quiz');
  };

  const handleClaimSticker = () => {
    if (pendingSticker) {
      const updatedStickers = [...user.stickers, pendingSticker.id];
      const updatedUser = { ...user, stickers: updatedStickers };
      setUser(updatedUser);
      syncProfile(updatedUser);
      setPendingSticker(null);
    }
  };

  const handleOpenChest = (rarities: Rarity[]) => {
    let candidates = allStickers.filter(s => rarities.includes(s.rarity) && !user.stickers.includes(s.id));
    if (candidates.length === 0) candidates = allStickers.filter(s => rarities.includes(s.rarity));
    
    if (candidates.length > 0) {
      const luckySticker = candidates[Math.floor(Math.random() * candidates.length)];
      setPendingSticker(luckySticker);
    } else {
      alert("Não há figurinhas disponíveis nestas raridades!");
    }
  };

  const updateSparks = (amount: number) => {
    setUser(prev => {
      const updated = { ...prev, sparks: prev.sparks + amount };
      syncProfile(updated);
      return updated;
    });
  };

  const updateHearts = (amount: number) => {
    setUser(prev => {
      const updated = { ...prev, hearts: Math.min(613, prev.hearts + amount) };
      syncProfile(updated);
      return updated;
    });
  };

  // Lógica de Desbloqueio de Portais
  const isPortalUnlocked = (type: PortalType): boolean => {
    if (isAdmin) return true;
    if (type === PortalType.NOAHIDE || type === PortalType.PSHAT) return true;

    const stats = user.portalStats || {};
    const MASTERY_THRESHOLD = 50; // Acertos necessários para "dominar"

    const noahideWins = stats[PortalType.NOAHIDE]?.correctAnswers || 0;
    const pshatWins = stats[PortalType.PSHAT]?.correctAnswers || 0;
    const remezWins = stats[PortalType.REMEZ]?.correctAnswers || 0;
    const drashWins = stats[PortalType.DRASH]?.correctAnswers || 0;
    const parashaWins = stats[PortalType.PARASHA]?.correctAnswers || 0;

    if (type === PortalType.REMEZ) return noahideWins >= MASTERY_THRESHOLD && pshatWins >= MASTERY_THRESHOLD;
    if (type === PortalType.DRASH) return remezWins >= MASTERY_THRESHOLD;
    if (type === PortalType.PARASHA) return drashWins >= MASTERY_THRESHOLD;
    if (type === PortalType.SOD) return parashaWins >= MASTERY_THRESHOLD;

    return false;
  };

  if (loading) return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
      <p className="font-cinzel text-yellow-500 tracking-widest text-xs uppercase animate-pulse">Carregando Destino...</p>
    </div>
  );

  if (!session) return <AuthView onAuthSuccess={() => {}} />;

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard 
            user={user} 
            parasha={currentParasha} 
            currentTrack={currentTrack} 
            allMerits={allMerits} 
            onStartJourney={(p) => { setSelectedPortal(p); setView('quiz-prep'); }} 
            setView={setView} 
            isAdmin={isAdmin}
            checkUnlock={isPortalUnlocked}
        />;
      case 'quiz-prep':
        return <QuizPreparationView user={user} portal={selectedPortal} onBack={() => setView('dashboard')} onStart={handleStartQuiz} />;
      case 'quiz':
        return <QuizView 
            user={user} 
            portal={selectedPortal} 
            questionLimit={questionLimit} 
            onFinish={(xp, sparks, correct) => { 
                addXP(xp, selectedPortal, correct); 
                updateSparks(sparks);
                setView('dashboard'); 
            }} 
            onClose={() => setView('dashboard')} 
        />;
      case 'parasha-details':
        return <ParashaDetailsView parasha={currentParasha} onClose={() => setView('dashboard')} onStartQuiz={() => { setSelectedPortal(PortalType.PARASHA); setView('quiz-prep'); }} />;
      case 'ranking':
        return <RankingView user={user} onClose={() => setView('dashboard')} />;
      case 'album':
        return <AlbumView ownedIds={user.stickers} userLevel={user.level} isAdmin={isAdmin} onClose={() => setView('dashboard')} />;
      case 'achievements':
        return <AchievementsView user={user} isAdmin={isAdmin} onClose={() => setView('dashboard')} onUpdateUser={(u) => { setUser(u); syncProfile(u); }} />;
      case 'shop':
        return <ShopView user={user} onClose={() => setView('dashboard')} onPurchaseHeart={() => updateHearts(1)} onSpendSparks={(amount) => updateSparks(-amount)} onOpenChest={handleOpenChest} />;
      case 'admin':
        return isAdmin ? <AdminDashboard onRefreshParasha={fetchCurrentParasha} onRefreshMerits={fetchAllMerits} onClose={() => setView('dashboard')} /> : null;
      case 'avatar-creation':
        return <AvatarCreationView onComplete={(updatedUser) => { setUser(updatedUser); syncProfile(updatedUser); setView('dashboard'); }} />;
      default:
        return null;
    }
  };

  const currentTheme = (view === 'quiz' || view === 'quiz-prep') ? PORTAL_THEMES[selectedPortal] : null;

  return (
    <div className={`min-h-screen transition-all duration-1000 ease-in-out ${currentTheme ? currentTheme.bg : 'bg-slate-950'} text-white selection:bg-yellow-500/30`}>
      <div className={`max-w-[1440px] mx-auto min-h-screen transition-all duration-1000 relative`}>
        {currentTrack && (
          <audio 
            ref={audioRef} 
            src={currentTrack.url} 
            onEnded={handleTrackEnded} 
            autoPlay 
          />
        )}
        <div className={`fixed inset-0 bg-gradient-to-b ${currentTheme ? currentTheme.gradient : 'from-transparent to-transparent'} transition-all duration-1000 pointer-events-none opacity-50 z-0`}></div>
        <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full transition-all duration-1000 blur-[120px] pointer-events-none z-0 ${currentTheme ? currentTheme.shadow : ''}`}></div>
        
        {pendingSticker && (
          <StickerRewardPopup 
            sticker={pendingSticker} 
            onClose={handleClaimSticker} 
          />
        )}

        <div className="relative z-10 min-h-screen">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default App;
