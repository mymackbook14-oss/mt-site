// netlify/functions/verifyTx.js
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }
  try {
    const { txId, network, expectedAmount, adminAddress } = JSON.parse(event.body);

    // TRC20 Verification
    if (network === 'TRC20') {
      const response = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${txId}`);
      const data = await response.json();
      if (data && data.contractRet === 'SUCCESS') {
        const transfer = data.trc20TransferInfo && data.trc20TransferInfo[0];
        if (transfer && transfer.to_address.toLowerCase() === adminAddress.toLowerCase()) {
          const actualAmount = parseFloat(transfer.amount_str) / 1000000;
          if (actualAmount >= expectedAmount) {
            return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: true, amount: actualAmount }) };
          }
        }
      }
      return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: false, message: "Mismatch or Fail." }) };
    } 

    // TON / BEP20 - Manual Admin Review
    else {
      return { 
        statusCode: 200, 
        headers: { 'Access-Control-Allow-Origin': '*' }, 
        body: JSON.stringify({ 
          success: true, 
          isManual: true, 
          message: `Hash detected on ${network}! Admin is verifying. It will be added in 10-15 minutes.` 
        }) 
      };
    }
  } catch (error) { return { statusCode: 500, body: JSON.stringify({ error: error.message }) }; }
};