
import { Rarity, PortalType, Sticker, Achievement } from './types';

export const RARITY_COLORS = {
  [Rarity.COMMON]: 'border-gray-400 text-gray-400 shadow-gray-900/50',
  [Rarity.RARE]: 'border-blue-400 text-blue-400 shadow-blue-900/50',
  [Rarity.EPIC]: 'border-purple-400 text-purple-400 shadow-purple-900/50',
  [Rarity.LEGENDARY]: 'border-yellow-400 text-yellow-400 shadow-yellow-900/50',
  [Rarity.MYTHIC]: 'border-red-500 text-red-500 shadow-red-900/50 animate-pulse',
};

export const PORTAL_THEMES = {
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
  [PortalType.SOD]: {
    bg: 'bg-[#021b0c]',
    gradient: 'from-green-950/60 via-slate-950 to-slate-950',
    shadow: 'shadow-[0_0_100px_rgba(34,197,94,0.15)]',
    accent: 'text-green-400'
  },
  [PortalType.NOAHIDE]: {
    bg: 'bg-[#0a0a0a]',
    gradient: 'from-indigo-950/60 via-slate-950 to-slate-950',
    shadow: 'shadow-[0_0_100px_rgba(99,102,241,0.15)]',
    accent: 'text-indigo-400'
  }
};

export const PORTAL_DATA = {
  [PortalType.PSHAT]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/PSHAT_250x320.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy9QU0hBVF8yNTB4MzIwLnBuZyIsImlhdCI6MTc2OTA5MzA3NSwiZXhwIjoxODAwNjI5MDc1fQ.byZntbhSfDExK-QUXoyqfCxSUcNsqSn4KlnxK278Hl8',
    video: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/PSHAT_250x320.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy9QU0hBVF8yNTB4MzIwLm1wNCIsImlhdCI6MTc2OTA5MzYyOSwiZXhwIjoxODAwNjI5NjI5fQ.D25ZdMu0m24TWquJV06qoE0FEflxRhT-xYBTLQxmTLA',
    color: 'yellow',
    description: 'O sentido literal e histórico do texto sagrado.',
    unlockLevel: 1
  },
  [PortalType.REMEZ]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/REMEZ_250x320.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy9SRU1FWl8yNTB4MzIwLnBuZyIsImlhdCI6MTc2OTA5MzA5NSwiZXhwIjoxODAwNjI5MDk1fQ.2Zeuaj_Sj2QScs4tac34sPaExxees-AJcrAdr6g18lU',
    video: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/REMEZ_250x320.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy9SRU1FWl8yNTB4MzIwLm1wNCIsImlhdCI6MTc2OTA5MzY0NSwiZXhwIjoxODAwNjI5NjQ1fQ.Z6yne55kmQEwjAocPO2jF3bW_w8m5KL8MFICzKSBosU',
    color: 'sky',
    description: 'As alusões, dicas e a profundidade da Gematria.',
    unlockLevel: 7
  },
  [PortalType.DRASH]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/drash.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy9kcmFzaC5wbmciLCJpYXQiOjE3NjkwOTMxNjQsImV4cCI6MTgwMDYyOTE2NH0.DP4EWA2_U80J4HVEohbfAkISxnII0AwKz57NsYHKvhU',
    video: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/DRASH_250x320.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy9EUkFTSF8yNTB4MzIwLm1wNCIsImlhdCI6MTc2OTA5MzY2NywiZXhwIjoxODAwNjI5NjY3fQ.UV9BxBtO3J2uNIL64MF4nRGd1nuL-aJjAtdOq598xB4',
    color: 'purple',
    description: 'A investigação homilética e as parábolas midráshicas.',
    unlockLevel: 18
  },
  [PortalType.SOD]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/SOD.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy9TT0QucG5nIiwiaWF0IjoxNzY5MDkzMTg1LCJleHAiOjE4MDA2MjkxODV9.qSAvvKM5-FS6OE2XBNaiXQwdCa-3dZkfTEj7bruDobY',
    video: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/sod.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy9zb2QubXA0IiwiaWF0IjoxNzY5MjkwNjU5LCJleHAiOjE4MDA4MjY2NTl9.zvGrK03hYLQzx2aXX8Rt47kxwkOVUqtt4mldxPfP5YY',
    color: 'green',
    description: 'Os segredos esotéricos e a luz oculta da Cabalá.',
    unlockLevel: 40
  },
  [PortalType.NOAHIDE]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/7%20leis.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy83IGxlaXMucG5nIiwiaWF0IjoxNzY5MDkyOTYzLCJleHAiOjE4MDA2Mjg5NjN9.Xr07YV-QdulAluPqCli4UKpAuc3psLSNlNBe6B_00Ks',
    video: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/7l.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy83bC5tcDQiLCJpYXQiOjE3NjkyOTIzNTUsImV4cCI6MTgwMDgyODM1NX0.XJSxuM7cw8VCHI5IL74Z6qxc0QM2yir_qvsU6Sp4sVk',
    color: 'indigo',
    description: 'As Sete Leis Universais para a Humanidade.',
    unlockLevel: 1
  }
};

export const MOCK_STICKERS: Sticker[] = [
  { id: '1', name: 'Menorá de Ouro', rarity: Rarity.COMMON, image_url: 'https://picsum.photos/seed/menora/250/320', description: 'Símbolo da luz espiritual.' },
  { id: '2', name: 'Rabino Sábio', rarity: Rarity.RARE, image_url: 'https://picsum.photos/seed/rabbi/250/320', description: 'Um guia contemporâneo.' },
  { id: '3', name: 'O Rambam', rarity: Rarity.EPIC, image_url: 'https://picsum.photos/seed/rambam/250/320', description: 'Maimônides, o grande codificador.' },
  { id: '4', name: 'Abraão Avinu', rarity: Rarity.LEGENDARY, image_url: 'https://picsum.photos/seed/abraham/250/320', description: 'O primeiro patriarca.' },
  { id: '5', name: 'Revelação no Sinai', rarity: Rarity.MYTHIC, image_url: 'https://picsum.photos/seed/sinai/250/320', description: 'O momento da outorga da Torá.' },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `ach-${i}`,
  name: `Conquista ${i + 1}`,
  description: `Completar o desafio nível ${i * 10} do PaRDeS.`,
  imageUrl: `https://picsum.photos/seed/ach${i}/150/150`,
  type: 'Quiz',
  targetValue: (i + 1) * 10
}));
