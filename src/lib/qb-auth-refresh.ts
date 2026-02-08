/**
 * QuickBooks Token Auto-Refresh
 * Runs every 2 hours to keep tokens fresh
 */

interface QBTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export class QBTokenManager {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;

  constructor() {
    this.clientId = process.env.QB_CLIENT_ID!;
    this.clientSecret = process.env.QB_CLIENT_SECRET!;
    this.refreshToken = process.env.QB_REFRESH_TOKEN!;
  }

  /**
   * Refresh QB access token using refresh token
   */
  async refreshAccessToken(): Promise<QBTokenResponse | null> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=refresh_token&refresh_token=${this.refreshToken}`
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('QB token refresh failed:', error);
        return null;
      }

      const tokenData: QBTokenResponse = await response.json();
      console.log('✅ QB token refreshed successfully');
      
      // Update environment variables (for current session)
      process.env.QB_ACCESS_TOKEN = tokenData.access_token;
      if (tokenData.refresh_token) {
        process.env.QB_REFRESH_TOKEN = tokenData.refresh_token;
      }

      return tokenData;
    } catch (error) {
      console.error('QB token refresh error:', error);
      return null;
    }
  }

  /**
   * Update .env.local file with new tokens
   */
  async updateEnvFile(tokenData: QBTokenResponse): Promise<boolean> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update access token
      envContent = envContent.replace(
        /QB_ACCESS_TOKEN=.*/,
        `QB_ACCESS_TOKEN=${tokenData.access_token}`
      );
      
      // Update refresh token if provided
      if (tokenData.refresh_token) {
        envContent = envContent.replace(
          /QB_REFRESH_TOKEN=.*/,
          `QB_REFRESH_TOKEN=${tokenData.refresh_token}`
        );
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env.local updated with new QB tokens');
      return true;
    } catch (error) {
      console.error('Failed to update .env.local:', error);
      return false;
    }
  }

  /**
   * Check if current token is still valid
   */
  async testToken(): Promise<boolean> {
    try {
      const accessToken = process.env.QB_ACCESS_TOKEN;
      const realmId = process.env.QB_REALM_ID;
      
      if (!accessToken || !realmId) return false;

      const response = await fetch(
        `https://quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Auto-refresh QB token (call this from cron)
 */
export async function autoRefreshQBToken(): Promise<void> {
  const tokenManager = new QBTokenManager();
  
  // Test if current token works
  const isValid = await tokenManager.testToken();
  if (isValid) {
    console.log('✅ QB token still valid, no refresh needed');
    return;
  }
  
  console.log('🔄 QB token expired, refreshing...');
  
  // Refresh token
  const newTokens = await tokenManager.refreshAccessToken();
  if (newTokens) {
    // Update .env.local file
    await tokenManager.updateEnvFile(newTokens);
    console.log(`✅ QB token refreshed, expires in ${newTokens.expires_in} seconds`);
  } else {
    console.error('❌ QB token refresh failed - manual re-authentication required');
  }
}