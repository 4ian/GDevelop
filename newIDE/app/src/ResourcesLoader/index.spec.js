// @flow
import ResourcesLoader from './index';

jest.mock('../Utils/OptionalRequire');

describe('ResourcesLoader', () => {
  let dateNowSpy;

  beforeEach(() => {
    ResourcesLoader.burstAllUrlsCache();
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1234);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  test('encodes hash characters in local file URLs before adding cache parameters', () => {
    const project: any = {
      ptr: 1,
      getProjectFile: () => '/project/Game Jam #1/game.json',
    };

    const resolvedUrl = ResourcesLoader.getFullUrl(
      project,
      'Parts/hero #1.png',
      {}
    );

    expect(resolvedUrl).toBe(
      'file:///project/Game%20Jam%20%231/Parts/hero%20%231.png?cache=1234'
    );
  });
});
