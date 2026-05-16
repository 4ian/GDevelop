// @flow
import path from 'path';
import { pathToFileURL } from 'url';
import { getLocalResourceFullPath } from './ResourceUtils';
import ResourcesLoader from '../ResourcesLoader';

jest.mock('../Utils/OptionalRequire');
jest.mock('../Utils/CrossOrigin', () => ({
  addGDevelopResourceTokenIfRequired: url => url,
}));

describe('ResourceUrlEncoding', () => {
  let dateNowSpy;

  const makeProject = ptr => ({
    ptr,
    getProjectFile: () => 'E:\\GDevelop\\Game\\game.json',
    getResourcesManager: () => ({
      hasResource: () => true,
      getResource: () => ({
        getFile: () => 'Weekend Jam #1/Parts/hero.png',
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

  it('encodes hashes in local resource urls and decodes them back', () => {
    const project = makeProject(1);

    const fullUrl = ResourcesLoader.getResourceFullUrl(
      project,
      'Weekend Jam #1/Parts/hero.png',
      { disableCacheBurst: true }
    );

    expect(fullUrl).toContain('%23');
    expect(fullUrl).toBe(
      pathToFileURL(
        path.resolve('E:\\GDevelop\\Game', 'Weekend Jam #1/Parts/hero.png')
      ).toString()
    );
    expect(
      getLocalResourceFullPath(project, 'Weekend Jam #1/Parts/hero.png')
    ).toBe(path.resolve('E:\\GDevelop\\Game', 'Weekend Jam #1/Parts/hero.png'));
  });

  it('adds cache busting after the encoded local resource url', () => {
    const project = makeProject(2);

    const fullUrl = ResourcesLoader.getResourceFullUrl(
      project,
      'Weekend Jam #1/Parts/hero.png',
      {}
    );

    expect(fullUrl).toBe(
      pathToFileURL(
        path.resolve('E:\\GDevelop\\Game', 'Weekend Jam #1/Parts/hero.png')
      ).toString() + '?cache=1234'
    );
  });
});
