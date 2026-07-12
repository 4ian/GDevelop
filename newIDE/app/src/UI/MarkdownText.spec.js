// @flow
import { interpolateMessageDescriptorValues } from './MarkdownText';

describe('interpolateMessageDescriptorValues', () => {
  it('replaces descriptor placeholders left in untranslated fallback strings', () => {
    expect(
      interpolateMessageDescriptorValues(
        'This moves the current branch back to {commitShortHash}.',
        {
          id: 'This moves the current branch back to {commitShortHash}.',
          values: {
            commitShortHash: 'c72ef33',
          },
        }
      )
    ).toBe('This moves the current branch back to c72ef33.');
  });

  it('keeps translated strings without matching placeholders unchanged', () => {
    expect(
      interpolateMessageDescriptorValues('Reset to this commit.', {
        id: 'Reset to this commit.',
        values: {
          commitShortHash: 'c72ef33',
        },
      })
    ).toBe('Reset to this commit.');
  });

  it('interpolates numeric placeholders without treating braces as a regular expression quantifier', () => {
    expect(
      interpolateMessageDescriptorValues('Rename {0} to {1}.', {
        id: 'Rename {0} to {1}.',
        values: {
          0: 'OldPrefab',
          1: 'NewPrefab',
        },
      })
    ).toBe('Rename OldPrefab to NewPrefab.');
  });
});
