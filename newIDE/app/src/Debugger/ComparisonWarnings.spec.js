// @flow
import { getComparisonWarningKinds } from './ComparisonWarnings';

const baselineMetadata: any = {
  projectName: 'My game',
  ideVersion: '5.5.0',
  userAgent: 'Some browser',
};

describe('getComparisonWarningKinds', () => {
  it('warns about nothing for a long reference of the same setup', () => {
    expect(
      getComparisonWarningKinds({
        baselineMetadata,
        selectedProjectName: 'My game',
        baselineFramesCount: 1000,
        ideVersion: '5.5.0',
        userAgent: 'Some browser',
      })
    ).toEqual([]);
  });

  it('warns about everything that differs', () => {
    expect(
      getComparisonWarningKinds({
        baselineMetadata,
        selectedProjectName: 'Another game',
        baselineFramesCount: 10,
        ideVersion: '5.6.0',
        userAgent: 'Another browser',
      })
    ).toEqual([
      'other-project',
      'ide-version',
      'user-agent',
      'short-reference',
    ]);
  });

  it('only warns about the length of a reference recorded in this editor', () => {
    expect(
      getComparisonWarningKinds({
        baselineMetadata: null,
        selectedProjectName: 'My game',
        baselineFramesCount: 10,
        ideVersion: '5.5.0',
        userAgent: 'Some browser',
      })
    ).toEqual(['short-reference']);
  });
});
