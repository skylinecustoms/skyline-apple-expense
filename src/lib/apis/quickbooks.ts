/**
 * QuickBooks API Integration
 * Fetches expense data and financial reports
 */

const QB_API_BASE = 'https://quickbooks.api.intuit.com/v3/company';

export interface QBExpense {
  id: string;
  date: string;
  amount: number;
  vendor: string;
  category: string;
  description: string;
  account: string;
}

export interface QBFinancialSummary {
  total_revenue: number;
  total_expenses: number;
  expenses_by_category: Record<string, number>;
  expenses_by_vendor: Record<string, number>;
  monthly_trend: Record<string, number>;
  top_vendors: Array<{ name: string; amount: number }>;
  top_categories: Array<{ name: string; amount: number }>;
}

export class QuickBooksAPI {
  private accessToken: string;
  private realmId: string;

  constructor(accessToken: string, realmId: string) {
    this.accessToken = accessToken;
    this.realmId = realmId;
  }

  private async fetchWithAuth(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${QB_API_BASE}/${this.realmId}${endpoint}`);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.append(key, String(value));
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`QuickBooks API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  /**
   * Get expenses from QuickBooks
   */
  async getExpenses(startDate?: string, endDate?: string): Promise<QBExpense[]> {
    // Query for expenses using QBO query language
    const query = `SELECT * FROM Purchase WHERE TxnDate >= '${startDate || '2024-01-01'}' AND TxnDate <= '${endDate || new Date().toISOString().split('T')[0]}' ORDERBY TxnDate DESC`;
    
    const data = await this.fetchWithAuth('/query', { query });
    
    const expenses: QBExpense[] = [];
    
    for (const purchase of (data.QueryResponse?.Purchase || [])) {
      const expense: QBExpense = {
        id: purchase.Id,
        date: purchase.TxnDate,
        amount: parseFloat(purchase.TotalAmt || '0'),
        vendor: purchase.VendorRef?.name || 'Unknown Vendor',
        category: this.getCategoryFromAccount(purchase.AccountRef?.name),
        description: purchase.PrivateNote || purchase.Line?.[0]?.Description || 'No description',
        account: purchase.AccountRef?.name || 'Uncategorized'
      };
      
      expenses.push(expense);
    }

    return expenses;
  }

  /**
   * Get financial summary for period
   */
  async getFinancialSummary(startDate?: string, endDate?: string): Promise<QBFinancialSummary> {
    const [expenses, revenueData] = await Promise.all([
      this.getExpenses(startDate, endDate),
      this.getRevenue(startDate, endDate)
    ]);
    
    const byCategory: Record<string, number> = {};
    const byVendor: Record<string, number> = {};
    const monthlyTrend: Record<string, number> = {};
    let totalExpenses = 0;

    for (const expense of expenses) {
      // Total
      totalExpenses += expense.amount;
      
      // By category
      byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
      
      // By vendor
      byVendor[expense.vendor] = (byVendor[expense.vendor] || 0) + expense.amount;
      
      // Monthly trend
      const month = expense.date.substring(0, 7); // YYYY-MM
      monthlyTrend[month] = (monthlyTrend[month] || 0) + expense.amount;
    }

    // Get top vendors (sorted by amount)
    const topVendors = Object.entries(byVendor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, amount]) => ({ name, amount: parseFloat(amount.toFixed(2)) }));

    // Get top categories
    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({ name, amount: parseFloat(amount.toFixed(2)) }));

    return {
      total_revenue: revenueData.total_revenue,
      total_expenses: parseFloat(totalExpenses.toFixed(2)),
      expenses_by_category: byCategory,
      expenses_by_vendor: byVendor,
      monthly_trend: monthlyTrend,
      top_vendors: topVendors,
      top_categories: topCategories
    };
  }

  /**
   * Get period expenses (matches GHL/Meta period format)
   */
  async getPeriodExpenses(period: string): Promise<{
    total_expenses: number;
    period: string;
    startDate: string;
    endDate: string;
    expenses: QBExpense[];
  }> {
    const { startDate, endDate } = this.getPeriodDates(period);
    const expenses = await this.getExpenses(startDate, endDate);
    
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      total_expenses: parseFloat(total.toFixed(2)),
      period,
      startDate,
      endDate,
      expenses
    };
  }

  /**
   * Get actual revenue from QuickBooks (invoices/sales)
   */
  async getRevenue(startDate?: string, endDate?: string): Promise<{
    total_revenue: number;
    by_month: Record<string, number>;
  }> {
    // Query for invoices using QBO query language
    const query = `SELECT * FROM Invoice WHERE TxnDate >= '${startDate || '2024-01-01'}' AND TxnDate <= '${endDate || new Date().toISOString().split('T')[0]}' ORDERBY TxnDate DESC`;
    
    try {
      const data = await this.fetchWithAuth('/query', { query });
      
      let totalRevenue = 0;
      const byMonth: Record<string, number> = {};
      
      for (const invoice of (data.QueryResponse?.Invoice || [])) {
        const amount = parseFloat(invoice.TotalAmt || '0');
        totalRevenue += amount;
        
        // Monthly breakdown
        const month = invoice.TxnDate.substring(0, 7); // YYYY-MM
        byMonth[month] = (byMonth[month] || 0) + amount;
      }
      
      return {
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
        by_month: byMonth
      };
    } catch (error) {
      console.error('QB Revenue fetch error:', error);
      return { total_revenue: 0, by_month: {} };
    }
  }

  /**
   * Get profit/loss summary with actual revenue
   */
  async getProfitLoss(startDate?: string, endDate?: string): Promise<{
    revenue: number;
    expenses: number;
    net_income: number;
    margin: number;
  }> {
    const [expenseSummary, revenueData] = await Promise.all([
      this.getFinancialSummary(startDate, endDate),
      this.getRevenue(startDate, endDate)
    ]);
    
    const revenue = revenueData.total_revenue;
    const expenses = expenseSummary.total_expenses;
    const netIncome = revenue - expenses;
    const margin = revenue > 0 ? (netIncome / revenue) * 100 : 0;

    return {
      revenue: parseFloat(revenue.toFixed(2)),
      expenses,
      net_income: parseFloat(netIncome.toFixed(2)),
      margin: parseFloat(margin.toFixed(2))
    };
  }

  private getCategoryFromAccount(accountName: string = ''): string {
    // Map QB account names to categories
    const accountLower = accountName.toLowerCase();
    
    if (accountLower.includes('marketing') || accountLower.includes('advertising')) {
      return 'Marketing';
    }
    if (accountLower.includes('materials') || accountLower.includes('supplies')) {
      return 'Materials';
    }
    if (accountLower.includes('vehicle') || accountLower.includes('auto')) {
      return 'Automotive';
    }
    if (accountLower.includes('labor') || accountLower.includes('payroll')) {
      return 'Labor';
    }
    if (accountLower.includes('rent') || accountLower.includes('facility')) {
      return 'Facility';
    }
    if (accountLower.includes('utilities')) {
      return 'Utilities';
    }
    
    return 'Other';
  }

  private getPeriodDates(period: string): { startDate: string; endDate: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const months: Record<string, number> = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3,
      'may': 4, 'june': 5, 'july': 6, 'august': 7,
      'september': 8, 'october': 9, 'november': 10, 'december': 11
    };

    if (months[period.toLowerCase()] !== undefined) {
      const monthIndex = months[period.toLowerCase()];
      return {
        startDate: new Date(year, monthIndex, 1).toISOString().split('T')[0],
        endDate: new Date(year, monthIndex + 1, 0).toISOString().split('T')[0]
      };
    }

    switch (period.toLowerCase()) {
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];
        return { startDate: yStr, endDate: yStr };
      
      case 'last_7_days':
        const last7 = new Date(now);
        last7.setDate(last7.getDate() - 7);
        return {
          startDate: last7.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
      
      case 'last_30_days':
        const last30 = new Date(now);
        last30.setDate(last30.getDate() - 30);
        return {
          startDate: last30.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
      
      default:
        return {
          startDate: new Date(year, month, 1).toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
    }
  }
}