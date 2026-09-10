import { describe, it, expect } from 'vitest';

import {
  DEFAULT_FREE_VALUE_PROPS,
  DEFAULT_PAID_VALUE_PROPS,
  MAX_VALUE_PROPS,
  MAX_VALUE_PROP_LENGTH,
  resolveValueProps,
} from '../valueProps';

describe('valueProps', () => {
  it('pins the default bullets (heartbeat-web renders the same ones)', () => {
    expect(DEFAULT_PAID_VALUE_PROPS).toEqual([
      'Full access to all intel lists',
      'New releases as they publish',
      'Priority support',
      '2 months free',
    ]);
    expect(DEFAULT_FREE_VALUE_PROPS).toEqual([
      'Access to free releases',
      'Stay up to date with new drops',
      'No credit card required',
    ]);
  });

  it('ships defaults that fit the Exchange validator caps', () => {
    for (const list of [DEFAULT_PAID_VALUE_PROPS, DEFAULT_FREE_VALUE_PROPS]) {
      expect(list.length).toBeGreaterThan(0);
      expect(list.length).toBeLessThanOrEqual(MAX_VALUE_PROPS);
      for (const bullet of list) {
        expect(bullet.length).toBeLessThanOrEqual(MAX_VALUE_PROP_LENGTH);
      }
    }
  });

  describe('resolveValueProps', () => {
    it('prefers publisher-authored bullets', () => {
      expect(resolveValueProps(['Weekly deal flow'], DEFAULT_PAID_VALUE_PROPS)).toEqual(['Weekly deal flow']);
    });

    it('falls back to the defaults when nothing was authored', () => {
      // A NULL column arrives as undefined; an untouched editor sends [].
      // Neither means "deliberately blank".
      expect(resolveValueProps(undefined, DEFAULT_PAID_VALUE_PROPS)).toBe(DEFAULT_PAID_VALUE_PROPS);
      expect(resolveValueProps([], DEFAULT_FREE_VALUE_PROPS)).toBe(DEFAULT_FREE_VALUE_PROPS);
    });
  });
});
