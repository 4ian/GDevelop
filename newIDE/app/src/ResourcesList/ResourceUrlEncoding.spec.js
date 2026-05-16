// @flow
import path from 'path';
import { pathToFileURL } from 'url';
import { getLocalResourceFullPath } from './ResourceUtils';
import ResourcesLoader from '../ResourcesLoader';
import optionalRequire from '../Utils/OptionalRequire';

jest.mock('../Utils/OptionalRequire');
jest.mock('../Utils/CrossOrigin', () => ({
  addGDevelopResourceTokenIfRequired: url => url,
}));

describe('ResourceUrlEncoding', () => {
  it('encodes hashes in local resource urls and decodes them back', () => {
    const project = {
      ptr: 1,
      getProjectFile: () => 'E:\\GDevelop\\Game\\game.json',
      getResourcesManager: () => ({
        hasResource: () => true,
        getResource: () => ({
          getFile: () => 'Weekend Jam #1/Parts/hero.png',
        }),
      }),
    };

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
});
