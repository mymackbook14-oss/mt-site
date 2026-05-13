const crypto = require('crypto');

exports.handler = async (event, context) => {
  // CORS Error bypass
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, sign, merchant',
      },
      body: ''
    };
  }

  try {
    const body = JSON.parse(event.body);
    const API_KEY = 'WzBPWVONuOq0uGzpaqQ7UfuEeNS5iFMRPOvq6tbdfc1S44htNEeTB3lTPM7IJvBblhSfDzwEeCFrwoCfm1bcp0IVJEhJdtTlMDG2xIWeMHZ6jNbWYRTI77QU79oTDfVq';

    // 1. Data tayyar karna
    const payload = {
      amount: body.amount,
      currency: 'USDT',
      order_id: body.order_id,
      network: 'TRON' // TRC20 network specify karne ke liye
    };

    const payloadString = JSON.stringify(payload);

    // 2. Heleket Security Algorithm: MD5(Base64(Payload) + API_KEY)
    const base64Payload = Buffer.from(payloadString).toString('base64');
    const signString = base64Payload + API_KEY;
    const sign = crypto.createHash('md5').update(signString).digest('hex');

    // 3. Request bhejna (Naye Sign ke sath)
    const response = await fetch('https://api.heleket.com/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sign': sign // Asli encrypted signature yahan ja rahi hai
      },
      body: payloadString
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};