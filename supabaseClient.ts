
import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and Anon Key if they differ
const supabaseUrl = 'https://qohqhkxalxlhtwzqgtbj.supabase.co';
const supabaseKey = 'sb_publishable_Cx5H8WL4sHbmg7w5HwQ9gA_pU00Ez0_';

export const supabase = createClient(supabaseUrl, supabaseKey);
