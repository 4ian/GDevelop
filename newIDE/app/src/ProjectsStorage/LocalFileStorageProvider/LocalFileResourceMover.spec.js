// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import { moveUrlResourcesToLocalFiles } from './LocalFileResourceMover';
import { makeTestProject } from '../../fixtures/TestProject';
import path from 'path';
const gd: libGDevelop = global.gd;

jest.mock('../../Utils/OptionalRequire');

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

const classicUrl = 'https://www.example.com/file-to-download.png';
const productAuthorizedUrl =
  'https://private-assets.gdevelop.io/a2adcae7-ceba-4c0d-ad0f-411bf83692ea/resources/Misc/stars_levels (3).png?token=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnZGV2ZWxvcC1zaG9wLWFwaSIsImF1ZCI6IjNwejJvWEZHSmVTaTVyVjROQ0pkclU4MjVUVDIiLCJleHAiOjE2NjY5NjM5NDY1OTUsInN1YiI6WyJhMmFkY2FlNy1jZWJhLTRjMGQtYWQwZi00MTFiZjgzNjkyZWEiLCJjM2ZmZjUyZS1lMTZjLTQxMTYtYTYzNS03ZjUzOGRmN2Y1YWEiXX0%3D.WY0V%2B2ypgT0PEWPUKVPSaiazKNfl4ib%2Bf89CpgcdxGo';
const publicResourceUrl =
  'https://asset-resources.gdevelop.io/public-resources/16x16 Dungeon Tileset/Armor/0a130324cd2501a97027b518b41231896a81e25034fd3a7baaca9581d079f8b6_Imp_Run_2.png';
const localFileUrl = 'some-local-file.png';

const makeTestProjectWithResourcesToDownload = () => {
  const { project } = makeTestProject(gd);

  // Add a resource that uses a URL, which will be download
  // by the LocalResourceMover.
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyResourceToDownload');
    newResource.setFile(classicUrl);
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }
  // Resource with an authorized URL
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyAuthorizedResourceToDownload');
    newResource.setFile(productAuthorizedUrl);
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }

  // Resource with a public asset URL
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyPublicResourceToDownload');
    newResource.setFile(publicResourceUrl);
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }

  // Add a resource that won't need to be downloaded (like other
  // resources in the test project).
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyAlreadyLocalResource');
    newResource.setFile(localFileUrl);
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }

  return project;
};

const makeMoveAllProjectResourcesOptions = (project: gdProject) => ({
  project,
  onProgress: jest.fn(),
  fileMetadata: { fileIdentifier: 'fake-file' },
});

describe('LocalResourceMover', () => {
  beforeEach(() => {
    mockFn(optionalRequire.mockFsExtra.ensureDir).mockReset();
    mockFn(optionalRequire.mockFsExtra.existsSync).mockReset();
    mockFn(optionalRequire.mockElectron.ipcRenderer.invoke).mockReset();
  });

  it('fetches resources and can download them', async () => {
    const project = makeTestProjectWithResourcesToDownload();

    // Mock a proper download
    mockFn(optionalRequire.mockFsExtra.ensureDir).mockResolvedValue({});
    mockFn(optionalRequire.mockFsExtra.existsSync).mockReturnValue(false);
    mockFn(optionalRequire.mockElectron.ipcRenderer.invoke).mockResolvedValue();

    const options = makeMoveAllProjectResourcesOptions(project);
    const fetchedResources = await moveUrlResourcesToLocalFiles(options);

    // Verify that download was done
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      classicUrl,
      path.join('assets', 'file-to-download.png')
    );
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      productAuthorizedUrl,
      path.join('assets', 'stars_levels (3).png')
    );
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      publicResourceUrl,
      path.join('assets', 'Imp_Run_2.png')
    );
    expect(fetchedResources.erroredResources).toEqual([]);
  });

  it('reports errors in case of download failure', async () => {
    const project = makeTestProjectWithResourcesToDownload();

    mockFn(optionalRequire.mockFsExtra.ensureDir).mockResolvedValue({});
    mockFn(optionalRequire.mockFsExtra.existsSync).mockReturnValue(false);
    // Mock failed download twice for first file
    mockFn(optionalRequire.mockElectron.ipcRenderer.invoke).mockRejectedValue(
      new Error('Fake download failure')
    );

    const options = makeMoveAllProjectResourcesOptions(project);
    const fetchedResources = await moveUrlResourcesToLocalFiles(options);

    // Verify that download was done and reported as failed, even after 2 tries for each file.
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledTimes(6);
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      classicUrl,
      path.join('assets', 'file-to-download.png')
    );
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      productAuthorizedUrl,
      path.join('assets', 'stars_levels (3).png')
    );
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      publicResourceUrl,
      path.join('assets', 'Imp_Run_2.png')
    );
    expect(fetchedResources.erroredResources).toEqual([
      { resourceName: 'MyResourceToDownload', error: expect.any(Error) },
      {
        resourceName: 'MyAuthorizedResourceToDownload',
        error: expect.any(Error),
      },
      { resourceName: 'MyPublicResourceToDownload', error: expect.any(Error) },
    ]);
  });

  it('automatically retries if a resource failed', async () => {
    const project = makeTestProjectWithResourcesToDownload();

    // Mock a failed download once, then successful
    mockFn(optionalRequire.mockFsExtra.ensureDir).mockResolvedValue({});
    mockFn(optionalRequire.mockFsExtra.existsSync).mockReturnValue(false);
    mockFn(optionalRequire.mockElectron.ipcRenderer.invoke)
      .mockRejectedValueOnce(new Error('Fake download failure'))
      .mockImplementationOnce(() => Promise.resolve());

    const options = makeMoveAllProjectResourcesOptions(project);
    const fetchedResources = await moveUrlResourcesToLocalFiles(options);

    // Verify that download was done (including a failure that was retried).
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledTimes(4);
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      classicUrl,
      path.join('assets', 'file-to-download.png')
    );
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      productAuthorizedUrl,
      path.join('assets', 'stars_levels (3).png')
    );
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      publicResourceUrl,
      path.join('assets', 'Imp_Run_2.png')
    );
    expect(fetchedResources.erroredResources).toEqual([]);
  });
});
