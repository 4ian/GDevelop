// @flow
import ResourcesLoader from '../ResourcesLoader';

jest.mock('../Utils/OptionalRequire');
jest.mock('../Utils/CrossOrigin', () => ({
  addGDevelopResourceTokenIfRequired: url => url,
}));

describe('ResourceUrlEncoding', () => {
  let dateNowSpy;

  const makeProject = (ptr: number): any => ({
    ptr,
    getProjectFile: () => 'E:\\GDevelop\\Weekend Jam #1\\game.json',
    getResourcesManager: () => ({
      hasResource: () => true,
      getResource: () => ({
        getFile: () => 'Parts/hero #1.png',
      }),
    }),
  });

  beforeEach(() => {
    ResourcesLoader.burstAllUrlsCache();
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1234);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  it('encodes hashes in local resource urls', () => {
    const project = makeProject(1);

    const fullUrl = ResourcesLoader.getResourceFullUrl(
      project,
      'Parts/hero #1.png',
      { disableCacheBurst: true }
    );

    expect(fullUrl).toContain('%23');
    expect(fullUrl).not.toContain('#');
    expect(fullUrl).not.toContain('?cache=');
  });

  it('adds cache busting after the encoded local resource url', () => {
    const project = makeProject(2);

    const fullUrl = ResourcesLoader.getResourceFullUrl(
      project,
      'Parts/hero #1.png',
      {}
    );

    expect(fullUrl).toContain('%23');
    expect(fullUrl).not.toContain('#');
    expect(fullUrl).toContain('?cache=1234');
    expect(fullUrl.indexOf('%23')).toBeLessThan(fullUrl.indexOf('?cache=1234'));
  });
});
