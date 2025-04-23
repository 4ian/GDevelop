// @flow
import { getTabsToDisplay } from './HomePageMenu';
import { isNativeMobileApp } from '../../../Utils/Platform';
import { limitsForStudentUser } from '../../../fixtures/GDevelopServicesTestData';

jest.mock('../../../Utils/Platform');
const mockFn = (fn: Function): JestMockFn<any, any> => fn;

describe('HomePageMenu', () => {
  describe('getTabsToDisplay', () => {
    beforeEach(() => {
      mockFn(isNativeMobileApp).mockReset();
    });

    test('Default desktop user', () => {
      mockFn(isNativeMobileApp).mockReturnValue(false);

      const tabs = getTabsToDisplay({ limits: null });

      expect(tabs.map(tab => tab.tab)).toEqual([
        'learn',
        'create',
        'play',
        'shop',
        'team-view',
      ]);
    });

    test('Desktop user student', () => {
      mockFn(isNativeMobileApp).mockReturnValue(false);

      const tabs = getTabsToDisplay({
        limits: limitsForStudentUser,
      });

      expect(tabs.map(tab => tab.tab)).toEqual(['learn', 'create']);
    });

    test('Default mobile user', () => {
      mockFn(isNativeMobileApp).mockReturnValue(true);

      const tabs = getTabsToDisplay({ limits: null });

      expect(tabs.map(tab => tab.tab)).toEqual([
        'learn',
        'create',
        'play',
        'shop',
      ]);
    });

    test('Mobile student user', () => {
      mockFn(isNativeMobileApp).mockReturnValue(true);

      const tabs = getTabsToDisplay({ limits: limitsForStudentUser });

      expect(tabs.map(tab => tab.tab)).toEqual(['learn', 'create']);
    });
  });
});
