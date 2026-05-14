// netlify/functions/plisioWebhook.js
const { createClient } = require('@supabase/supabase-js');

// 👇 YAHAN BILKUL SAHI DETAILS PASTE KAREIN 👇
const supabaseUrl = 'https://irxdvwjrvrwiolwlwtvr.supabase.co'; 
const supabaseKey = 'sb_publishable_QyW2w4a8pnY5aSg_pHheiA_FAu6Rgq7'; // Apni lambi wali key yahan paste karein

const supabase = createClient(supabaseUrl, supabaseKey);

// ... baaki ka code waisa hi rahega

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const data = new URLSearchParams(event.body);
    const status = data.get('status'); // Plisio batayega payment 'completed' hui ya nahi
    const amount = parseFloat(data.get('source_amount')); 
    const orderNumber = data.get('order_number'); // Yahan se humein email milegi

    // Agar payment success ho gayi (mismatch ka matlab usne thode se cents kam/zyada bheje, par accept ho gaya)
    if (status === 'completed' || status === 'mismatch') {
      
      // Order number se email nikalna (Kyunki humne banaya tha: USER_xyz@gmail.com_12345)
      const email = orderNumber.split('_')[1];

      // 1. User ka purana balance check karna
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('balance, total_recharge')
        .eq('email', email)
        .single();

      if (user && !fetchError) {
        // 2. Database mein naya balance update karna
        await supabase
          .from('users')
          .update({ 
            balance: user.balance + amount, 
            total_recharge: user.total_recharge + amount 
          })
          .eq('email', email);
      }
    }

    // Plisio ko OK bolna zaroori hai, nahi toh wo baar-baar message bhejega
    return { statusCode: 200, body: 'OK' }; 
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};