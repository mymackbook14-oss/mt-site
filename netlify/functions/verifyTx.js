// netlify/functions/verifyTx.js
exports.handler = async (event) => {
  // CORS Error bypass karne ke liye (Taki frontend backend se baat kar sake)
  if (event.httpMethod === 'OPTIONS') {
    return { 
        statusCode: 200, 
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }, 
        body: '' 
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { txId, network, expectedAmount, adminAddress } = body;

    // 1. Agar network TRC20 hai, toh auto-verify karo (TronScan Public API se)
    if (network === 'TRC20') {
      const response = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${txId}`);
      const data = await response.json();

      // Check agar transaction sahi mein hui hai
      if (data && data.contractRet === 'SUCCESS') {
        const transfer = data.trc20TransferInfo && data.trc20TransferInfo[0];
        
        // Check agar paisa admin (aapke) address par hi aaya hai
        if (transfer && transfer.to_address.toLowerCase() === adminAddress.toLowerCase()) {
          const actualAmount = parseFloat(transfer.amount_str) / 1000000;
          
          // Check agar user ne poora paisa bheja hai
          if (actualAmount >= expectedAmount) {
            return { 
                statusCode: 200, 
                headers: { 'Access-Control-Allow-Origin': '*' }, 
                body: JSON.stringify({ success: true, amount: actualAmount, isManual: false }) 
            };
          }
        }
      }
      // Agar kuch bhi galat hua toh fail kar do
      return { 
          statusCode: 200, 
          headers: { 'Access-Control-Allow-Origin': '*' }, 
          body: JSON.stringify({ success: false, message: "Payment not found, incorrect amount, or wrong address." }) 
      };
    } 
    
    // 2. Agar network BEP20 (MetaMask) ya BTC hai, toh manual verification ka alert bhejo
    else {
      return { 
          statusCode: 200, 
          headers: { 'Access-Control-Allow-Origin': '*' }, 
          body: JSON.stringify({ 
              success: true, 
              isManual: true, 
              message: `Your ${network} transaction is under review. The admin will verify and add the balance within 10-15 minutes.` 
          }) 
      };
    }

  } catch (error) {
    return { 
        statusCode: 500, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: error.message }) 
    };
  }
};