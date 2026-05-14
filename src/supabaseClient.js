import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irxdvwjrvrwiolwlwtvr.supabase.co'; 
const supabaseKey = 'sb_publishable_QyW2w4a8pnY5aSg_pHheiA_FAu6Rgq7';

// 👇 Ye line humein sacchayi bata degi 👇
console.log("Mera Supabase URL ye hai:", supabaseUrl); 

export const supabase = createClient(supabaseUrl, supabaseKey);