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
});
