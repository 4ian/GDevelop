// @flow
import {
  buildFileDeletionBlockersMessage,
  buildDuplicateFolderCreationErrorMessage,
  buildDuplicateMarkdownCreationErrorMessage,
  buildFolderCreationDiskErrorMessage,
  canDeleteProjectFolder,
  canMoveProjectFileToFolder,
  getMovedProjectFilePath,
  getProjectFileDragEffectAllowed,
  getResourceFileAfterProjectFileMove,
  shouldSelectProjectFileNode,
  shouldSelectCreatedProjectFile,
  type ProjectFileNode,
} from './ProjectFilesPanel';

describe('ProjectFilesPanel', () => {
  const fileNode: ProjectFileNode = {
    id: 'project/assets/coin.png',
    name: 'coin.png',
    absolutePath: 'D:\\Project\\assets\\coin.png',
    relativePath: 'assets/coin.png',
    type: 'file',
    extension: '.png',
    resourceName: 'coin',
    resourceKind: 'image',
  };
  const sourceFolderNode: ProjectFileNode = {
    id: 'project/assets',
    name: 'assets',
    absolutePath: 'D:\\Project\\assets',
    relativePath: 'assets',
    type: 'folder',
    extension: '',
    children: [fileNode],
  };
  const targetFolderNode: ProjectFileNode = {
    id: 'project/ui',
    name: 'ui',
    absolutePath: 'D:\\Project\\ui',
    relativePath: 'ui',
    type: 'folder',
    extension: '',
    children: [],
  };

  it('formats file deletion blockers without Lingui placeholders', () => {
    const message = buildFileDeletionBlockersMessage([
      {
        location: 'Resources manager',
        value: 'coin.png (image)',
      },
    ]);

    expect(message).toContain(
      'Remove these references first:\n\n- Resources manager: coin.png (image)'
    );
    expect(message).not.toContain('\\n');
    expect(message).not.toContain('{0}');
  });

  it('builds creation error messages as plain strings', () => {
    expect(buildDuplicateFolderCreationErrorMessage()).toBe(
      'A file or folder with this name already exists.'
    );
    expect(buildDuplicateMarkdownCreationErrorMessage()).toBe(
      'A file with this name already exists.'
    );
    expect(buildFolderCreationDiskErrorMessage('EEXIST')).toBe(
      'The folder could not be created on disk:\n\nEEXIST'
    );
    expect(typeof buildDuplicateFolderCreationErrorMessage()).toBe('string');
  });

  it('allows moving a file to a different folder', () => {
    expect(
      canMoveProjectFileToFolder({
        sourceNode: fileNode,
        targetFolderNode,
      })
    ).toBe(true);
    expect(
      canMoveProjectFileToFolder({
        sourceNode: fileNode,
        targetFolderNode: sourceFolderNode,
      })
    ).toBe(false);
    expect(
      canMoveProjectFileToFolder({
        sourceNode: sourceFolderNode,
        targetFolderNode,
      })
    ).toBe(false);
  });

  it('allows project file drags to be moved or copied', () => {
    expect(getProjectFileDragEffectAllowed()).toBe('copyMove');
  });

  it('allows deleting empty folders only', () => {
    const emptyFolderNode: ProjectFileNode = {
      id: 'project/empty',
      name: 'empty',
      absolutePath: 'D:\\Project\\empty',
      relativePath: 'empty',
      type: 'folder',
      extension: '',
      children: [],
    };
    const rootFolderNode: ProjectFileNode = {
      id: 'project',
      name: 'Project',
      absolutePath: 'D:\\Project',
      relativePath: '',
      type: 'folder',
      extension: '',
      children: [],
    };

    expect(canDeleteProjectFolder(emptyFolderNode)).toBe(true);
    expect(canDeleteProjectFolder(sourceFolderNode)).toBe(false);
    expect(canDeleteProjectFolder(rootFolderNode)).toBe(false);
    expect(canDeleteProjectFolder(fileNode)).toBe(false);
  });

  it('selects an empty folder on regular click', () => {
    const emptyFolderNode: ProjectFileNode = {
      id: 'project/empty',
      name: 'empty',
      absolutePath: 'D:\\Project\\empty',
      relativePath: 'empty',
      type: 'folder',
      extension: '',
      children: [],
    };

    expect(shouldSelectProjectFileNode(emptyFolderNode)).toBe(true);
    expect(shouldSelectProjectFileNode(sourceFolderNode)).toBe(true);
    expect(shouldSelectProjectFileNode(fileNode)).toBe(true);
  });

  it('computes moved file and resource paths', () => {
    const movedFilePath = getMovedProjectFilePath({
      sourceNode: fileNode,
      targetFolderNode,
    });

    expect(movedFilePath).toBe('D:\\Project\\ui\\coin.png');
    expect(
      getResourceFileAfterProjectFileMove({
        projectRootPath: 'D:\\Project',
        previousResourceFile: 'assets/coin.png',
        movedAbsolutePath: movedFilePath,
      })
    ).toBe('ui/coin.png');
  });

  it('does not auto-select a newly created folder', () => {
    const folderNode: ProjectFileNode = {
      id: 'project/New folder',
      name: 'New folder',
      absolutePath: 'D:\\Project\\New folder',
      relativePath: 'New folder',
      type: 'folder',
      extension: '',
      children: [],
    };
    const fileNode: ProjectFileNode = {
      id: 'project/notes.md',
      name: 'notes.md',
      absolutePath: 'D:\\Project\\notes.md',
      relativePath: 'notes.md',
      type: 'file',
      extension: '.md',
      resourceName: null,
      resourceKind: null,
    };

    expect(shouldSelectCreatedProjectFile(folderNode)).toBe(false);
    expect(shouldSelectCreatedProjectFile(fileNode)).toBe(true);
  });
});
