// @flow
import {
  isAllowedInIdentifier,
  containsNameUsedAsIdentifier,
} from './EventScriptIdentifiers';

describe('isAllowedInIdentifier', () => {
  it('allows any unicode character except the grammar separators', () => {
    for (const character of ['a', 'Z', '0', '_', 'é', 'Œ', '名', '🙂']) {
      expect(isAllowedInIdentifier(character)).toBe(true);
    }
    // The characters reserved by the expressions grammar
    // (see `GrammarTerminals.h`):
    for (const character of [
      ' ',
      '\n',
      '\r',
      ',',
      '.',
      '"',
      '(',
      ')',
      '[',
      ']',
      '{',
      '}',
      '+',
      '-',
      '<',
      '>',
      '?',
      '^',
      '=',
      '\\',
      ':',
      '!',
      '/',
      '*',
      '~',
      "'",
      '%',
      '#',
      '@',
      '|',
      '&',
      '`',
      '$',
      ';',
    ]) {
      expect(isAllowedInIdentifier(character)).toBe(false);
    }
  });
});

describe('containsNameUsedAsIdentifier', () => {
  it('matches whole identifiers only, with unicode-aware boundaries', () => {
    expect(containsNameUsedAsIdentifier('Delete(Héros)', 'Héros')).toBe(true);
    expect(containsNameUsedAsIdentifier('Héros.X() + 1', 'Héros')).toBe(true);
    // Not a whole identifier: an ASCII `\b`-style boundary would wrongly
    // match these (the characters around are identifier characters too).
    expect(containsNameUsedAsIdentifier('SuperHéros.X()', 'Héros')).toBe(false);
    expect(containsNameUsedAsIdentifier('Delete(Héros2)', 'Héros')).toBe(false);
    // A later occurrence still matches after a partial one.
    expect(
      containsNameUsedAsIdentifier('SuperHéros.X() + Héros.X()', 'Héros')
    ).toBe(true);
    expect(containsNameUsedAsIdentifier('anything', '')).toBe(false);
  });
});
