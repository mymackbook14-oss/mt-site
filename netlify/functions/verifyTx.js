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

    // 1. USDT (TON) Automatic Verification (Using TonAPI.io)
    if (network === 'USDT (TON)') {
      const response = await fetch(`https://tonapi.io/v2/events/${txId}`);
      const data = await response.json();

      if (!data || !data.actions) {
        return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "Transaction not found on TON blockchain." }) };
      }

      // Check for JettonTransfer (USDT is a Jetton on TON)
      const transferAction = data.actions.find(action => action.type === 'JettonTransfer');
      
      if (transferAction) {
        const jetton = transferAction.jetton_transfer;
        const recipient = jetton.recipient.address;
        const symbol = jetton.jetton.symbol;
        const actualAmount = parseFloat(jetton.amount) / 1000000; // USDT decimals is 6

        // Address verification (Check if it's your wallet)
        if (recipient.toLowerCase() === adminAddress.toLowerCase() && symbol === 'USDT') {
          if (actualAmount >= expectedAmount) {
            return { 
              statusCode: 200, 
              headers: { 'Access-Control-Allow-Origin': '*' }, 
              body: JSON.stringify({ success: true, amount: actualAmount, isManual: false }) 
            };
          }
        }
      }
      return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "USDT Payment mismatch on TON Network." }) };
    }

    // 2. TRC20 Verification (TronScan) - Auto
    if (network === 'TRC20') {
      const response = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${txId}`);
      const data = await response.json();

      if (data && data.contractRet === 'SUCCESS') {
        const transfer = data.trc20TransferInfo && data.trc20TransferInfo[0];
        if (transfer && transfer.to_address.toLowerCase() === adminAddress.toLowerCase()) {
          const actualAmount = parseFloat(transfer.amount_str) / 1000000;
          if (actualAmount >= expectedAmount) {
            return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, amount: actualAmount, isManual: false }) };
          }
        }
      }
      return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "Transaction mismatch or not found on Tron." }) };
    } 

    // 3. BEP20 - Manual Review (Iske liye BscScan API Key chahiye hoti hai)
    else {
      return { 
        statusCode: 200, 
        headers: { 'Access-Control-Allow-Origin': '*' }, 
        body: JSON.stringify({ 
          success: true, 
          isManual: true, 
          message: "Transaction received! Admin is verifying your BEP20 payment." 
        }) 
      };
    }

  } catch (error) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: error.message }) };
  }
};