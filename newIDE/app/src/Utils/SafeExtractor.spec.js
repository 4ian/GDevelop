// @flow
import { SafeExtractor } from './SafeExtractor';

describe('SafeExtractor', () => {
  describe('comme separated finite numbers', () => {
    test('parseCommaSeparatedTwoFiniteNumbers', () => {
      expect(SafeExtractor.parseCommaSeparatedTwoFiniteNumbers('1,2')).toEqual([
        1,
        2,
      ]);
      expect(
        SafeExtractor.parseCommaSeparatedTwoFiniteNumbers('10,2.345')
      ).toEqual([10, 2.345]);
      expect(
        SafeExtractor.parseCommaSeparatedTwoFiniteNumbers('1,2,3')
      ).toEqual([1, 2]);
      expect(SafeExtractor.parseCommaSeparatedTwoFiniteNumbers('1,,3')).toEqual(
        null
      );
      expect(SafeExtractor.parseCommaSeparatedTwoFiniteNumbers('1,,')).toEqual(
        null
      );
      expect(SafeExtractor.parseCommaSeparatedTwoFiniteNumbers('1,')).toEqual(
        null
      );
      expect(SafeExtractor.parseCommaSeparatedTwoFiniteNumbers('1')).toEqual(
        null
      );
    });
    test('parseCommaSeparatedThreeFiniteNumbers', () => {
      expect(
        SafeExtractor.parseCommaSeparatedThreeFiniteNumbers('1,2,3')
      ).toEqual([1, 2, 3]);
      expect(
        SafeExtractor.parseCommaSeparatedThreeFiniteNumbers('10,2.345,3.456')
      ).toEqual([10, 2.345, 3.456]);
      expect(
        SafeExtractor.parseCommaSeparatedThreeFiniteNumbers('1,2,3,4')
      ).toEqual([1, 2, 3]);
      expect(
        SafeExtractor.parseCommaSeparatedThreeFiniteNumbers('1,,3')
      ).toEqual(null);
      expect(
        SafeExtractor.parseCommaSeparatedThreeFiniteNumbers('1,,')
      ).toEqual(null);
      expect(SafeExtractor.parseCommaSeparatedThreeFiniteNumbers('1,')).toEqual(
        null
      );
      expect(SafeExtractor.parseCommaSeparatedThreeFiniteNumbers('1')).toEqual(
        null
      );
    });
  });

  describe('extractStringArrayProperty', () => {
    test('returns only the string items of an array property', () => {
      expect(
        SafeExtractor.extractStringArrayProperty(
          { names: ['a', 'b', 2, null, {}, 'c'] },
          'names'
        )
      ).toEqual(['a', 'b', 'c']);
    });
    test('returns an empty array when the property is an empty array', () => {
      expect(
        SafeExtractor.extractStringArrayProperty({ names: [] }, 'names')
      ).toEqual([]);
    });
    test('returns null when the property is missing or not an array', () => {
      expect(SafeExtractor.extractStringArrayProperty({}, 'names')).toEqual(
        null
      );
      expect(
        SafeExtractor.extractStringArrayProperty({ names: 'a,b' }, 'names')
      ).toEqual(null);
      expect(SafeExtractor.extractStringArrayProperty(null, 'names')).toEqual(
        null
      );
    });
  });
});
