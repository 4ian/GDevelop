// @flow
import {
  getBreakingChanges,
  formatBreakingChanges,
} from './ExtensionCompatibilityChecker';
import {
  buttonV2ExtensionShortHeader,
  breakingButtonV3ExtensionShortHeader,
  breakingButtonV31ExtensionShortHeader,
} from '../../fixtures/GDevelopServicesTestData';
import semverGreaterThan from 'semver/functions/gt';

describe('ExtensionCompatibilityChecker', () => {
  describe('getBreakingChanges', () => {
    it('can report empty breaking changes', () => {
      expect(getBreakingChanges('1.0.0', buttonV2ExtensionShortHeader)).toEqual(
        []
      );
    });

    it('can report breaking changes', () => {
      expect(
        getBreakingChanges('1.0.0', breakingButtonV3ExtensionShortHeader)
      ).toEqual([{ version: '3.0.0', changes: '- Breaking reason' }]);
    });

    it('can compare version', () => {
      expect(semverGreaterThan('3.0.0', '1.0.0')).toBe(true);
    });

    it('can exclude older breaking changes', () => {
      expect(
        getBreakingChanges('3.0.0', breakingButtonV31ExtensionShortHeader)
      ).toEqual([]);
    });
  });

  describe('formatBreakingChanges', () => {
    it('can report breaking changes', () => {
      const breakingChanges = new Map<ExtensionShortHeader, sting>();
      breakingChanges.set(breakingButtonV3ExtensionShortHeader, [
        {
          version: '3.0.0',
          changes:
            '- The extension has breaking changes. It needs the following adaptations:\n  - first do this\n  - then this',
        },
      ]);
      expect(formatBreakingChanges(breakingChanges)).toEqual(
        `- Button
  - The extension has breaking changes. It needs the following adaptations:
    - first do this
    - then this
`
      );
    });
  });
});
