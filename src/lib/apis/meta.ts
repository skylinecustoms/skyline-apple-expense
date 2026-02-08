/**
 * Meta Marketing API Integration
 * Fetches ad spend and campaign performance data
 */

const META_API_BASE = 'https://graph.facebook.com/v18.0';

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  daily_budget?: number;
  lifetime_budget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions?: number;
  cost_per_conversion?: number;
}

export interface MetaAdSpend {
  total_spend: number;
  daily_spend: number;
  campaigns: MetaCampaign[];
  insights: {
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    cost_per_conversion: number;
  };
}

export class MetaAPI {
  private accessToken: string;
  private adAccountId: string;

  constructor(accessToken: string, adAccountId: string) {
    this.accessToken = accessToken;
    this.adAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  }

  private async fetchWithAuth(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${META_API_BASE}${endpoint}`);
    url.searchParams.append('access_token', this.accessToken);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        // Handle arrays by JSON stringifying them
        if (Array.isArray(value)) {
          url.searchParams.append(key, JSON.stringify(value));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Meta API error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get ad spend for a specific date range
   */
  async getAdSpend(startDate?: string, endDate?: string): Promise<MetaAdSpend> {
    const since = startDate || this.getDefaultStartDate();
    const until = endDate || new Date().toISOString().split('T')[0];

    // Get campaign data with insights
    const campaignsData = await this.fetchWithAuth(`/${this.adAccountId}/campaigns`, {
      fields: 'id,name,status,daily_budget,lifetime_budget,insights{spend,impressions,clicks,ctr,cpc,conversions,cost_per_conversion}',
      effective_status: ['ACTIVE', 'PAUSED'],
      time_range: JSON.stringify({ since, until })
    });

    const campaigns: MetaCampaign[] = [];
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;

    for (const campaign of (campaignsData.data || [])) {
      const insights = campaign.insights?.data?.[0] || {};
      
      const campaignData: MetaCampaign = {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        daily_budget: campaign.daily_budget ? parseInt(campaign.daily_budget) / 100 : undefined,
        lifetime_budget: campaign.lifetime_budget ? parseInt(campaign.lifetime_budget) / 100 : undefined,
        spend: parseFloat(insights.spend || '0'),
        impressions: parseInt(insights.impressions || '0'),
        clicks: parseInt(insights.clicks || '0'),
        ctr: parseFloat(insights.ctr || '0'),
        cpc: parseFloat(insights.cpc || '0'),
        conversions: parseInt(insights.conversions || '0'),
        cost_per_conversion: parseFloat(insights.cost_per_conversion || '0')
      };

      campaigns.push(campaignData);
      totalSpend += campaignData.spend;
      totalImpressions += campaignData.impressions;
      totalClicks += campaignData.clicks;
      totalConversions += campaignData.conversions || 0;
    }

    // Calculate aggregate metrics
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const costPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0;

    // Calculate daily spend (average over date range)
    const days = this.getDaysBetween(since, until);
    const dailySpend = days > 0 ? totalSpend / days : 0;

    return {
      total_spend: parseFloat(totalSpend.toFixed(2)),
      daily_spend: parseFloat(dailySpend.toFixed(2)),
      campaigns,
      insights: {
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: parseFloat(ctr.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        conversions: totalConversions,
        cost_per_conversion: parseFloat(costPerConversion.toFixed(2))
      }
    };
  }

  /**
   * Get spend for specific period (matches GHL period format)
   */
  async getPeriodSpend(period: string): Promise<{
    spend: number;
    period: string;
    startDate: string;
    endDate: string;
  }> {
    const { startDate, endDate } = this.getPeriodDates(period);
    const spendData = await this.getAdSpend(startDate, endDate);

    return {
      spend: spendData.total_spend,
      period,
      startDate,
      endDate
    };
  }

  /**
   * Get real-time campaign performance
   */
  async getRealtimePerformance(): Promise<{
    active_campaigns: number;
    today_spend: number;
    today_clicks: number;
    today_conversions: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const spendData = await this.getAdSpend(today, today);

    const activeCampaigns = spendData.campaigns.filter(c => c.status === 'ACTIVE').length;

    return {
      active_campaigns: activeCampaigns,
      today_spend: spendData.total_spend,
      today_clicks: spendData.insights.clicks,
      today_conversions: spendData.insights.conversions
    };
  }

  /**
   * Calculate blended CAC from Meta spend and GHL customers
   */
  async calculateBlendedCAC(customersAcquired: number, period: string): Promise<{
    blended_cac: number;
    meta_spend: number;
    customers_acquired: number;
    period: string;
  }> {
    const spendData = await this.getPeriodSpend(period);
    
    const blendedCAC = customersAcquired > 0 
      ? spendData.spend / customersAcquired 
      : 0;

    return {
      blended_cac: parseFloat(blendedCAC.toFixed(2)),
      meta_spend: spendData.spend,
      customers_acquired: customersAcquired,
      period
    };
  }

  private getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  private getDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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