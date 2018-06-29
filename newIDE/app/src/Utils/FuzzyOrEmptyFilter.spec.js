import { fuzzyOrEmptyFilter } from './FuzzyOrEmptyFilter';

describe('FuzzyOrEmptyFilter', () => {
  it('filter as expected', () => {
    expect(fuzzyOrEmptyFilter('anything', '')).toBe(true);
    expect(fuzzyOrEmptyFilter('A', 'ABCDEF')).toBe(true);
    expect(fuzzyOrEmptyFilter('ABC', 'ABCDEF')).toBe(true);
    expect(fuzzyOrEmptyFilter('ADF', 'ABCDEF')).toBe(true);
    expect(fuzzyOrEmptyFilter('ADG', 'ABCDEF')).toBe(false);
  });
});
