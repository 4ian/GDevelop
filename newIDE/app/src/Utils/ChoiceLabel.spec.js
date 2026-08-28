// @flow
import { getChoiceDisplayLabel } from './ChoiceLabel';

describe('ChoiceLabel', () => {
  describe('getChoiceDisplayLabel', () => {
    it('displays the value alone when there is no label', () => {
      expect(getChoiceDisplayLabel('Mesh', null)).toBe('Mesh');
      expect(getChoiceDisplayLabel('Mesh', '')).toBe('Mesh');
    });

    it('displays the value alone when the label is the same', () => {
      expect(getChoiceDisplayLabel('Mesh', 'Mesh')).toBe('Mesh');
    });

    it('displays the label alone when it starts with the value', () => {
      expect(
        getChoiceDisplayLabel('Mesh', 'Mesh (works for Static only)')
      ).toBe('Mesh (works for Static only)');
    });

    it('displays both the value and the label when the label does not start with the value', () => {
      expect(getChoiceDisplayLabel('Mesh', 'Maillage')).toBe('Mesh — Maillage');
      expect(getChoiceDisplayLabel('Mesh', 'A mesh')).toBe('Mesh — A mesh');
    });
  });
});
