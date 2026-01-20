
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
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/PSHAT_250x320.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy9QU0hBVF8yNTB4MzIwLndlYnAiLCJpYXQiOjE3Njg4MjMzNDYsImV4cCI6MTgwMDM1OTM0Nn0.aeFfkSkoNIbkbka3OWs1cRSJa2E3La0Wnl2Xlhrjr9U',
    color: 'yellow',
    description: 'O sentido literal e histórico do texto sagrado.',
    unlockLevel: 1
  },
  [PortalType.REMEZ]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/REMEZ_250x320.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy9SRU1FWl8yNTB4MzIwLndlYnAiLCJpYXQiOjE3Njg4MjMzNzMsImV4cCI6MTgwMDM1OTM3M30.KwfTc8H7Ek1lreWLbAzEBgzmglWlI8L1onE1mOcvttA',
    color: 'sky',
    description: 'As alusões, dicas e a profundidade da Gematria.',
    unlockLevel: 7
  },
  [PortalType.DRASH]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/DRASH_250x320.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy9EUkFTSF8yNTB4MzIwLndlYnAiLCJpYXQiOjE3Njg4MjMzOTQsImV4cCI6MTgwMDM1OTM5NH0.Ok1OeSJ73Y8YgDWWVXAUzs6xbAqxxL5q6vspP59-vVw',
    color: 'purple',
    description: 'A investigação homilética e as parábolas midráshicas.',
    unlockLevel: 18
  },
  [PortalType.SOD]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/Portoes%20do%20PaRDeS/SOD_250x320.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xODAyZTIzYy1lYjZkLTQ0NWYtYWUzZS1mZGEzMjc5NGZkYjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQb3J0b2VzIGRvIFBhUkRlUy9TT0RfMjUweDMyMC53ZWJwIiwiaWF0IjoxNzY4ODIzNDEwLCJleHAiOjE4MDAzNTk0MTB9.2KARfxxa-P2U0ZOmzGsYhWWA2_t2EBiLIrFNCWD444M',
    color: 'green',
    description: 'Os segredos esotéricos e a luz oculta da Cabalá.',
    unlockLevel: 40
  },
  [PortalType.NOAHIDE]: {
    image: 'https://shkpradqqvixpkbakijr.supabase.co/storage/v1/object/sign/images/sete%20leis.png',
    color: 'indigo',
    description: 'As Sete Leis Universais para a Humanidade.',
    unlockLevel: 1
  }
};

// FIX: Renamed 'imageUrl' to 'image_url' in MOCK_STICKERS to align with the Sticker interface.
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
  bonusSparks: (i + 1) * 50
}));
