// @noflow
import path from 'path';
import {
  copyGitHubRepositoryFilesToLocalProjectFolder,
  copyLocalTemplateFilesToLocalProjectFolder,
  createNewEmptyProject,
  emptyProjectTemplateFilesSource,
  getProjectTemplateFileDestinationPath,
} from './CreateProject';

jest.mock('../Utils/Analytics/EventSender', () => ({
  sendNewGameCreated: jest.fn(),
}));

describe('CreateProject template files', () => {
  const repository = {
    owner: 'zhouzhipeng',
    name: 'gd-project-template',
    ref: 'main',
  };

  it('marks empty projects as using the bundled local template files source', () => {
    const newProjectSource = createNewEmptyProject({
      creationSource: 'default',
    });

    expect(newProjectSource.templateFilesSource).toEqual(
      emptyProjectTemplateFilesSource
    );
    expect(emptyProjectTemplateFilesSource.type).toBe('local-folder');
  });

  it('copies files from a GitHub repository tree into the local project folder', async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tree: [
            { path: 'AGENTS.md', type: 'blob' },
            { path: 'assets/icon.png', type: 'blob' },
            { path: 'assets', type: 'tree' },
          ],
        }),
      })
      .mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      });
    const fs = {
      ensureDir: jest.fn(),
      writeFile: jest.fn(),
    };

    await copyGitHubRepositoryFilesToLocalProjectFolder({
      projectFilePath: 'D:\\Project\\game.json',
      repository,
      fetch,
      fs,
      path: path.win32,
    });

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'https://api.github.com/repos/zhouzhipeng/gd-project-template/git/trees/main?recursive=1'
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'https://raw.githubusercontent.com/zhouzhipeng/gd-project-template/main/AGENTS.md'
    );
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      'https://raw.githubusercontent.com/zhouzhipeng/gd-project-template/main/assets/icon.png'
    );
    expect(fs.ensureDir).toHaveBeenCalledWith('D:\\Project');
    expect(fs.ensureDir).toHaveBeenCalledWith('D:\\Project\\assets');
    expect(fs.writeFile).toHaveBeenCalledWith(
      'D:\\Project\\AGENTS.md',
      new Uint8Array([1, 2, 3])
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      'D:\\Project\\assets\\icon.png',
      new Uint8Array([1, 2, 3])
    );
  });

  it('copies only the subdirectory files and strips the prefix', async () => {
    const subdirRepository = {
      owner: 'zhouzhipeng',
      name: 'GDevelop',
      ref: 'master',
      subdirectory: 'gd-project-template',
    };
    const fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tree: [
            { path: 'gd-project-template/AGENTS.md', type: 'blob' },
            { path: 'gd-project-template/assets/icon.png', type: 'blob' },
            // Files outside the subdirectory must be ignored.
            { path: 'README.md', type: 'blob' },
            { path: 'newIDE/app/src/index.js', type: 'blob' },
          ],
        }),
      })
      .mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      });
    const fs = { ensureDir: jest.fn(), writeFile: jest.fn() };

    await copyGitHubRepositoryFilesToLocalProjectFolder({
      projectFilePath: 'D:\\Project\\game.json',
      repository: subdirRepository,
      fetch,
      fs,
      path: path.win32,
    });

    // Raw file is fetched by its FULL repository path...
    expect(fetch).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/zhouzhipeng/GDevelop/master/gd-project-template/AGENTS.md'
    );
    // ...but written WITHOUT the subdirectory prefix.
    expect(fs.writeFile).toHaveBeenCalledWith(
      'D:\\Project\\AGENTS.md',
      new Uint8Array([1, 2, 3])
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      'D:\\Project\\assets\\icon.png',
      new Uint8Array([1, 2, 3])
    );
    // Files outside the subdirectory are not copied.
    const writtenPaths = fs.writeFile.mock.calls.map(call => call[0]);
    expect(writtenPaths).not.toContain('D:\\Project\\README.md');
    expect(writtenPaths).toHaveLength(2);
  });

  it('recursively copies a bundled local template folder into the project', async () => {
    // Mock a template folder containing AGENTS.md, CLAUDE.md and a nested skill.
    const dirEntry = name => ({
      name,
      isDirectory: () => false,
      isFile: () => true,
    });
    const subDirEntry = name => ({
      name,
      isDirectory: () => true,
      isFile: () => false,
    });
    const fs = {
      existsSync: jest.fn(() => true),
      readdir: jest.fn(async dir => {
        if (dir === '/tpl') {
          return [
            dirEntry('AGENTS.md'),
            dirEntry('CLAUDE.md'),
            subDirEntry('gdevelop-mcp'),
          ];
        }
        if (dir === '/tpl/gdevelop-mcp') {
          return [dirEntry('SKILL.md'), subDirEntry('agents')];
        }
        if (dir === '/tpl/gdevelop-mcp/agents') {
          return [dirEntry('openai.yaml')];
        }
        return [];
      }),
      ensureDir: jest.fn(async () => {}),
      readFile: jest.fn(async () => Buffer.from('content')),
      writeFile: jest.fn(async () => {}),
    };

    await copyLocalTemplateFilesToLocalProjectFolder({
      projectFilePath: '/Project/game.json',
      templateFolderPath: '/tpl',
      fs,
      path: path.posix,
    });

    const written = fs.writeFile.mock.calls.map(call => call[0]).sort();
    expect(written).toEqual([
      '/Project/AGENTS.md',
      '/Project/CLAUDE.md',
      '/Project/gdevelop-mcp/SKILL.md',
      '/Project/gdevelop-mcp/agents/openai.yaml',
    ]);
  });

  it('rejects repository paths that would escape the local project folder', () => {
    expect(() =>
      getProjectTemplateFileDestinationPath({
        projectFolder: 'D:\\Project',
        repositoryFilePath: '../outside.txt',
        path: path.win32,
      })
    ).toThrow(/unsafe/i);

    expect(() =>
      getProjectTemplateFileDestinationPath({
        projectFolder: 'D:\\Project',
        repositoryFilePath: 'assets/../../outside.txt',
        path: path.win32,
      })
    ).toThrow(/unsafe/i);
  });
});
