// @flow
import { getSelectedChoice } from './StringWithSelectorField';

jest.mock('./GenericExpressionField', () => ({
  __esModule: true,
  default: () => null,
}));

describe('getSelectedChoice', () => {
  it('finds the choice matching a quoted value', () => {
    expect(getSelectedChoice('"linear"', ['linear', 'easeInQuad'])).toBe(
      'linear'
    );
    expect(getSelectedChoice('linear', ['linear', 'easeInQuad'])).toBe(null);
  });

  it('keeps a custom cubic-bezier literal that was added to the choices', () => {
    expect(
      getSelectedChoice('"cubic-bezier(.91,.17,.08,.88)"', [
        'linear',
        'cubic-bezier(.91,.17,.08,.88)',
      ])
    ).toBe('cubic-bezier(.91,.17,.08,.88)');
  });
});
