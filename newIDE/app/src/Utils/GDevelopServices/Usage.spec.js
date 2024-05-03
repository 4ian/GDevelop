// @flow
import { canBenefitFromDiscordRole, type Subscription } from './Usage';

describe('Usage service', () => {
  describe('canBenefitFromDiscordRole', () => {
    it('should return false when subscription is null', () => {
      const result = canBenefitFromDiscordRole(null);
      expect(result).toBe(false);
    });

    it('should return false when subscription does not have a planId', () => {
      const subscription: Subscription = {
        planId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: 'user_id',
        pricingSystemId: null,
      };
      const result = canBenefitFromDiscordRole(subscription);
      expect(result).toBe(false);
    });

    it('should return false for silver subscription', () => {
      const subscription: Subscription = {
        planId: 'gdevelop_silver',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: 'user_id',
        pricingSystemId: 'silver_1month',
      };
      const result = canBenefitFromDiscordRole(subscription);
      expect(result).toBe(false);
    });

    it('should return false for legacy sub', () => {
      const subscription: Subscription = {
        planId: 'gdevelop_pro',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: 'user_id',
        pricingSystemId: 'pro_1month',
      };
      const result = canBenefitFromDiscordRole(subscription);
      expect(result).toBe(false);
    });

    it('should return false when subscription benefits from education plan', () => {
      const subscription: Subscription = {
        planId: 'gdevelop_gold',
        benefitsFromEducationPlan: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: 'user_id',
        pricingSystemId: 'TEAM_MEMBER',
      };
      const result = canBenefitFromDiscordRole(subscription);
      expect(result).toBe(false);
    });

    it('should return true for education subscription', () => {
      const subscription: Subscription = {
        planId: 'gdevelop_education',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: 'user_id',
        pricingSystemId: 'education_1month',
      };
      const result = canBenefitFromDiscordRole(subscription);
      expect(result).toBe(true);
    });

    it('should return true for gold subscription', () => {
      const subscription: Subscription = {
        planId: 'gdevelop_gold',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: 'user_id',
        pricingSystemId: 'gold_1month',
      };
      const result = canBenefitFromDiscordRole(subscription);
      expect(result).toBe(true);
    });

    it('should return true for startup subscription', () => {
      const subscription: Subscription = {
        planId: 'gdevelop_startup',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: 'user_id',
        pricingSystemId: 'startup_1month',
      };
      const result = canBenefitFromDiscordRole(subscription);
      expect(result).toBe(true);
    });
  });
});
