export enum PromptCategory {
  ALL = 'All',
  TRENDING = 'Trending',
  PREMIUM = 'Premium',
  IMG2IMG = 'Image-to-Image',
  TXT2IMG = 'Text-to-Image'
}

export type PromptType = 'IMG2IMG' | 'TXT2IMG';
export type RarityType = 'Common' | 'Rare' | 'Legendary';

export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  plan: 'free' | 'pro';
  is_pro?: boolean; // Reflecting DB column
}

export interface PromptItem {
  id: string;
  title: string;
  type: PromptType;
  isPremium: boolean;
  isTrending: boolean;
  trendingRank?: number | null;
  category: string;
  imageResult: string;
  imageSource?: string;
  prompt: string;
  model: string;
  rarity: RarityType;
  aspectRatio: string;
  seed: number;
  guidanceScale: number;
  description?: string;
  date: string;
}