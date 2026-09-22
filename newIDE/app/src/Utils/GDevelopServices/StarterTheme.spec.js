// @flow
import axios from 'axios';

jest.mock('axios');
// $FlowFixMe[method-unbinding]
const mockedAxiosGet: any = axios.get;

const themedTankUrl =
  'https://resources.gdevelop-app.com/examples/starting-3d-tank/starting-3d-tank.theme-pirate.json';

const mockThemedStarters = (themes: Array<Object>) => {
  mockedAxiosGet.mockResolvedValue({ data: { version: 1, themes } });
};

// The list of themed starters is kept for the session: load the module anew
// for each test.
const loadGetThemedStarterProjectFileUrl = () => {
  let getThemedStarterProjectFileUrl;
  jest.isolateModules(() => {
    getThemedStarterProjectFileUrl = require('./StarterTheme')
      .getThemedStarterProjectFileUrl;
  });
  if (!getThemedStarterProjectFileUrl) throw new Error('Module not loaded.');
  return getThemedStarterProjectFileUrl;
};

describe('getThemedStarterProjectFileUrl', () => {
  beforeEach(() => {
    mockedAxiosGet.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('gives the URL of the themed copy of the starter', async () => {
    mockThemedStarters([
      {
        id: 'pirate',
        name: 'Pirate islands',
        description: '',
        starters: { 'starting-3d-tank': themedTankUrl },
      },
    ]);

    expect(
      await loadGetThemedStarterProjectFileUrl()({
        starterSlug: 'starting-3d-tank',
        themeId: 'pirate',
        environment: 'live',
      })
    ).toBe(themedTankUrl);
  });

  it('reads the themed starters of the requested environment', async () => {
    mockThemedStarters([]);

    await loadGetThemedStarterProjectFileUrl()({
      starterSlug: 'starting-3d-tank',
      themeId: 'pirate',
      environment: 'staging',
    });

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      'https://resources.gdevelop-app.com/staging/examples-database/themedStarters.json'
    );
  });

  it('gives nothing for a theme that does not exist', async () => {
    mockThemedStarters([]);

    expect(
      await loadGetThemedStarterProjectFileUrl()({
        starterSlug: 'starting-3d-tank',
        themeId: 'pirate',
        environment: 'live',
      })
    ).toBeNull();
  });

  it('gives nothing for a starter the theme does not cover', async () => {
    mockThemedStarters([
      {
        id: 'pirate',
        name: 'Pirate islands',
        description: '',
        starters: { 'starting-3d-top-down-rpg': themedTankUrl },
      },
    ]);

    expect(
      await loadGetThemedStarterProjectFileUrl()({
        starterSlug: 'starting-platformer',
        themeId: 'pirate',
        environment: 'live',
      })
    ).toBeNull();
  });

  it('gives nothing when the themed starters cannot be read', async () => {
    mockedAxiosGet.mockRejectedValue(new Error('Network error'));

    expect(
      await loadGetThemedStarterProjectFileUrl()({
        starterSlug: 'starting-3d-tank',
        themeId: 'pirate',
        environment: 'live',
      })
    ).toBeNull();
  });
});
