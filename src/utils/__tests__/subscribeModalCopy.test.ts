import { describe, it, expect } from 'vitest';

import {
  DEFAULT_TIER,
  SUBSCRIBE_COPY,
  TIER_NAMES,
  TIER_ORDER,
  fmt,
  stepLabels,
  subscribeCtaLabel,
} from '../subscribeModalCopy';

describe('subscribeModalCopy', () => {
  it('pins every user-visible string (heartbeat-public snapshots the same object)', () => {
    expect(SUBSCRIBE_COPY).toMatchSnapshot();
  });

  it('labels the third step by where the tier ends up', () => {
    expect(stepLabels('monthly')).toEqual(['Choose Plan', 'Verify Email', 'Payment']);
    expect(stepLabels('yearly')).toEqual(['Choose Plan', 'Verify Email', 'Payment']);
    expect(stepLabels('free')).toEqual(['Choose Plan', 'Verify Email', 'Access']);
    // Before a tier is selected the paid label holds, as it did before.
    expect(stepLabels('')).toEqual(['Choose Plan', 'Verify Email', 'Payment']);
  });

  it('fills placeholders and leaves an unfilled one as written', () => {
    expect(fmt('Subscribe for ${price}{period}', { price: 29, period: '/month' })).toBe('Subscribe for $29/month');
    expect(fmt(SUBSCRIBE_COPY.verify.subtitle, { email: 'a@b.co' })).toBe('Check your inbox for a@b.co');
    expect(fmt('Check your inbox for {email}')).toBe('Check your inbox for {email}');
    expect(fmt('plain')).toBe('plain');
  });

  it('names the free tier Get invite, with monthly first and preselected', () => {
    expect(TIER_NAMES.free).toBe('Get invite');
    expect(TIER_ORDER).toEqual(['monthly', 'yearly', 'free']);
    expect(DEFAULT_TIER).toBe('monthly');
  });

  it('labels the CTA with the publisher when there is one', () => {
    expect(subscribeCtaLabel('Diego Alcaino')).toBe('Subscribe to Diego Alcaino for access');
    expect(subscribeCtaLabel()).toBe('Subscribe for access');
    expect(subscribeCtaLabel('')).toBe('Subscribe for access');
    expect(subscribeCtaLabel(null)).toBe('Subscribe for access');
  });
});
