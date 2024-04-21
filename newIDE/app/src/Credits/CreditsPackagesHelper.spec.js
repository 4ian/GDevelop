// @flow
const { getItemsSplitInLines } = require('./CreditsPackagesHelper');

describe('getItemsSplitInLines', () => {
  describe('loading', () => {
    it('returns null if loading', () => {
      const results = getItemsSplitInLines(null, false);
      expect(results).toEqual(null);
    });
  });
  describe('large screen', () => {
    const isMediumScreen = false;
    it('works for 3 credit packages', () => {
      const creditPackages = Array(3).fill({});
      const results = getItemsSplitInLines(creditPackages, isMediumScreen);
      if (!results) {
        throw new Error('results should not be null.');
      }
      expect(results).toHaveLength(1);
      expect(results[0]).toHaveLength(3);
    });
    it('works for 4 credit packages', () => {
      const creditPackages = Array(4).fill({});
      const results = getItemsSplitInLines(creditPackages, isMediumScreen);
      if (!results) {
        throw new Error('results should not be null.');
      }
      expect(results).toHaveLength(1);
      expect(results[0]).toHaveLength(4);
    });
    it('works for 5 credit packages', () => {
      const creditPackages = Array(5).fill({});
      const results = getItemsSplitInLines(creditPackages, isMediumScreen);
      if (!results) {
        throw new Error('results should not be null.');
      }
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveLength(3);
      expect(results[1]).toHaveLength(2);
    });
    it('works for 6 credit packages', () => {
      const creditPackages = Array(6).fill({});
      const results = getItemsSplitInLines(creditPackages, isMediumScreen);
      if (!results) {
        throw new Error('results should not be null.');
      }
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveLength(3);
      expect(results[1]).toHaveLength(3);
    });
    it('works for 7 credit packages', () => {
      const creditPackages = Array(7).fill({});
      const results = getItemsSplitInLines(creditPackages, isMediumScreen);
      if (!results) {
        throw new Error('results should not be null.');
      }
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveLength(4);
      expect(results[1]).toHaveLength(3);
    });
  });
  describe('medium screen', () => {
    const isMediumScreen = true;
    it('works for 3 credit packages', () => {
      const creditPackages = Array(3).fill({});
      const results = getItemsSplitInLines(creditPackages, isMediumScreen);
      if (!results) {
        throw new Error('results should not be null.');
      }
      expect(results).toHaveLength(1);
      expect(results[0]).toHaveLength(3);
    });
    it('works for 4 credit packages', () => {
      const creditPackages = Array(4).fill({});
      const results = getItemsSplitInLines(creditPackages, isMediumScreen);
      if (!results) {
        throw new Error('results should not be null.');
      }
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveLength(2);
      expect(results[1]).toHaveLength(2);
    });
    it('works for 5 credit packages', () => {
      const creditPackages = Array(5).fill({});
      const results = getItemsSplitInLines(creditPackages, isMediumScreen);
      if (!results) {
        throw new Error('results should not be null.');
      }
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveLength(3);
      expect(results[1]).toHaveLength(2);
    });
    it('works for 6 credit packages', () => {
      const creditPackages = Array(6).fill({});
      const results = getItemsSplitInLines(creditPackages, isMediumScreen);
      if (!results) {
        throw new Error('results should not be null.');
      }
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveLength(3);
      expect(results[1]).toHaveLength(3);
    });
    it('works for 7 credit packages', () => {
      const creditPackages = Array(7).fill({});
      const results = getItemsSplitInLines(creditPackages, isMediumScreen);
      if (!results) {
        throw new Error('results should not be null.');
      }
      expect(results).toHaveLength(3);
      expect(results[0]).toHaveLength(3);
      expect(results[1]).toHaveLength(2);
      expect(results[2]).toHaveLength(2);
    });
  });
});
