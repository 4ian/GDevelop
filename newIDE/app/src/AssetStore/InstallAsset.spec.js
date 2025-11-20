// @flow
import {
  addAssetToProject,
  getRequiredExtensionsFromAsset,
  installPublicAsset,
  checkRequiredExtensionsUpdateForAssets,
} from './InstallAsset';
import {
  addSerializedExtensionsToProject,
  installRequiredExtensions,
  checkRequiredExtensionsUpdate,
} from './ExtensionStore/InstallExtension';
import { makeTestProject } from '../fixtures/TestProject';
import { type EventsFunctionsExtensionsState } from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import {
  fakeAsset1,
  fakePixelArtAsset1,
  fakeAssetWithUnknownExtension1,
  fakeAssetWithFlashExtensionDependency1,
  flashExtensionShortHeader,
  incompatibleFlashExtensionShortHeader,
  fireBulletExtensionShortHeader,
  fakeAssetWithCustomObject,
  buttonV1ExtensionShortHeader,
  buttonV2ExtensionShortHeader,
  breakingButtonV3ExtensionShortHeader,
  incompatibleButtonV4ExtensionShortHeader,
} from '../fixtures/GDevelopServicesTestData';
import { makeTestExtensions } from '../fixtures/TestExtensions';
import {
  getExtensionsRegistry,
  getExtension,
  type ExtensionShortHeader,
  type SerializedExtension,
} from '../Utils/GDevelopServices/Extension';
import * as Asset from '../Utils/GDevelopServices/Asset';

const gd: libGDevelop = global.gd;

jest.mock('../Utils/GDevelopServices/Extension');

// $FlowFixMe - overriding method to do a mocked network call.
Asset.getPublicAsset = jest.fn();

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

describe('InstallAsset', () => {
  describe('addAssetToProject', () => {
    it('installs an object asset in the project, without renaming it if not needed', async () => {
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      const output = await addAssetToProject({
        project,
        objectsContainer: layout.getObjects(),
        asset: fakeAsset1,
      });

      expect(output.createdObjects).toHaveLength(1);
      expect(layout.getObjects().hasObjectNamed('PlayerSpaceship')).toBe(true);
      expect(output.createdObjects).toEqual([
        layout.getObjects().getObject('PlayerSpaceship'),
      ]);
      expect(
        project.getResourcesManager().hasResource('player-ship1.png')
      ).toBe(true);
      expect(
        project.getResourcesManager().hasResource('player-ship2.png')
      ).toBe(true);
    });

    it('renames the object if name is already used', async () => {
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);
      layout
        .getObjects()
        .insertNewObject(project, 'Sprite', 'PlayerSpaceship', 0);

      const output = await addAssetToProject({
        project,
        objectsContainer: layout.getObjects(),
        asset: fakeAsset1,
      });

      expect(output.createdObjects).toHaveLength(1);
      expect(layout.getObjects().hasObjectNamed('PlayerSpaceship')).toBe(true);
      expect(layout.getObjects().hasObjectNamed('PlayerSpaceship2')).toBe(true);
      expect(
        project.getResourcesManager().hasResource('player-ship1.png')
      ).toBe(true);
      expect(
        project.getResourcesManager().hasResource('player-ship2.png')
      ).toBe(true);
    });

    it('does not add a resource if it is already existing', async () => {
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      const originalResourceNames = project
        .getResourcesManager()
        .getAllResourceNames()
        .toJSArray();

      // Create a resource that is the same as the one added for the spaceship
      const resource = new gd.ImageResource();
      resource.setName('player-ship1.png');
      resource.setFile('https://example.com/player-ship1.png');
      resource.setOrigin(
        'gdevelop-asset-store',
        'https://example.com/player-ship1.png'
      );
      project.getResourcesManager().addResource(resource);
      resource.delete();

      // Install the spaceship
      await addAssetToProject({
        project,
        objectsContainer: layout.getObjects(),
        asset: fakeAsset1,
      });

      // Verify there was not extra resource added.
      expect(
        project
          .getResourcesManager()
          .getAllResourceNames()
          .toJSArray()
      ).toEqual([
        ...originalResourceNames,
        'player-ship1.png',
        'player-ship2.png',
      ]);
    });

    it('does not add a resource if it is already existing, even if changed but origin is the same', async () => {
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      const originalResourceNames = project
        .getResourcesManager()
        .getAllResourceNames()
        .toJSArray();

      // Create a resource that is originally the same as the one of the spaceship (same origin),
      // but which was modified (file is different, name is different)
      const resource = new gd.ImageResource();
      resource.setName('renamed-player-ship1.png');
      resource.setFile('https://example.com/modified-player-ship.png');
      resource.setOrigin(
        'gdevelop-asset-store',
        'https://example.com/player-ship1.png'
      );
      project.getResourcesManager().addResource(resource);
      resource.delete();

      // Install the spaceship
      await addAssetToProject({
        project,
        objectsContainer: layout.getObjects(),
        asset: fakeAsset1,
      });

      // Verify there was not extra resource added.
      expect(
        project
          .getResourcesManager()
          .getAllResourceNames()
          .toJSArray()
      ).toEqual([
        ...originalResourceNames,
        'renamed-player-ship1.png',
        'player-ship2.png',
      ]);
    });

    it('add a resource with a new name, if this name is already taken by another', async () => {
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      const originalResourceNames = project
        .getResourcesManager()
        .getAllResourceNames()
        .toJSArray();

      // Create a resource that is NOT the same as the one added for the spaceship
      // but has the same name.
      const resource = new gd.ImageResource();
      resource.setName('player-ship1.png');
      resource.setFile('https://example.com/some-unrelated-file.png');
      resource.setOrigin('some-origin', 'some-unrelated-identifier');
      project.getResourcesManager().addResource(resource);
      resource.delete();

      // Install the spaceship
      await addAssetToProject({
        project,
        objectsContainer: layout.getObjects(),
        asset: fakeAsset1,
      });

      // Verify there was not extra resource added
      expect(
        project
          .getResourcesManager()
          .getAllResourceNames()
          .toJSArray()
      ).toEqual([
        ...originalResourceNames,
        'player-ship1.png',
        'player-ship1.png2',
        'player-ship2.png',
      ]);
      expect(
        project
          .getResourcesManager()
          .getResource('player-ship1.png2')
          .getFile()
      ).toBe('https://example.com/player-ship1.png');

      // Verify the resource names used by the object
      expect(layout.getObjects().hasObjectNamed('PlayerSpaceship')).toBe(true);
      const object = layout.getObjects().getObject('PlayerSpaceship');

      const resourcesInUse = new gd.ResourcesInUseHelper(
        project.getResourcesManager()
      );
      object.getConfiguration().exposeResources(resourcesInUse);
      const objectResourceNames = resourcesInUse
        .getAllImages()
        .toNewVectorString()
        .toJSArray();
      resourcesInUse.delete();

      expect(objectResourceNames).toEqual([
        'player-ship1.png2',
        'player-ship2.png',
      ]);
    });

    it('installs an object asset in the project, smoothing the resources by default', async () => {
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      await addAssetToProject({
        project,
        objectsContainer: layout.getObjects(),
        asset: fakeAsset1,
      });

      expect(
        project.getResourcesManager().hasResource('player-ship1.png')
      ).toBe(true);
      expect(
        project.getResourcesManager().hasResource('player-ship2.png')
      ).toBe(true);

      expect(
        gd
          .asImageResource(
            project.getResourcesManager().getResource('player-ship1.png')
          )
          .isSmooth()
      ).toBe(true);
      expect(
        gd
          .asImageResource(
            project.getResourcesManager().getResource('player-ship2.png')
          )
          .isSmooth()
      ).toBe(true);
    });

    it('installs an object asset in the project, unsmoothing the resources if the asset is pixel art', async () => {
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      await addAssetToProject({
        project,
        objectsContainer: layout.getObjects(),
        asset: fakePixelArtAsset1,
      });

      expect(
        project.getResourcesManager().hasResource('player-ship1.png')
      ).toBe(true);
      expect(
        project.getResourcesManager().hasResource('player-ship2.png')
      ).toBe(true);
      expect(
        gd
          .asImageResource(
            project.getResourcesManager().getResource('player-ship1.png')
          )
          .isSmooth()
      ).toBe(false);
      expect(
        gd
          .asImageResource(
            project.getResourcesManager().getResource('player-ship2.png')
          )
          .isSmooth()
      ).toBe(false);
    });

    it('installs an object asset in the project, unsmoothing the resources if the project is pixel art', async () => {
      const { project } = makeTestProject(gd);
      project.setScaleMode('nearest');
      const layout = project.insertNewLayout('MyTestLayout', 0);

      await addAssetToProject({
        project,
        objectsContainer: layout.getObjects(),
        asset: fakeAsset1,
      });

      expect(
        project.getResourcesManager().hasResource('player-ship1.png')
      ).toBe(true);
      expect(
        project.getResourcesManager().hasResource('player-ship2.png')
      ).toBe(true);
      expect(
        gd
          .asImageResource(
            project.getResourcesManager().getResource('player-ship1.png')
          )
          .isSmooth()
      ).toBe(false);
      expect(
        gd
          .asImageResource(
            project.getResourcesManager().getResource('player-ship2.png')
          )
          .isSmooth()
      ).toBe(false);
    });
  });

  describe('getRequiredExtensionsFromAsset', () => {
    it('get the required extensions for custom objects in an asset', () => {
      expect(getRequiredExtensionsFromAsset(fakeAssetWithCustomObject)).toEqual(
        [
          {
            extensionName: 'Button',
            extensionVersion: '1.0.0',
          },
        ]
      );
    });
  });

  const emptyExtensionShortHeader: ExtensionShortHeader = {
    tier: 'reviewed',
    shortDescription: '',
    authorIds: [],
    extensionNamespace: '',
    fullName: '',
    name: 'NotExistingExtension',
    version: '1.0.0',
    url: '',
    headerUrl: '',
    tags: [],
    category: '',
    previewIconUrl: '',
    eventsBasedBehaviorsCount: 0,
    eventsFunctionsCount: 0,
    helpPath: '',
  };

  // TODO Find a way to test this

  // describe('fetchAssets', () => {
  //   it("throws if asset can't be downloaded", async () => {
  //     mockFn(Asset.getPublicAsset).mockImplementationOnce(() => {
  //       throw new Error('Fake error - unable to download');
  //     });

  //     const fetchAssets = useFetchAssets();
  //     await expect(fetchAssets([fakeAssetShortHeader1])).rejects.toMatchObject({
  //       message: 'Fake error - unable to download',
  //     });

  //     expect(getExtensionsRegistry).not.toHaveBeenCalled();
  //     expect(getExtension).not.toHaveBeenCalled();
  //   });
  // });

  const createExtensionRegistry = (
    ...extensionShortHeaders: Array<ExtensionShortHeader>
  ) => {
    const extensionShortHeadersByName: {
      [name: string]: ExtensionShortHeader,
    } = {};
    for (const extensionShortHeader of extensionShortHeaders) {
      extensionShortHeadersByName[
        extensionShortHeader.name
      ] = extensionShortHeader;
    }
    return extensionShortHeadersByName;
  };

  describe('checkRequiredExtensionsUpdate', () => {
    it('can find an extension to install', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('Flash')).toBe(false);

      // The extension is in the registry.
      const extensionShortHeadersByName = createExtensionRegistry(
        fireBulletExtensionShortHeader,
        flashExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdate({
          requiredExtensions: [
            {
              extensionName: flashExtensionShortHeader.name,
              extensionVersion: flashExtensionShortHeader.version,
            },
          ],
          project,
          extensionShortHeadersByName,
        })
      ).resolves.toEqual({
        requiredExtensionShortHeaders: [flashExtensionShortHeader],
        missingExtensionShortHeaders: [flashExtensionShortHeader],
        outOfDateExtensionShortHeaders: [],
        breakingChangesExtensionShortHeaders: [],
        incompatibleWithIdeExtensionShortHeaders: [],
        safeToUpdateExtensions: [],
        isGDevelopUpdateNeeded: false,
      });
    });

    it('can find an up to date extension from the project', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('Button')).toBe(true);

      // The extension is in the registry.
      const extensionShortHeadersByName = createExtensionRegistry(
        buttonV1ExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdate({
          requiredExtensions: [
            {
              extensionName: buttonV1ExtensionShortHeader.name,
              extensionVersion: buttonV1ExtensionShortHeader.version,
            },
          ],
          project,
          extensionShortHeadersByName,
        })
      ).resolves.toEqual({
        requiredExtensionShortHeaders: [buttonV1ExtensionShortHeader],
        missingExtensionShortHeaders: [],
        outOfDateExtensionShortHeaders: [],
        breakingChangesExtensionShortHeaders: [],
        incompatibleWithIdeExtensionShortHeaders: [],
        safeToUpdateExtensions: [],
        isGDevelopUpdateNeeded: false,
      });
    });

    it('can find an extension to update', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('Button')).toBe(true);

      // The extension is in the registry.
      const extensionShortHeadersByName = createExtensionRegistry(
        buttonV2ExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdate({
          requiredExtensions: [
            {
              extensionName: buttonV2ExtensionShortHeader.name,
              extensionVersion: buttonV2ExtensionShortHeader.version,
            },
          ],
          project,
          extensionShortHeadersByName,
        })
      ).resolves.toEqual({
        requiredExtensionShortHeaders: [buttonV2ExtensionShortHeader],
        missingExtensionShortHeaders: [],
        outOfDateExtensionShortHeaders: [buttonV2ExtensionShortHeader],
        breakingChangesExtensionShortHeaders: [],
        incompatibleWithIdeExtensionShortHeaders: [],
        safeToUpdateExtensions: [buttonV2ExtensionShortHeader],
        isGDevelopUpdateNeeded: false,
      });
    });

    it('can find an extension to update with breaking changes', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('Button')).toBe(true);

      // The extension is in the registry.
      const extensionShortHeadersByName = createExtensionRegistry(
        breakingButtonV3ExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdate({
          requiredExtensions: [
            {
              extensionName: breakingButtonV3ExtensionShortHeader.name,
              extensionVersion: breakingButtonV3ExtensionShortHeader.version,
            },
          ],
          project,
          extensionShortHeadersByName,
        })
      ).resolves.toEqual({
        requiredExtensionShortHeaders: [breakingButtonV3ExtensionShortHeader],
        missingExtensionShortHeaders: [],
        outOfDateExtensionShortHeaders: [breakingButtonV3ExtensionShortHeader],
        breakingChangesExtensionShortHeaders: [
          breakingButtonV3ExtensionShortHeader,
        ],
        incompatibleWithIdeExtensionShortHeaders: [],
        safeToUpdateExtensions: [],
        isGDevelopUpdateNeeded: false,
      });
    });

    it('can find an extension to update incompatible with the editor', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('Button')).toBe(true);

      // The extension is in the registry.
      const extensionShortHeadersByName = createExtensionRegistry(
        incompatibleButtonV4ExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdate({
          requiredExtensions: [
            {
              extensionName: incompatibleButtonV4ExtensionShortHeader.name,
              extensionVersion:
                incompatibleButtonV4ExtensionShortHeader.version,
            },
          ],
          project,
          extensionShortHeadersByName,
        })
      ).resolves.toEqual({
        requiredExtensionShortHeaders: [
          incompatibleButtonV4ExtensionShortHeader,
        ],
        missingExtensionShortHeaders: [],
        outOfDateExtensionShortHeaders: [
          incompatibleButtonV4ExtensionShortHeader,
        ],
        breakingChangesExtensionShortHeaders: [],
        incompatibleWithIdeExtensionShortHeaders: [
          incompatibleButtonV4ExtensionShortHeader,
        ],
        safeToUpdateExtensions: [],
        isGDevelopUpdateNeeded: false,
      });
    });

    it('can find an extension to install incompatible with the editor', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('Flash')).toBe(false);

      // The extension is in the registry.
      const extensionShortHeadersByName = createExtensionRegistry(
        incompatibleFlashExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdate({
          requiredExtensions: [
            {
              extensionName: incompatibleFlashExtensionShortHeader.name,
              extensionVersion: incompatibleFlashExtensionShortHeader.version,
            },
          ],
          project,
          extensionShortHeadersByName,
        })
      ).resolves.toEqual({
        requiredExtensionShortHeaders: [incompatibleFlashExtensionShortHeader],
        missingExtensionShortHeaders: [incompatibleFlashExtensionShortHeader],
        outOfDateExtensionShortHeaders: [],
        breakingChangesExtensionShortHeaders: [],
        incompatibleWithIdeExtensionShortHeaders: [
          incompatibleFlashExtensionShortHeader,
        ],
        safeToUpdateExtensions: [],
        isGDevelopUpdateNeeded: true,
      });
    });

    it('errors if an extension is not found in the registry', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);

      const extensionShortHeadersByName = createExtensionRegistry(
        flashExtensionShortHeader,
        fireBulletExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdate({
          requiredExtensions: [
            {
              extensionName: 'UnknownExtension',
              extensionVersion: '1.0.0',
            },
          ],
          project,
          extensionShortHeadersByName,
        })
      ).rejects.toMatchObject({
        message: 'Unable to find extension UnknownExtension in the registry.',
      });
    });
  });

  describe('checkRequiredExtensionsUpdateForAssets', () => {
    it('can find an extension to install', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('Flash')).toBe(false);

      // Get an asset that uses an extension...
      mockFn(Asset.getPublicAsset).mockImplementationOnce(
        () => fakeAssetWithFlashExtensionDependency1
      );

      // ...and this extension is in the registry
      const extensionShortHeadersByName = createExtensionRegistry(
        flashExtensionShortHeader,
        fireBulletExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdateForAssets({
          assets: [
            fakeAssetWithFlashExtensionDependency1,
            fakeAssetWithFlashExtensionDependency1,
          ],
          project,
          extensionShortHeadersByName,
        })
      ).resolves.toEqual({
        requiredExtensionShortHeaders: [flashExtensionShortHeader],
        missingExtensionShortHeaders: [flashExtensionShortHeader],
        outOfDateExtensionShortHeaders: [],
        breakingChangesExtensionShortHeaders: [],
        incompatibleWithIdeExtensionShortHeaders: [],
        safeToUpdateExtensions: [],
        isGDevelopUpdateNeeded: false,
      });
    });

    it('can find an up to date extension from the project', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('Button')).toBe(true);

      // Get an asset that uses an extension...
      mockFn(Asset.getPublicAsset).mockImplementationOnce(
        () => fakeAssetWithCustomObject
      );

      // ...and this extension is in the registry
      const extensionShortHeadersByName = createExtensionRegistry(
        flashExtensionShortHeader,
        fireBulletExtensionShortHeader,
        // The project contains the 1.0.0 of this extension.
        buttonV1ExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdateForAssets({
          assets: [fakeAssetWithCustomObject, fakeAssetWithCustomObject],
          project,
          extensionShortHeadersByName,
        })
      ).resolves.toEqual({
        requiredExtensionShortHeaders: [buttonV1ExtensionShortHeader],
        missingExtensionShortHeaders: [],
        outOfDateExtensionShortHeaders: [],
        breakingChangesExtensionShortHeaders: [],
        incompatibleWithIdeExtensionShortHeaders: [],
        safeToUpdateExtensions: [],
        isGDevelopUpdateNeeded: false,
      });
    });

    it('can find an extension to update', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('Button')).toBe(true);

      // Get an asset that uses an extension...
      mockFn(Asset.getPublicAsset).mockImplementationOnce(
        () => fakeAssetWithCustomObject
      );

      // ...and this extension is in the registry
      const extensionShortHeadersByName = createExtensionRegistry(
        flashExtensionShortHeader,
        fireBulletExtensionShortHeader,
        // The project contains the 1.0.0 of this extension.
        buttonV2ExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdateForAssets({
          assets: [fakeAssetWithCustomObject, fakeAssetWithCustomObject],
          project,
          extensionShortHeadersByName,
        })
      ).resolves.toEqual({
        requiredExtensionShortHeaders: [buttonV2ExtensionShortHeader],
        missingExtensionShortHeaders: [],
        outOfDateExtensionShortHeaders: [buttonV2ExtensionShortHeader],
        breakingChangesExtensionShortHeaders: [],
        incompatibleWithIdeExtensionShortHeaders: [],
        safeToUpdateExtensions: [buttonV2ExtensionShortHeader],
        isGDevelopUpdateNeeded: false,
      });
    });

    it('can find an extension to update with breaking changes', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('Button')).toBe(true);

      // Get an asset that uses an extension...
      mockFn(Asset.getPublicAsset).mockImplementationOnce(
        () => fakeAssetWithCustomObject
      );

      // ...and this extension is in the registry
      const extensionShortHeadersByName = createExtensionRegistry(
        flashExtensionShortHeader,
        fireBulletExtensionShortHeader,
        // The project contains the 1.0.0 of this extension.
        breakingButtonV3ExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdateForAssets({
          assets: [fakeAssetWithCustomObject, fakeAssetWithCustomObject],
          project,
          extensionShortHeadersByName,
        })
      ).resolves.toEqual({
        requiredExtensionShortHeaders: [breakingButtonV3ExtensionShortHeader],
        missingExtensionShortHeaders: [],
        outOfDateExtensionShortHeaders: [breakingButtonV3ExtensionShortHeader],
        breakingChangesExtensionShortHeaders: [
          breakingButtonV3ExtensionShortHeader,
        ],
        incompatibleWithIdeExtensionShortHeaders: [],
        safeToUpdateExtensions: [],
        isGDevelopUpdateNeeded: false,
      });
    });

    it('can find an extension to update incompatible with the editor', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('Button')).toBe(true);

      // Get an asset that uses an extension...
      mockFn(Asset.getPublicAsset).mockImplementationOnce(
        () => fakeAssetWithCustomObject
      );

      // ...and this extension is in the registry
      const extensionShortHeadersByName = createExtensionRegistry(
        flashExtensionShortHeader,
        fireBulletExtensionShortHeader,
        // The project contains the 1.0.0 of this extension.
        incompatibleButtonV4ExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdateForAssets({
          assets: [fakeAssetWithCustomObject, fakeAssetWithCustomObject],
          project,
          extensionShortHeadersByName,
        })
      ).resolves.toEqual({
        requiredExtensionShortHeaders: [
          incompatibleButtonV4ExtensionShortHeader,
        ],
        missingExtensionShortHeaders: [],
        outOfDateExtensionShortHeaders: [
          incompatibleButtonV4ExtensionShortHeader,
        ],
        breakingChangesExtensionShortHeaders: [],
        incompatibleWithIdeExtensionShortHeaders: [
          incompatibleButtonV4ExtensionShortHeader,
        ],
        safeToUpdateExtensions: [],
        isGDevelopUpdateNeeded: true,
      });
    });

    it('can find an extension to install incompatible with the editor', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('Flash')).toBe(false);

      // Get an asset that uses an extension...
      mockFn(Asset.getPublicAsset).mockImplementationOnce(
        () => fakeAssetWithFlashExtensionDependency1
      );

      // ...and this extension is in the registry
      const extensionShortHeadersByName = createExtensionRegistry(
        incompatibleFlashExtensionShortHeader,
        fireBulletExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdateForAssets({
          assets: [
            fakeAssetWithFlashExtensionDependency1,
            fakeAssetWithFlashExtensionDependency1,
          ],
          project,
          extensionShortHeadersByName,
        })
      ).resolves.toEqual({
        requiredExtensionShortHeaders: [incompatibleFlashExtensionShortHeader],
        missingExtensionShortHeaders: [incompatibleFlashExtensionShortHeader],
        outOfDateExtensionShortHeaders: [],
        breakingChangesExtensionShortHeaders: [],
        incompatibleWithIdeExtensionShortHeaders: [
          incompatibleFlashExtensionShortHeader,
        ],
        safeToUpdateExtensions: [],
        isGDevelopUpdateNeeded: true,
      });
    });

    it('errors if an extension is not found in the registry', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);

      const extensionShortHeadersByName = createExtensionRegistry(
        flashExtensionShortHeader,
        fireBulletExtensionShortHeader
      );

      await expect(
        checkRequiredExtensionsUpdateForAssets({
          assets: [fakeAssetWithUnknownExtension1],
          project,
          extensionShortHeadersByName,
        })
      ).rejects.toMatchObject({
        message: 'Unable to find extension UnknownExtension in the registry.',
      });
    });
  });

  describe('addSerializedExtensionsToProject', () => {
    const mockEventsFunctionsExtensionsState: EventsFunctionsExtensionsState = {
      eventsFunctionsExtensionsError: null,
      loadProjectEventsFunctionsExtensions: () => Promise.resolve(),
      unloadProjectEventsFunctionsExtensions: () => {},
      reloadProjectEventsFunctionsExtensions: () => Promise.resolve(),
      reloadProjectEventsFunctionsExtensionMetadata: () => {},
      unloadProjectEventsFunctionsExtension: () => {},
      getEventsFunctionsExtensionWriter: () => null,
      getEventsFunctionsExtensionOpener: () => null,
      ensureLoadFinished: () => Promise.resolve(),
      getIncludeFileHashs: () => ({}),
    };

    const serializedExtension: SerializedExtension = { name: 'ExtensionName' };

    it('adds an extension with origin set if it comes from the store', () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      addSerializedExtensionsToProject(
        mockEventsFunctionsExtensionsState,
        project,
        [serializedExtension]
      );

      expect(
        project.hasEventsFunctionsExtensionNamed(serializedExtension.name)
      ).toBe(true);
      expect(
        project
          .getEventsFunctionsExtension(serializedExtension.name)
          .getOriginName()
      ).toEqual('gdevelop-extension-store');
      expect(
        project
          .getEventsFunctionsExtension(serializedExtension.name)
          .getOriginIdentifier()
      ).toEqual(serializedExtension.name);
    });

    it("adds an extension with origin not set if it doesn't come from the store", () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      addSerializedExtensionsToProject(
        mockEventsFunctionsExtensionsState,
        project,
        [serializedExtension],
        false
      );

      expect(
        project.hasEventsFunctionsExtensionNamed(serializedExtension.name)
      ).toBe(true);
      expect(
        project
          .getEventsFunctionsExtension(serializedExtension.name)
          .getOriginName()
      ).toEqual('');
      expect(
        project
          .getEventsFunctionsExtension(serializedExtension.name)
          .getOriginIdentifier()
      ).toEqual('');
    });
  });

  describe('installAsset', () => {
    beforeEach(() => {
      mockFn(Asset.getPublicAsset).mockReset();
      mockFn(getExtensionsRegistry).mockReset();
      mockFn(getExtension).mockReset();
    });

    const mockEventsFunctionsExtensionsState: EventsFunctionsExtensionsState = {
      eventsFunctionsExtensionsError: null,
      loadProjectEventsFunctionsExtensions: () => Promise.resolve(),
      unloadProjectEventsFunctionsExtensions: () => {},
      reloadProjectEventsFunctionsExtensions: () => Promise.resolve(),
      reloadProjectEventsFunctionsExtensionMetadata: () => {},
      unloadProjectEventsFunctionsExtension: () => {},
      getEventsFunctionsExtensionWriter: () => null,
      getEventsFunctionsExtensionOpener: () => null,
      ensureLoadFinished: () => Promise.resolve(),
      getIncludeFileHashs: () => ({}),
    };

    it('loads the required extensions ', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('FireBullet')).toBe(
        false
      );

      mockFn(getExtensionsRegistry).mockImplementationOnce(() => ({
        version: '1.0.0',
        headers: [flashExtensionShortHeader, fireBulletExtensionShortHeader],
      }));

      mockFn(getExtension).mockImplementationOnce(
        () => fireBulletExtensionShortHeader
      );

      // Install the extension
      await expect(
        installRequiredExtensions({
          requiredExtensionInstallation: {
            requiredExtensionShortHeaders: [
              {
                ...emptyExtensionShortHeader,
                name: 'FireBullet',
                version: '1.0.0',
              },
            ],
            missingExtensionShortHeaders: [
              {
                ...emptyExtensionShortHeader,
                name: 'FireBullet',
                version: '1.0.0',
              },
            ],
            outOfDateExtensionShortHeaders: [],
            breakingChangesExtensionShortHeaders: [],
            incompatibleWithIdeExtensionShortHeaders: [],
            safeToUpdateExtensions: [],
            isGDevelopUpdateNeeded: false,
          },
          shouldUpdateExtension: true,
          eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
          project,
          onWillInstallExtension: () => {},
          onExtensionInstalled: () => {},
          importedSerializedExtensions: [],
        })
      ).rejects.toMatchObject({
        // It's just because the mock doesn't reloadProjectEventsFunctionsExtensions.
        message: 'These extensions could not be installed: FireBullet',
      });

      expect(getExtension).toHaveBeenCalledTimes(1);
      expect(project.hasEventsFunctionsExtensionNamed('FireBullet')).toBe(true);
    });

    it("throws if an extension can't be installed, even if its extension was properly found in the registry", async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);

      mockFn(getExtension).mockImplementationOnce(
        () => flashExtensionShortHeader
      );

      // Verify that, because we use `mockEventsFunctionsExtensionsState`, the
      // extension won't be loaded.
      await expect(
        installRequiredExtensions({
          // An asset that uses an extension
          requiredExtensionInstallation: {
            requiredExtensionShortHeaders: [flashExtensionShortHeader],
            missingExtensionShortHeaders: [flashExtensionShortHeader],
            outOfDateExtensionShortHeaders: [],
            breakingChangesExtensionShortHeaders: [],
            incompatibleWithIdeExtensionShortHeaders: [],
            safeToUpdateExtensions: [],
            isGDevelopUpdateNeeded: false,
          },
          shouldUpdateExtension: true,
          eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
          project,
          onWillInstallExtension: () => {},
          onExtensionInstalled: () => {},
          importedSerializedExtensions: [],
        })
      ).rejects.toMatchObject({
        message: 'These extensions could not be installed: Flash',
      });

      expect(getExtension).toHaveBeenCalledTimes(1);
    });

    // TODO EBO Add a test for a custom object that contains another custom objet.
    // There are 2 cases:
    // - an event-based object from the same extension (this should already work).
    // - an event-based object from another extension (this won't work because
    //   it needs extension dependencies).

    it('install an asset with an event-based object that is already installed', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      expect(project.hasEventsFunctionsExtensionNamed('Button')).toBe(true);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      // Install the extension
      await installRequiredExtensions({
        requiredExtensionInstallation: {
          requiredExtensionShortHeaders: [
            {
              ...emptyExtensionShortHeader,
              name: 'Button',
              version: '1.0.0',
            },
          ],
          missingExtensionShortHeaders: [],
          outOfDateExtensionShortHeaders: [],
          breakingChangesExtensionShortHeaders: [],
          incompatibleWithIdeExtensionShortHeaders: [],
          safeToUpdateExtensions: [],
          isGDevelopUpdateNeeded: false,
        },
        shouldUpdateExtension: true,
        eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
        project,
        onWillInstallExtension: () => {},
        onExtensionInstalled: () => {},
        importedSerializedExtensions: [],
      });

      // No extensions fetched because the extension is already installed.
      expect(getExtension).not.toHaveBeenCalled();

      // Install the asset
      await installPublicAsset({
        // Fake an asset with a custom object of type "Button::PanelSpriteButton",
        // that is installed already.
        asset: fakeAssetWithCustomObject,
        project,
        objectsContainer: layout.getObjects(),
      });

      // Check that the object was created.
      expect(layout.getObjects().getObjectsCount()).toBe(1);
      expect(
        layout
          .getObjects()
          .getObjectAt(0)
          .getName()
      ).toBe('YellowButton');
      expect(
        layout
          .getObjects()
          .getObjectAt(0)
          .getType()
      ).toEqual('Button::PanelSpriteButton');
    });
  });
});
