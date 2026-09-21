// @flow
import ResourcesLoader from '.';
const gd: libGDevelop = global.gd;

jest.mock('../Utils/OptionalRequire');

describe('ResourcesLoader', () => {
  let project;
  beforeEach(() => {
    project = gd.ProjectHelper.createNewGDJSProject();
    project.setProjectFile('/home/user/My Project/game.json');
    const resource = new gd.ImageResource();
    resource.setName('Sprite #1');
    resource.setFile('assets/Sprite #1 (100%).png');
    project.getResourcesManager().addResource(resource);
    const urlResource = new gd.ImageResource();
    urlResource.setName('Remote');
    urlResource.setFile('https://example.com/a%23b.png');
    project.getResourcesManager().addResource(urlResource);
    ResourcesLoader.burstAllUrlsCache();
  });
  afterEach(() => {
    project.delete();
  });

  it('gives a file URL with special characters encoded for a local resource', () => {
    expect(
      ResourcesLoader.getResourceFullUrl(project, 'Sprite #1', {
        disableCacheBurst: true,
      })
    ).toBe('file:///home/user/My Project/assets/Sprite %231 (100%25).png');
  });

  it('keeps adding a cache bursting parameter to local file URLs', () => {
    const url = ResourcesLoader.getResourceFullUrl(project, 'Sprite #1', {});
    expect(url).toMatch(
      /^file:\/\/\/home\/user\/My Project\/assets\/Sprite %231 \(100%25\)\.png\?cache=\d+$/
    );
    // The same URL is given until the cache is burst.
    expect(ResourcesLoader.getResourceFullUrl(project, 'Sprite #1', {})).toBe(
      url
    );
    ResourcesLoader.burstAllUrlsCache();
    expect(
      ResourcesLoader.getResourceFullUrl(project, 'Sprite #1', {})
    ).toMatch(/\?cache=\d+$/);
  });

  it('leaves URL resources untouched', () => {
    expect(
      ResourcesLoader.getResourceFullUrl(project, 'Remote', {
        disableCacheBurst: true,
      })
    ).toBe('https://example.com/a%23b.png');
  });
});
