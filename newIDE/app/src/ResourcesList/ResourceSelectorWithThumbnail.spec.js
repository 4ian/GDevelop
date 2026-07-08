// @noflow
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  getDroppedResourceFilePathsFromDataTransfer,
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
});
