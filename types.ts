
export type PromptType = 'IMG2IMG' | 'TXT2IMG';
export type RarityType = 'Common' | 'Rare' | 'Legendary';

export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  bio?: string;
  plan: 'free' | 'pro';
  is_pro?: boolean;
}

export interface AuthorInfo {
  id: string;
  username: string;
  avatar_url: string;
}

export interface PromptItem {
  id: string;
  user_id: string;
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
  author?: AuthorInfo;
}
