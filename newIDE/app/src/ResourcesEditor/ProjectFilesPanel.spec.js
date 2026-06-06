// @flow
import fs from 'fs';
import path from 'path';
import {
  buildFileDeletionBlockersMessage,
  buildDuplicateFolderCreationErrorMessage,
  buildDuplicateMarkdownCreationErrorMessage,
  buildFolderCreationDiskErrorMessage,
  canDeleteProjectFolder,
  canMoveProjectFileToFolder,
  canRenameProjectFileNode,
  getExternalFileCopyDestinationPath,
  getExternalFileDropPaths,
  getMovedProjectFilePath,
  getProjectFolderDropOperation,
  getProjectFileDragEffectAllowed,
  getRenamedProjectFilePath,
  getRegisteredProjectFileBadgeTitle,
  getResourceFileAfterProjectFileMove,
  getResourceFileAfterProjectPathMove,
  hasExternalFilesDragData,
  shouldSelectProjectFileNode,
  shouldSelectCreatedProjectFile,
  type ProjectFileNode,
} from './ProjectFilesPanel';

describe('ProjectFilesPanel', () => {
  const getSource = () =>
    fs.readFileSync(path.join(__dirname, 'ProjectFilesPanel.js'), 'utf8');

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

  it('uses an accessible title for registered file icon badges', () => {
    expect(getRegisteredProjectFileBadgeTitle('coin')).toBe(
      'Registered as coin'
    );
  });

  it('renders the project file search bar in the header toolbar', () => {
    const source = getSource();
    const browseProjectFilesStart = source.indexOf(
      'if (!canBrowseProjectFiles)'
    );
    const renderEnd = source.indexOf(
      '{isTruncated &&',
      browseProjectFilesStart
    );
    const projectFilesHeaderSection = source.slice(
      browseProjectFilesStart,
      renderEnd
    );
    const searchBarStart = projectFilesHeaderSection.indexOf('<SearchBar');
    const toolbarStart = projectFilesHeaderSection.indexOf(
      '<MiniToolbar noPadding>'
    );

    expect(projectFilesHeaderSection).toContain(
      '<div style={styles.headerSearch}>'
    );
    expect(searchBarStart).toBeGreaterThan(
      projectFilesHeaderSection.indexOf('<div style={styles.header}>')
    );
    expect(searchBarStart).toBeLessThan(toolbarStart);
    expect(projectFilesHeaderSection).toContain(
      'placeholder={t`Search project files`}'
    );
    expect(projectFilesHeaderSection).toContain('<MiniToolbar noPadding>');
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

  it('detects external files dragged from the operating system', () => {
    expect(hasExternalFilesDragData(['Files'])).toBe(true);
    expect(
      hasExternalFilesDragData({
        length: 2,
        0: 'text/plain',
        1: 'Files',
      })
    ).toBe(true);
    expect(hasExternalFilesDragData(['text/plain'])).toBe(false);
  });

  it('extracts external file paths and computes copy destinations', () => {
    expect(
      getExternalFileDropPaths({
        files: [
          { path: 'D:\\Downloads\\coin.png' },
          { path: '' },
          { name: 'ignored-without-path.png' },
        ],
      })
    ).toEqual(['D:\\Downloads\\coin.png']);
    expect(
      getExternalFileCopyDestinationPath({
        sourceFilePath: 'D:\\Downloads\\coin.png',
        targetFolderNode,
      })
    ).toBe('D:\\Project\\ui\\coin.png');
  });

  it('extracts external file paths through Electron webUtils when file.path is unavailable', () => {
    const imageFile = { name: 'coin.png' };
    const soundFile = { name: 'coin.mp3' };
    const dataTransfer = {
      files: [imageFile, soundFile],
    };
    const webUtils = {
      getPathForFile: (file: any) =>
        file === imageFile
          ? 'D:\\Downloads\\coin.png'
          : 'D:\\Downloads\\coin.mp3',
    };

    expect(getExternalFileDropPaths(dataTransfer, webUtils)).toEqual([
      'D:\\Downloads\\coin.png',
      'D:\\Downloads\\coin.mp3',
    ]);
  });

  it('ignores external file drops when no importable file path is available', () => {
    expect(
      getProjectFolderDropOperation({
        sourceNode: null,
        targetFolderNode,
        dataTransfer: {
          types: ['Files'],
          files: [{ name: 'file-without-electron-path.png' }],
        },
      })
    ).toBe('ignore');
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

  it('updates resource paths after renaming a folder containing registered files', () => {
    expect(
      getResourceFileAfterProjectPathMove({
        projectRootPath: 'D:\\Project',
        previousResourceFile: 'assets/coin.png',
        sourceAbsolutePath: 'D:\\Project\\assets',
        movedAbsolutePath: 'D:\\Project\\sprites',
      })
    ).toBe('sprites/coin.png');
    expect(
      getResourceFileAfterProjectPathMove({
        projectRootPath: 'D:\\Project',
        previousResourceFile: 'ui/button.png',
        sourceAbsolutePath: 'D:\\Project\\assets',
        movedAbsolutePath: 'D:\\Project\\sprites',
      })
    ).toBe('ui/button.png');
  });

  it('computes renamed file and folder paths', () => {
    expect(
      getRenamedProjectFilePath({
        node: fileNode,
        newName: 'coin-idle.png',
      })
    ).toBe('D:\\Project\\assets\\coin-idle.png');
    expect(
      getRenamedProjectFilePath({
        node: sourceFolderNode,
        newName: 'sprites',
      })
    ).toBe('D:\\Project\\sprites');
  });

  it('allows renaming project files and non-root folders only', () => {
    const rootFolderNode: ProjectFileNode = {
      id: 'project',
      name: 'Project',
      absolutePath: 'D:\\Project',
      relativePath: '',
      type: 'folder',
      extension: '',
      children: [],
    };

    expect(canRenameProjectFileNode(fileNode)).toBe(true);
    expect(canRenameProjectFileNode(sourceFolderNode)).toBe(true);
    expect(canRenameProjectFileNode(rootFolderNode)).toBe(false);
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
