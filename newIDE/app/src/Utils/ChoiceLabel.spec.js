// @flow
import { getChoiceDisplayLabel } from './ChoiceLabel';

describe('getChoiceDisplayLabel', () => {
  it('hides the value when the label starts with it (or is missing)', () => {
    expect(getChoiceDisplayLabel('Mesh', 'Mesh (works for Static only)')).toBe(
      'Mesh (works for Static only)'
    );
    expect(getChoiceDisplayLabel('Mesh', 'Mesh')).toBe('Mesh');
    expect(getChoiceDisplayLabel('Mesh', '')).toBe('Mesh');
  });

  it('displays both the value and the label otherwise', () => {
    expect(getChoiceDisplayLabel('Mesh', 'Maillage')).toBe('Mesh — Maillage');
  });
});
