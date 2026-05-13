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

      // Pura actions list search karna
      const transferAction = data.actions?.find(action => 
        action.type === 'JettonTransfer' && 
        action.jetton_transfer?.jetton.symbol === 'USDT'
      );

      if (transferAction) {
        const jetton = transferAction.jetton_transfer;
        const recipient = jetton.recipient?.address || "";
        const actualAmount = parseFloat(jetton.amount) / 1000000;

        // 🔥 ULTIMATE MATCHING LOGIC 🔥
        // TON addresses ke prefix (UQ/EQ) aur checksum ko puri tarah ignore karke
        // hum sirf middle ke 30 unique characters match karenge.
        const clean = (addr) => addr.replace(/[^a-zA-Z0-9]/g, '');
        
        const coreRecipient = clean(recipient);
        const coreAdmin = clean(adminAddress);

        // Substring check: Agar admin address ka bada hissa recipient mein maujood hai
        if (coreRecipient.includes(coreAdmin.substring(4, 34))) {
          if (actualAmount >= expectedAmount - 0.1) {
            return { 
              statusCode: 200, 
              headers: { 'Access-Control-Allow-Origin': '*' }, 
              body: JSON.stringify({ success: true, amount: actualAmount }) 
            };
          }
        }

        // Agar match nahi hua, toh debug ke liye dono addresses wapas bhejna
        return { 
          statusCode: 200, 
          headers: { 'Access-Control-Allow-Origin': '*' }, 
          body: JSON.stringify({ 
            success: false, 
            message: `Address Mismatch! Blockchain: ${recipient.substring(0,10)}... vs Your Code: ${adminAddress.substring(0,10)}...` 
          }) 
        };
      }
      return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "No USDT transfer found in this Hash." }) };
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
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "Error: " + error.message }) };
  }
};