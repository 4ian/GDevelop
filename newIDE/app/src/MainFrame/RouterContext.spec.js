// @flow
import * as React from 'react';
import renderer, { act } from 'react-test-renderer';
import RouterContext, { RouterContextProvider } from './RouterContext';
import Window from '../Utils/Window';

jest.mock('../Utils/Window', () => ({
  __esModule: true,
  default: {
    getArguments: jest.fn(() => ({})),
    removeArguments: jest.fn(),
    addArguments: jest.fn(),
  },
}));

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

let currentRouterContext = null;

const TestConsumer = () => {
  currentRouterContext = React.useContext(RouterContext);
  return null;
};

describe('RouterContextProvider', () => {
  beforeEach(() => {
    currentRouterContext = null;
    mockFn(Window.getArguments).mockReset();
    mockFn(Window.removeArguments).mockReset();
    mockFn(Window.addArguments).mockReset();
  });

  test('navigateToRoute clears stale route arguments before setting new route', () => {
    mockFn(Window.getArguments).mockReturnValue({
      'initial-dialog': 'play',
      'game-id': 'old-game-id',
      'asset-pack': 'old-pack',
      'playable-game-id': 'old-playable-id',
    });

    act(() => {
      renderer.create(
        <RouterContextProvider>
          <TestConsumer />
        </RouterContextProvider>
      );
    });

    expect(currentRouterContext).not.toBeNull();

    act(() => {
      currentRouterContext.navigateToRoute('store', {
        'asset-pack': 'product-new',
      });
    });

    expect(mockFn(Window.removeArguments)).toHaveBeenCalledTimes(1);
    expect(mockFn(Window.removeArguments).mock.calls[0][0]).toEqual(
      expect.arrayContaining([
        'initial-dialog',
        'game-id',
        'games-dashboard-tab',
        'asset-pack',
        'game-template',
        'bundle',
        'bundle-category',
        'tutorial-id',
        'course-id',
        'create-from-example',
        'recommended-plan-id',
        'playable-game-id',
        'purchase-id',
        'claimable-token',
        'coupon-code',
      ])
    );
    expect(mockFn(Window.addArguments)).toHaveBeenCalledWith({
      'asset-pack': 'product-new',
      'initial-dialog': 'store',
    });

    expect(currentRouterContext.routeArguments).toEqual({
      'asset-pack': 'product-new',
      'initial-dialog': 'store',
    });
  });

  test('navigateToRoute without additional arguments keeps only the new route', () => {
    mockFn(Window.getArguments).mockReturnValue({
      'initial-dialog': 'learn',
      bundle: 'old-bundle',
      'coupon-code': 'OLDCODE',
    });

    act(() => {
      renderer.create(
        <RouterContextProvider>
          <TestConsumer />
        </RouterContextProvider>
      );
    });

    expect(currentRouterContext).not.toBeNull();

    act(() => {
      currentRouterContext.navigateToRoute('create');
    });

    expect(currentRouterContext.routeArguments).toEqual({
      'initial-dialog': 'create',
    });
    expect(mockFn(Window.addArguments)).toHaveBeenCalledWith({
      'initial-dialog': 'create',
    });
  });
});
