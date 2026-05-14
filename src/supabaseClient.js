import { createClient } from '@supabase/supabase-js';

// Apne Supabase Dashboard (Settings > API) se URL aur ANON KEY yahan daalein
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);