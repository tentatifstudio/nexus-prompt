
import { supabase } from '../supabaseClient';
import { PromptItem, PromptType, RarityType } from '../types';

export const promptService = {
  getAll: async (): Promise<PromptItem[]> => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase error fetching prompts:", error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title || 'Untitled',
        type: (item.type as PromptType) || 'TXT2IMG',
        isPremium: !!item.is_premium, 
        isTrending: !!item.is_trending,
        trendingRank: item.trending_rank,
        category: item.category || 'General',
        imageResult: item.image_result_url || item.image_result || 'https://placehold.co/800x1000?text=No+Image', 
        imageSource: item.image_source_url || item.image_source,
        prompt: item.prompt || 'Prompt not available.',
        model: item.model || 'Unknown Model',
        rarity: (item.rarity as RarityType) || 'Common',
        aspectRatio: item.aspect_ratio || '1:1',
        seed: item.seed || 0,
        guidanceScale: item.guidance_scale || 7.5,
        description: item.description,
        date: item.created_at,
        author: item.profiles ? {
          id: item.profiles.id,
          username: item.profiles.username || 'Nexus Creator',
          avatar_url: item.profiles.avatar_url || `https://ui-avatars.com/api/?background=random&color=fff&name=${item.profiles.username || 'U'}`
        } : undefined
      }));
    } catch (err) {
      console.error("Critical error in getAll prompts:", err);
      return [];
    }
  },

  getByUserId: async (userId: string): Promise<PromptItem[]> => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*, profiles(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return [];
      return (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title || 'Untitled',
        type: (item.type as PromptType) || 'TXT2IMG',
        isPremium: !!item.is_premium,
        isTrending: !!item.is_trending,
        category: item.category || 'General',
        imageResult: item.image_result_url || item.image_result || 'https://placehold.co/800x1000?text=No+Image',
        imageSource: item.image_source_url || item.image_source,
        prompt: item.prompt || 'Prompt not available.',
        model: item.model || 'Unknown Model',
        rarity: (item.rarity as RarityType) || 'Common',
        aspectRatio: item.aspect_ratio || '1:1',
        seed: item.seed || 0,
        guidanceScale: item.guidance_scale || 7.5,
        description: item.description,
        date: item.created_at,
        author: item.profiles ? {
          id: item.profiles.id,
          username: item.profiles.username || 'Nexus Creator',
          avatar_url: item.profiles.avatar_url || `https://ui-avatars.com/api/?background=random&color=fff&name=${item.profiles.username || 'U'}`
        } : undefined
      }));
    } catch (err) {
      console.error("Error fetching user prompts:", err);
      return [];
    }
  },

  getProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) return null;
      return data;
    } catch (err) {
      return null;
    }
  },

  updateProfile: async (userId: string, updates: any) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name', { ascending: true });
      
      if (error) {
        console.warn("Supabase category fetch error:", error.message);
        return [];
      }
      
      return (data || []).map(cat => cat.name);
    } catch (e) {
      console.error("Failed to fetch categories:", e);
      return [];
    }
  },

  uploadImage: async (file: File, bucket: string = 'images'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) return null;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      return null;
    }
  },

  createPrompt: async (promptData: any) => {
    const { data, error } = await supabase
      .from('prompts')
      .insert([promptData])
      .select();
    if (error) throw error;
    return data;
  },

  deletePrompt: async (id: string) => {
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    if (error) throw error;
  }
};
