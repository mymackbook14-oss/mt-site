exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' };

  try {
    const { amount, currency, email } = JSON.parse(event.body);
    
    // 👇 1. YAHAN APNI ASLI PLISIO SECRET KEY DAALEIN (Jo 'OA...' se shuru hoti hai) 👇
    const SECRET_KEY = "OA0rizBXKkVp3cDS0mIdBMYcwp3rF6Ac_eZPmEgiEctGICaUAGp6avI5ZJYtfAa4";

    // 👇 2. YAHAN APNI NETLIFY WEBSITE KA ASLI URL DAALEIN 👇
    const SITE_URL = "https://funny-mandazi-a3e30d.netlify.app"; 
    
    // Webhook URL aur Order Number ko 'encode' karna zaroori hai taaki '@' sign issue na kare
    const callbackUrl = encodeURIComponent(`${SITE_URL}/.netlify/functions/plisioWebhook`);
    const orderNumber = encodeURIComponent(`USER_${email}_${Date.now()}`);

    const apiUrl = `https://api.plisio.net/api/v1/invoices/new?source_currency=USD&source_amount=${amount}&order_number=${orderNumber}&currency=${currency}&callback_url=${callbackUrl}&api_key=${SECRET_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Agar Plisio ne invoice bana diya
    if (data && data.status === 'success') {
      return { 
        statusCode: 200, 
        headers: { 'Access-Control-Allow-Origin': '*' }, 
        body: JSON.stringify({ success: true, checkoutUrl: data.data.invoice_url }) 
      };
    } else {
      // 🟢 ASLI ERROR YAHAN SE SCREEN PAR DIKHEGA
      const errorMessage = data?.data?.message || "Plisio ne invoice reject kar diya. Key check karein.";
      return { 
        statusCode: 400, 
        headers: { 'Access-Control-Allow-Origin': '*' }, 
        body: JSON.stringify({ success: false, message: errorMessage }) 
      };
    }
  } catch (error) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "System error: " + error.message }) };
  }
};