// @noflow
import path from 'path';
import {
  copyGitHubRepositoryFilesToLocalProjectFolder,
  copyLocalTemplateFilesToLocalProjectFolder,
  copyProjectTemplateFilesToLocalProjectFolder,
  createNewEmptyProject,
  emptyProjectTemplateFilesSource,
  ensureProjectHasDefaultScene,
  getProjectTemplateFileDestinationPath,
  initializeLocalProjectGitRepository,
} from './CreateProject';
import { findLocalProjectTemplatePath } from './LocalProjectTemplateFinder';

jest.mock('../Utils/Analytics/EventSender', () => ({
  sendNewGameCreated: jest.fn(),
}));
jest.mock('./LocalProjectTemplateFinder', () => ({
  findLocalProjectTemplatePath: jest.fn(),
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

  it('adds the default scene once before a new project is first saved', () => {
    const project = global.gd.ProjectHelper.createNewGDJSProject();

    ensureProjectHasDefaultScene(project);
    ensureProjectHasDefaultScene(project);

    expect(project.getLayoutsCount()).toBe(1);
    expect(project.getLayoutAt(0).getName()).toBe('Game');
    project.delete();
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

  it('recursively copies all bundled local template folder contents into the project', async () => {
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
            subDirEntry('assets'),
            subDirEntry('.git'),
            subDirEntry('gdevelop-mcp'),
          ];
        }
        if (dir === '/tpl/assets') {
          return [];
        }
        if (dir === '/tpl/.git') {
          return [dirEntry('config')];
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
    expect(written).not.toContain('/Project/.git/config');
    expect(fs.ensureDir).toHaveBeenCalledWith('/Project/assets');
  });

  it('initializes and commits a local project Git repository', async () => {
    const childProcess = {
      execFile: jest.fn((command, args, options, callback) => {
        const stdout =
          args[0] === 'status'
            ? 'A  game.json\nA  AGENTS.md\nA  .gitignore\n'
            : '';
        callback(null, stdout, '');
      }),
    };

    await initializeLocalProjectGitRepository({
      projectFilePath: '/Project/game.json',
      childProcess,
      path: path.posix,
    });

    expect(childProcess.execFile).toHaveBeenNthCalledWith(
      1,
      'git',
      ['init'],
      expect.objectContaining({ cwd: '/Project', timeout: 10000 }),
      expect.any(Function)
    );
    expect(childProcess.execFile).toHaveBeenNthCalledWith(
      2,
      'git',
      ['config', 'user.name'],
      expect.objectContaining({ cwd: '/Project' }),
      expect.any(Function)
    );
    expect(childProcess.execFile).toHaveBeenNthCalledWith(
      3,
      'git',
      ['config', 'user.name', 'GDevelop'],
      expect.objectContaining({ cwd: '/Project' }),
      expect.any(Function)
    );
    expect(childProcess.execFile).toHaveBeenNthCalledWith(
      4,
      'git',
      ['config', 'user.email'],
      expect.objectContaining({ cwd: '/Project' }),
      expect.any(Function)
    );
    expect(childProcess.execFile).toHaveBeenNthCalledWith(
      5,
      'git',
      ['config', 'user.email', 'gdevelop@example.invalid'],
      expect.objectContaining({ cwd: '/Project' }),
      expect.any(Function)
    );
    expect(childProcess.execFile).toHaveBeenNthCalledWith(
      6,
      'git',
      ['add', '-A'],
      expect.objectContaining({ cwd: '/Project' }),
      expect.any(Function)
    );
    expect(childProcess.execFile).toHaveBeenNthCalledWith(
      7,
      'git',
      ['status', '--porcelain=v1', '-uall'],
      expect.objectContaining({ cwd: '/Project' }),
      expect.any(Function)
    );
    expect(childProcess.execFile).toHaveBeenNthCalledWith(
      8,
      'git',
      [
        '-c',
        'commit.gpgsign=false',
        'commit',
        '--no-gpg-sign',
        '--no-verify',
        '-m',
        'Initial GDevelop project',
      ],
      expect.objectContaining({ cwd: '/Project' }),
      expect.any(Function)
    );
  });

  it('copies the bundled local template when no explicit template source is provided', async () => {
    findLocalProjectTemplatePath.mockReturnValue('/tpl');
    const fs = {
      existsSync: jest.fn(() => true),
      readdir: jest.fn(async dir => {
        if (dir === '/tpl') {
          return [
            {
              name: 'AGENTS.md',
              isDirectory: () => false,
              isFile: () => true,
            },
          ];
        }
        return [];
      }),
      ensureDir: jest.fn(async () => {}),
      readFile: jest.fn(async () => Buffer.from('content')),
      writeFile: jest.fn(async () => {}),
    };

    await copyProjectTemplateFilesToLocalProjectFolder({
      projectFilePath: '/Project/game.json',
      fs,
      path: path.posix,
    });

    expect(findLocalProjectTemplatePath).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledWith(
      '/Project/AGENTS.md',
      Buffer.from('content')
    );
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
