// @flow
import { normalizeFolderName } from './FolderNameDialog';

describe('FolderNameDialog', () => {
  it('normalizes folder names for safe local creation', () => {
    expect(normalizeFolderName('  Art  ')).toBe('Art');
    expect(normalizeFolderName('Level/One')).toBe('Level-One');
    expect(normalizeFolderName('Bad<>:"\\|?*Name')).toBe('Bad--------Name');
    expect(normalizeFolderName('   ')).toBe('');
  });
});
