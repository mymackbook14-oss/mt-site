// netlify/functions/verifyTx.js
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 200, 
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }, 
      body: '' 
    };
  }

  try {
    const { txId, network, expectedAmount, adminAddress } = JSON.parse(event.body);

    if (network === 'USDT (TON)') {
      const response = await fetch(`https://tonapi.io/v2/events/${txId}`);
      if (!response.ok) throw new Error("Transaction ID not found on TON.");
      
      const data = await response.json();

      // 🔍 SAFETY CHECK: Pehle check karein ki actions exist karte hain ya nahi
      if (!data.actions || data.actions.length === 0) {
        throw new Error("No actions found in this transaction.");
      }

      // USDT transfer dhoondhna
      const transferAction = data.actions.find(action => action.type === 'JettonTransfer');
      
      // 🛡️ Error Fix: 'recipient' read karne se pehle check karein ki jetton_transfer exist karta hai
      if (transferAction && transferAction.jetton_transfer) {
        const jetton = transferAction.jetton_transfer;
        const recipient = jetton.recipient ? jetton.recipient.address : null; 
        const symbol = jetton.jetton ? jetton.jetton.symbol : null;
        const actualAmount = parseFloat(jetton.amount) / 1000000;

        // Address Match Logic
        const normalize = (addr) => addr ? addr.replace(/^(UQ|EQ)/, '').substring(0, 30).toLowerCase() : "";

        if (recipient && normalize(recipient) === normalize(adminAddress) && symbol === 'USDT') {
          if (actualAmount >= expectedAmount - 0.1) {
            return { 
              statusCode: 200, 
              headers: { 'Access-Control-Allow-Origin': '*' }, 
              body: JSON.stringify({ success: true, amount: actualAmount }) 
            };
          }
        }
      }
      return { 
        statusCode: 200, 
        headers: { 'Access-Control-Allow-Origin': '*' }, 
        body: JSON.stringify({ success: false, message: "USDT transfer data not found in this Hash." }) 
      };
    }

    // TRC20 Logic
    if (network === 'TRC20') {
      const resp = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${txId}`);
      const d = await resp.json();
      if (d && d.contractRet === 'SUCCESS') {
        const t = d.trc20TransferInfo && d.trc20TransferInfo[0];
        if (t && t.to_address.toLowerCase() === adminAddress.toLowerCase()) {
          const amt = parseFloat(t.amount_str) / 1000000;
          if (amt >= expectedAmount - 0.1) return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, amount: amt }) };
        }
      }
    }

    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "Verification failed. Check network or address." }) };

  } catch (error) {
    return { 
      statusCode: 200, 
      headers: { 'Access-Control-Allow-Origin': '*' }, 
      body: JSON.stringify({ success: false, message: "Error: " + error.message }) 
    };
  }
};