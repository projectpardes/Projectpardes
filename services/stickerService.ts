
import { Rarity, Sticker } from '../types';

const DROP_RATES = {
  [Rarity.COMMON]: 55.0,
  [Rarity.RARE]: 25.0,
  [Rarity.EPIC]: 12.0,
  [Rarity.LEGENDARY]: 6.0,
  [Rarity.MYTHIC]: 2.0
};

const LEVEL_ADJUSTMENTS: Record<string, Partial<Record<Rarity, number>>> = {
  '1-50': { [Rarity.COMMON]: 10, [Rarity.RARE]: -5, [Rarity.EPIC]: -3, [Rarity.LEGENDARY]: -2, [Rarity.MYTHIC]: 0 },
  '51-150': { [Rarity.COMMON]: -5, [Rarity.RARE]: 0, [Rarity.EPIC]: 3, [Rarity.LEGENDARY]: 2, [Rarity.MYTHIC]: 0 },
  '151-300': { [Rarity.COMMON]: -15, [Rarity.RARE]: -5, [Rarity.EPIC]: 8, [Rarity.LEGENDARY]: 10, [Rarity.MYTHIC]: 2 },
  '301-613': { [Rarity.COMMON]: -25, [Rarity.RARE]: -10, [Rarity.EPIC]: 5, [Rarity.LEGENDARY]: 20, [Rarity.MYTHIC]: 10 }
};

export const getRewardType = (level: number): 'standard' | 'special' | null => {
  const specials = [7, 18, 40, 100, 248, 613];
  if (specials.includes(level)) return 'special';
  if (level % 3 === 0) return 'standard';
  return null;
};

export const calculateAdjustedRates = (level: number) => {
  let range = '1-50';
  if (level > 300) range = '301-613';
  else if (level > 150) range = '151-300';
  else if (level > 50) range = '51-150';

  const adjustment = LEVEL_ADJUSTMENTS[range];
  const finalRates = { ...DROP_RATES };

  Object.keys(adjustment).forEach((rarity) => {
    finalRates[rarity as Rarity] += adjustment[rarity as Rarity] || 0;
  });

  return finalRates;
};

export const pickSticker = (level: number, allStickers: Sticker[], ownedIds: string[]): Sticker | null => {
  if (allStickers.length === 0) return null;

  // Lógica de Marcos Especiais (Garantias)
  if (level === 7) {
    const rares = allStickers.filter(s => s.rarity === Rarity.RARE && !ownedIds.includes(s.id));
    if (rares.length > 0) return rares[Math.floor(Math.random() * rares.length)];
  }
  if (level === 18) {
    const epics = allStickers.filter(s => s.rarity === Rarity.EPIC && !ownedIds.includes(s.id));
    if (epics.length > 0) return epics[Math.floor(Math.random() * epics.length)];
  }
  if (level === 40 || level === 248) {
    const legends = allStickers.filter(s => s.rarity === Rarity.LEGENDARY && !ownedIds.includes(s.id));
    if (legends.length > 0) return legends[Math.floor(Math.random() * legends.length)];
  }
  if (level === 613) {
    const mythics = allStickers.filter(s => s.rarity === Rarity.MYTHIC && !ownedIds.includes(s.id));
    if (mythics.length > 0) return mythics[Math.floor(Math.random() * mythics.length)];
  }

  // Sorteio Normal
  const rates = calculateAdjustedRates(level);
  const random = Math.random() * 100;
  let cumulative = 0;
  let selectedRarity = Rarity.COMMON;

  for (const [rarity, rate] of Object.entries(rates)) {
    cumulative += rate;
    if (random <= cumulative) {
      selectedRarity = rarity as Rarity;
      break;
    }
  }

  // Filtrar figurinhas da raridade sorteada que o usuário não tem
  let candidates = allStickers.filter(s => s.rarity === selectedRarity && !ownedIds.includes(s.id));
  
  // Se não houver figurinhas novas na raridade, tenta uma superior
  if (candidates.length === 0) {
    candidates = allStickers.filter(s => !ownedIds.includes(s.id));
  }

  if (candidates.length === 0) return null; // Coleção completa
  return candidates[Math.floor(Math.random() * candidates.length)];
};
