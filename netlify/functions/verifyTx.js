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
      if (!response.ok) throw new Error("Hash not found on TON Network.");
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

        // 🔥 ROBUST ADDRESS MATCHING 🔥
        // TON addresses ke formats handle karne ke liye hum sirf core string match karenge
        const getCore = (addr) => addr.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        
        // Admin address aur Recipient address dono ka core nikal kar check karna
        const coreRecipient = getCore(recipient);
        const coreAdmin = getCore(adminAddress);

        // Agar recipient ke core mein admin core chupa hai ya vice versa
        if (coreRecipient.includes(coreAdmin) || coreAdmin.includes(coreRecipient)) {
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
        body: JSON.stringify({ success: false, message: "Address Mismatch: System detected a different receiver wallet." }) 
      };
    }

    // TRC20 Verification
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
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "Blockchain Error: " + error.message }) };
  }
};