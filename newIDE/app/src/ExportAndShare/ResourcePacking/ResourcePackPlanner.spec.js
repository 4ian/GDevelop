// @flow
import {
  planResourcePacks,
  type PlannedPack,
  type ResourcePackPlan,
} from './ResourcePackPlanner';

const makeResource = (name: string, file: string, options: Object = {}) => ({
  name,
  file,
  kind: options.kind || 'image',
  metadata: options.metadata || '',
  userAdded: true,
});

const makeProjectData = ({
  resources,
  usedResources = [],
  objects = [],
  layouts = [],
  loadingScreenBackground = '',
}: Object) => ({
  properties: {
    loadingScreen: {
      backgroundImageResourceName: loadingScreenBackground,
    },
  },
  resources: { resources },
  usedResources: usedResources.map(name => ({ name })),
  objects,
  layouts,
});

const makeLayout = (
  name: string,
  usedResources: Array<string>,
  objects: Array<Object> = []
) => ({
  name,
  usedResources: usedResources.map(resourceName => ({ name: resourceName })),
  objects,
});

const getPackByName = (plan: ResourcePackPlan, name: string): ?PlannedPack =>
  plan.packs.find(pack => pack.name === name);

const getPackFilePaths = (
  plan: ResourcePackPlan,
  name: string
): Array<string> => {
  const pack = getPackByName(plan, name);
  if (!pack) throw new Error(`The plan has no pack named "${name}".`);
  return pack.filePaths;
};

const getPackIndex = (plan: ResourcePackPlan, name: string): number =>
  plan.packs.findIndex(pack => pack.name === name);

describe('ResourcePackPlanner', () => {
  it('puts project-level resources in the global pack and scene ones in their own pack', () => {
    const plan = planResourcePacks(
      makeProjectData({
        resources: [
          makeResource('shared', 'shared.png'),
          makeResource('menuBg', 'menu-bg.png'),
          makeResource('levelBg', 'level-bg.png'),
        ],
        usedResources: ['shared'],
        layouts: [
          makeLayout('Menu', ['menuBg']),
          makeLayout('Level', ['levelBg']),
        ],
      })
    );

    expect(getPackFilePaths(plan, 'resources.pak')).toEqual(['shared.png']);
    expect(getPackFilePaths(plan, 'scene-0.pak')).toEqual(['menu-bg.png']);
    expect(getPackFilePaths(plan, 'scene-1.pak')).toEqual(['level-bg.png']);

    expect(plan.fileToPackIndex['shared.png']).toBe(
      getPackIndex(plan, 'resources.pak')
    );
    expect(plan.fileToPackIndex['level-bg.png']).toBe(
      getPackIndex(plan, 'scene-1.pak')
    );
  });

  it('gives manually preloaded objects their own per-scene pack', () => {
    const plan = planResourcePacks(
      makeProjectData({
        resources: [
          makeResource('sceneImage', 'scene.png'),
          makeResource('heavyImage', 'heavy.png'),
        ],
        layouts: [
          makeLayout(
            'Level',
            ['sceneImage'],
            [
              { name: 'HeavyObject', usedResources: [{ name: 'heavyImage' }] },
              { name: 'NormalObject' },
            ]
          ),
        ],
      })
    );

    expect(getPackFilePaths(plan, 'scene-0.pak')).toEqual(['scene.png']);
    expect(getPackFilePaths(plan, 'scene-0-lazy.pak')).toEqual(['heavy.png']);
  });

  it('gives manually preloaded global objects their own pack', () => {
    const plan = planResourcePacks(
      makeProjectData({
        resources: [makeResource('heavyImage', 'heavy.png')],
        objects: [
          { name: 'GlobalHeavy', usedResources: [{ name: 'heavyImage' }] },
        ],
      })
    );

    expect(getPackFilePaths(plan, 'resources-lazy.pak')).toEqual(['heavy.png']);
  });

  it('marks only the global pack as needed at startup', () => {
    const plan = planResourcePacks(
      makeProjectData({
        resources: [
          makeResource('global', 'global.png'),
          makeResource('menu', 'menu.png'),
        ],
        usedResources: ['global'],
        layouts: [makeLayout('Menu', ['menu'])],
      })
    );

    expect(plan.packs.map(pack => [pack.name, pack.isLoadedAtStartup])).toEqual(
      [['resources.pak', true], ['scene-0.pak', false]]
    );
  });

  it('puts resources referenced by no scene in the global pack', () => {
    // Resources only reachable dynamically, for example a sound played by name
    // from an expression, are listed nowhere - they must not be dropped.
    const plan = planResourcePacks(
      makeProjectData({
        resources: [
          makeResource('menuBg', 'menu-bg.png'),
          makeResource('dynamicSound', 'dynamic.mp3', { kind: 'audio' }),
        ],
        layouts: [makeLayout('Menu', ['menuBg'])],
      })
    );

    expect(getPackFilePaths(plan, 'resources.pak')).toEqual(['dynamic.mp3']);
    expect(plan.fileToPackIndex['dynamic.mp3']).toBeDefined();
  });

  it('promotes a file used by several scenes to the global pack', () => {
    const plan = planResourcePacks(
      makeProjectData({
        resources: [
          makeResource('common', 'common.png'),
          makeResource('menuOnly', 'menu.png'),
        ],
        layouts: [
          makeLayout('Menu', ['common', 'menuOnly']),
          makeLayout('Level', ['common']),
        ],
      })
    );

    expect(getPackFilePaths(plan, 'resources.pak')).toEqual(['common.png']);
    expect(getPackFilePaths(plan, 'scene-0.pak')).toEqual(['menu.png']);
    // Scene 1 only used the promoted file, so it needs no pack of its own.
    expect(getPackByName(plan, 'scene-1.pak')).toBeUndefined();
  });

  it('keeps a spine skeleton, its atlas and its pages in the same pack', () => {
    const plan = planResourcePacks(
      makeProjectData({
        resources: [
          makeResource('hero', 'hero.json', {
            kind: 'spine',
            metadata: JSON.stringify({
              embeddedResourcesMapping: { 'hero.atlas': 'heroAtlas' },
            }),
          }),
          makeResource('heroAtlas', 'hero.atlas', {
            kind: 'atlas',
            metadata: JSON.stringify({
              embeddedResourcesMapping: { 'hero.png': 'heroPage' },
            }),
          }),
          makeResource('heroPage', 'hero.png'),
        ],
        layouts: [makeLayout('Level', ['hero'])],
      })
    );

    expect(getPackFilePaths(plan, 'scene-0.pak').sort()).toEqual([
      'hero.atlas',
      'hero.json',
      'hero.png',
    ]);
    expect(getPackByName(plan, 'resources.pak')).toBeUndefined();
  });

  it('does not choke on unparseable resource metadata', () => {
    const plan = planResourcePacks(
      makeProjectData({
        resources: [
          makeResource('image', 'image.png', { metadata: 'not json at all' }),
        ],
        usedResources: ['image'],
      })
    );

    expect(getPackFilePaths(plan, 'resources.pak')).toEqual(['image.png']);
  });

  it('leaves the loading screen background as an individual file', () => {
    const plan = planResourcePacks(
      makeProjectData({
        resources: [
          makeResource('splash', 'splash.png'),
          makeResource('other', 'other.png'),
        ],
        usedResources: ['splash', 'other'],
        loadingScreenBackground: 'splash',
      })
    );

    expect(plan.unpackedFilePaths).toEqual(['splash.png']);
    expect(getPackFilePaths(plan, 'resources.pak')).toEqual(['other.png']);
    expect(plan.fileToPackIndex['splash.png']).toBeUndefined();
  });

  it('leaves excluded resource kinds as individual files', () => {
    const plan = planResourcePacks(
      makeProjectData({
        resources: [
          makeResource('hero', 'hero.json', { kind: 'spine' }),
          makeResource('image', 'image.png'),
        ],
        usedResources: ['hero', 'image'],
      }),
      { excludedResourceKinds: ['spine', 'atlas'] }
    );

    expect(plan.unpackedFilePaths).toEqual(['hero.json']);
    expect(getPackFilePaths(plan, 'resources.pak')).toEqual(['image.png']);
  });

  it('never packs a resource that is still a URL', () => {
    const plan = planResourcePacks(
      makeProjectData({
        resources: [
          makeResource('remote', 'https://example.com/image.png'),
          makeResource('local', 'local.png'),
        ],
        usedResources: ['remote', 'local'],
      })
    );

    expect(plan.unpackedFilePaths).toEqual(['https://example.com/image.png']);
    expect(getPackFilePaths(plan, 'resources.pak')).toEqual(['local.png']);
  });

  it('stores a file shared by two resources only once', () => {
    const plan = planResourcePacks(
      makeProjectData({
        resources: [
          makeResource('smoothed', 'shared.png'),
          makeResource('pixelated', 'shared.png'),
        ],
        usedResources: ['smoothed', 'pixelated'],
      })
    );

    expect(getPackFilePaths(plan, 'resources.pak')).toEqual(['shared.png']);
  });

  it('ignores resources without a file, like the engine does', () => {
    const plan = planResourcePacks(
      makeProjectData({
        resources: [
          {
            name: 'broken',
            file: '',
            kind: 'image',
            metadata: '',
            userAdded: true,
          },
          makeResource('image', 'image.png'),
        ],
        usedResources: ['broken', 'image'],
      })
    );

    expect(getPackFilePaths(plan, 'resources.pak')).toEqual(['image.png']);
    expect(plan.unpackedFilePaths).toEqual([]);
  });

  it('merges the smallest packs to stay under the pack count limit', () => {
    const layoutCount = 20;
    const plan = planResourcePacks(
      makeProjectData({
        resources: Array.from({ length: layoutCount }, (_, index) =>
          makeResource(`image${index}`, `image${index}.png`)
        ),
        layouts: Array.from({ length: layoutCount }, (_, index) =>
          makeLayout(`Scene${index}`, [`image${index}`])
        ),
      }),
      { maxPackCount: 5 }
    );

    expect(plan.packs.length).toBeLessThanOrEqual(5);
    // No resource may be lost when merging.
    const packedFiles: Array<string> = [];
    plan.packs.forEach(pack => packedFiles.push(...pack.filePaths));
    expect(packedFiles.sort()).toEqual(
      Array.from(
        { length: layoutCount },
        (_, index) => `image${index}.png`
      ).sort()
    );
    packedFiles.forEach(file => {
      expect(plan.fileToPackIndex[file]).toBeDefined();
    });
  });

  it('handles a project without any resource', () => {
    const plan = planResourcePacks(
      makeProjectData({ resources: [], layouts: [makeLayout('Menu', [])] })
    );

    expect(plan.packs).toEqual([]);
    expect(plan.fileToPackIndex).toEqual({});
    expect(plan.unpackedFilePaths).toEqual([]);
  });
});
