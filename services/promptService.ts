
import { supabase } from '../supabaseClient';
import { PromptItem, PromptType, RarityType } from '../types';

export const promptService = {
  getAll: async (): Promise<PromptItem[]> => {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching prompts:", error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type as PromptType,
      isPremium: item.is_premium,
      isTrending: item.is_trending,
      trendingRank: item.trending_rank,
      category: item.category || 'General',
      imageResult: item.image_result,
      imageSource: item.image_source,
      prompt: item.prompt,
      model: item.model,
      rarity: item.rarity as RarityType,
      aspectRatio: item.aspect_ratio || '1:1',
      seed: item.seed || 0,
      guidanceScale: item.guidance_scale || 7.5,
      description: item.description,
      date: item.created_at
    }));
  },

  getCategories: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data.map(cat => cat.name);
  },

  uploadImage: async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file);

    if (uploadError) return null;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  createPrompt: async (promptData: any) => {
    const { data, error } = await supabase
      .from('prompts')
      .insert([promptData])
      .select();

    if (error) throw error;
    return data;
  }
};
