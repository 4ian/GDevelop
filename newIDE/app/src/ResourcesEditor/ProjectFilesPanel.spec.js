// @flow
import fs from 'fs';
import path from 'path';
import {
  buildFileDeletionBlockersMessage,
  buildDuplicateFolderCreationErrorMessage,
  buildDuplicateMarkdownCreationErrorMessage,
  buildFolderCreationDiskErrorMessage,
  canDeleteProjectFolder,
  canRenameLinkedFolderNode,
  canMoveProjectFileToFolder,
  canRenameProjectFileNode,
  canUpdateProjectFolderFromTemplate,
  copyProjectTemplateFolderContents,
  findNodeById,
  getProjectFileNodeIdsAfterSelection,
  getLinkedFoldersFilePath,
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
  isTextLikeFile,
  isProjectFileNode,
  normalizeLinkedFolders,
  shouldSelectProjectFileNode,
  shouldSelectCreatedProjectFile,
  type ProjectFileNode,
} from './ProjectFilesPanel';

describe('ProjectFilesPanel', () => {
  const getSource = () =>
    fs
      .readFileSync(path.join(__dirname, 'ProjectFilesPanel.js'), 'utf8')
      .replace(/\r\n/g, '\n');

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
  const linkedFileNode: ProjectFileNode = {
    ...fileNode,
    id: 'linked-folder:d:/library:D:/Library/coin.png',
    absolutePath: 'D:\\Library\\coin.png',
    relativePath: 'Library/coin.png',
    source: 'linked-folder',
    linkedFolderId: 'linked-folder:d:/library',
  };
  const linkedFolderNode: ProjectFileNode = {
    id: 'linked-folder:d:/library',
    name: 'Library',
    absolutePath: 'D:\\Library',
    relativePath: 'Library',
    type: 'folder',
    extension: '',
    children: [linkedFileNode],
    source: 'linked-folder',
    linkedFolderId: 'linked-folder:d:/library',
    isLinkedFolderRoot: true,
  };

  it.each(['.events', '.gdevelop', '.layout', '.settings', '.toml'])(
    'recognizes %s project sources as text files',
    extension => {
      expect(
        isTextLikeFile({
          ...fileNode,
          name: `project${extension}`,
          extension,
        })
      ).toBe(true);
    }
  );

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
    expect(source).toContain('headerSearch: {\n    flex: 1,\n    minWidth: 0,');
    expect(source).not.toContain(
      "headerSearch: {\n    display: 'flex',\n    flex: 1,"
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

  it('uses the cleanup-aware refresh handler in the header toolbar', () => {
    const source = getSource();

    expect(source).toContain(
      'onRefreshProjectFiles: () => void | Promise<void>'
    );
    expect(source).toContain(
      'onProjectFilesRefreshed: ProjectFileNode => void'
    );
    expect(source).toContain('onClick={onRefreshProjectFiles}');
    expect(source).toContain(
      'tooltip={t`Refresh project files and remove unused resources`}'
    );
  });

  it('copies the project absolute path from the header toolbar', () => {
    const source = getSource();
    const toolbarStart = source.indexOf('<MiniToolbar noPadding>');
    const toolbarEnd = source.indexOf('</MiniToolbar>', toolbarStart);
    const toolbar = source.slice(toolbarStart, toolbarEnd);

    expect(source).toContain(
      "import CopyIcon from '../UI/CustomSvgIcons/Copy'"
    );
    expect(source).toContain(
      "import { copyTextToClipboard } from '../Utils/Clipboard'"
    );
    expect(source).toContain(
      'const copyProjectAbsolutePath = React.useCallback'
    );
    expect(source).toContain('await copyTextToClipboard(projectRoot);');
    expect(toolbar).toContain('onClick={copyProjectAbsolutePath}');
    expect(toolbar).toContain('tooltip={t`Copy project absolute path`}');
    expect(toolbar.indexOf('onClick={openProjectFolder}')).toBeLessThan(
      toolbar.indexOf('onClick={copyProjectAbsolutePath}')
    );
    expect(toolbar.indexOf('onClick={copyProjectAbsolutePath}')).toBeLessThan(
      toolbar.indexOf('onClick={onRefreshProjectFiles}')
    );
  });

  it('refreshes registered file badges when project resources change', () => {
    const source = getSource();

    expect(source).toContain(
      "import useResourcesChangedWatcher from '../ResourcesList/UseResourcesChangedWatcher'"
    );
    expect(source).toContain('onProjectFilesRefreshed(projectFilesRootNode)');
    expect(source).toContain(
      'const refreshOnResourceChange = React.useCallback'
    );
    expect(source).toContain('callback: refreshOnResourceChange');
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
    expect(
      canMoveProjectFileToFolder({
        sourceNode: linkedFileNode,
        targetFolderNode,
      })
    ).toBe(false);
    expect(
      canMoveProjectFileToFolder({
        sourceNode: fileNode,
        targetFolderNode: linkedFolderNode,
      })
    ).toBe(false);
  });

  it('allows project file drags to be moved or copied', () => {
    expect(getProjectFileDragEffectAllowed()).toBe('copyMove');
  });

  it('blocks the embedded game frame while dragging GLB project files', () => {
    const source = getSource();

    expect(source).toContain(
      "import { preventGameFramePointerEvents } from '../EmbeddedGame/EmbeddedGameFramePointerEvents'"
    );
    expect(source).toContain('if (is3DModelFile(node))');
    expect(source).toContain('preventEmbeddedGameFramePointerEvents(true)');
    expect(source).toContain('preventEmbeddedGameFramePointerEvents(false)');
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
    expect(canDeleteProjectFolder(linkedFolderNode)).toBe(false);
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

  it('replaces the selection on a regular click', () => {
    expect(
      getProjectFileNodeIdsAfterSelection({
        selectedNodeIds: ['00.png', '01.png'],
        nodeId: '03.png',
        orderedNodeIds: ['00.png', '01.png', '02.png', '03.png'],
        anchorNodeId: '01.png',
        isToggleSelection: false,
        isRangeSelection: false,
      })
    ).toEqual(['03.png']);
  });

  it('toggles individual files with Ctrl or Cmd selection', () => {
    expect(
      getProjectFileNodeIdsAfterSelection({
        selectedNodeIds: ['00.png'],
        nodeId: '02.png',
        orderedNodeIds: ['00.png', '01.png', '02.png'],
        anchorNodeId: '00.png',
        isToggleSelection: true,
        isRangeSelection: false,
      })
    ).toEqual(['00.png', '02.png']);
    expect(
      getProjectFileNodeIdsAfterSelection({
        selectedNodeIds: ['00.png', '02.png'],
        nodeId: '00.png',
        orderedNodeIds: ['00.png', '01.png', '02.png'],
        anchorNodeId: '02.png',
        isToggleSelection: true,
        isRangeSelection: false,
      })
    ).toEqual(['02.png']);
  });

  it('selects a contiguous range in either direction with Shift', () => {
    const orderedNodeIds = ['00.png', '01.png', '02.png', '03.png', '04.png'];
    expect(
      getProjectFileNodeIdsAfterSelection({
        selectedNodeIds: ['01.png'],
        nodeId: '04.png',
        orderedNodeIds,
        anchorNodeId: '01.png',
        isToggleSelection: false,
        isRangeSelection: true,
      })
    ).toEqual(['01.png', '02.png', '03.png', '04.png']);
    expect(
      getProjectFileNodeIdsAfterSelection({
        selectedNodeIds: ['04.png'],
        nodeId: '01.png',
        orderedNodeIds,
        anchorNodeId: '04.png',
        isToggleSelection: false,
        isRangeSelection: true,
      })
    ).toEqual(['01.png', '02.png', '03.png', '04.png']);
  });

  it('adds a range to the selection with Ctrl or Cmd plus Shift', () => {
    expect(
      getProjectFileNodeIdsAfterSelection({
        selectedNodeIds: ['00.png'],
        nodeId: '04.png',
        orderedNodeIds: ['00.png', '01.png', '02.png', '03.png', '04.png'],
        anchorNodeId: '02.png',
        isToggleSelection: true,
        isRangeSelection: true,
      })
    ).toEqual(['00.png', '02.png', '03.png', '04.png']);
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
    expect(canRenameProjectFileNode(linkedFileNode)).toBe(false);
    expect(canRenameProjectFileNode(linkedFolderNode)).toBe(false);
    expect(canRenameLinkedFolderNode(linkedFolderNode)).toBe(true);
    expect(canRenameLinkedFolderNode(linkedFileNode)).toBe(false);
  });

  it('allows updating from template only on the project root folder', () => {
    const rootFolderNode: ProjectFileNode = {
      id: 'project',
      name: 'Project',
      absolutePath: 'D:\\Project',
      relativePath: '',
      type: 'folder',
      extension: '',
      children: [],
    };

    expect(canUpdateProjectFolderFromTemplate(rootFolderNode)).toBe(true);
    expect(canUpdateProjectFolderFromTemplate(sourceFolderNode)).toBe(false);
    expect(canUpdateProjectFolderFromTemplate(fileNode)).toBe(false);
    expect(canUpdateProjectFolderFromTemplate(linkedFolderNode)).toBe(false);
  });

  it('normalizes linked folder sidecar entries', () => {
    expect(
      normalizeLinkedFolders([
        { path: 'D:\\Asset Library', name: 'Shared art' },
        { absolutePath: 'D:\\Asset Library' },
        { path: 'D:\\Audio' },
        { path: '' },
        {},
      ]).map(linkedFolder => ({
        name: linkedFolder.name,
        absolutePath: linkedFolder.absolutePath,
      }))
    ).toEqual([
      {
        name: 'Shared art',
        absolutePath: 'D:\\Asset Library',
      },
      {
        name: 'Audio',
        absolutePath: 'D:\\Audio',
      },
    ]);
  });

  it('keeps linked folder metadata in a dedicated sidecar file', () => {
    expect(
      getLinkedFoldersFilePath({
        getProjectFile: () => 'D:\\Project\\game.json',
      })
    ).toBe('D:\\Project\\.gdevelop\\folder-links.json');
    expect(isProjectFileNode(fileNode)).toBe(true);
    expect(isProjectFileNode(linkedFileNode)).toBe(false);
  });

  it('finds linked folder nodes by id in a top-level tree', () => {
    const projectFolderNode: ProjectFileNode = {
      id: 'project',
      name: 'Project',
      absolutePath: 'D:\\Project',
      relativePath: '',
      type: 'folder',
      extension: '',
      children: [sourceFolderNode],
      source: 'project',
    };
    const projectFilesRootNode: ProjectFileNode = {
      id: 'project#project-files-root',
      name: 'Project files',
      absolutePath: 'D:\\Project',
      relativePath: '',
      type: 'folder',
      extension: '',
      children: [projectFolderNode, linkedFolderNode],
      source: 'project-files-root',
    };

    expect(findNodeById(projectFilesRootNode, linkedFileNode.id)).toBe(
      linkedFileNode
    );
    expect(findNodeById(projectFilesRootNode, projectFolderNode.id)).toBe(
      projectFolderNode
    );
  });

  it('recursively overwrites project files with every template file', async () => {
    const fileEntry = name => ({
      name,
      isDirectory: () => false,
      isFile: () => true,
    });
    const directoryEntry = name => ({
      name,
      isDirectory: () => true,
      isFile: () => false,
    });
    const fs = {
      promises: {
        mkdir: jest.fn(async () => {}),
        readdir: jest.fn(async directoryPath => {
          if (directoryPath === 'D:\\Template') {
            return [
              fileEntry('.gitignore'),
              fileEntry('AGENTS.md'),
              fileEntry('CLAUDE.md'),
              directoryEntry('skills'),
            ];
          }
          if (directoryPath === 'D:\\Template\\skills') {
            return [fileEntry('SKILL.md')];
          }
          return [];
        }),
        copyFile: jest.fn(async () => {}),
      },
    };

    await copyProjectTemplateFolderContents({
      projectTemplatePath: 'D:\\Template',
      projectRootPath: 'D:\\Project',
      fs,
      path: path.win32,
    });

    expect(fs.promises.copyFile.mock.calls).toEqual([
      ['D:\\Template\\.gitignore', 'D:\\Project\\.gitignore'],
      ['D:\\Template\\AGENTS.md', 'D:\\Project\\AGENTS.md'],
      ['D:\\Template\\CLAUDE.md', 'D:\\Project\\CLAUDE.md'],
      ['D:\\Template\\skills\\SKILL.md', 'D:\\Project\\skills\\SKILL.md'],
    ]);
  });

  it('shows the update from template context menu action for root folders', () => {
    const source = getSource();

    expect(source).toContain('canUpdateProjectFolderFromTemplate(node)');
    expect(source).toContain('label: i18n._(t`Update from template`)');
    expect(source).toContain('updateProjectFolderFromTemplate(node);');
    expect(source).toContain('await copyProjectTemplateFolderContents({');
    expect(source).toContain('projectTemplatePath,');
    expect(source).toContain('projectRootPath: node.absolutePath');
  });

  it('shows the add folder link action only on the linked folders root', () => {
    const source = getSource();

    expect(source).toContain("'folder-links.json'");
    expect(source).not.toContain(
      'children: [...children, linkedFoldersRootNode]'
    );
    expect(source).toContain(
      'if (linkedFoldersRootNode) nodes.push(linkedFoldersRootNode);'
    );
    expect(source).toContain('if (rootNode) nodes.push(rootNode);');
    expect(source).toContain('topLevelNodes.map(node => renderNode(node, 0))');
    expect(source.split('label: i18n._(t`Add folder link`)').length - 1).toBe(
      1
    );
    expect(source).not.toContain('tooltip={t`Add folder link`}');
    expect(source).toContain('canRenameLinkedFolderNode(node)');
    expect(source).toContain('name: newName');
    expect(source).toContain('label: i18n._(t`Remove folder link`)');
    expect(source).toContain('title: i18n._(t`Add folder link`)');
    expect(source).toContain(
      'message: i18n._(t`Choose a folder to show under Project files.`)'
    );
    expect(source).toContain('openAddLinkedFolderDialog');
    expect(source).toContain('removeLinkedFolder(node)');
  });

  it("can open a linked file's folder", () => {
    const source = getSource();

    expect(source).toContain('shell.showItemInFolder(node.absolutePath);');
    expect(source).toContain("...(node.type === 'file'");
    expect(source).toContain('label: i18n._(t`Open folder`)');
    expect(source).toContain('click: () => openFolderForNode(node)');
  });

  it('can open folders and copy absolute paths from project nodes', () => {
    const source = getSource();
    const menuStart = source.indexOf('const menu: Array<MenuItemTemplate> = [');
    const menuEnd = source.indexOf('];', menuStart);
    const menu = source.slice(menuStart, menuEnd);

    expect(source).toContain("if (node.type === 'folder') {");
    expect(source).toContain('shell.openPath(node.absolutePath);');
    expect(menu).toContain('label: i18n._(t`Open folder`)');
    expect(menu).toContain('click: () => openFolderForNode(node)');
    expect(menu).toContain('label: i18n._(t`Copy absolute path`)');
    expect(menu).toContain('click: () => copyNodeAbsolutePath(node)');
  });

  it('shows the unregister action for registered project files', () => {
    const source = getSource();
    const menuStart = source.indexOf('const menu: Array<MenuItemTemplate> = [');
    const menuEnd = source.indexOf('return menu;', menuStart);
    const menu = source.slice(menuStart, menuEnd);

    expect(menu).toContain(
      'const resource = getResourceFromNode(project, node);'
    );
    expect(menu).toContain('if (resource) {');
    expect(menu).toContain('label: i18n._(t`Unregister resource`)');
    expect(menu).toContain('click: () => onUnregisterResource(resource)');
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
