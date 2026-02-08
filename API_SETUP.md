# API Setup Guide - Skyline Business Hub

## Overview
Your app now has a complete Business Intelligence engine that connects to:
- **GoHighLevel (GHL)** - Lead & customer data
- **Meta Marketing API** - Ad spend & campaign data  
- **QuickBooks** - Expense tracking

## Step 1: Get Your API Keys

### GoHighLevel API Token
1. Go to GHL Agency/Sub-account settings
2. Navigate to **Settings → API Keys**
3. Generate a new token with these permissions:
   - ✅ Contacts (read)
   - ✅ Opportunities (read)
   - ✅ Campaigns (read)
4. Copy the token

### GHL Location ID
1. In GHL, go to **Settings → Business Profile**
2. Copy the Location ID from the URL or profile page

---

### Meta Marketing API
1. Go to [Meta Business Settings](https://business.facebook.com/settings)
2. Select your business → **System Users**
3. Create a new system user or use existing
4. Generate a new token with these permissions:
   - ✅ ads_read
   - ✅ ads_management
   - ✅ business_management
5. Copy the access token

### Meta Ad Account ID
1. In Meta Ads Manager, look at the URL
2. It contains `act_123456789` - the number after `act_` is your account ID
3. Copy just the numbers (without `act_`)

---

### QuickBooks API
1. Go to [QuickBooks Developer Portal](https://developer.intuit.com/)
2. Create an app or use existing
3. Go to **Keys & OAuth** section
4. Copy:
   - Client ID
   - Client Secret
   - Realm ID (found in your QB URL when logged in)
5. Generate an access token (valid for 1 hour, use refresh token for production)

## Step 2: Configure Environment Variables

Create `.env.local` file in your project root:

```bash
# GoHighLevel
GHL_API_TOKEN=your_ghl_token_here
GHL_LOCATION_ID=your_location_id_here

# Meta
META_ACCESS_TOKEN=your_meta_token_here
META_AD_ACCOUNT_ID=your_ad_account_id_here

# QuickBooks (optional - for expense tracking)
QB_CLIENT_ID=your_qb_client_id
QB_CLIENT_SECRET=your_qb_client_secret
QB_REALM_ID=your_realm_id
QB_ACCESS_TOKEN=your_qb_access_token
```

## Step 3: Deploy to Vercel with Environment Variables

### Option A: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add each variable from above
5. Redeploy the project

### Option B: Vercel CLI
```bash
vercel env add GHL_API_TOKEN
vercel env add GHL_LOCATION_ID
vercel env add META_ACCESS_TOKEN
vercel env add META_AD_ACCOUNT_ID
# ... etc

# Then redeploy
vercel --prod
```

## Step 4: Test the APIs

Once deployed, test the endpoints:

```bash
# Dashboard data (real-time)
curl https://skyline-apple-style.vercel.app/api/dashboard

# All KPIs
curl https://skyline-apple-style.vercel.app/api/kpis?period=january

# CAC calculation
curl https://skyline-apple-style.vercel.app/api/cac?period=last_30_days
```

## API Formulas & Logic

### Customer Acquisition Cost (CAC)
```
CAC = Meta Ad Spend / Customers Acquired

Example:
- Meta Spend (Jan): $1,008.98
- Customers (Jan): 15
- CAC = $1,008.98 / 15 = $67.27
```

### Lifetime Value (LTV)
```
LTV = Average Job Value × Repeat Customers

Default calculation:
- Avg Job Value: $400
- Repeat factor: 3×
- LTV = $400 × 3 = $1,200
```

### LTV:CAC Ratio
```
Ratio = LTV / CAC

Target: 3:1 or higher (healthy business)
- 3+ = Good (green)
- 2-3 = Warning (yellow)
- <2 = Bad (red)
```

### Conversion Rate
```
Conversion Rate = (Customers / Hot Leads) × 100

Example:
- Hot Leads: 213
- Customers: 15
- Conversion = (15/213) × 100 = 7.0%
```

### Pipeline Value
```
Pipeline = Hot Leads × Average Job Value

Example:
- Hot Leads: 520
- Avg Job Value: $400
- Pipeline = 520 × $400 = $208,000
```

### Gross Margin
```
Gross Margin = (Revenue - Expenses) / Revenue × 100
```

### Net Margin
```
Net Margin = (Revenue - Expenses - Marketing) / Revenue × 100
```

## Supported Time Periods

All API endpoints support these periods:

- `january`, `february`, `march`, etc.
- `yesterday`
- `last_7_days`
- `last_30_days`
- `current_month` (default)

## Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GHL API   │    │  Meta API   │    │   QB API    │
│  (Leads)    │    │  (Ad Spend) │    │  (Expenses) │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                          ▼
               ┌─────────────────────┐
               │  Business Intelligence │
               │      Engine          │
               │  (Formulas & Logic)   │
               └─────────────────────┘
                          │
                          ▼
               ┌─────────────────────┐
               │   API Endpoints     │
               │  /api/dashboard     │
               │  /api/kpis          │
               │  /api/cac           │
               └─────────────────────┘
```

## Troubleshooting

### API Returns 500 Error
1. Check environment variables are set correctly
2. Verify API tokens haven't expired
3. Check Vercel logs for detailed error messages

### Data Doesn't Match Dashboard
- GHL: Tags must match exactly (case-sensitive)
- Meta: Ad account ID must be correct
- QB: Chart of accounts mapping may need adjustment

### Rate Limiting
- GHL: Built-in 100ms delays between requests
- Meta: Follows standard Meta rate limits
- QB: 500 requests per day limit

## Security Notes

⚠️ **Never commit `.env.local` to GitHub!**

The `.env.local` file is in `.gitignore` by default. Always use Vercel environment variables for production.

## Next Steps

1. Add API keys to environment variables
2. Redeploy to Vercel
3. Test the API endpoints
4. Update frontend components to use real API data
5. Set up automated daily sync (optional)

Need help? Check the API integration files in `/src/lib/apis/`