// netlify/functions/createInvoice.js
exports.handler = async (event) => {
  const { amount, currency, email } = JSON.parse(event.body);
  const SECRET_KEY = "OA0rizBXKkVp3cDS0mIdBMYcwp3rF6Ac_eZPmEgiEctGICaUAGp6avI5ZJYtfAa4";

  // Order number mein user ki email daal rahe hain taaki webhook pehchan sake
  const orderNumber = `USER_${email}_${Date.now()}`;
  
  // Isme callback_url zaroori hai (Aapki site ka webhook URL)
  const callbackUrl = `https://your-site.netlify.app/.netlify/functions/plisioWebhook`;

  const apiUrl = `https://api.plisio.net/api/v1/invoices/new?source_currency=USD&source_amount=${amount}&order_number=${orderNumber}&currency=${currency}&callback_url=${callbackUrl}&api_key=${SECRET_KEY}`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ success: true, checkoutUrl: data.data.invoice_url })
  };
};