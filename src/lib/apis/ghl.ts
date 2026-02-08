/**
 * GoHighLevel API Integration
 * Extracts accurate contact data using proven pagination method
 */

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

export interface GHLBusinessData {
  total_contacts: number;
  hot_leads: {
    total: number;
    by_service: Record<string, number>;
  };
  customers: {
    total_paying: number;
    total_deposit: number;
    by_period: Record<string, number>;
  };
  conversion_rate: number;
  pipeline_value: number;
  leads_by_source?: Record<string, number>; // For debugging
}

export class GHLAPI {
  private token: string;
  private locationId: string;

  constructor(token: string, locationId: string) {
    this.token = token;
    this.locationId = locationId;
  }

  private async fetchWithAuth(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${GHL_API_BASE}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.append(key, String(value));
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all contacts with pagination
   * Uses page-based pagination (not cursor-based)
   * Optionally filters by dateAdded range
   */
  async getAllContacts(startDate?: string, endDate?: string): Promise<any[]> {
    const allContacts: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const params: any = {
        locationId: this.locationId,
        limit: 100,
        page: page
      };

      const data = await this.fetchWithAuth('/contacts', params);
      
      if (data.contacts && data.contacts.length > 0) {
        allContacts.push(...data.contacts);
        page++;
        // Rate limiting - be nice to the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        hasMore = false;
      }

      // Safety check - max 50 pages (5000 contacts)
      if (page > 50) hasMore = false;
    }

    // Filter by dateAdded if dates provided (convert UTC to EST)
    if (startDate || endDate) {
      return allContacts.filter(contact => {
        if (!contact.dateAdded) return false;
        
        // Convert UTC date to EST
        const utcDate = new Date(contact.dateAdded);
        const estOffset = -5; // EST is UTC-5
        const estDate = new Date(utcDate.getTime() + (estOffset * 60 * 60 * 1000));
        const contactDateStr = estDate.toISOString().split('T')[0];
        
        if (startDate && contactDateStr < startDate) return false;
        if (endDate && contactDateStr > endDate) return false;
        
        return true;
      });
    }

    return allContacts;
  }

  /**
   * Get contacts by specific tags
   */
  async getContactsByTags(tags: string[]): Promise<any[]> {
    const allContacts = await this.getAllContacts();
    
    return allContacts.filter(contact => {
      const contactTags = contact.tags || [];
      return tags.some(tag => contactTags.includes(tag));
    });
  }

  /**
   * Get period-specific customers (using date filtering)
   */
  async getPeriodCustomers(period: string): Promise<{
    customers_acquired: number;
    period: string;
    startDate: string;
    endDate: string;
  }> {
    const { startDate, endDate } = this.getPeriodDates(period);
    
    // Get contacts created in this period with 'paid/job completed' tag
    const contacts = await this.getAllContacts(startDate, endDate);
    const customers = contacts.filter(contact => 
      (contact.tags || []).includes('paid/job completed')
    );

    return {
      customers_acquired: customers.length,
      period,
      startDate,
      endDate
    };
  }

  /**
   * Get standard business metrics
   */
  async getBusinessData(): Promise<GHLBusinessData> {
    const allContacts = await this.getAllContacts();
    
    // Hot leads by service
    const hotLeadTags = {
      'tints': 'hot lead - tints',
      'ceramic': 'hot lead - ceramic coating',
      'ppf': 'hot lead - ppf'
    };

    const hotLeadsByService: Record<string, number> = {};
    let totalHotLeads = 0;

    for (const [service, tag] of Object.entries(hotLeadTags)) {
      const count = allContacts.filter(c => 
        (c.tags || []).includes(tag)
      ).length;
      hotLeadsByService[service] = count;
      totalHotLeads += count;
    }

    // Customers
    const payingCustomers = allContacts.filter(c =>
      (c.tags || []).includes('paid/job completed')
    ).length;

    const depositCustomers = allContacts.filter(c =>
      (c.tags || []).includes('deposit paid')
    ).length;

    // Pipeline value (assuming $400 per hot lead)
    const pipelineValue = totalHotLeads * 400;

    // Conversion rate
    const conversionRate = totalHotLeads > 0 
      ? (payingCustomers / totalHotLeads) * 100 
      : 0;

    return {
      total_contacts: allContacts.length,
      hot_leads: {
        total: totalHotLeads,
        by_service: hotLeadsByService
      },
      customers: {
        total_paying: payingCustomers,
        total_deposit: depositCustomers,
        by_period: {}
      },
      conversion_rate: parseFloat(conversionRate.toFixed(2)),
      pipeline_value: pipelineValue
    };
  }

  /**
   * Get period-specific business data (leads/customers created in date range)
   * Counts leads with ANY lead source tag (organic, facebook, google, hot lead, etc.)
   */
  async getPeriodBusinessData(period: string): Promise<GHLBusinessData> {
    const { startDate, endDate } = this.getPeriodDates(period);
    
    // Get contacts created in this period
    const periodContacts = await this.getAllContacts(startDate, endDate);
    
    // Define lead source tags - ONLY facebook and organic count as leads
    const leadSourceTags = [
      'facebook',            // Facebook ads leads
      'organic'              // Organic/referral leads
    ];
    
    // Count leads by source
    const leadsBySource: Record<string, number> = {};
    let totalLeads = 0;
    
    for (const tag of leadSourceTags) {
      const count = periodContacts.filter(c => 
        (c.tags || []).includes(tag)
      ).length;
      if (count > 0) {
        leadsBySource[tag] = count;
        totalLeads += count;
      }
    }
    
    // Hot leads by service (for service breakdown)
    const hotLeadTags = {
      'tints': 'hot lead - tints',
      'ceramic': 'hot lead - ceramic coating',
      'ppf': 'hot lead - ppf'
    };

    const hotLeadsByService: Record<string, number> = {};
    let totalHotLeads = 0;

    for (const [service, tag] of Object.entries(hotLeadTags)) {
      const count = periodContacts.filter(c => 
        (c.tags || []).includes(tag)
      ).length;
      hotLeadsByService[service] = count;
      totalHotLeads += count;
    }

    // Customers (created in period)
    const payingCustomers = periodContacts.filter(c =>
      (c.tags || []).includes('paid/job completed')
    ).length;

    const depositCustomers = periodContacts.filter(c =>
      (c.tags || []).includes('deposit paid')
    ).length;

    // Pipeline value for period
    const pipelineValue = totalHotLeads * 400;

    // Conversion rate for period
    const conversionRate = totalLeads > 0 
      ? (payingCustomers / totalLeads) * 100 
      : 0;

    return {
      total_contacts: totalLeads, // Now counts only leads, not all contacts
      hot_leads: {
        total: totalHotLeads,
        by_service: hotLeadsByService
      },
      customers: {
        total_paying: payingCustomers,
        total_deposit: depositCustomers,
        by_period: { [period]: payingCustomers }
      },
      conversion_rate: parseFloat(conversionRate.toFixed(2)),
      pipeline_value: pipelineValue,
      leads_by_source: leadsBySource // Extra detail for debugging
    };
  }

  /**
   * Calculate CAC for a specific period
   */
  async calculateCAC(period: string, metaSpend: number): Promise<{
    cac: number;
    customers_acquired: number;
    meta_spend: number;
    period: string;
  }> {
    const periodData = await this.getPeriodCustomers(period);
    const cac = periodData.customers_acquired > 0 
      ? metaSpend / periodData.customers_acquired 
      : 0;

    return {
      cac: parseFloat(cac.toFixed(2)),
      customers_acquired: periodData.customers_acquired,
      meta_spend: metaSpend,
      period
    };
  }

  /**
   * Convert period name to date range (EST timezone)
   */
  private getPeriodDates(period: string): { startDate: string; endDate: string } {
    // Get current date in EST
    const now = new Date();
    const estOffset = -5; // EST is UTC-5
    const estNow = new Date(now.getTime() + (estOffset * 60 * 60 * 1000));
    
    const year = estNow.getFullYear();
    const month = estNow.getMonth();

    // Month mapping
    const months: Record<string, number> = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3,
      'may': 4, 'june': 5, 'july': 6, 'august': 7,
      'september': 8, 'october': 9, 'november': 10, 'december': 11
    };

    if (months[period.toLowerCase()] !== undefined) {
      const monthIndex = months[period.toLowerCase()];
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0);
      
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
    }

    // Relative periods
    switch (period.toLowerCase()) {
      case 'yesterday':
        const yesterday = new Date(estNow);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: yesterday.toISOString().split('T')[0],
          endDate: yesterday.toISOString().split('T')[0]
        };
      
      case 'last_7_days':
        const last7 = new Date(estNow);
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
        // Default to current month
        const startOfMonth = new Date(year, month, 1);
        return {
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
    }
  }
}