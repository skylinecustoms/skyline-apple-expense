const https = require('https');

// Your QB credentials from .env.local
const clientId = 'ABv0UwwczvLVnU53mQIlEpNVkBmHDAY0ajNkg9QZw1BzU0ZSGj';
const clientSecret = '8C11h6oLL9FYJ9Lq1CbwJcuu7WC7UDiOMDMWq17k';
const refreshToken = 'RT1-86-H0-1779036856grq0ajsqvfcku8v2tnev';

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

console.log('🔄 Refreshing QuickBooks access token...');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.access_token) {
        console.log('✅ New access token obtained!');
        console.log('\n📝 Add this to your .env.local:');
        console.log(`QB_ACCESS_TOKEN=${response.access_token}`);
        console.log(`\n⏰ Token expires in: ${response.expires_in} seconds (${Math.round(response.expires_in/3600)} hours)`);
        if (response.refresh_token) {
          console.log(`QB_REFRESH_TOKEN=${response.refresh_token}`);
        }
      } else {
        console.error('❌ Error refreshing token:', response);
      }
    } catch (e) {
      console.error('❌ Failed to parse response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
});

req.write(postData);
req.end();