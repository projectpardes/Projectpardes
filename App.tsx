
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { UserProfile, PortalType, Sticker, Rarity } from './types';
import { PORTAL_THEMES } from './constants';
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
  
  const [user, setUser] = useState<UserProfile>({
    name: "Explorador",
    level: 1,
    xp: 0,
    sparks: 50,
    hearts: 5,
    merits: [],
    featuredMerits: [],
    stickers: [],
    lastLevelRewarded: 0
  });

  const currentTrack = playlist.length > 0 ? playlist[trackIndex] : null;

  // Função para embaralhar array (Fisher-Yates)
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
        // ALEATORIEDADE: Toda vez que muda a página, a lista é embaralhada
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
      'projectpardes@gmail.com' // ADMIN CONFIRMADO
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
        supporter_tier: data.supporter_tier
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
      updated_at: new Date().toISOString()
    };

    try {
      await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    } catch (e) {
      console.error("Exceção na sincronização:", e);
    }
  };

  const addXP = (amount: number) => {
    setUser(prev => {
      const newXP = prev.xp + amount;
      const nextLevelXP = Math.floor(Math.pow(prev.level, 1.7) * 100);
      let newLevel = prev.level;
      let newSparks = prev.sparks + (amount / 10);
      
      if (newXP >= nextLevelXP) {
        newLevel++;
        newSparks += newLevel * 10;
        soundManager.play(SFX.VICTORY);

        const rewardType = getRewardType(newLevel);
        if (rewardType && (prev.lastLevelRewarded || 0) < newLevel) {
          const sticker = pickSticker(newLevel, allStickers, prev.stickers);
          if (sticker) setPendingSticker(sticker);
        }
      }
      
      const updated = { ...prev, xp: newXP, level: newLevel, sparks: Math.floor(newSparks), lastLevelRewarded: newLevel };
      syncProfile(updated);
      return updated;
    });
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
      const updated = { ...prev, hearts: Math.min(10, prev.hearts + amount) };
      syncProfile(updated);
      return updated;
    });
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
        return <Dashboard user={user} parasha={currentParasha} currentTrack={currentTrack} allMerits={allMerits} onStartJourney={(p) => { setSelectedPortal(p); setView('quiz-prep'); }} setView={setView} isAdmin={isAdmin} />;
      case 'quiz-prep':
        return <QuizPreparationView user={user} portal={selectedPortal} onBack={() => setView('dashboard')} onStart={(limit) => { setQuestionLimit(limit); setView('quiz'); }} />;
      case 'quiz':
        return <QuizView user={user} portal={selectedPortal} questionLimit={questionLimit} onFinish={(xp) => { addXP(xp); setView('dashboard'); }} onClose={() => setView('dashboard')} />;
      case 'parasha-details':
        return <ParashaDetailsView parasha={currentParasha} onClose={() => setView('dashboard')} onStartQuiz={() => { setSelectedPortal(PortalType.PSHAT); setView('quiz-prep'); }} />;
      case 'ranking':
        return <RankingView user={user} onClose={() => setView('dashboard')} />;
      case 'album':
        return <AlbumView ownedIds={user.stickers} userLevel={user.level} isAdmin={isAdmin} onClose={() => setView('dashboard')} />;
      case 'achievements':
        return <AchievementsView user={user} isAdmin={isAdmin} onClose={() => setView('dashboard')} onUpdateUser={(u) => { setUser(u); syncProfile(u); }} />;
      case 'shop':
        return <ShopView user={user} onClose={() => setView('dashboard')} onPurchaseHeart={() => updateHearts(1)} onSpendSparks={(amount) => updateSparks(-amount)} onOpenChest={handleOpenChest} />;
      case 'admin':
        return isAdmin ? <AdminDashboard onRefreshParasha={fetchCurrentParasha} onRefreshMerits={fetchAllMerits} onClose={() => setView('dashboard')} /> : <Dashboard user={user} parasha={currentParasha} allMerits={allMerits} onStartJourney={(p) => { setSelectedPortal(p); setView('quiz-prep'); }} setView={setView} isAdmin={isAdmin} />;
      case 'avatar-creation':
        return <AvatarCreationView onComplete={(updatedUser) => { setUser(updatedUser); syncProfile(updatedUser); setView('dashboard'); }} />;
      default:
        return <Dashboard user={user} parasha={currentParasha} allMerits={allMerits} onStartJourney={(p) => { setSelectedPortal(p); setView('quiz-prep'); }} setView={setView} isAdmin={isAdmin} />;
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
