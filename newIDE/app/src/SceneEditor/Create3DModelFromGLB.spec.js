// @noflow
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  add3DModelFileToProjectResources,
  create3DModelObjectFromGLBFile,
  get3DModelFilePathsFromDataTransfer,
  getSupported3DModelFilePaths,
} from './Create3DModelFromGLB';
import {
  clearActiveProjectFileDragPath,
  projectFileDragDataMimeType,
  setActiveProjectFileDragPath,
} from '../Utils/ProjectFileDragData';

const gd = global.gd;
const scene3DExtensionModule = require('../../../../Extensions/3D/JsExtension');

const makeProjectInTempFolder = () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'gdevelop-glb-drop-'));
  const project = gd.ProjectHelper.createNewGDJSProject();
  project.setProjectFile(path.join(folder, 'game.json'));
  return { folder, project };
};

describe('Create3DModelFromGLB', () => {
  const getSceneEditorSource = () =>
    fs
      .readFileSync(path.join(__dirname, 'index.js'), 'utf8')
      .replace(/\r\n/g, '\n');
  const getEmbeddedGameFrameSource = () =>
    fs
      .readFileSync(
        path.join(__dirname, '..', 'EmbeddedGame', 'EmbeddedGameFrame.js'),
        'utf8'
      )
      .replace(/\r\n/g, '\n');
  const getDebuggerClientSource = () =>
    fs
      .readFileSync(
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          '..',
          'GDJS',
          'Runtime',
          'debugger-client',
          'abstract-debugger-client.ts'
        ),
        'utf8'
      )
      .replace(/\r\n/g, '\n');
  const getResourceLoaderSource = () =>
    fs
      .readFileSync(
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          '..',
          'GDJS',
          'Runtime',
          'ResourceLoader.ts'
        ),
        'utf8'
      )
      .replace(/\r\n/g, '\n');
  const getPixiImageManagerSource = () =>
    fs
      .readFileSync(
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          '..',
          'GDJS',
          'Runtime',
          'pixi-renderers',
          'pixi-image-manager.ts'
        ),
        'utf8'
      )
      .replace(/\r\n/g, '\n');
  const getModel3DManagerSource = () =>
    fs
      .readFileSync(
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          '..',
          'GDJS',
          'Runtime',
          'Model3DManager.ts'
        ),
        'utf8'
      )
      .replace(/\r\n/g, '\n');
  const getPhysics3DJsExtensionSource = () =>
    fs
      .readFileSync(
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          '..',
          'Extensions',
          'Physics3DBehavior',
          'JsExtension.js'
        ),
        'utf8'
      )
      .replace(/\r\n/g, '\n');

  beforeAll(() => {
    const translate = message => message;
    const extension = scene3DExtensionModule.createExtension(translate, gd);
    gd.JsPlatform.get().addNewExtension(extension);
  });

  test('keeps only supported 3D model file paths', () => {
    expect(
      getSupported3DModelFilePaths([
        'hero.glb',
        'enemy.GLB',
        'notes.txt',
        'scene.gltf',
        '',
        'image.png',
      ])
    ).toEqual(['hero.glb', 'enemy.GLB']);
  });

  test('adds a dropped GLB file to project resources', async () => {
    const { folder, project } = makeProjectInTempFolder();
    const sourceFile = path.join(folder, 'Crate.glb');
    fs.writeFileSync(sourceFile, Buffer.from('fake glb bytes'));

    const resourceName = await add3DModelFileToProjectResources({
      project,
      modelFilePath: sourceFile,
    });

    expect(resourceName).toBe('assets/Crate.glb');
    expect(project.getResourcesManager().hasResource(resourceName)).toBe(true);
    expect(fs.existsSync(path.join(folder, 'assets', 'Crate.glb'))).toBe(true);
  });

  test('creates a 3D model resource and object using the GLB', async () => {
    const { folder, project } = makeProjectInTempFolder();
    const sourceFile = path.join(folder, 'Hero Ship.glb');
    fs.writeFileSync(sourceFile, Buffer.from('fake glb bytes'));
    const scene = project.insertNewLayout('Scene', 0);

    const object = await create3DModelObjectFromGLBFile({
      project,
      objectsContainer: scene.getObjects(),
      modelFilePath: sourceFile,
    });

    expect(object.getName()).toBe('Hero_Ship');
    expect(object.getType()).toBe('Scene3D::Model3DObject');
    expect(
      project.getResourcesManager().hasResource('assets/Hero Ship.glb')
    ).toBe(true);
    const resource = project
      .getResourcesManager()
      .getResource('assets/Hero Ship.glb');
    expect(resource.getKind()).toBe('model3D');
    expect(resource.getFile()).toBe('assets/Hero Ship.glb');
    expect(fs.existsSync(path.join(folder, 'assets', 'Hero Ship.glb'))).toBe(
      true
    );
    expect(
      gd
        .asModel3DConfiguration(object.getConfiguration())
        .getModelResourceName()
    ).toBe('assets/Hero Ship.glb');
  });

  test('creates unique resource and object names', async () => {
    const { folder, project } = makeProjectInTempFolder();
    const sourceFile = path.join(folder, 'Hero.glb');
    fs.writeFileSync(sourceFile, Buffer.from('fake glb bytes'));
    const scene = project.insertNewLayout('Scene', 0);

    await create3DModelObjectFromGLBFile({
      project,
      objectsContainer: scene.getObjects(),
      modelFilePath: sourceFile,
    });
    const secondObject = await create3DModelObjectFromGLBFile({
      project,
      objectsContainer: scene.getObjects(),
      modelFilePath: sourceFile,
    });

    expect(secondObject.getName()).toBe('Hero2');
    expect(project.getResourcesManager().hasResource('assets/Hero2.glb')).toBe(
      true
    );
  });

  test('extracts supported local file paths from a native drop data transfer', () => {
    const dataTransfer = {
      files: [
        { path: 'C:\\project\\Hero.glb' },
        { path: 'C:\\project\\readme.txt' },
        { path: 'C:\\project\\Enemy.GLB' },
        { name: 'browser-file-without-local-path.glb' },
      ],
    };

    expect(get3DModelFilePathsFromDataTransfer(dataTransfer)).toEqual([
      'C:\\project\\Hero.glb',
      'C:\\project\\Enemy.GLB',
    ]);
  });

  test('extracts supported local file paths through Electron webUtils when file.path is unavailable', () => {
    const heroFile = { name: 'Hero.glb' };
    const notesFile = { name: 'notes.txt' };
    const dataTransfer = {
      files: [heroFile, notesFile],
    };
    const webUtils = {
      getPathForFile: file =>
        file === heroFile ? 'C:\\project\\Hero.glb' : 'C:\\project\\notes.txt',
    };

    expect(get3DModelFilePathsFromDataTransfer(dataTransfer, webUtils)).toEqual(
      ['C:\\project\\Hero.glb']
    );
  });

  test('extracts supported GLB paths from project file drag data', () => {
    const dataTransfer = {
      types: [projectFileDragDataMimeType],
      getData: mimeType =>
        mimeType === projectFileDragDataMimeType
          ? JSON.stringify({
              type: 'file',
              absolutePath: 'C:\\project\\Linked\\Hero.glb',
            })
          : '',
    };

    expect(get3DModelFilePathsFromDataTransfer(dataTransfer)).toEqual([
      'C:\\project\\Linked\\Hero.glb',
    ]);
  });

  test('extracts a supported GLB path from the active project file drag', () => {
    try {
      setActiveProjectFileDragPath('C:\\project\\Linked\\Hero.glb');
      const dataTransfer = {
        types: [],
        getData: () => '',
      };

      expect(get3DModelFilePathsFromDataTransfer(dataTransfer)).toEqual([
        'C:\\project\\Linked\\Hero.glb',
      ]);
    } finally {
      clearActiveProjectFileDragPath();
    }
  });

  test('updates the embedded 3D editor incrementally after dropping a GLB', () => {
    const source = getSceneEditorSource();
    const embeddedDropStart = source.indexOf(
      '_on3DModelFilesDroppedInEmbeddedGameFrame = async'
    );
    const embeddedDropEnd = source.indexOf('_onRemoveLayer', embeddedDropStart);
    const embeddedDropSource = source.slice(embeddedDropStart, embeddedDropEnd);

    expect(source).toContain("command: 'hotReloadObjectsAndAddInstances'");
    expect(source).toContain(
      'const resources = getRuntimeProjectResourceDataArray(project)'
    );
    expect(embeddedDropSource).toContain(
      'this._hotReloadObjectsAndAddInstancesInEditor3D({ objects, instances })'
    );
    expect(embeddedDropSource).toContain(
      'this._ignoreResourceExternalChangesForFiles'
    );
    expect(source).toContain('_shouldIgnoreResourceExternalChange');
    expect(source).toContain('Ignoring resource watcher event');
    expect(embeddedDropSource).not.toContain(
      'resourceManagementProps.onResourceUsageChanged()'
    );
    expect(embeddedDropSource).not.toContain(
      'resourceManagementProps.onNewResourcesAdded()'
    );
  });

  test('accepts native GLB drops that enter directly over the embedded game iframe', () => {
    const source = getEmbeddedGameFrameSource();

    expect(source).toContain('const toParentNativeFileDragEvent');
    expect(source).toContain('iframe.contentWindow');
    expect(source).toContain('registeredIframeWindow.addEventListener(');
    expect(source).toContain("'dragover'");
    expect(source).toContain(
      'onNativeFileDrop(toParentNativeFileDragEvent(event))'
    );
  });

  test('adds dropped GLB resources without resetting all runtime resource data', () => {
    const debuggerClientSource = getDebuggerClientSource();
    const resourceLoaderSource = getResourceLoaderSource();
    const hotReloadObjectsAndAddInstancesStart = debuggerClientSource.indexOf(
      "data.command === 'hotReloadObjectsAndAddInstances'"
    );
    const hotReloadObjectsAndAddInstancesEnd = debuggerClientSource.indexOf(
      "data.command === 'hotReloadLayers'",
      hotReloadObjectsAndAddInstancesStart
    );
    const hotReloadObjectsAndAddInstancesSource = debuggerClientSource.slice(
      hotReloadObjectsAndAddInstancesStart,
      hotReloadObjectsAndAddInstancesEnd
    );

    expect(resourceLoaderSource).toContain(
      'upsertResources(resourceDataArray: ResourceData[])'
    );
    expect(hotReloadObjectsAndAddInstancesSource).toContain(
      'runtimeGame.getResourceLoader().upsertResources(resources)'
    );
    expect(hotReloadObjectsAndAddInstancesSource).not.toContain(
      'runtimeGame.setProjectData(projectData)'
    );
  });

  test('reloads destroyed PIXI textures after an embedded editor hot reload', () => {
    const pixiImageManagerSource = getPixiImageManagerSource();
    const loadTextureStart = pixiImageManagerSource.indexOf(
      'async _loadTexture(resource: ResourceData): Promise<void>'
    );
    const loadTextureEnd = pixiImageManagerSource.indexOf(
      'const resourceUrl = this._resourceLoader.getFullUrl(resource.file);',
      loadTextureStart
    );
    const loadTextureCacheSource = pixiImageManagerSource.slice(
      loadTextureStart,
      loadTextureEnd
    );

    expect(loadTextureCacheSource).toContain('const existingTexture');
    expect(loadTextureCacheSource).toContain('!existingTexture.destroyed');
    expect(loadTextureCacheSource).toContain('existingTexture.valid');
    expect(loadTextureCacheSource).toContain(
      'this._loadedTextures.delete(resource)'
    );
  });

  test('keeps renderer-held GLTF scenes intact when model resources unload', () => {
    const model3DManagerSource = getModel3DManagerSource();
    const unloadResourceStart = model3DManagerSource.indexOf(
      'unloadResource(resourceData: ResourceData): void'
    );
    const unloadResourceSource = model3DManagerSource.slice(
      unloadResourceStart
    );

    expect(model3DManagerSource).toContain(
      'loadedThreeModel.scene.children.length > 0'
    );
    expect(unloadResourceSource).not.toContain(
      'loadedThreeModel.scene.clear()'
    );
    expect(unloadResourceSource).toContain(
      'this._loadedThreeModels.delete(resourceData)'
    );
  });

  test('does not warn for old Physics3D behavior data without a mesh shape resource', () => {
    const physics3DJsExtensionSource = getPhysics3DJsExtensionSource();
    const meshShapePropertyStart = physics3DJsExtensionSource.indexOf(
      ".getOrCreate('meshShapeResourceName')"
    );
    const meshShapePropertyEnd = physics3DJsExtensionSource.indexOf(
      ".setType('resource')",
      meshShapePropertyStart
    );
    const meshShapePropertySource = physics3DJsExtensionSource.slice(
      meshShapePropertyStart,
      meshShapePropertyEnd
    );

    expect(meshShapePropertySource).toContain(
      ".getOrCreateChild('meshShapeResourceName')"
    );
    expect(meshShapePropertySource).not.toContain(
      ".getChild('meshShapeResourceName')"
    );
  });

  test('refits custom-sized 3D model instances after replacing their model resource', () => {
    const source = getSceneEditorSource();
    const refitStart = source.indexOf(
      '_fitCustomSizedModel3DInstancesToObjectRatio ='
    );
    const refitEnd = source.indexOf('_onInstancesRotated', refitStart);
    const refitSource = source.slice(refitStart, refitEnd);
    const objectEditedStart = source.indexOf('_onObjectEdited =');
    const objectEditedEnd = source.indexOf(
      'onSelectTileMapTile',
      objectEditedStart
    );
    const objectEditedSource = source.slice(objectEditedStart, objectEditedEnd);

    expect(refitSource).toContain(
      "object.getType() !== 'Scene3D::Model3DObject'"
    );
    expect(refitSource).toContain('getInstancesInLayoutForObject');
    expect(refitSource).toContain('const scale = Math.min(');
    expect(refitSource).toContain('instance.setHasCustomSize(true)');
    expect(refitSource).toContain('instance.setCustomWidth(nextWidth)');
    expect(refitSource).toContain('instance.setCustomHeight(nextHeight)');
    expect(refitSource).toContain('instance.setHasCustomDepth(true)');
    expect(refitSource).toContain('instance.setCustomDepth(nextDepth)');
    expect(objectEditedSource).toContain('hasResourceChanged');
    expect(objectEditedSource).toContain(
      'this._fitCustomSizedModel3DInstancesToObjectRatio('
    );
    expect(objectEditedSource).toContain(
      'this._onInstancesResized(resizedInstances)'
    );
  });
});
