// netlify/functions/createInvoice.js
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }

  try {
    const { amount, currency } = JSON.parse(event.body);
    
    // 👇 YAHAN APNI PLISIO KI SECRET KEY PASTE KAREIN 👇
    const SECRET_KEY = "OA0rizBXKkVp3cDS0mIdBMYcwp3rF6Ac_eZPmEgiEctGICaUAGp6avI5ZJYtfAa4";

    // Random Order ID generate karna
    const orderNumber = "ORDER_" + Math.floor(Math.random() * 100000000);

    // Plisio ka API URL call karna
    const apiUrl = `https://api.plisio.net/api/v1/invoices/new?source_currency=USD&source_amount=${amount}&order_number=${orderNumber}&currency=${currency}&order_name=Wallet_Recharge&api_key=${SECRET_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data.status === 'success') {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, checkoutUrl: data.data.invoice_url })
      };
    } else {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: "Failed to create invoice." })
      };
    }
  } catch (error) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: error.message }) };
  }
};