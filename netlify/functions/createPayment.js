// netlify/functions/createPayment.js
exports.handler = async (event, context) => {
  // CORS Error bypass karne ka logic
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: ''
    };
  }

  try {
    const body = JSON.parse(event.body);
    const API_KEY = 'WzBPWVONuOq0uGzpaqQ7UfuEeNS5iFMRPOvq6tbdfc1S44htNEeTB3lTPM7IJvBblhSfDzwEeCFrwoCfm1bcp0IVJEhJdtTlMDG2xIWeMHZ6jNbWYRTI77QU79oTDfVq';

    // Heleket ke Server ko Request bhejna
    const response = await fetch('https://api.heleket.com/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'API-Key': API_KEY
      },
      body: JSON.stringify({
        amount: body.amount,
        currency: 'USDT',
        order_id: body.order_id
      })
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