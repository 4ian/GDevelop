// @flow
import { shiftSentenceParamIndexes } from './MetadataDeclarationHelpers';

describe('shiftSentenceParamIndexes', () => {
  it('give back the sentence when there is no parameters', () => {
    expect(shiftSentenceParamIndexes('Make an action', 2)).toBe(
      'Make an action'
    );
  });
  it('can shift a parameter at the end', () => {
    expect(shiftSentenceParamIndexes('Change the speed to _PARAM2_', 2)).toBe(
      'Change the speed to _PARAM4_'
    );
  });
  it('can shift a parameter at the beginning', () => {
    expect(shiftSentenceParamIndexes('_PARAM2_ is moving', 2)).toBe(
      '_PARAM4_ is moving'
    );
  });
  it('can shift a parameter alone', () => {
    expect(shiftSentenceParamIndexes('_PARAM2_', 2)).toBe('_PARAM4_');
  });
  it("won't shift an ill-formed parameter", () => {
    expect(
      shiftSentenceParamIndexes(
        'The speed is greater than PARAM2_ pixels per second',
        2
      )
    ).toBe('The speed is greater than PARAM2_ pixels per second');
    expect(
      shiftSentenceParamIndexes(
        'The speed is greater than _PARAM2 pixels per second',
        2
      )
    ).toBe('The speed is greater than _PARAM2 pixels per second');
    expect(
      shiftSentenceParamIndexes(
        'The speed is greater than PARAM2 pixels per second',
        2
      )
    ).toBe('The speed is greater than PARAM2 pixels per second');
    expect(
      shiftSentenceParamIndexes(
        'The speed is greater than _param2_ pixels per second',
        2
      )
    ).toBe('The speed is greater than _param2_ pixels per second');
    expect(
      shiftSentenceParamIndexes(
        'The speed is greater than 2 pixels per second',
        2
      )
    ).toBe('The speed is greater than 2 pixels per second');
  });
  [2, 0, -2].forEach(indexOffset => {
    it(`can shift 1 parameter by ${indexOffset}`, () => {
      expect(
        shiftSentenceParamIndexes(
          'The speed is greater than _PARAM2_ pixels per second',
          indexOffset
        )
      ).toBe(
        'The speed is greater than _PARAM' +
          (2 + indexOffset) +
          '_ pixels per second'
      );
    });
    it(`can shift 2 parameters by ${indexOffset}`, () => {
      expect(
        shiftSentenceParamIndexes(
          'The speed is between _PARAM1_ and _PARAM2_ pixels per second',
          indexOffset
        )
      ).toBe(
        `The speed is between _PARAM${1 + indexOffset}_ and _PARAM${2 +
          indexOffset}_ pixels per second`
      );
    });
    it(`can shift 2 parameters with jumbled indexes by ${indexOffset}`, () => {
      expect(
        shiftSentenceParamIndexes(
          'The speed is between _PARAM3_ and _PARAM2_ pixels per second',
          indexOffset
        )
      ).toBe(
        `The speed is between _PARAM${3 + indexOffset}_ and _PARAM${2 +
          indexOffset}_ pixels per second`
      );
    });
  });
});
