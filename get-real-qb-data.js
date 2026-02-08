// Get fresh QB token and pull REAL revenue data
const https = require('https');

const clientId = 'ABv0UwwczvLVnU53mQIlEpNVkBmHDAY0ajNkg9QZw1BzU0ZSGj';
const clientSecret = '8C11h6oLL9FYJ9Lq1CbwJcuu7WC7UDiOMDMWq17k';
const refreshToken = 'RT1-86-H0-1779036856grq0ajsqvfcku8v2tnev';
const realmId = '9341455407465475';

// Step 1: Get fresh access token
const refreshAccessToken = () => {
  return new Promise((resolve, reject) => {
    const postData = `grant_type=refresh_token&refresh_token=${refreshToken}`;
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const options = {
      hostname: 'oauth.platform.intuit.com',
      path: '/oauth2/v1/tokens/bearer',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            console.log('✅ Got fresh QB access token');
            resolve(response.access_token);
          } else {
            console.log('❌ Token refresh failed:', response);
            resolve(null);
          }
        } catch (e) {
          console.log('❌ Token response parse error:', data);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Token refresh request failed:', e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
};

// Step 2: Get invoices for date range  
const getInvoices = (accessToken, startDate, endDate) => {
  return new Promise((resolve, reject) => {
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
            resolve(response.QueryResponse.Invoice);
          } else {
            resolve([]);
          }
        } catch (e) {
          console.error('Parse error:', e.message);
          resolve([]);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Invoice request failed:', e.message);
      resolve([]);
    });

    req.end();
  });
};

// Get date ranges
const getDateRanges = () => {
  const now = new Date();
  
  // Last 7 days
  const last7Start = new Date(now);
  last7Start.setDate(now.getDate() - 7);
  
  // Last 30 days
  const last30Start = new Date(now);
  last30Start.setDate(now.getDate() - 30);
  
  // Current month (Feb 2026)
  const monthStart = new Date(2026, 1, 1); // February 1
  
  // January 2026
  const janStart = new Date(2026, 0, 1);
  const janEnd = new Date(2026, 0, 31);
  
  return {
    last_7_days: {
      start: last7Start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    },
    last_30_days: {
      start: last30Start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    },
    current_month: {
      start: monthStart.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    },
    january: {
      start: janStart.toISOString().split('T')[0],
      end: janEnd.toISOString().split('T')[0]
    }
  };
};

// Main execution
(async () => {
  console.log('🔄 Refreshing QB token and fetching REAL data...\n');
  
  // Get fresh token
  const accessToken = await refreshAccessToken();
  if (!accessToken) {
    console.log('❌ Cannot get fresh token - you may need to re-authenticate QB manually');
    console.log('Go to: https://developer.intuit.com/app/developer/qbo/docs/get-started');
    return;
  }
  
  const dateRanges = getDateRanges();
  const realData = {};
  
  // Fetch data for each period
  for (const [period, dates] of Object.entries(dateRanges)) {
    console.log(`📊 Fetching ${period} revenue (${dates.start} to ${dates.end})...`);
    
    const invoices = await getInvoices(accessToken, dates.start, dates.end);
    const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.TotalAmt || 0), 0);
    
    realData[period] = {
      revenue: totalRevenue,
      invoice_count: invoices.length,
      period_label: period
    };
    
    console.log(`💰 ${period}: $${totalRevenue} (${invoices.length} invoices)`);
  }
  
  console.log('\n🎯 REAL QUICKBOOKS DATA:');
  console.log(JSON.stringify(realData, null, 2));
  
  console.log('\n📝 Updated manual data for your app:');
  console.log(`last_7_days: $${realData.last_7_days.revenue}`);
  console.log(`last_30_days: $${realData.last_30_days.revenue}`);
  console.log(`current_month: $${realData.current_month.revenue}`);
  console.log(`january: $${realData.january.revenue}`);
})();