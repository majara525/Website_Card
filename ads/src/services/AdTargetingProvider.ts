import type { Ad, TargetingSnapshot } from '../types';

export interface AdTargetingProvider {
  getTargeting(ad: Ad): Promise<TargetingSnapshot>;
}

export class MockAdTargetingProvider implements AdTargetingProvider {
  async getTargeting(ad: Ad): Promise<TargetingSnapshot> {
    return {
      ageRange: ad.mock_target_age_range,
      gender: ad.mock_target_gender,
      locations: ad.mock_target_locations,
      source: 'mock',
    };
  }
}

/*
 * Future integration boundary:
 * - Meta: implement this interface with the Ad Library API `ads_archive` endpoint.
 * - TikTok: implement it with the Commercial Content Library API.
 * - Keep platform credentials on a server; never ship them in the mobile client.
 * - Normalize provider-specific responses into TargetingSnapshot here so UI code stays unchanged.
 */
export class ExternalLibraryTargetingProvider implements AdTargetingProvider {
  async getTargeting(_ad: Ad): Promise<TargetingSnapshot> {
    throw new Error('External ad-library integration is not configured.');
  }
}

export const adTargetingProvider: AdTargetingProvider = new MockAdTargetingProvider();
