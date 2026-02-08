// Quick fix: Add your actual QB numbers here temporarily
// This will make the app show real data immediately

export const manualQBData = {
  "last_7_days": {
    revenue: 600,    // Your actual last week revenue
    expenses: 200    // Your actual last week expenses  
  },
  "last_30_days": {
    revenue: 2400,   // Update with your actual numbers
    expenses: 800
  },
  "current_month": {
    revenue: 1200,   // Current month so far
    expenses: 400
  }
}

// Usage: Import this in your API routes as fallback when QB API fails