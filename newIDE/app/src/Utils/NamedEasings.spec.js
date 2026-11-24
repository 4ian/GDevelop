// @flow
import { allEasingNames, type CubicBezierPoints } from './Easings';
import {
  findNamedEasingNameWithSamePoints,
  getEasingChoicesWithNamedEasings,
  getNamedEasingNames,
  getNamedEasingPointsOrNull,
  getQuotedStringLiteralOrNull,
  getUnknownEasingWarning,
  validateNamedEasingName,
} from './NamedEasings';

const getMessage = (descriptor: any): string =>
  typeof descriptor === 'string'
    ? descriptor
    : (descriptor && (descriptor.message || descriptor.id)) || '';

const makeFakeEasing = (
  name: string,
  points: [number, number, number, number]
) => ({
  getName: () => name,
  getX1: () => points[0],
  getY1: () => points[1],
  getX2: () => points[2],
  getY2: () => points[3],
});

const makeFakeContainer = (easings: Array<any>): any => ({
  hasNamedEasingNamed: (name: string) =>
    easings.some(easing => easing.getName() === name),
  getNamedEasingsCount: () => easings.length,
  getNamedEasingAt: (index: number) => easings[index],
  getNamedEasing: (name: string) =>
    easings.find(easing => easing.getName() === name),
});

describe('validateNamedEasingName', () => {
  const existingNames = ['PopupOpen', 'ButtonPress'];

  it('rejects an empty or whitespace-only name', () => {
    expect(getMessage(validateNamedEasingName('', { existingNames }))).toMatch(
      /empty/i
    );
    expect(
      getMessage(validateNamedEasingName('   ', { existingNames }))
    ).toMatch(/empty/i);
  });

  it('rejects a built-in easing name', () => {
    expect(
      getMessage(validateNamedEasingName('easeInQuad', { existingNames }))
    ).toMatch(/built-in/i);
    expect(
      getMessage(validateNamedEasingName(allEasingNames[0], { existingNames }))
    ).toMatch(/built-in/i);
  });

  it('rejects a cubic-bezier(...) literal', () => {
    expect(
      getMessage(
        validateNamedEasingName('cubic-bezier(.25,.1,.25,1)', { existingNames })
      )
    ).toMatch(/cubic-bezier/i);
  });

  it('rejects a name that would break the string literal or is not an identifier', () => {
    ['Popup"Open', 'Popup\\Open', 'Popup Open', '1Popup'].forEach(name => {
      expect(
        getMessage(validateNamedEasingName(name, { existingNames }))
      ).toMatch(/letters, digits and underscores/i);
    });
  });

  it('rejects a duplicate name', () => {
    expect(
      getMessage(validateNamedEasingName('PopupOpen', { existingNames }))
    ).toMatch(/already exists/i);
  });

  it('allows renaming a named easing to its current name', () => {
    expect(
      validateNamedEasingName('PopupOpen', {
        existingNames,
        ignoredName: 'PopupOpen',
      })
    ).toBe(null);
  });

  it('accepts a unique name', () => {
    expect(validateNamedEasingName('MyEasing', { existingNames })).toBe(null);
    expect(validateNamedEasingName('Slide_In2', { existingNames })).toBe(null);
    expect(validateNamedEasingName('  SlideIn  ', { existingNames })).toBe(
      null
    );
  });
});

describe('named easings container helpers', () => {
  it('lists names and resolves points, guarding a missing container', () => {
    const container = makeFakeContainer([
      makeFakeEasing('PopupOpen', [0.34, 1.56, 0.64, 1]),
      makeFakeEasing('ButtonPress', [0.5, 0, 0.75, 0]),
    ]);

    expect(getNamedEasingNames(container)).toEqual([
      'PopupOpen',
      'ButtonPress',
    ]);
    expect(getNamedEasingPointsOrNull(container, 'PopupOpen')).toEqual([
      0.34,
      1.56,
      0.64,
      1,
    ]);
    expect(getNamedEasingPointsOrNull(container, 'Missing')).toBe(null);
    expect(getNamedEasingNames(null)).toEqual([]);
    expect(getNamedEasingPointsOrNull(null, 'PopupOpen')).toBe(null);
  });
});

describe('getEasingChoicesWithNamedEasings', () => {
  it('puts named easings before built-ins', () => {
    expect(
      getEasingChoicesWithNamedEasings(['linear', 'easeInQuad'], ['PopupOpen'])
    ).toEqual(['PopupOpen', 'linear', 'easeInQuad']);
  });
});

describe('findNamedEasingNameWithSamePoints', () => {
  const pointsByName: { [string]: CubicBezierPoints } = {
    Wheel: [0.08, 3.35, 0.95, -1.08],
    PopupOpen: [0.34, 1.56, 0.64, 1],
  };

  it('finds an existing named easing with the same rounded points', () => {
    expect(
      findNamedEasingNameWithSamePoints([0.08, 3.35, 0.95, -1.08], pointsByName)
    ).toBe('Wheel');
    expect(
      findNamedEasingNameWithSamePoints(
        [0.0801, 3.3502, 0.9496, -1.0804],
        pointsByName
      )
    ).toBe('Wheel');
  });

  it('ignores a named easing when renaming it', () => {
    expect(
      findNamedEasingNameWithSamePoints(
        [0.08, 3.35, 0.95, -1.08],
        pointsByName,
        'Wheel'
      )
    ).toBe(null);
  });

  it('returns null when the curve is new', () => {
    expect(
      findNamedEasingNameWithSamePoints([0.5, 0, 0.75, 0], pointsByName)
    ).toBe(null);
  });
});

describe('getUnknownEasingWarning', () => {
  it('warns only for a quoted literal that is not a built-in, curve or named easing', () => {
    expect(getUnknownEasingWarning('"easeInQuad"', ['PopupOpen'])).toBe(null);
    expect(
      getUnknownEasingWarning('"cubic-bezier(.25,.1,.25,1)"', ['PopupOpen'])
    ).toBe(null);
    expect(getUnknownEasingWarning('"PopupOpen"', ['PopupOpen'])).toBe(null);
    expect(getUnknownEasingWarning('VariableString(X)', ['PopupOpen'])).toBe(
      null
    );
    expect(
      getUnknownEasingWarning('"cubic-bezier(" + VariableString(X) + ")"', [
        'PopupOpen',
      ])
    ).toBe(null);
    expect(getUnknownEasingWarning('""', ['PopupOpen'])).toBe(null);
    expect(
      getMessage(getUnknownEasingWarning('"DeletedEasing"', ['PopupOpen']))
    ).toMatch(/not defined/i);
  });
});

describe('getQuotedStringLiteralOrNull', () => {
  it('returns the unquoted text of a string literal', () => {
    expect(getQuotedStringLiteralOrNull('"PopupOpen"')).toBe('PopupOpen');
    expect(getQuotedStringLiteralOrNull('"a" + "b"')).toBe(null);
    expect(getQuotedStringLiteralOrNull('PopupOpen')).toBe(null);
  });
});
