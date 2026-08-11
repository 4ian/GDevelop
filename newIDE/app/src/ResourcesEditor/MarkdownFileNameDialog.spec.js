// @flow
import { normalizeMarkdownBaseName } from './MarkdownFileNameDialog';

describe('MarkdownFileNameDialog', () => {
  it('normalizes Markdown input as a base file name only', () => {
    expect(normalizeMarkdownBaseName('  notes  ')).toBe('notes');
    expect(normalizeMarkdownBaseName('notes.md')).toBe('notes');
    expect(normalizeMarkdownBaseName('notes.markdown')).toBe('notes');
    expect(normalizeMarkdownBaseName('docs/intro')).toBe('docs-intro');
    expect(normalizeMarkdownBaseName('   ')).toBe('');
  });
});
