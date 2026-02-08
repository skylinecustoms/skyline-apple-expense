// Debug QuickBooks API calls directly
const https = require('https');

const accessToken = 'XAB11770586662P6Z66sXWQLRD8gULOYO5Wrqqu4NnxKZmR8Rw';
const realmId = '9341455407465475';

// Test 1: Company Info (basic auth test)
console.log('🔍 Testing QB API authentication...');

const testAuth = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'quickbooks.api.intuit.com',
      path: `/v3/company/${realmId}/companyinfo/${realmId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`Auth test status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log('✅ QB authentication successful');
          resolve(true);
        } else {
          console.log('❌ QB auth failed:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request failed:', e.message);
      reject(e);
    });

    req.end();
  });
};

// Test 2: Get actual invoices for last 7 days
const getLastWeekRevenue = () => {
  return new Promise((resolve, reject) => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const startDate = last7Days.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    
    console.log(`\n📊 Fetching invoices from ${startDate} to ${endDate}...`);
    
    const query = `SELECT * FROM Invoice WHERE TxnDate >= '${startDate}' AND TxnDate <= '${endDate}'`;
    const encodedQuery = encodeURIComponent(query);
    
    const options = {
      hostname: 'quickbooks.api.intuit.com',
      path: `/v3/company/${realmId}/query?query=${encodedQuery}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.QueryResponse && response.QueryResponse.Invoice) {
            const invoices = response.QueryResponse.Invoice;
            let totalRevenue = 0;
            
            console.log(`\n📋 Found ${invoices.length} invoices in last 7 days:`);
            invoices.forEach(invoice => {
              const amount = parseFloat(invoice.TotalAmt || 0);
              totalRevenue += amount;
              console.log(`- ${invoice.TxnDate}: $${amount} (${invoice.DocNumber || 'N/A'})`);
            });
            
            console.log(`\n💰 Total Last 7 Days Revenue: $${totalRevenue}`);
            resolve(totalRevenue);
          } else {
            console.log('📄 No invoices found in last 7 days');
            resolve(0);
          }
        } catch (e) {
          console.error('❌ Failed to parse response:', data);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Invoice query failed:', e.message);
      reject(e);
    });

    req.end();
  });
};

// Run tests
(async () => {
  try {
    const authSuccess = await testAuth();
    if (authSuccess) {
      const revenue = await getLastWeekRevenue();
      console.log(`\n🎯 CONFIRMED: Last 7 days revenue = $${revenue}`);
    }
  } catch (error) {
    console.error('Debug failed:', error);
  }
})();