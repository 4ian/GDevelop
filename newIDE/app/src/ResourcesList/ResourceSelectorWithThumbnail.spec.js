// @noflow
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  getDroppedResourceFilePathsFromDataTransfer,
  hasDroppedResourceFileData,
  importDroppedResourceFileAsProjectResource,
  isSupportedDroppedResourceFilePath,
} from './ResourceSelectorWithThumbnail';
import {
  clearActiveProjectFileDragPath,
  projectFileDragDataMimeType,
  setActiveProjectFileDragPath,
} from '../Utils/ProjectFileDragData';

const gd = global.gd;

const makeProjectInTempFolder = () => {
  const folder = fs.mkdtempSync(
    path.join(os.tmpdir(), 'gdevelop-resource-drop-')
  );
  const project = gd.ProjectHelper.createNewGDJSProject();
  project.setProjectFile(path.join(folder, 'game.json'));
  return { folder, project };
};

describe('ResourceSelectorWithThumbnail', () => {
  test('detects supported dropped model3D resource files', () => {
    expect(
      isSupportedDroppedResourceFilePath({
        filePath: 'C:\\project\\Hero.glb',
        resourceKind: 'model3D',
      })
    ).toBe(true);
    expect(
      isSupportedDroppedResourceFilePath({
        filePath: 'C:\\project\\Hero.png',
        resourceKind: 'model3D',
      })
    ).toBe(false);
  });

  test('extracts model3D file paths from native and project file drops', () => {
    const nativeFile = { name: 'Hero.glb' };
    const dataTransfer = {
      types: ['Files', projectFileDragDataMimeType],
      files: [nativeFile, { name: 'Ignored.txt' }],
      getData: mimeType =>
        mimeType === projectFileDragDataMimeType
          ? JSON.stringify({
              type: 'file',
              absolutePath: 'D:\\Linked\\Crate.glb',
            })
          : '',
    };
    const webUtils = {
      getPathForFile: file =>
        file === nativeFile ? 'C:\\Downloads\\Hero.glb' : 'C:\\Notes.txt',
    };

    expect(
      getDroppedResourceFilePathsFromDataTransfer(
        dataTransfer,
        'model3D',
        webUtils
      )
    ).toEqual(['D:\\Linked\\Crate.glb', 'C:\\Downloads\\Hero.glb']);
  });

  test('extracts model3D file paths from active project file drags', () => {
    try {
      setActiveProjectFileDragPath('D:\\Linked\\Tree.glb');

      expect(
        getDroppedResourceFilePathsFromDataTransfer(
          { types: [], getData: () => '' },
          'model3D'
        )
      ).toEqual(['D:\\Linked\\Tree.glb']);
    } finally {
      clearActiveProjectFileDragPath();
    }
  });

  test('detects native and project image file drag data', () => {
    expect(
      hasDroppedResourceFileData(
        { types: ['Files'], files: [], getData: () => '' },
        'image'
      )
    ).toBe(true);
    expect(
      hasDroppedResourceFileData(
        {
          types: [projectFileDragDataMimeType],
          files: [],
          getData: mimeType =>
            mimeType === projectFileDragDataMimeType
              ? JSON.stringify({
                  type: 'file',
                  absolutePath: 'D:\\Project\\Hero.png',
                })
              : '',
        },
        'image'
      )
    ).toBe(true);
  });

  test('extracts supported image paths and ignores other files', () => {
    const imageFile = { name: 'Hero.png' };
    const dataTransfer = {
      types: ['Files'],
      files: [imageFile, { name: 'Ignored.txt' }],
      getData: () => '',
    };
    const webUtils = {
      getPathForFile: file =>
        file === imageFile
          ? 'C:\\Downloads\\Hero.png'
          : 'C:\\Downloads\\Ignored.txt',
    };

    expect(
      getDroppedResourceFilePathsFromDataTransfer(
        dataTransfer,
        'image',
        webUtils
      )
    ).toEqual(['C:\\Downloads\\Hero.png']);
  });

  test('imports a dropped GLB as a model3D resource', async () => {
    const { folder, project } = makeProjectInTempFolder();
    const sourceFile = path.join(folder, 'Downloads', 'Player.glb');
    fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
    fs.writeFileSync(sourceFile, Buffer.from('fake glb bytes'));

    const {
      resourceName,
      hasCreatedResource,
    } = await importDroppedResourceFileAsProjectResource({
      project,
      resourceKind: 'model3D',
      filePath: sourceFile,
    });

    expect(resourceName).toBe('assets/Player.glb');
    expect(hasCreatedResource).toBe(true);
    expect(project.getResourcesManager().hasResource(resourceName)).toBe(true);
    expect(
      project
        .getResourcesManager()
        .getResource(resourceName)
        .getKind()
    ).toBe('model3D');
    expect(fs.existsSync(path.join(folder, 'assets', 'Player.glb'))).toBe(true);
  });

  test('imports a dropped image as an image resource', async () => {
    const { folder, project } = makeProjectInTempFolder();
    const sourceFile = path.join(folder, 'Downloads', 'Player.png');
    fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
    fs.writeFileSync(sourceFile, Buffer.from('fake png bytes'));

    const {
      resourceName,
      hasCreatedResource,
    } = await importDroppedResourceFileAsProjectResource({
      project,
      resourceKind: 'image',
      filePath: sourceFile,
    });

    expect(resourceName).toBe('assets/Player.png');
    expect(hasCreatedResource).toBe(true);
    expect(
      project
        .getResourcesManager()
        .getResource(resourceName)
        .getKind()
    ).toBe('image');
    expect(fs.existsSync(path.join(folder, 'assets', 'Player.png'))).toBe(true);
  });

  test('reuses a project resource when its image file is dropped', async () => {
    const { folder, project } = makeProjectInTempFolder();
    const sourceFile = path.join(folder, 'images', 'Player.png');
    fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
    fs.writeFileSync(sourceFile, Buffer.from('fake png bytes'));

    const resource = new gd.ImageResource();
    resource.setName('PlayerImage');
    resource.setFile('images/Player.png');
    project.getResourcesManager().addResource(resource);
    resource.delete();

    const result = await importDroppedResourceFileAsProjectResource({
      project,
      resourceKind: 'image',
      filePath: sourceFile,
    });

    expect(result).toEqual({
      resourceName: 'PlayerImage',
      hasCreatedResource: false,
    });
    expect(
      project
        .getResourcesManager()
        .getAllResourceNames()
        .size()
    ).toBe(1);
    expect(fs.existsSync(path.join(folder, 'assets', 'Player.png'))).toBe(
      false
    );
  });
});
