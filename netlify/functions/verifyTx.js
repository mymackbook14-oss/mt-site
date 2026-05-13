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
      // TonAPI se pura event data nikalna
      const response = await fetch(`https://tonapi.io/v2/events/${txId}`);
      if (!response.ok) throw new Error("Hash not found on TON Network.");
      
      const data = await response.json();

      // Sabhi actions mein check karna ki USDT transfer kahan hai
      let foundTransfer = null;
      if (data.actions) {
        foundTransfer = data.actions.find(action => 
          action.type === 'JettonTransfer' && 
          action.jetton_transfer && 
          action.jetton_transfer.jetton.symbol === 'USDT'
        );
      }

      if (foundTransfer) {
        const jetton = foundTransfer.jetton_transfer;
        const recipient = jetton.recipient ? jetton.recipient.address : "";
        const actualAmount = parseFloat(jetton.amount) / 1000000;

        // 🔥 IMPROVED ADDRESS MATCHING 🔥
        // TON addresses ke formats (Base64 vs Raw) ko handle karne ke liye
        // Hum address ke sirf main 25 characters compare karenge
        const clean = (addr) => addr.replace(/[^a-zA-Z0-9]/g, '').substring(5, 30).toLowerCase();

        if (clean(recipient) === clean(adminAddress)) {
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
        body: JSON.stringify({ 
          success: false, 
          message: "Recipient address mismatch. Please send to your registered address." 
        }) 
      };
    }

    // TRC20 Verification
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

    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "Verification failed. Check your TxID." }) };

  } catch (error) {
    return { 
      statusCode: 200, 
      headers: { 'Access-Control-Allow-Origin': '*' }, 
      body: JSON.stringify({ success: false, message: "Blockchain Error: " + error.message }) 
    };
  }
};