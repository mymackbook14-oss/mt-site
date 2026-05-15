const { createClient } = require('@supabase/supabase-js');

// 👇 APNI DETAILS DAALEIN 👇
const supabaseUrl = 'https://irxdvwjrvrwiolwlwtvr.supabase.co'; 
const supabaseKey = 'sb_publishable_QyW2w4a8pnY5aSg_pHheiA_FAu6Rgq7';
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const data = new URLSearchParams(event.body);
    const status = data.get('status');
    const amount = parseFloat(data.get('source_amount')); 
    const orderNumber = data.get('order_number'); 

    if (status === 'completed' || status === 'mismatch') {
      const email = orderNumber.split('_')[1];

      // 1. User ki details nikalna
      const { data: user } = await supabase.from('users').select('*').eq('email', email).single();

      if (user) {
        // Nayi History Entry (User ke liye)
        const userHistory = user.tx_history || [];
        userHistory.push({ type: 'Recharge', amount: amount, date: new Date().toISOString() });

        // User ka balance update
        await supabase.from('users')
          .update({ balance: user.balance + amount, total_recharge: user.total_recharge + amount, tx_history: userHistory })
          .eq('email', email);

        // ==========================================
        // LEVEL 1 COMMISSION (7%)
        // ==========================================
        if (user.referred_by) {
          const { data: level1User } = await supabase.from('users').select('*').eq('referral_code', user.referred_by).single();
          if (level1User) {
            const l1Comm = amount * 0.07;
            const l1History = level1User.tx_history || [];
            l1History.push({ type: 'Level 1 Commission', from: email, amount: l1Comm, date: new Date().toISOString() });
            
            await supabase.from('users')
              .update({ refer_balance: (level1User.refer_balance || 0) + l1Comm, tx_history: l1History })
              .eq('email', level1User.email);
          }
        }

        // ==========================================
        // LEVEL 2 COMMISSION (3%)
        // ==========================================
        if (user.level2_referred_by) {
          const { data: level2User } = await supabase.from('users').select('*').eq('referral_code', user.level2_referred_by).single();
          if (level2User) {
            const l2Comm = amount * 0.03;
            const l2History = level2User.tx_history || [];
            l2History.push({ type: 'Level 2 Commission', from: email, amount: l2Comm, date: new Date().toISOString() });
            
            await supabase.from('users')
              .update({ refer_balance: (level2User.refer_balance || 0) + l2Comm, tx_history: l2History })
              .eq('email', level2User.email);
          }
        }
      }
    }
    return { statusCode: 200, body: 'OK' }; 
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};