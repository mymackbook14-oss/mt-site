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

      // USDT Transfer dhoondhna
      const transferAction = data.actions?.find(action => 
        action.type === 'JettonTransfer' && 
        action.jetton_transfer?.jetton.symbol === 'USDT'
      );

      if (transferAction) {
        const jetton = transferAction.jetton_transfer;
        const recipient = jetton.recipient?.address || "";
        const actualAmount = parseFloat(jetton.amount) / 1000000;

        // 🔥 PRO ADDRESS MATCHING 🔥
        // TON addresses ke prefix aur format ki fikar kiye bina 
        // hum sirf wallet ke unique characters ko match karenge.
        const cleanAddress = (addr) => {
          // Address ke beech ke main characters uthana (Prefix aur Checksum hata kar)
          return addr.replace(/[^a-zA-Z0-9]/g, '').substring(10, 40).toLowerCase();
        };
        
        const coreRecipient = cleanAddress(recipient);
        const coreAdmin = cleanAddress(adminAddress);

        if (coreRecipient === coreAdmin) {
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
        body: JSON.stringify({ success: false, message: "Mismatch: Wallet IDs don't match on blockchain." }) 
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
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "Network Error: " + error.message }) };
  }
};