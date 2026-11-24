// @flow
import {
  isAllowedInIdentifier,
  isNameSafe,
  containsNameUsedAsIdentifier,
} from './EventScriptIdentifiers';

const gd: libGDevelop = global.gd;

// A corpus of tricky names checked against the REAL C++ implementation
// (`gd.Project.isNameSafe`, compiled to wasm): a change to
// `GrammarTerminals.h` not mirrored in the JavaScript ports makes this test
// fail. Keep it in sync with the same corpus in
// `generation-api/src/lib/__tests__/gdevelop-identifiers.spec.js`
// (GDevelop-services repository, which cannot call the wasm and pins the
// same expectations explicitly).
const trickyNames = [
  // Safe names:
  'A',
  'a',
  '_',
  'MyObject',
  'abc5',
  'My_Object_2',
  'Héros',
  'SuperHéros',
  'Pièce_dorée',
  'Œuf',
  '名前',
  'valid_名称',
  '🙂',
  'emoji🙂name',
  // The first character must not be an (ASCII) digit:
  '5',
  '5abc',
  '9lives',
  // Unicode digits are NOT considered digits (neither by the C++ `isdigit`
  // nor by the JavaScript `parseInt`):
  '٥name',
  '５fullwidth',
  // A tab is NOT part of the grammar whitespaces (space, \n, \r): a name
  // containing one is allowed.
  'a\tb',
  // Empty:
  '',
  // Grammar whitespaces:
  'My Object',
  'a\nb',
  'a\rb',
  // Every reserved character of the grammar:
  'a,b',
  'a.b',
  'a"b',
  'a(b',
  'a)b',
  'a[b',
  'a]b',
  'a{b',
  'a}b',
  'a+b',
  'a-b',
  'a<b',
  'a>b',
  'a?b',
  'a^b',
  'a=b',
  'a\\b',
  'a:b',
  'a!b',
  'a/b',
  'a*b',
  'a~b',
  "a'b",
  'a%b',
  'a#b',
  'a@b',
  'a|b',
  'a&b',
  'a`b',
  'a$b',
  'a;b',
];

describe('conformance with the C++ GrammarTerminals (via libGD.js)', () => {
  it('isNameSafe agrees with gd.Project.isNameSafe on every tricky name', () => {
    for (const name of trickyNames) {
      expect(`${JSON.stringify(name)} -> ${String(isNameSafe(name))}`).toBe(
        `${JSON.stringify(name)} -> ${String(gd.Project.isNameSafe(name))}`
      );
    }
  });
});

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
