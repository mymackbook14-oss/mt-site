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

    // 1. USDT (TON) Automatic Verification
    if (network === 'USDT (TON)') {
      // TonAPI.io se data mangwana
      const response = await fetch(`https://tonapi.io/v2/events/${txId}`);
      if (!response.ok) throw new Error("Transaction not found. Check TxID again.");
      
      const data = await response.json();

      // Jetton Transfer (USDT) check karna
      const transferAction = data.actions.find(action => action.type === 'JettonTransfer');
      
      if (transferAction) {
        const jetton = transferAction.jetton_transfer;
        const recipient = jetton.recipient.address; 
        const symbol = jetton.jetton.symbol;
        const actualAmount = parseFloat(jetton.amount) / 1000000;

        // 🔥 ADDRESS MATCHING LOGIC FIX 🔥
        // TON addresses ke prefix (UQ/EQ) alag ho sakte hain, isiliye hum main part compare karenge
        const normalize = (addr) => addr.replace(/^(UQ|EQ)/, '').substring(0, 30).toLowerCase();

        if (normalize(recipient) === normalize(adminAddress) && symbol === 'USDT') {
          // 100 USDT match karna
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
        body: JSON.stringify({ success: false, message: "USDT Payment mismatch. Ensure you sent to the correct address." }) 
      };
    }

    // 2. TRC20 Logic (Pehle jaisa)
    if (network === 'TRC20') {
      const response = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${txId}`);
      const data = await response.json();
      if (data && data.contractRet === 'SUCCESS') {
        const transfer = data.trc20TransferInfo && data.trc20TransferInfo[0];
        if (transfer && transfer.to_address.toLowerCase() === adminAddress.toLowerCase()) {
          const amt = parseFloat(transfer.amount_str) / 1000000;
          if (amt >= expectedAmount - 0.1) return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, amount: amt }) };
        }
      }
      return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "TRC20 Verification Failed." }) };
    }

    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, isManual: true, message: "Admin is manually reviewing this hash." }) };

  } catch (error) {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: error.message }) };
  }
};