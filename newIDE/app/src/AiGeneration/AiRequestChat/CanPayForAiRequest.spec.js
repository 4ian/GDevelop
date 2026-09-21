// @flow
import { canPayForAiRequest } from './Utils';
import {
  type Quota,
  type UsagePrice,
} from '../../Utils/GDevelopServices/Usage';

const price: UsagePrice = { priceInCredits: 5 };

const exhaustedQuota: Quota = {
  limitReached: true,
  current: 100,
  max: 100,
  period: '7days',
};

const remainingQuota: Quota = {
  ...exhaustedQuota,
  limitReached: false,
  current: 10,
};

describe('canPayForAiRequest', () => {
  it('lets the user send while their allowance is not exhausted', () => {
    expect(
      canPayForAiRequest({
        quota: remainingQuota,
        price,
        availableCredits: 0,
        automaticallyUseCreditsForAiRequests: false,
      })
    ).toBe(true);
  });

  it('lets the user send when their limits are not known', () => {
    expect(
      canPayForAiRequest({
        quota: null,
        price,
        availableCredits: 0,
        automaticallyUseCreditsForAiRequests: false,
      })
    ).toBe(true);
  });

  it('blocks the user when their allowance is exhausted and they did not accept to pay with credits', () => {
    expect(
      canPayForAiRequest({
        quota: exhaustedQuota,
        price,
        availableCredits: 1000,
        automaticallyUseCreditsForAiRequests: false,
      })
    ).toBe(false);
  });

  it('blocks the user when their allowance is exhausted and they have no credits left', () => {
    expect(
      canPayForAiRequest({
        quota: exhaustedQuota,
        price,
        availableCredits: 0,
        automaticallyUseCreditsForAiRequests: true,
      })
    ).toBe(false);
    expect(
      canPayForAiRequest({
        quota: exhaustedQuota,
        price,
        availableCredits: 4,
        automaticallyUseCreditsForAiRequests: true,
      })
    ).toBe(false);
  });

  // The case a user hit: their allowance was exhausted, they were already paying
  // with credits and bought some. Nothing must keep blocking them once the
  // limits say they can pay.
  it('lets the user send as soon as they have enough credits to pay with', () => {
    expect(
      canPayForAiRequest({
        quota: exhaustedQuota,
        price,
        availableCredits: 5,
        automaticallyUseCreditsForAiRequests: true,
      })
    ).toBe(true);
    expect(
      canPayForAiRequest({
        quota: exhaustedQuota,
        price,
        availableCredits: 500,
        automaticallyUseCreditsForAiRequests: true,
      })
    ).toBe(true);
  });

  it('lets the user send when the price is not known or free', () => {
    expect(
      canPayForAiRequest({
        quota: exhaustedQuota,
        price: null,
        availableCredits: 0,
        automaticallyUseCreditsForAiRequests: true,
      })
    ).toBe(true);
    expect(
      canPayForAiRequest({
        quota: exhaustedQuota,
        price: { priceInCredits: 0 },
        availableCredits: 0,
        automaticallyUseCreditsForAiRequests: true,
      })
    ).toBe(true);
  });
});
