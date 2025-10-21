// @flow
import {
  getBreakingChanges,
  formatExtensionsBreakingChanges,
  formatOldBreakingChanges,
  type ExtensionChange,
} from './ExtensionCompatibilityChecker';
import {
  buttonV2ExtensionShortHeader,
  breakingButtonV3ExtensionShortHeader,
  breakingButtonV31ExtensionShortHeader,
} from '../../fixtures/GDevelopServicesTestData';
import { type ExtensionShortHeader } from '../GDevelopServices/Extension';

describe('ExtensionCompatibilityChecker', () => {
  describe('getBreakingChanges', () => {
    it('can report empty breaking changes', () => {
      expect(getBreakingChanges('1.0.0', buttonV2ExtensionShortHeader)).toEqual(
        []
      );
    });

    it('can report breaking changes', () => {
      expect(getBreakingChanges('1.0.0', breakingButtonV3ExtensionShortHeader))
        .toMatchInlineSnapshot(`
        Array [
          Object {
            "changes": "- The extension has breaking changes. It needs the following adaptations:
          - first do this
          - then this",
            "version": "3.0.0",
          },
        ]
      `);
    });

    it('can exclude older breaking changes', () => {
      expect(
        getBreakingChanges('3.0.0', breakingButtonV31ExtensionShortHeader)
      ).toEqual([]);
    });
  });

  describe('formatExtensionsBreakingChanges', () => {
    it('can format breaking changes', () => {
      const breakingChanges = new Map<
        ExtensionShortHeader,
        Array<ExtensionChange>
      >();
      breakingChanges.set(breakingButtonV3ExtensionShortHeader, [
        {
          version: '3.0.0',
          changes:
            '- The extension has breaking changes. It needs the following adaptations:\n  - first do this\n  - then this',
        },
      ]);
      expect(formatExtensionsBreakingChanges(breakingChanges))
        .toMatchInlineSnapshot(`
        "- Button
          - The extension has breaking changes. It needs the following adaptations:
            - first do this
            - then this
        "
      `);
    });
  });

  describe('formatOldExtensionsBreakingChanges', () => {
    it('can format no longer relevant breaking changes history', () => {
      expect(
        formatOldBreakingChanges('3.0.0', breakingButtonV3ExtensionShortHeader)
      ).toMatchInlineSnapshot(`
        "- 3.0.0
          - The extension has breaking changes. It needs the following adaptations:
            - first do this
            - then this
        "
      `);
    });
  });
});
