// @flow
import {
  addAssetToProject,
  addSerializedExtensionsToProject,
  getRequiredExtensionsFromAsset,
  downloadExtensions,
  filterMissingExtensions,
  sanitizeObjectName,
  installPublicAsset,
} from './InstallAsset';
import { makeTestProject } from '../fixtures/TestProject';
import { type EventsFunctionsExtensionsState } from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import {
  fakeAssetShortHeader1,
  fakeAsset1,
  fakePixelArtAsset1,
  fakeAssetWithBehaviorCustomizations1,
  fakeAssetWithUnknownBehaviorCustomizations1,
  fakeAssetWithFlashBehaviorCustomizations1,
  flashExtensionShortHeader,
  fireBulletExtensionShortHeader,
  fakeAssetWithCustomObject,
} from '../fixtures/GDevelopServicesTestData';
import { makeTestExtensions } from '../fixtures/TestExtensions';
import {
  getExtensionsRegistry,
  getExtension,
} from '../Utils/GDevelopServices/Extension';
import * as Asset from '../Utils/GDevelopServices/Asset';
const gd: libGDevelop = global.gd;

jest.mock('../Utils/GDevelopServices/Extension');

// $FlowFixMe - overriding method to do a mocked network call.
Asset.getPublicAsset = jest.fn();

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

describe('InstallAsset', () => {
  test('sanitizeObjectName', () => {
    expect(sanitizeObjectName('')).toBe('UnnamedObject');
    expect(sanitizeObjectName('HelloWorld')).toBe('HelloWorld');
    expect(sanitizeObjectName('Hello World')).toBe('HelloWorld');
    expect(sanitizeObjectName('hello world')).toBe('HelloWorld');
    expect(sanitizeObjectName('hello world12')).toBe('HelloWorld12');
    expect(sanitizeObjectName('12 hello world')).toBe('_12HelloWorld');
    expect(sanitizeObjectName('/-=hello/-=world/-=')).toBe('HelloWorld');
    expect(sanitizeObjectName('  hello/-=world/-=')).toBe('HelloWorld');
    expect(sanitizeObjectName('9hello/-=world/-=')).toBe('_9helloWorld');
    expect(sanitizeObjectName('  9hello/-=world/-=')).toBe('_9helloWorld');
  });

  describe('addAssetToProject', () => {
    it('installs an object asset in the project, without renaming it if not needed', async () => {
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      const output = await addAssetToProject({
        project,
        objectsContainer: layout,
        asset: fakeAsset1,
      });

      expect(output.createdObjects).toHaveLength(1);
      expect(layout.hasObjectNamed('PlayerSpaceship')).toBe(true);
      expect(output.createdObjects).toEqual([
        layout.getObject('PlayerSpaceship'),
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
      layout.insertNewObject(project, 'Sprite', 'PlayerSpaceship', 0);

      const output = await addAssetToProject({
        project,
        objectsContainer: layout,
        asset: fakeAsset1,
      });

      expect(output.createdObjects).toHaveLength(1);
      expect(layout.hasObjectNamed('PlayerSpaceship')).toBe(true);
      expect(layout.hasObjectNamed('PlayerSpaceship2')).toBe(true);
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
        objectsContainer: layout,
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
        objectsContainer: layout,
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
        objectsContainer: layout,
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
      expect(layout.hasObjectNamed('PlayerSpaceship')).toBe(true);
      const object = layout.getObject('PlayerSpaceship');

      const resourcesInUse = new gd.ResourcesInUseHelper();
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
        objectsContainer: layout,
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
        objectsContainer: layout,
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
        objectsContainer: layout,
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

    it('installs an object asset in the project, adding the required behaviors', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      await addAssetToProject({
        project,
        objectsContainer: layout,
        asset: fakeAssetWithBehaviorCustomizations1,
      });

      expect(layout.hasObjectNamed('PlayerSpaceship')).toBe(true);
      expect(
        layout
          .getObject('PlayerSpaceship')
          .getAllBehaviorNames()
          .toJSArray()
      ).toEqual(['MyBehavior']);
      expect(
        layout
          .getObject('PlayerSpaceship')
          .getBehavior('MyBehavior')
          .getTypeName()
      ).toBe('FakeBehavior::FakeBehavior');

      // Check that the properties from customization were set.
      expect(
        layout
          .getObject('PlayerSpaceship')
          .getBehavior('MyBehavior')
          .getProperties()
          .get('property1')
          .getValue()
      ).toBe('Overridden value');
      expect(
        layout
          .getObject('PlayerSpaceship')
          .getBehavior('MyBehavior')
          .getProperties()
          .get('property2')
          .getValue()
      ).toBe('true');
    });
  });

  describe('getRequiredBehaviorsFromAsset', () => {
    it('get the required extension for behaviors in an asset', () => {
      expect(
        getRequiredExtensionsFromAsset(fakeAssetWithBehaviorCustomizations1)
      ).toEqual([
        {
          extensionName: 'FakeBehavior',
          extensionVersion: '1.0.0',
        },
      ]);
    });

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

  describe('filterMissingExtensions', () => {
    it('filters extensions that are not loaded ', () => {
      makeTestExtensions(gd);

      expect(
        filterMissingExtensions(gd, [
          // An unknown behavior not loaded:
          {
            extensionName: 'NotExistingExtension',
            extensionVersion: '1.0.0',
          },
          // A fake extension loaded in makeTestExtensions:
          {
            extensionName: 'FakeBehavior',
            extensionVersion: '1.0.0',
          },
        ])
      ).toEqual([
        {
          extensionName: 'NotExistingExtension',
          extensionVersion: '1.0.0',
        },
      ]);
    });
  });

  describe('downloadExtensions', () => {
    it('loads the required extensions ', async () => {
      mockFn(getExtensionsRegistry).mockImplementationOnce(() => ({
        version: '1.0.0',
        allTags: [''],
        allCategories: [''],
        extensionShortHeaders: [
          flashExtensionShortHeader,
          fireBulletExtensionShortHeader,
        ],
      }));

      mockFn(getExtension).mockImplementationOnce(
        () => fireBulletExtensionShortHeader
      );

      await expect(downloadExtensions(['FireBullet'])).resolves.toEqual([
        fireBulletExtensionShortHeader,
      ]);
    });

    it('errors if an extension is not found ', async () => {
      mockFn(getExtensionsRegistry).mockImplementationOnce(() => ({
        version: '1.0.0',
        allTags: [''],
        allCategories: [''],
        extensionShortHeaders: [
          flashExtensionShortHeader,
          fireBulletExtensionShortHeader,
        ],
      }));

      await expect(
        downloadExtensions(['NotFoundExtension'])
      ).rejects.toMatchObject({
        message: 'Unable to find extension NotFoundExtension in the registry.',
      });
    });

    it("errors if the registry can't be loaded ", async () => {
      mockFn(getExtensionsRegistry).mockImplementationOnce(() => {
        throw new Error('Fake error');
      });

      await expect(downloadExtensions(['FakeExtension'])).rejects.toMatchObject(
        { message: 'Fake error' }
      );
    });
  });

  describe('addSerializedExtensionsToProject', () => {
    const mockEventsFunctionsExtensionsState: EventsFunctionsExtensionsState = {
      eventsFunctionsExtensionsError: null,
      loadProjectEventsFunctionsExtensions: () => Promise.resolve(),
      unloadProjectEventsFunctionsExtensions: () => {},
      reloadProjectEventsFunctionsExtensions: () => Promise.resolve(),
      unloadProjectEventsFunctionsExtension: () => {},
      getEventsFunctionsExtensionWriter: () => null,
      getEventsFunctionsExtensionOpener: () => null,
      ensureLoadFinished: () => Promise.resolve(),
      getIncludeFileHashs: () => ({}),
    };

    const serializedExtension = { name: 'ExtensionName' };

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
      unloadProjectEventsFunctionsExtension: () => {},
      getEventsFunctionsExtensionWriter: () => null,
      getEventsFunctionsExtensionOpener: () => null,
      ensureLoadFinished: () => Promise.resolve(),
      getIncludeFileHashs: () => ({}),
    };

    it("throws if asset can't be downloaded", async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);
      mockFn(Asset.getPublicAsset).mockImplementationOnce(() => {
        throw new Error('Fake error - unable to download');
      });

      await expect(
        installPublicAsset({
          assetShortHeader: fakeAssetShortHeader1,
          project,
          objectsContainer: layout,
          eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
          environment: 'live',
        })
      ).rejects.toMatchObject({
        message: 'Fake error - unable to download',
      });

      expect(getExtensionsRegistry).not.toHaveBeenCalled();
      expect(getExtension).not.toHaveBeenCalled();
    });

    it("throws if an extension for a behavior can't be found in the registry", async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      // Get an asset that uses a behavior...
      mockFn(Asset.getPublicAsset).mockImplementationOnce(
        () => fakeAssetWithUnknownBehaviorCustomizations1
      );

      // ...but this behavior extension does not exist in the registry
      mockFn(getExtensionsRegistry).mockImplementationOnce(() => ({
        version: '1.0.0',
        allTags: [''],
        allCategories: [''],
        extensionShortHeaders: [
          flashExtensionShortHeader,
          fireBulletExtensionShortHeader,
        ],
      }));

      // Check that the extension is stated as not found in the registry
      await expect(
        installPublicAsset({
          assetShortHeader: fakeAssetShortHeader1,
          project,
          objectsContainer: layout,
          eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
          environment: 'live',
        })
      ).rejects.toMatchObject({
        message: 'Unable to find extension UnknownBehavior in the registry.',
      });

      expect(getExtensionsRegistry).toHaveBeenCalledTimes(1);
      expect(getExtension).not.toHaveBeenCalled();
    });

    it("throws if a behavior can't be installed, even if its extension was properly found in the registry", async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      // Get an asset that uses a behavior...
      mockFn(Asset.getPublicAsset).mockImplementationOnce(
        () => fakeAssetWithFlashBehaviorCustomizations1
      );

      // ...and this behavior extension is in the registry
      mockFn(getExtensionsRegistry).mockImplementationOnce(() => ({
        version: '1.0.0',
        allTags: [''],
        allCategories: [''],
        extensionShortHeaders: [
          flashExtensionShortHeader,
          fireBulletExtensionShortHeader,
        ],
      }));

      mockFn(getExtension).mockImplementationOnce(
        () => flashExtensionShortHeader
      );

      // Verify that, because we use `mockEventsFunctionsExtensionsState`, the
      // extension won't be loaded, so the behavior won't be installed.
      await expect(
        installPublicAsset({
          assetShortHeader: fakeAssetShortHeader1,
          project,
          objectsContainer: layout,
          eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
          environment: 'live',
        })
      ).rejects.toMatchObject({
        message: 'These extensions could not be installed: Flash',
      });

      expect(getExtensionsRegistry).toHaveBeenCalledTimes(1);
      expect(getExtension).toHaveBeenCalledTimes(1);
    });

    it('install an asset, with a behavior that is already installed', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      // Fake an asset with a behavior of type "FakeBehavior::FakeBehavior",
      // that is installed already.
      mockFn(Asset.getPublicAsset).mockImplementationOnce(
        () => fakeAssetWithBehaviorCustomizations1
      );

      // Install the asset
      await installPublicAsset({
        assetShortHeader: fakeAssetShortHeader1,
        project,
        objectsContainer: layout,
        eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
        environment: 'live',
      });

      // No extensions fetched because the behavior is already installed.
      expect(getExtension).not.toHaveBeenCalled();
      expect(getExtensionsRegistry).not.toHaveBeenCalled();

      // Check that the object was created, with the proper behavior:
      expect(layout.getObjectsCount()).toBe(1);
      expect(layout.getObjectAt(0).getName()).toBe('PlayerSpaceship');
      expect(
        layout
          .getObjectAt(0)
          .getAllBehaviorNames()
          .toJSArray()
      ).toEqual(['MyBehavior']);
    });

    // TODO EBO Add a test for a custom object that contains another custom objet.
    // There are 2 cases:
    // - an event-based object from the same extension (this should already work).
    // - an event-based object from another extension (this won't work because
    //   it needs extension dependencies).

    it('install an asset, with an event-based object that is already installed', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      // Fake an asset with a custom object of type "Button::PanelSpriteButton",
      // that is installed already.
      mockFn(Asset.getAsset).mockImplementationOnce(
        () => fakeAssetWithCustomObject
      );

      // Install the asset
      await installAsset({
        assetShortHeader: fakeAssetShortHeader1,
        project,
        objectsContainer: layout,
        eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
        environment: 'live',
      });

      // No extensions fetched because the behavior is already installed.
      expect(getExtension).not.toHaveBeenCalled();
      expect(getExtensionsRegistry).not.toHaveBeenCalled();

      // Check that the object was created, with the proper behavior:
      expect(layout.getObjectsCount()).toBe(1);
      expect(layout.getObjectAt(0).getName()).toBe('YellowButton');
      expect(layout.getObjectAt(0).getType()).toEqual(
        'Button::PanelSpriteButton'
      );
    });
  });
});
