
import { Rarity, PortalType, Sticker, Achievement } from './types';

export const RARITY_COLORS = {
  [Rarity.COMMON]: 'border-gray-400 text-gray-400 shadow-gray-900/50',
  [Rarity.RARE]: 'border-blue-400 text-blue-400 shadow-blue-900/50',
  [Rarity.EPIC]: 'border-purple-400 text-purple-400 shadow-purple-900/50',
  [Rarity.LEGENDARY]: 'border-yellow-400 text-yellow-400 shadow-yellow-900/50',
  [Rarity.MYTHIC]: 'border-red-500 text-red-500 shadow-red-900/50 animate-pulse',
};

// Configurações de Recompensa por Dificuldade
export const PORTAL_REWARDS = {
  EASY: { xp: 10, sparks: 5 },
  MEDIUM: { xp: 20, sparks: 10 },
  HARD: { xp: 35, sparks: 18 },
  EXTRA_HARD: { xp: 50, sparks: 25 }
};

export const PORTAL_THEMES = {
  [PortalType.NOAHIDE]: {
    bg: 'bg-[#0a0a0a]',
    gradient: 'from-indigo-950/60 via-slate-950 to-slate-950',
    shadow: 'shadow-[0_0_100px_rgba(99,102,241,0.15)]',
    accent: 'text-indigo-400'
  },
  [PortalType.PSHAT]: {
    bg: 'bg-[#1c1602]',
    gradient: 'from-yellow-950/60 via-slate-950 to-slate-950',
    shadow: 'shadow-[0_0_100px_rgba(234,179,8,0.15)]',
    accent: 'text-yellow-500'
  },
  [PortalType.REMEZ]: {
    bg: 'bg-[#020c1b]',
    gradient: 'from-blue-950/60 via-slate-950 to-slate-950',
    shadow: 'shadow-[0_0_100px_rgba(14,165,233,0.15)]',
    accent: 'text-sky-400'
  },
  [PortalType.DRASH]: {
    bg: 'bg-[#12021b]',
    gradient: 'from-purple-950/60 via-slate-950 to-slate-950',
    shadow: 'shadow-[0_0_100px_rgba(168,85,247,0.15)]',
    accent: 'text-purple-400'
  },
  [PortalType.PARASHA]: {
    bg: 'bg-[#1a0505]',
    gradient: 'from-red-950/60 via-slate-950 to-slate-950',
    shadow: 'shadow-[0_0_100px_rgba(239,68,68,0.15)]',
    accent: 'text-red-400'
  },
  [PortalType.SOD]: {
    bg: 'bg-[#021b0c]',
    gradient: 'from-green-950/60 via-slate-950 to-slate-950',
    shadow: 'shadow-[0_0_100px_rgba(34,197,94,0.15)]',
    accent: 'text-green-400'
  }
};

export const PORTAL_DATA = {
  [PortalType.NOAHIDE]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/7%20leis.png',
    video: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/7l.mp4',
    color: 'indigo',
    description: 'As Sete Leis Universais para a Humanidade.',
    difficultyLabel: 'MÉDIO',
    baseXp: 20,
    baseSparks: 10,
    unlockCriteria: 'Inicial'
  },
  [PortalType.PSHAT]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/PSHAT_250x320.png',
    video: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/PSHAT_250x320.mp4',
    color: 'yellow',
    description: 'O sentido literal e histórico do texto sagrado.',
    difficultyLabel: 'FÁCIL',
    baseXp: 10,
    baseSparks: 5,
    unlockCriteria: 'Inicial'
  },
  [PortalType.REMEZ]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/REMEZ_250x320.png',
    video: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/REMEZ_250x320.mp4',
    color: 'sky',
    description: 'As alusões, dicas e a profundidade da Gematria.',
    difficultyLabel: 'MÉDIO',
    baseXp: 20,
    baseSparks: 10,
    unlockCriteria: 'Dominar Pshat e Noahide'
  },
  [PortalType.DRASH]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/drash.png',
    video: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/DRASH_250x320.mp4',
    color: 'purple',
    description: 'A investigação homilética e as parábolas midráshicas.',
    difficultyLabel: 'DIFÍCIL',
    baseXp: 35,
    baseSparks: 18,
    unlockCriteria: 'Dominar Remez'
  },
  [PortalType.PARASHA]: {
    image: 'https://images.unsplash.com/photo-1603504369460-6029587f7390?auto=format&fit=crop&q=80&w=400', // Placeholder
    video: '', 
    color: 'red',
    description: 'Estudo aprofundado das Porções da Torá.',
    difficultyLabel: 'DIFÍCIL',
    baseXp: 35,
    baseSparks: 18,
    unlockCriteria: 'Dominar Drash'
  },
  [PortalType.SOD]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/SOD.png',
    video: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/sod.mp4',
    color: 'green',
    description: 'Os segredos esotéricos e a luz oculta da Cabalá.',
    difficultyLabel: 'EXTRA DIFÍCIL',
    baseXp: 50,
    baseSparks: 25,
    unlockCriteria: 'Dominar Parashá'
  }
};

// LISTA DE 50 MÉRITOS (ACHIEVEMENTS)
export const MERITS_LIST: Achievement[] = [
  // PROGRESSÃO (Níveis)
  { id: 'm1', name: 'Iniciante', hebrewName: 'Matchil', description: 'Alcance o nível 2.', iconClass: 'fa-shoe-prints', type: 'level', targetValue: 2, imageUrl: '' },
  { id: 'm2', name: 'Aluno', hebrewName: 'Talmid', description: 'Alcance o nível 10.', iconClass: 'fa-book-reader', type: 'level', targetValue: 10, imageUrl: '' },
  { id: 'm3', name: 'Dedicado', hebrewName: 'Masmid', description: 'Alcance o nível 26 (Valor do Nome de Hashem).', iconClass: 'fa-fire', type: 'level', targetValue: 26, imageUrl: '' },
  { id: 'm4', name: 'Guerreiro', hebrewName: 'Gibor', description: 'Alcance o nível 50.', iconClass: 'fa-shield-alt', type: 'level', targetValue: 50, imageUrl: '' },
  { id: 'm5', name: 'Sábio', hebrewName: 'Chacham', description: 'Alcance o nível 100.', iconClass: 'fa-brain', type: 'level', targetValue: 100, imageUrl: '' },
  { id: 'm6', name: 'Mestre', hebrewName: 'Rav', description: 'Alcance o nível 248 (Mitzvot Positivas).', iconClass: 'fa-user-graduate', type: 'level', targetValue: 248, imageUrl: '' },
  { id: 'm7', name: 'Príncipe', hebrewName: 'Nassi', description: 'Alcance o nível 365 (Mitzvot Negativas).', iconClass: 'fa-crown', type: 'level', targetValue: 365, imageUrl: '' },
  { id: 'm8', name: 'Completo', hebrewName: 'Shalem', description: 'Alcance o nível máximo 613.', iconClass: 'fa-infinity', type: 'level', targetValue: 613, imageUrl: '' },

  // MAESTRIA EM PORTAIS (Acertos)
  { id: 'm9', name: 'Filho de Noé', hebrewName: 'Ben Noach', description: '50 Acertos em Noahide.', iconClass: 'fa-dove', type: 'portal_mastery', targetValue: 50, targetPortal: PortalType.NOAHIDE, imageUrl: '' },
  { id: 'm10', name: 'Mestre do Simples', hebrewName: 'Baal Pshat', description: '50 Acertos em Pshat.', iconClass: 'fa-scroll', type: 'portal_mastery', targetValue: 50, targetPortal: PortalType.PSHAT, imageUrl: '' },
  { id: 'm11', name: 'Investigador', hebrewName: 'Doresh', description: '50 Acertos em Remez.', iconClass: 'fa-search', type: 'portal_mastery', targetValue: 50, targetPortal: PortalType.REMEZ, imageUrl: '' },
  { id: 'm12', name: 'Narrador', hebrewName: 'Darshan', description: '50 Acertos em Drash.', iconClass: 'fa-comment-dots', type: 'portal_mastery', targetValue: 50, targetPortal: PortalType.DRASH, imageUrl: '' },
  { id: 'm13', name: 'Guardião da Parashá', hebrewName: 'Shomer Parasha', description: '50 Acertos em Parashá.', iconClass: 'fa-torah', type: 'portal_mastery', targetValue: 50, targetPortal: PortalType.PARASHA, imageUrl: '' },
  { id: 'm14', name: 'Místico', hebrewName: 'Mekubal', description: '50 Acertos em Sod.', iconClass: 'fa-star-of-david', type: 'portal_mastery', targetValue: 50, targetPortal: PortalType.SOD, imageUrl: '' },
  
  // COLECIONADOR (Figurinhas/Álbum)
  { id: 'm15', name: 'Primeira Centelha', hebrewName: 'Nitzotz Rishon', description: 'Tenha 1 figurinha.', iconClass: 'fa-image', type: 'collection', targetValue: 1, imageUrl: '' },
  { id: 'm16', name: 'Colecionador', hebrewName: 'Osef', description: 'Tenha 10 figurinhas.', iconClass: 'fa-images', type: 'collection', targetValue: 10, imageUrl: '' },
  { id: 'm17', name: 'Arquivista', hebrewName: 'Ganaz', description: 'Tenha 50 figurinhas.', iconClass: 'fa-archive', type: 'collection', targetValue: 50, imageUrl: '' },
  { id: 'm18', name: 'Tesoureiro', hebrewName: 'Gizbar', description: 'Tenha 100 figurinhas.', iconClass: 'fa-gem', type: 'collection', targetValue: 100, imageUrl: '' },
  
  // DEDICAÇÃO (Jogos Jogados)
  { id: 'm19', name: 'Visitante', hebrewName: 'Oreach', description: 'Jogue 5 quizzes.', iconClass: 'fa-walking', type: 'dedication', targetValue: 5, imageUrl: '' },
  { id: 'm20', name: 'Habitante', hebrewName: 'Toshav', description: 'Jogue 20 quizzes.', iconClass: 'fa-home', type: 'dedication', targetValue: 20, imageUrl: '' },
  { id: 'm21', name: 'Pilar', hebrewName: 'Amud', description: 'Jogue 50 quizzes.', iconClass: 'fa-monument', type: 'dedication', targetValue: 50, imageUrl: '' },
  { id: 'm22', name: 'Eterno', hebrewName: 'Netzach', description: 'Jogue 100 quizzes.', iconClass: 'fa-hourglass-half', type: 'dedication', targetValue: 100, imageUrl: '' },

  // SABEDORIA (Acertos Consecutivos - Lógica complexa, simplificada aqui como total de acertos)
  { id: 'm23', name: 'Inteligente', hebrewName: 'Navon', description: 'Total de 100 acertos.', iconClass: 'fa-lightbulb', type: 'wisdom', targetValue: 100, imageUrl: '' },
  { id: 'm24', name: 'Gênio', hebrewName: 'Ilui', description: 'Total de 500 acertos.', iconClass: 'fa-bolt', type: 'wisdom', targetValue: 500, imageUrl: '' },
  { id: 'm25', name: 'Cabeça', hebrewName: 'Rosh', description: 'Total de 1000 acertos.', iconClass: 'fa-brain', type: 'wisdom', targetValue: 1000, imageUrl: '' },

  // TEMÁTICOS JUDAICOS DIVERSOS
  { id: 'm26', name: 'Bom Coração', hebrewName: 'Lev Tov', description: 'Acumule 20 corações.', iconClass: 'fa-heart', type: 'special', targetValue: 20, imageUrl: '' },
  { id: 'm27', name: 'Caridoso', hebrewName: 'Baal Tsedaká', description: 'Gaste 1000 centelhas na loja.', iconClass: 'fa-hand-holding-heart', type: 'special', targetValue: 1000, imageUrl: '' },
  { id: 'm28', name: 'Cantor', hebrewName: 'Chazan', description: 'Ouça todas as músicas (Lógica futura).', iconClass: 'fa-music', type: 'special', targetValue: 1, imageUrl: '' },
  { id: 'm29', name: 'Justo', hebrewName: 'Tzadik', description: 'Complete todos os portais (Masterizado).', iconClass: 'fa-balance-scale', type: 'special', targetValue: 6, imageUrl: '' },
  { id: 'm30', name: 'Líder', hebrewName: 'Manhig', description: 'Chegue ao Top 3 do Ranking.', iconClass: 'fa-trophy', type: 'special', targetValue: 1, imageUrl: '' },
  { id: 'm31', name: 'Guardião do Shabat', hebrewName: 'Shomer Shabat', description: 'Jogue na sexta-feira (Lógica futura).', iconClass: 'fa-candles', type: 'special', targetValue: 1, imageUrl: '' },
  { id: 'm32', name: 'Pessoa Íntegra', hebrewName: 'Mentsch', description: 'Alcance nível 18 (Chai).', iconClass: 'fa-user-tie', type: 'level', targetValue: 18, imageUrl: '' },
  { id: 'm33', name: 'Leão', hebrewName: 'Ari', description: 'Alcance nível 40 (Idade do entendimento).', iconClass: 'fa-paw', type: 'level', targetValue: 40, imageUrl: '' },
  { id: 'm34', name: 'Águia', hebrewName: 'Nesher', description: 'Alcance nível 70 (Ancião).', iconClass: 'fa-feather', type: 'level', targetValue: 70, imageUrl: '' },
  { id: 'm35', name: 'Servo', hebrewName: 'Eved', description: 'Acerte 10 questões de Noé.', iconClass: 'fa-hands-helping', type: 'portal_mastery', targetValue: 10, targetPortal: PortalType.NOAHIDE, imageUrl: '' },
  { id: 'm36', name: 'Luminar', hebrewName: 'Maor', description: 'Acerte 100 questões em Pshat.', iconClass: 'fa-sun', type: 'portal_mastery', targetValue: 100, targetPortal: PortalType.PSHAT, imageUrl: '' },
  { id: 'm37', name: 'Profundo', hebrewName: 'Amok', description: 'Acerte 100 questões em Remez.', iconClass: 'fa-water', type: 'portal_mastery', targetValue: 100, targetPortal: PortalType.REMEZ, imageUrl: '' },
  { id: 'm38', name: 'Pregador', hebrewName: 'Maguid', description: 'Acerte 100 questões em Drash.', iconClass: 'fa-bullhorn', type: 'portal_mastery', targetValue: 100, targetPortal: PortalType.DRASH, imageUrl: '' },
  { id: 'm39', name: 'Oculto', hebrewName: 'Nistar', description: 'Acerte 100 questões em Sod.', iconClass: 'fa-user-secret', type: 'portal_mastery', targetValue: 100, targetPortal: PortalType.SOD, imageUrl: '' },
  { id: 'm40', name: 'Rico', hebrewName: 'Ashir', description: 'Acumule 5000 centelhas.', iconClass: 'fa-coins', type: 'special', targetValue: 5000, imageUrl: '' },
  { id: 'm41', name: 'Alegre', hebrewName: 'Sameach', description: 'Compre 5 baús.', iconClass: 'fa-smile', type: 'special', targetValue: 5, imageUrl: '' },
  { id: 'm42', name: 'Forte', hebrewName: 'Chazak', description: 'Chegue ao nível 10 sem errar (Lógica futura).', iconClass: 'fa-fist-raised', type: 'special', targetValue: 1, imageUrl: '' },
  { id: 'm43', name: 'Amado', hebrewName: 'Ahuv', description: 'Complete o álbum.', iconClass: 'fa-heart-circle-check', type: 'collection', targetValue: 200, imageUrl: '' },
  { id: 'm44', name: 'Zeloso', hebrewName: 'Zeriz', description: 'Responda em menos de 5s (Lógica futura).', iconClass: 'fa-stopwatch', type: 'special', targetValue: 1, imageUrl: '' },
  { id: 'm45', name: 'Temente', hebrewName: 'Yere', description: 'Nível 30.', iconClass: 'fa-praying-hands', type: 'level', targetValue: 30, imageUrl: '' },
  { id: 'm46', name: 'Piedoso', hebrewName: 'Chassid', description: 'Nível 60.', iconClass: 'fa-hand-sparkles', type: 'level', targetValue: 60, imageUrl: '' },
  { id: 'm47', name: 'Puro', hebrewName: 'Tahor', description: 'Acerte todas em um quiz de 50.', iconClass: 'fa-tint', type: 'special', targetValue: 50, imageUrl: '' },
  { id: 'm48', name: 'Santo', hebrewName: 'Kadosh', description: 'Nível 613 (Título Final).', iconClass: 'fa-star', type: 'level', targetValue: 613, imageUrl: '' },
  { id: 'm49', name: 'Rei', hebrewName: 'Melech', description: 'Top 1 do Ranking.', iconClass: 'fa-chess-king', type: 'special', targetValue: 1, imageUrl: '' },
  { id: 'm50', name: 'Lenda', hebrewName: 'Agada', description: 'Desbloqueie todos os méritos.', iconClass: 'fa-dragon', type: 'special', targetValue: 49, imageUrl: '' },
];
