// netlify/functions/createInvoice.js
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' };

  try {
    const { amount, currency, email } = JSON.parse(event.body);
    
    // 👇 APNI PLISIO SECRET KEY DAALEIN 👇
    const SECRET_KEY = "OA0rizBXKkVp3cDS0mIdBMYcwp3rF6Ac_eZPmEgiEctGICaUAGp6avI5ZJYtfAa4";

    // Order number mein user ki email chhupa rahe hain taaki webhook pehchan sake
    const orderNumber = `USER_${email}_${Date.now()}`;
    
    // 👇 APNI LIVE WEBSITE KA NAAM DAALEIN (jaise: https://my-site.netlify.app) 👇
    const SITE_URL = "https://YOUR_WEBSITE_NAME.netlify.app"; 
    const callbackUrl = `${SITE_URL}/.netlify/functions/plisioWebhook`;

    const apiUrl = `https://api.plisio.net/api/v1/invoices/new?source_currency=USD&source_amount=${amount}&order_number=${orderNumber}&currency=${currency}&callback_url=${callbackUrl}&api_key=${SECRET_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data.status === 'success') {
      return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, checkoutUrl: data.data.invoice_url }) };
    } else {
      return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "Failed to create invoice." }) };
    }
  } catch (error) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: error.message }) };
  }
};