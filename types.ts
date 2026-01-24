
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
  id?: string;
  name: string;
  level: number;
  xp: number;
  sparks: number;
  hearts: number;
  merits: string[];
  featuredMerits?: string[];
  stickers: string[];
  lastLevelRewarded?: number;
  avatarUrl?: string;
  email?: string;
  status?: 'Ativo' | 'Bloqueado';
  supporter_tier?: string;
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
  type: string;
  targetValue: number;
}

export interface Supporter {
  id: string;
  name: string;
  amount: number;
  date: string;
  method: string;
  message?: string;
  tier: 'Bronze' | 'Prata' | 'Ouro' | 'Benfeitor';
}

export interface Nigun {
  id: string;
  name: string;
  url: string;
  category: string;
  is_active: boolean;
  artist?: string;
}
