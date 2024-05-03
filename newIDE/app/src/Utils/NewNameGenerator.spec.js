// @flow

import newNameGenerator, { splitNameAndNumberSuffix } from './NewNameGenerator';

describe('NewNameGenerator', () => {
  describe('newNameGenerator', () => {
    describe('with prefix', () => {
      it('should return the name with the given prefix if it is already used', () => {
        expect(
          newNameGenerator('Object', text => text === 'Object', 'CopyOf')
        ).toEqual('CopyOfObject');
      });
      it('should return the name with the given prefix if the name contains a number suffix', () => {
        expect(
          newNameGenerator('Object2', text => text === 'Object2', 'CopyOf')
        ).toEqual('CopyOfObject2');
      });
      it('should return the prefix and the name with a 3 as a suffix if the 2 suffix is already used', () => {
        expect(
          newNameGenerator(
            'Object',
            text =>
              text === 'Object' ||
              text === 'CopyOfObject' ||
              text === 'CopyOfObject2',
            'CopyOf'
          )
        ).toEqual('CopyOfObject3');
      });
    });
    describe('without prefix', () => {
      it("should return the name if it isn't already used", () => {
        expect(newNameGenerator('Object', () => false)).toEqual('Object');
      });
      it('should return the name with a 2 as a suffix if it is already used', () => {
        expect(newNameGenerator('Object', text => text === 'Object')).toEqual(
          'Object2'
        );
      });
      it('should return the name with a 3 as a suffix if the name and the name with a 2 as a suffix is already used', () => {
        expect(
          newNameGenerator(
            'Object',
            text => text === 'Object' || text === 'Object2'
          )
        ).toEqual('Object3');
      });

      it('should return the radix with a 3 as a suffix if the name contains a number suffix', () => {
        expect(
          newNameGenerator(
            'Object2',
            text => text === 'Object' || text === 'Object2'
          )
        ).toEqual('Object3');
      });
    });
  });

  describe('splitNameAndNumberSuffix', () => {
    it('should return the whole text if no number suffix', () => {
      expect(splitNameAndNumberSuffix('NewObject')).toEqual([
        'NewObject',
        null,
      ]);
    });
    it('should return an empty string if the input is an empty string', () => {
      expect(splitNameAndNumberSuffix('')).toEqual(['', null]);
    });
    it('should return an empty string and a number if the whole text is a number', () => {
      expect(splitNameAndNumberSuffix('5602')).toEqual(['', 5602]);
    });
    it('should return 0 as a string and a number if the whole text is a number and starts with 0', () => {
      expect(splitNameAndNumberSuffix('05602')).toEqual(['0', 5602]);
    });
    it('should return 000 as a string and a number if the whole text is a number and starts with 000', () => {
      expect(splitNameAndNumberSuffix('00014')).toEqual(['000', 14]);
    });
    it("should return the text and the number suffix when there's a number in the name", () => {
      expect(splitNameAndNumberSuffix('NewCube3D4')).toEqual(['NewCube3D', 4]);
    });
    it("should return the text and the number suffix when there's a float in the name", () => {
      expect(splitNameAndNumberSuffix('Player5.10')).toEqual(['Player5.', 10]);
    });
    it("should return the text and the number suffix when there's a float in the name with decimals starting with 0", () => {
      expect(splitNameAndNumberSuffix('Player8.041')).toEqual([
        'Player8.0',
        41,
      ]);
    });
    it('should return the text and the number suffix for a regular latin name with a suffix', () => {
      expect(splitNameAndNumberSuffix('Enemy5')).toEqual(['Enemy', 5]);
    });
    it('should return the text and the number suffix for a regular cyrillic name with a suffix', () => {
      expect(splitNameAndNumberSuffix('Ябвгд40')).toEqual(['Ябвгд', 40]);
    });
    it('should return the text and the number suffix for a regular chinese name with a suffix', () => {
      expect(splitNameAndNumberSuffix('隧道1')).toEqual(['隧道', 1]);
    });
    it('should return the text and the number suffix for a regular chinese name without a suffix', () => {
      expect(splitNameAndNumberSuffix('隧道')).toEqual(['隧道', null]);
    });
  });
});
