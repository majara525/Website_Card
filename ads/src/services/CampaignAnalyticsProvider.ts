export interface CampaignMetric {
  id: string;
  label: string;
  value: number;
  unit: 'count' | 'percent' | 'currency';
}

export interface CampaignAnalyticsProvider {
  connect(provider: 'meta' | 'google'): Promise<{ connected: boolean }>;
  getCampaignMetrics(accountId: string): Promise<CampaignMetric[]>;
}

/*
 * Typed seam for a future read-only Meta Marketing API / Google Ads API connection.
 * OAuth tokens must be exchanged and stored server-side. This demo deliberately makes no network calls.
 */
export class MockCampaignAnalyticsProvider implements CampaignAnalyticsProvider {
  async connect(): Promise<{ connected: boolean }> {
    return { connected: false };
  }

  async getCampaignMetrics(): Promise<CampaignMetric[]> {
    return [];
  }
}

export const campaignAnalyticsProvider: CampaignAnalyticsProvider = new MockCampaignAnalyticsProvider();
