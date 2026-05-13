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
      if (!response.ok) throw new Error("Hash not found on TON blockchain.");
      const data = await response.json();

      let verified = false;
      let actualAmount = 0;

      // 🔥 DEEP SCAN LOGIC 🔥
      // Hum har action ko check karenge, chahe woh kisi bhi type ka ho
      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          // JettonTransfer dhoondna
          const jetton = action.jetton_transfer || (action.type === 'JettonTransfer' ? action : null);
          
          if (jetton && (jetton.jetton_transfer || jetton.amount)) {
            const transfer = jetton.jetton_transfer || jetton;
            const recipient = transfer.recipient?.address || "";
            const symbol = transfer.jetton?.symbol || "";
            
            // Decimal fix (USDT on TON is 6 decimals)
            actualAmount = parseFloat(transfer.amount) / 1000000;

            // Address Matching (Ignore UQ/EQ prefix)
            const normalize = (addr) => addr.replace(/^(UQ|EQ)/, '').substring(0, 32).toLowerCase();
            const targetAddress = "UQBK2vhnxCbEVLhdjmaQMZiH6LHJi_o3jjf21r4lT4IUai5R"; // From your screenshot

            if (normalize(recipient) === normalize(targetAddress)) {
              if (actualAmount >= expectedAmount - 0.1) {
                verified = true;
                break; 
              }
            }
          }
        }
      }

      if (verified) {
        return { 
          statusCode: 200, 
          headers: { 'Access-Control-Allow-Origin': '*' }, 
          body: JSON.stringify({ success: true, amount: actualAmount }) 
        };
      }
      
      return { 
        statusCode: 200, 
        headers: { 'Access-Control-Allow-Origin': '*' }, 
        body: JSON.stringify({ success: false, message: "System could not link this Hash to your wallet." }) 
      };
    }

    // TRC20 Logic
    if (network === 'TRC20') {
      const resp = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${txId}`);
      const d = await resp.json();
      if (d?.contractRet === 'SUCCESS') {
        const t = d.trc20TransferInfo?.[0];
        if (t?.to_address.toLowerCase() === adminAddress.toLowerCase()) {
          const amt = parseFloat(t.amount_str) / 1000000;
          if (amt >= expectedAmount - 0.1) return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, amount: amt }) };
        }
      }
    }

    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "Verification failed." }) };

  } catch (error) {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: error.message }) };
  }
};