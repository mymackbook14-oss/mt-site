exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' };

  try {
    const { amount, currency, email } = JSON.parse(event.body);
    
    // 👇 1. YAHAN APNI ASLI PLISIO SECRET KEY DAALEIN 👇
    const SECRET_KEY = "OA0rizBXKkVp3cDS0mIdBMYcwp3rF6Ac_eZPmEgiEctGICaUAGp6avI5ZJYtfAa4";

    // 👇 2. YAHAN APNI NETLIFY WEBSITE KA ASLI URL DAALEIN 👇
    const SITE_URL = "https://funny-mandazi-a3e30d.netlify.app"; 
    
    const callbackUrl = encodeURIComponent(`${SITE_URL}/.netlify/functions/plisioWebhook`);
    const orderNumber = encodeURIComponent(`USER_${email}_${Date.now()}`);
    
    // 🟢 YAHAN HUMNE ORDER NAME ADD KAR DIYA HAI
    const orderName = encodeURIComponent("Account Recharge"); 

    // URL mein ab order_name bhi jayega
    const apiUrl = `https://api.plisio.net/api/v1/invoices/new?source_currency=USD&source_amount=${amount}&order_number=${orderNumber}&order_name=${orderName}&currency=${currency}&callback_url=${callbackUrl}&api_key=${SECRET_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data.status === 'success') {
      return { 
        statusCode: 200, 
        headers: { 'Access-Control-Allow-Origin': '*' }, 
        body: JSON.stringify({ success: true, checkoutUrl: data.data.invoice_url }) 
      };
    } else {
      // Agar ab koi error aaya toh Plisio wahi dikhayega
      const errorMessage = data?.data?.message || JSON.stringify(data.data) || "Plisio error";
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