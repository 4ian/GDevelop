// @noflow
import path from 'path';
import {
  copyGitHubRepositoryFilesToLocalProjectFolder,
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

  it('marks empty projects as using the GitHub repository files source', () => {
    const newProjectSource = createNewEmptyProject({
      creationSource: 'default',
    });

    expect(newProjectSource.templateFilesSource).toEqual(
      emptyProjectTemplateFilesSource
    );
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
