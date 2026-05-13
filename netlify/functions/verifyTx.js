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

        // 🔥 ULTRA-ROBUST MATCHING 🔥
        // Hum address ke shuruat ke 4 aur aakhri 4 akshar hata denge 
        // kyunki UQ/EQ aur checksum wahi hota hai. Beech ka part same rehta hai.
        const getCore = (addr) => {
            if (!addr) return "";
            // Special characters hatao aur sirf beech ka main part uthao
            return addr.replace(/[^a-zA-Z0-9]/g, '').slice(4, -4);
        };
        
        const coreRecipient = getCore(recipient);
        const coreAdmin = getCore(adminAddress);

        // Agar core ID match ho gayi toh payment pakki hai
        if (coreRecipient !== "" && coreRecipient === coreAdmin) {
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
        body: JSON.stringify({ success: false, message: "Mismatch: Address core does not match. Ensure you sent to your registered wallet." }) 
      };
    }

    // TRC20 Logic (Aapka purana logic safe hai)
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

    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "Verification failed. Hash records do not match requirements." }) };

  } catch (error) {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "Blockchain API Error: " + error.message }) };
  }
};