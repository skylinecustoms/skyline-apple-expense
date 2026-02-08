#!/bin/bash
# Add all API credentials to Vercel project
# Run this in your skyline-apple-style directory

echo "🔑 Adding API credentials to Vercel..."
echo ""

# GoHighLevel
echo "Adding GHL credentials..."
echo "pit-04fe35c9-0970-4ba4-90f2-b178263c0b0f" | vercel env add GHL_API_TOKEN production
echo "jVR23Hle26EBW1Trpnsc" | vercel env add GHL_LOCATION_ID production

# Meta
echo "Adding Meta credentials..."
echo "EAA85DawVfCsBQv3OfVb1Spk4ZAvaJqeg2Hz6ZB5X2plZBdYxjHxutQZC5ozH4PpPrUFO9AjOB0jNLBZCllYeBx85PK1kkDU1vLgAzExVzTmXzZATi7ER2geYMZBwI8KJGDnFFzodDVraOpZCWMmdGucedsjafUEYVwnLo11aIO7tMiX0C33YPikgzTZBUDYUMiKxN9YtWVs7Mk82q" | vercel env add META_ACCESS_TOKEN production
echo "act_1358300385938315" | vercel env add META_AD_ACCOUNT_ID production

# QuickBooks
echo "Adding QuickBooks credentials..."
echo "ABv0UwwczvLVnU53mQIlEpNVkBmHDAY0ajNkg9QZw1BzU0ZSGj" | vercel env add QB_CLIENT_ID production
echo "8C11h6oLL9FYJ9Lq1CbwJcuu7WC7UDiOMDMWq17k" | vercel env add QB_CLIENT_SECRET production
echo "9341455407465475" | vercel env add QB_REALM_ID production
echo "RT1-86-H0-1779036856grq0ajsqvfcku8v2tnev" | vercel env add QB_REFRESH_TOKEN production

echo ""
echo "✅ All environment variables added!"
echo "🚀 Redeploying..."
vercel --prod
