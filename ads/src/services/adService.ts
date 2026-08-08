import adsData from '../data/ads.json';
import type { Ad } from '../types';

export interface AdService {
  listAds(): Promise<Ad[]>;
  getAd(id: string): Promise<Ad | undefined>;
}

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export class LocalAdService implements AdService {
  async listAds(): Promise<Ad[]> {
    await delay(320);
    return adsData as Ad[];
  }

  async getAd(id: string): Promise<Ad | undefined> {
    await delay(120);
    return (adsData as Ad[]).find((ad) => ad.id === id);
  }
}

export const adService: AdService = new LocalAdService();
