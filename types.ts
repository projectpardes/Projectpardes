
export enum PortalType {
  PSHAT = 'Pshat',
  REMEZ = 'Remez',
  DRASH = 'Drash',
  SOD = 'Sod',
  NOAHIDE = 'Noahide'
}

export enum Rarity {
  COMMON = 'Comum',
  RARE = 'Rara',
  EPIC = 'Épica',
  LEGENDARY = 'Lendária',
  MYTHIC = 'Mítica'
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  sparks: number;
  hearts: number;
  merits: string[];
  featuredMerits?: string[];
  stickers: string[];
  lastLevelRewarded?: number; // Para evitar recompensas duplicadas no mesmo nível
  avatarUrl?: string;
  avatarConfig?: {
    gender: string;
    skinTone: string;
    hairStyle: string;
    hairColor: string;
    beardStyle?: string;
    clothing: string;
    accessory: string;
  };
}

export interface Question {
  id: string;
  portal: PortalType;
  difficulty: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  xpReward: number;
}

export interface Sticker {
  id: string;
  name: string;
  rarity: Rarity;
  image_url: string;
  description: string;
  category?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  bonusSparks: number;
}
