import { describe, it, expect } from 'vitest';

import { detailToPublisherData } from '../fetch';
import type { ApiPublisherProfile } from '../fetch';

const profile: ApiPublisherProfile = {
  id: 'pub-uuid',
  slug: 'diego-alcaino',
  name: 'Diego Alcaino',
  role: 'Founder',
  specialty: null,
  description: 'Deal flow',
  logo_url: null,
  color: null,
  long_bio: null,
  linkedin_url: null,
  twitter_url: null,
  website_url: null,
  expertise: [],
  monthly_price_cents: 2900,
  yearly_price_cents: 24900,
  stats: { lists_count: 1, articles_count: 2, subscribers: 3 },
  products: [],
  collections: [],
};

describe('detailToPublisherData', () => {
  it('maps free_tier_enabled onto freeTierEnabled', () => {
    expect(detailToPublisherData({ ...profile, free_tier_enabled: true }).freeTierEnabled).toBe(true);
    expect(detailToPublisherData({ ...profile, free_tier_enabled: false }).freeTierEnabled).toBe(false);
  });

  it('defaults freeTierEnabled to false when the API omits it', () => {
    // An older Exchange (or a cached response) without the field must not
    // put a Get invite card on the page.
    expect(detailToPublisherData(profile).freeTierEnabled).toBe(false);
  });

  it('keeps the fields the subscribe modal is opened with', () => {
    const data = detailToPublisherData({
      ...profile,
      billing_options: 'monthly_only',
      value_props: { paid: ['Weekly deal flow'] },
    });

    expect(data).toMatchObject({
      id: 'pub-uuid',
      name: 'Diego Alcaino',
      monthlyPriceCents: 2900,
      yearlyPriceCents: 24900,
      billingOptions: 'monthly_only',
      valueProps: { paid: ['Weekly deal flow'] },
    });
  });
});
