
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qohqhkxalxlhtwzqgtbj.supabase.co';
const supabaseKey = 'sb_publishable_Cx5H8WL4sHbmg7w5HwQ9gA_pU00Ez0_';

// Always trim keys to prevent invisible character errors
export const supabase = createClient(supabaseUrl.trim(), supabaseKey.trim());
