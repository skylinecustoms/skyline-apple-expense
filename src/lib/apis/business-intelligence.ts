/**
 * Business Intelligence Engine
 * Combines GHL, Meta, and QuickBooks data for accurate KPIs
 */

import { GHLAPI, GHLBusinessData } from './ghl';
import { MetaAPI, MetaAdSpend } from './meta';
import { QuickBooksAPI, QBFinancialSummary } from './quickbooks';

export interface BusinessKPIs {
  // Lead Metrics
  total_leads: number;
  hot_leads: number;
  leads_by_service: Record<string, number>;
  
  // Customer Metrics
  total_customers: number;
  new_customers_this_month: number;
  conversion_rate: number;
  
  // Revenue Metrics
  pipeline_value: number;
  estimated_revenue: number;
  actual_revenue: number; // From QuickBooks
  avg_job_value: number;
  
  // Marketing Metrics
  meta_spend: number;
  meta_impressions: number;
  meta_clicks: number;
  meta_ctr: number;
  meta_cpc: number;
  meta_conversions: number;
  
  // CAC Metrics
  blended_cac: number;
  target_cac: number;
  cac_performance: 'good' | 'warning' | 'bad';
  
  // LTV Metrics
  estimated_ltv: number;
  ltv_cac_ratio: number;
  ratio_performance: 'good' | 'warning' | 'bad';
  
  // Expense Metrics
  total_expenses: number;
  expenses_by_category: Record<string, number>;
  
  // Profit Metrics
  gross_profit: number;
  gross_margin: number;
  net_profit: number;
  net_margin: number;
  
  // Period
  period: string;
  last_updated: string;
}

export class BusinessIntelligence {
  private ghl: GHLAPI | null = null;
  private meta: MetaAPI | null = null;
  private qb: QuickBooksAPI | null = null;

  constructor(
    ghlToken?: string,
    ghlLocationId?: string,
    metaToken?: string,
    metaAdAccountId?: string,
    qbToken?: string,
    qbRealmId?: string
  ) {
    if (ghlToken && ghlLocationId) {
      this.ghl = new GHLAPI(ghlToken, ghlLocationId);
    }
    if (metaToken && metaAdAccountId) {
      this.meta = new MetaAPI(metaToken, metaAdAccountId);
    }
    if (qbToken && qbRealmId) {
      this.qb = new QuickBooksAPI(qbToken, qbRealmId);
    }
  }

  /**
   * Calculate all business KPIs
   */
  async calculateKPIs(period: string = 'current_month'): Promise<BusinessKPIs> {
    const startTime = Date.now();
    
    // Fetch all data in parallel
    const [
      ghlData,
      metaData,
      qbData
    ] = await Promise.all([
      this.fetchGHLData(period),
      this.fetchMetaData(period),
      this.fetchQBData(period)
    ]);

    console.log(`Data fetched in ${Date.now() - startTime}ms`);

    // Calculate derived metrics
    const kpi = this.deriveKPIs(ghlData, metaData, qbData, period);
    
    return kpi;
  }

  /**
   * Get real-time dashboard data
   */
  async getDashboardData(): Promise<Partial<BusinessKPIs>> {
    if (!this.ghl || !this.meta) {
      throw new Error('GHL and Meta APIs required for dashboard data');
    }

    const [ghlData, metaRealtime] = await Promise.all([
      this.ghl.getBusinessData(),
      this.meta.getRealtimePerformance()
    ]);

    return {
      total_leads: ghlData.total_contacts,
      hot_leads: ghlData.hot_leads.total,
      leads_by_service: ghlData.hot_leads.by_service,
      total_customers: ghlData.customers.total_paying,
      conversion_rate: ghlData.conversion_rate,
      pipeline_value: ghlData.pipeline_value,
      meta_spend: metaRealtime.today_spend,
      meta_clicks: metaRealtime.today_clicks,
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Calculate CAC for specific period
   */
  async calculatePeriodCAC(period: string): Promise<{
    cac: number;
    customers: number;
    spend: number;
    period: string;
  }> {
    if (!this.ghl || !this.meta) {
      throw new Error('GHL and Meta APIs required for CAC calculation');
    }

    const [customerData, spendData] = await Promise.all([
      this.ghl.getPeriodCustomers(period),
      this.meta.getPeriodSpend(period)
    ]);

    const cac = customerData.customers_acquired > 0
      ? spendData.spend / customerData.customers_acquired
      : 0;

    return {
      cac: parseFloat(cac.toFixed(2)),
      customers: customerData.customers_acquired,
      spend: spendData.spend,
      period
    };
  }

  /**
   * Fetch GHL data for period
   */
  private async fetchGHLData(period: string): Promise<GHLBusinessData | null> {
    if (!this.ghl) return null;
    
    try {
      // Get period-specific customers and all-time business data
      const [periodCustomers, allBusinessData] = await Promise.all([
        this.ghl.getPeriodCustomers(period),
        this.ghl.getBusinessData()
      ]);
      
      // Merge period-specific customer count with overall business data
      return {
        ...allBusinessData,
        customers: {
          ...allBusinessData.customers,
          total_paying: periodCustomers.customers_acquired,
          by_period: { [period]: periodCustomers.customers_acquired }
        }
      };
    } catch (error) {
      console.error('GHL API error:', error);
      return null;
    }
  }

  /**
   * Fetch Meta data for period
   */
  private async fetchMetaData(period: string): Promise<MetaAdSpend | null> {
    if (!this.meta) return null;
    
    try {
      // Get period dates from meta API's logic
      const periodData = await this.meta.getPeriodSpend(period);
      // Fetch full ad spend data for that date range
      return await this.meta.getAdSpend(periodData.startDate, periodData.endDate);
    } catch (error) {
      console.error('Meta API error:', error);
      return null;
    }
  }

  /**
   * Fetch QuickBooks data
   */
  private async fetchQBData(period: string): Promise<QBFinancialSummary | null> {
    if (!this.qb) return null;
    
    try {
      return await this.qb.getFinancialSummary();
    } catch (error) {
      console.error('QuickBooks API error:', error);
      return null;
    }
  }

  /**
   * Derive all KPIs from raw data
   */
  private deriveKPIs(
    ghlData: GHLBusinessData | null,
    metaData: MetaAdSpend | null,
    qbData: QBFinancialSummary | null,
    period: string
  ): BusinessKPIs {
    
    // Lead metrics
    const totalLeads = ghlData?.total_contacts || 0;
    const hotLeads = ghlData?.hot_leads.total || 0;
    const leadsByService = ghlData?.hot_leads.by_service || {};
    
    // Customer metrics
    const totalCustomers = ghlData?.customers.total_paying || 0;
    const conversionRate = ghlData?.conversion_rate || 0;
    
    // Revenue metrics - use ACTUAL QuickBooks revenue, not pipeline estimates
    const pipelineValue = ghlData?.pipeline_value || 0;
    const actualRevenue = qbData?.total_revenue || 0;
    const avgJobValue = totalCustomers > 0 ? (actualRevenue / totalCustomers) : 400; // Default $400
    
    // Use actual revenue from QB, fall back to pipeline estimate only if no QB data
    const estimatedRevenue = actualRevenue > 0 ? actualRevenue : (pipelineValue * (conversionRate / 100));
    
    // Marketing metrics
    const metaSpend = metaData?.total_spend || 0;
    const metaImpressions = metaData?.insights.impressions || 0;
    const metaClicks = metaData?.insights.clicks || 0;
    const metaCtr = metaData?.insights.ctr || 0;
    const metaCpc = metaData?.insights.cpc || 0;
    const metaConversions = metaData?.insights.conversions || 0;
    
    // CAC metrics
    const blendedCAC = totalCustomers > 0 ? metaSpend / totalCustomers : 0;
    const targetCAC = 200; // $200 target
    const cacPerformance = this.getCACPerformance(blendedCAC, targetCAC);
    
    // LTV metrics (estimate: avg job value × 3 repeat customers)
    const estimatedLTV = avgJobValue * 3;
    const ltvCACRatio = blendedCAC > 0 ? estimatedLTV / blendedCAC : 0;
    const ratioPerformance = this.getRatioPerformance(ltvCACRatio);
    
    // Expense metrics
    const totalExpenses = qbData?.total_expenses || 0;
    const expensesByCategory = qbData?.expenses_by_category || {};
    
    // Profit metrics
    const grossProfit = estimatedRevenue - totalExpenses;
    const grossMargin = estimatedRevenue > 0 ? (grossProfit / estimatedRevenue) * 100 : 0;
    const netProfit = grossProfit - metaSpend;
    const netMargin = estimatedRevenue > 0 ? (netProfit / estimatedRevenue) * 100 : 0;

    return {
      total_leads: totalLeads,
      hot_leads: hotLeads,
      leads_by_service: leadsByService,
      total_customers: totalCustomers,
      new_customers_this_month: totalCustomers, // TODO: Get period-specific
      conversion_rate: conversionRate,
      pipeline_value: pipelineValue,
      estimated_revenue: parseFloat(estimatedRevenue.toFixed(2)),
      actual_revenue: actualRevenue,
      avg_job_value: parseFloat(avgJobValue.toFixed(2)),
      meta_spend: metaSpend,
      meta_impressions: metaImpressions,
      meta_clicks: metaClicks,
      meta_ctr: metaCtr,
      meta_cpc: metaCpc,
      meta_conversions: metaConversions,
      blended_cac: parseFloat(blendedCAC.toFixed(2)),
      target_cac: targetCAC,
      cac_performance: cacPerformance,
      estimated_ltv: parseFloat(estimatedLTV.toFixed(2)),
      ltv_cac_ratio: parseFloat(ltvCACRatio.toFixed(2)),
      ratio_performance: ratioPerformance,
      total_expenses: totalExpenses,
      expenses_by_category: expensesByCategory,
      gross_profit: parseFloat(grossProfit.toFixed(2)),
      gross_margin: parseFloat(grossMargin.toFixed(2)),
      net_profit: parseFloat(netProfit.toFixed(2)),
      net_margin: parseFloat(netMargin.toFixed(2)),
      period,
      last_updated: new Date().toISOString()
    };
  }

  private getCACPerformance(cac: number, target: number): 'good' | 'warning' | 'bad' {
    if (cac <= target) return 'good';
    if (cac <= target * 1.5) return 'warning';
    return 'bad';
  }

  private getRatioPerformance(ratio: number): 'good' | 'warning' | 'bad' {
    if (ratio >= 3) return 'good';
    if (ratio >= 2) return 'warning';
    return 'bad';
  }
}