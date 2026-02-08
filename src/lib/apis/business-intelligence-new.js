/**
 * Skyline Customs Business Intelligence Engine
 * Consolidated API integration with correct formulas
 */

// API Clients
class GHLAPI {
  constructor(token, locationId) {
    this.token = token;
    this.locationId = locationId;
    this.baseUrl = 'https://services.leadconnectorhq.com';
  }

  async fetch(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.append(k, String(v));
    });

    const res = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) throw new Error(`GHL ${res.status}: ${await res.text()}`);
    return res.json();
  }

  async getAllContacts() {
    const allContacts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 50) {
      const data = await this.fetch('/contacts', {
        locationId: this.locationId,
        limit: 100,
        page: page
      });
      
      if (data.contacts?.length > 0) {
        allContacts.push(...data.contacts);
        page++;
        await new Promise(r => setTimeout(r, 100));
      } else {
        hasMore = false;
      }
    }

    return allContacts;
  }

  async getBusinessData() {
    const contacts = await this.getAllContacts();
    
    const hotLeadTags = ['hot lead - tints', 'hot lead - ceramic coating', 'hot lead - ppf'];
    const customers = contacts.filter(c => 
      (c.tags || []).includes('paid/job completed')
    );
    
    const hotLeads = contacts.filter(c => 
      hotLeadTags.some(tag => (c.tags || []).includes(tag))
    );

    const byService = {};
    for (const tag of hotLeadTags) {
      const service = tag.replace('hot lead - ', '');
      byService[service] = contacts.filter(c => 
        (c.tags || []).includes(tag)
      ).length;
    }

    return {
      total_contacts: contacts.length,
      hot_leads: {
        total: hotLeads.length,
        by_service: byService
      },
      customers: {
        total_paying: customers.length,
        total_deposit: contacts.filter(c => 
          (c.tags || []).includes('deposit paid')
        ).length
      },
      conversion_rate: hotLeads.length > 0 
        ? parseFloat(((customers.length / hotLeads.length) * 100).toFixed(2))
        : 0,
      pipeline_value: hotLeads.length * 400 // $400 per hot lead
    };
  }
}

class MetaAPI {
  constructor(token, adAccountId) {
    this.token = token;
    this.adAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    this.baseUrl = 'https://graph.facebook.com/v18.0';
  }

  async fetch(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('access_token', this.token);
    
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) {
        url.searchParams.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
      }
    });

    const res = await fetch(url.toString());
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Meta ${res.status}: ${err.error?.message || res.statusText}`);
    }
    return res.json();
  }

  getPeriodDates(period) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const months = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3,
      'may': 4, 'june': 5, 'july': 6, 'august': 7,
      'september': 8, 'october': 9, 'november': 10, 'december': 11
    };

    if (months[period.toLowerCase()] !== undefined) {
      const m = months[period.toLowerCase()];
      return {
        start: new Date(year, m, 1).toISOString().split('T')[0],
        end: new Date(year, m + 1, 0).toISOString().split('T')[0]
      };
    }

    switch (period.toLowerCase()) {
      case 'yesterday':
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        const s = y.toISOString().split('T')[0];
        return { start: s, end: s };
      
      case 'last_7_days':
        const l7 = new Date(now);
        l7.setDate(l7.getDate() - 7);
        return {
          start: l7.toISOString().split('T')[0],
          end: now.toISOString().split('T')[0]
        };
      
      case 'last_30_days':
        const l30 = new Date(now);
        l30.setDate(l30.getDate() - 30);
        return {
          start: l30.toISOString().split('T')[0],
          end: now.toISOString().split('T')[0]
        };
      
      default:
        return {
          start: new Date(year, month, 1).toISOString().split('T')[0],
          end: now.toISOString().split('T')[0]
        };
    }
  }

  async getAdSpend(period) {
    const { start, end } = this.getPeriodDates(period);

    const data = await this.fetch(`/${this.adAccountId}/insights`, {
      fields: 'spend,impressions,clicks,ctr,cpc,conversions',
      time_range: JSON.stringify({ since: start, until: end })
    });

    const insights = data.data?.[0] || {};

    return {
      total_spend: parseFloat(insights.spend || '0'),
      impressions: parseInt(insights.impressions || '0'),
      clicks: parseInt(insights.clicks || '0'),
      ctr: parseFloat(insights.ctr || '0'),
      cpc: parseFloat(insights.cpc || '0'),
      conversions: parseInt(insights.conversions || '0')
    };
  }
}

class QuickBooksAPI {
  constructor(token, realmId) {
    this.token = token;
    this.realmId = realmId;
    this.baseUrl = 'https://quickbooks.api.intuit.com/v3/company';
  }

  async fetch(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}/${this.realmId}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.append(k, String(v));
    });

    const res = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) throw new Error(`QB ${res.status}: ${await res.text()}`);
    return res.json();
  }

  getPeriodDates(period) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const months = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3,
      'may': 4, 'june': 5, 'july': 6, 'august': 7,
      'september': 8, 'october': 9, 'november': 10, 'december': 11
    };

    if (months[period.toLowerCase()] !== undefined) {
      const m = months[period.toLowerCase()];
      return {
        start: new Date(year, m, 1).toISOString().split('T')[0],
        end: new Date(year, m + 1, 0).toISOString().split('T')[0]
      };
    }

    switch (period.toLowerCase()) {
      case 'yesterday':
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        const s = y.toISOString().split('T')[0];
        return { start: s, end: s };
      case 'last_7_days':
        const l7 = new Date(now);
        l7.setDate(l7.getDate() - 7);
        return { start: l7.toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
      case 'last_30_days':
        const l30 = new Date(now);
        l30.setDate(l30.getDate() - 30);
        return { start: l30.toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
      default:
        return { start: new Date(year, month, 1).toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
    }
  }

  async getRevenue(period) {
    const { start, end } = this.getPeriodDates(period);
    const query = `SELECT * FROM Invoice WHERE TxnDate >= '${start}' AND TxnDate <= '${end}'`;
    
    try {
      const data = await this.fetch('/query', { query });
      let total = 0;
      for (const inv of (data.QueryResponse?.Invoice || [])) {
        total += parseFloat(inv.TotalAmt || '0');
      }
      return { total_revenue: parseFloat(total.toFixed(2)) };
    } catch (e) {
      console.error('QB Revenue error:', e);
      return { total_revenue: 0 };
    }
  }
}

// Main Business Intelligence Engine
export async function calculateKPIs(period, config) {
  const { 
    ghlToken, ghlLocationId, 
    metaToken, metaAdAccountId,
    qbToken, qbRealmId 
  } = config;

  // Initialize APIs
  const ghl = ghlToken && ghlLocationId ? new GHLAPI(ghlToken, ghlLocationId) : null;
  const meta = metaToken && metaAdAccountId ? new MetaAPI(metaToken, metaAdAccountId) : null;
  const qb = qbToken && qbRealmId ? new QuickBooksAPI(qbToken, qbRealmId) : null;

  // Fetch data in parallel
  const [ghlData, metaData, qbRevenue] = await Promise.all([
    ghl?.getBusinessData().catch(e => { console.error('GHL error:', e); return null; }),
    meta?.getAdSpend(period).catch(e => { console.error('Meta error:', e); return null; }),
    qb?.getRevenue(period).catch(e => { console.error('QB error:', e); return { total_revenue: 0 }; })
  ]);

  if (!ghlData || !metaData) {
    throw new Error('GHL and Meta APIs required for KPI calculation');
  }

  // Extract metrics
  const totalCustomers = ghlData.customers.total_paying;
  const metaSpend = metaData.total_spend;
  const actualRevenue = qbRevenue?.total_revenue || 0;
  const pipelineValue = ghlData.pipeline_value;

  // Calculate CAC: Ad Spend ÷ Total Customers (including organic)
  const blendedCAC = totalCustomers > 0 ? parseFloat((metaSpend / totalCustomers).toFixed(2)) : 0;

  // Calculate Avg Job Value
  const avgJobValue = totalCustomers > 0 
    ? parseFloat(((actualRevenue || pipelineValue) / totalCustomers).toFixed(2))
    : 400;

  // Calculate LTV
  const estimatedLTV = parseFloat((avgJobValue * 3).toFixed(2));

  // Calculate LTV:CAC Ratio
  const ltvCACRatio = blendedCAC > 0 ? parseFloat((estimatedLTV / blendedCAC).toFixed(1)) : 0;

  // Calculate days in period for daily ad spend
  const daysInPeriod = period === 'yesterday' ? 1 : 
                       period === 'last_7_days' ? 7 :
                       period === 'last_30_days' ? 30 : 30;
  const dailyAdSpend = parseFloat((metaSpend / daysInPeriod).toFixed(2));

  return {
    // GHL Data
    total_leads: ghlData.total_contacts,
    hot_leads: ghlData.hot_leads.total,
    leads_by_service: ghlData.hot_leads.by_service,
    total_customers: totalCustomers,
    conversion_rate: ghlData.conversion_rate,
    pipeline_value: pipelineValue,

    // Meta Data
    meta_spend: metaSpend,
    meta_impressions: metaData.impressions,
    meta_clicks: metaData.clicks,
    meta_ctr: metaData.ctr,
    meta_cpc: metaData.cpc,

    // Calculated Metrics
    blended_cac: blendedCAC,
    target_cac: 200,
    cac_performance: blendedCAC <= 200 ? 'good' : blendedCAC <= 300 ? 'warning' : 'bad',
    estimated_ltv: estimatedLTV,
    ltv_cac_ratio: ltvCACRatio,
    ratio_performance: ltvCACRatio >= 3 ? 'good' : ltvCACRatio >= 2 ? 'warning' : 'bad',
    avg_job_value: avgJobValue,
    daily_ad_spend: dailyAdSpend,

    // Revenue
    estimated_revenue: pipelineValue * (ghlData.conversion_rate / 100),
    actual_revenue: actualRevenue,

    period,
    last_updated: new Date().toISOString()
  };
}

// Export for use in Next.js API routes
export { GHLAPI, MetaAPI, QuickBooksAPI };
