// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import { LocalResourceFetcher } from './LocalResourceFetcher';
import { makeTestProject } from '../../fixtures/TestProject';
import path from 'path';
const gd: libGDevelop = global.gd;

jest.mock('../../Utils/OptionalRequire');

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

const makeTestProjectWithResourcesToDownload = () => {
  const { project } = makeTestProject(gd);

  // Add a resource that uses a URL, which will be download
  // by the LocalResourceFetcher (whatever the origin).
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyResourceToDownload');
    newResource.setFile('http://example/file-to-download.png');
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }

  // Add a resource that won't need to be downloaded (like other
  // resources in the test project).
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyAlreadyLocalResource');
    newResource.setFile('some-local-file.png');
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }

  return project;
};

describe('LocalResourceFetcher', () => {
  beforeEach(() => {
    mockFn(optionalRequire.mockFsExtra.ensureDir).mockReset();
    mockFn(optionalRequire.mockFsExtra.existsSync).mockReset();
    mockFn(optionalRequire.mockElectron.ipcRenderer.invoke).mockReset();
  });

  it('fetches resources and can download them', async () => {
    const project = makeTestProjectWithResourcesToDownload();

    // Ensure just the files to be downloaded are listed
    const resourceNames = LocalResourceFetcher.getResourcesToFetch(project);
    expect(resourceNames).toEqual(['MyResourceToDownload']);

    // Mock a proper download
    const onProgress = jest.fn();
    mockFn(optionalRequire.mockFsExtra.ensureDir).mockImplementation(
      async () => {}
    );
    mockFn(optionalRequire.mockFsExtra.existsSync).mockImplementation(
      () => false
    );
    mockFn(optionalRequire.mockElectron.ipcRenderer.invoke).mockImplementation(
      () => Promise.resolve()
    );

    const fetchedResources = await LocalResourceFetcher.fetchResources({
      project,
      resourceNames,
      onProgress,
    });

    // Verify that download was done
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      'http://example/file-to-download.png',
      path.join('assets', 'file-to-download.png')
    );
    expect(fetchedResources.erroredResources).toEqual([]);
  });

  it('reports errors in case of download failure', async () => {
    const project = makeTestProjectWithResourcesToDownload();

    // Ensure just the files to be downloaded are listed
    const resourceNames = LocalResourceFetcher.getResourcesToFetch(project);
    expect(resourceNames).toEqual(['MyResourceToDownload']);

    // Mock a failed download
    const onProgress = jest.fn();
    mockFn(optionalRequire.mockFsExtra.ensureDir).mockImplementation(
      async () => {}
    );
    mockFn(optionalRequire.mockFsExtra.existsSync).mockImplementation(
      () => false
    );
    mockFn(optionalRequire.mockElectron.ipcRenderer.invoke).mockImplementation(
      () => Promise.reject(new Error('Fake download failure'))
    );

    const fetchedResources = await LocalResourceFetcher.fetchResources({
      project,
      resourceNames,
      onProgress,
    });

    // Verify that download was done and reported as failed, even after 2 tries.
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledTimes(2);
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      'http://example/file-to-download.png',
      path.join('assets', 'file-to-download.png')
    );
    expect(fetchedResources.erroredResources).toEqual([
      { resourceName: 'MyResourceToDownload', error: expect.any(Error) },
    ]);
  });

  it('automatically retries if a resource failed', async () => {
    const project = makeTestProjectWithResourcesToDownload();

    // Ensure just the files to be downloaded are listed
    const resourceNames = LocalResourceFetcher.getResourcesToFetch(project);
    expect(resourceNames).toEqual(['MyResourceToDownload']);

    // Mock a failed download once, then successful
    const onProgress = jest.fn();
    mockFn(optionalRequire.mockFsExtra.ensureDir).mockImplementation(
      async () => {}
    );
    mockFn(optionalRequire.mockFsExtra.existsSync).mockImplementation(
      () => false
    );
    mockFn(optionalRequire.mockElectron.ipcRenderer.invoke)
      .mockImplementationOnce(() =>
        Promise.reject(new Error('Fake download failure'))
      )
      .mockImplementationOnce(() => Promise.resolve());

    const fetchedResources = await LocalResourceFetcher.fetchResources({
      project,
      resourceNames,
      onProgress,
    });

    // Verify that download was done.
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledTimes(2);
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenNthCalledWith(
      1,
      'local-file-download',
      'http://example/file-to-download.png',
      path.join('assets', 'file-to-download.png')
    );
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenNthCalledWith(
      2,
      'local-file-download',
      'http://example/file-to-download.png',
      path.join('assets', 'file-to-download.png')
    );
    expect(fetchedResources.erroredResources).toEqual([]);
  });
});
