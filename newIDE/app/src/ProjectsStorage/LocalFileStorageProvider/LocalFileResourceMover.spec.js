// @flow
import axios from 'axios';
import optionalRequire from '../../Utils/OptionalRequire';
import { moveUrlResourcesToLocalFiles } from './LocalFileResourceMover';
import { makeTestProject } from '../../fixtures/TestProject';
import { fakeSilverAuthenticatedUser } from '../../fixtures/GDevelopServicesTestData';
import path from 'path';
const gd: libGDevelop = global.gd;

jest.mock('../../Utils/OptionalRequire');
jest.mock('axios');

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

const classicUrl = 'https://www.example.com/file-to-download.png';
const productAuthorizedUrl =
  'https://private-assets.gdevelop.io/a2adcae7-ceba-4c0d-ad0f-411bf83692ea/resources/Misc/stars_levels (3) 汉字.png?token=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnZGV2ZWxvcC1zaG9wLWFwaSIsImF1ZCI6IjNwejJvWEZHSmVTaTVyVjROQ0pkclU4MjVUVDIiLCJleHAiOjE2NjY5NjM5NDY1OTUsInN1YiI6WyJhMmFkY2FlNy1jZWJhLTRjMGQtYWQwZi00MTFiZjgzNjkyZWEiLCJjM2ZmZjUyZS1lMTZjLTQxMTYtYTYzNS03ZjUzOGRmN2Y1YWEiXX0%3D.WY0V%2B2ypgT0PEWPUKVPSaiazKNfl4ib%2Bf89CpgcdxGo';
const encodedProductAuthorizedUrl =
  'https://private-assets.gdevelop.io/a2adcae7-ceba-4c0d-ad0f-411bf83692ea/resources/Misc/stars_levels%20(3)%20%E6%B1%89%E5%AD%97.png?token=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnZGV2ZWxvcC1zaG9wLWFwaSIsImF1ZCI6IjNwejJvWEZHSmVTaTVyVjROQ0pkclU4MjVUVDIiLCJleHAiOjE2NjY5NjM5NDY1OTUsInN1YiI6WyJhMmFkY2FlNy1jZWJhLTRjMGQtYWQwZi00MTFiZjgzNjkyZWEiLCJjM2ZmZjUyZS1lMTZjLTQxMTYtYTYzNS03ZjUzOGRmN2Y1YWEiXX0%3D.WY0V%2B2ypgT0PEWPUKVPSaiazKNfl4ib%2Bf89CpgcdxGo';
const publicResourceUrl =
  'https://asset-resources.gdevelop.io/public-resources/16x16 Dungeon Tileset/Armor/0a130324cd2501a97027b518b41231896a81e25034fd3a7baaca9581d079f8b6_Imp Run 2.png';
const encodedPublicResourceUrl =
  'https://asset-resources.gdevelop.io/public-resources/16x16%20Dungeon%20Tileset/Armor/0a130324cd2501a97027b518b41231896a81e25034fd3a7baaca9581d079f8b6_Imp%20Run%202.png';
const localFileUrl = 'some-local-file.png';
const blobUrl = 'blob:http://something.com/1234567';

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

const makeTestProjectWithBlobResourcesToDownload = () => {
  const { project } = makeTestProject(gd);

  // Add a resource that uses a blob: URL, which will be download
  // by the LocalResourceMover. Use a name that needs to be adapted to be a valid filename.
  {
    const newResource = new gd.ImageResource();
    newResource.setName(
      'My Blob Resource To Download with 汉字 and funk¥/\\character$*\'"'
    );
    newResource.setFile(blobUrl);
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }
  // Add a blob with metadata indicating where to save the file.
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyOtherBlobResourceToDownload');
    newResource.setFile(blobUrl);
    newResource.setMetadata(
      '{"localFilePath": "existing-file.png","extension":".png"}'
    );
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }

  return project;
};

const makeTestProjectWitheBlobResourcesFailingToDownload = () => {
  const { project } = makeTestProject(gd);

  // Add a resource that uses a blob: URL, which will have an error
  // when downloaded by the LocalResourceMover.
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyBlobResourceFailingToDownload');
    newResource.setFile(blobUrl);
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }
  // Add a blob with an invalid metadata, which will be ignored.
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyOtherBlobResourceWithInvalidMetadata');
    newResource.setFile(blobUrl);
    newResource.setMetadata('{invalid metadata}');
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }

  return project;
};

const makeMoveAllProjectResourcesOptions = (project: gdProject) => ({
  project,
  onProgress: jest.fn(),
  fileMetadata: { fileIdentifier: 'fake-file' },
  authenticatedUser: fakeSilverAuthenticatedUser,
});

describe('LocalResourceMover', () => {
  let project = null;
  beforeEach(() => {
    mockFn(optionalRequire.mockFsExtra.ensureDir).mockReset();
    mockFn(optionalRequire.mockFsExtra.existsSync).mockReset();
    mockFn(optionalRequire.mockElectron.ipcRenderer.invoke).mockReset();
    mockFn(axios.get).mockReset();
  });
  afterEach(() => {
    if (project) project.delete();
  });

  it('fetches resources and can download them', async () => {
    project = makeTestProjectWithResourcesToDownload();

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
      encodedProductAuthorizedUrl,
      path.join('assets', 'stars_levels (3) 汉字.png')
    );
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      encodedPublicResourceUrl,
      path.join('assets', 'Imp Run 2.png')
    );
    expect(fetchedResources.erroredResources).toEqual([]);
  });

  it('reports errors in case of download failure', async () => {
    project = makeTestProjectWithResourcesToDownload();

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
      encodedProductAuthorizedUrl,
      path.join('assets', 'stars_levels (3) 汉字.png')
    );
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      encodedPublicResourceUrl,
      path.join('assets', 'Imp Run 2.png')
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
    project = makeTestProjectWithResourcesToDownload();

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
      encodedProductAuthorizedUrl,
      path.join('assets', 'stars_levels (3) 汉字.png')
    );
    expect(
      optionalRequire.mockElectron.ipcRenderer.invoke
    ).toHaveBeenCalledWith(
      'local-file-download',
      encodedPublicResourceUrl,
      path.join('assets', 'Imp Run 2.png')
    );
    expect(fetchedResources.erroredResources).toEqual([]);
  });

  describe('Support for blobs', () => {
    it('fetches resources with blobs and can download them', async () => {
      project = makeTestProjectWithBlobResourcesToDownload();

      // Mock a proper download
      mockFn(optionalRequire.mockFsExtra.ensureDir).mockResolvedValue({});
      mockFn(optionalRequire.mockFsExtra.existsSync).mockReturnValue(false);
      mockFn(
        optionalRequire.mockElectron.ipcRenderer.invoke
      ).mockResolvedValue();
      mockFn(axios.get).mockResolvedValue({
        data: 'fake-array-buffer-content',
      });

      const options = makeMoveAllProjectResourcesOptions(project);
      const fetchedResources = await moveUrlResourcesToLocalFiles(options);

      // Verify that download was done
      expect(
        optionalRequire.mockElectron.ipcRenderer.invoke
      ).toHaveBeenCalledWith(
        'local-file-save-from-arraybuffer',
        'fake-array-buffer-content',
        // No extension because none was specified, and the filename is inferred.
        path.join(
          'assets',
          "My Blob Resource To Download with 汉字 and funk¥__character__'_"
        )
      );
      expect(
        optionalRequire.mockElectron.ipcRenderer.invoke
      ).toHaveBeenCalledWith(
        'local-file-save-from-arraybuffer',
        'fake-array-buffer-content',
        // The filename in the metadata is used.
        path.resolve('existing-file.png')
      );
      expect(fetchedResources.erroredResources).toEqual([]);
    });

    it('reports errors in case of failure with blobs', async () => {
      project = makeTestProjectWitheBlobResourcesFailingToDownload();

      // Mock a failed download
      mockFn(optionalRequire.mockFsExtra.ensureDir).mockResolvedValue({});
      mockFn(optionalRequire.mockFsExtra.existsSync).mockReturnValue(false);
      mockFn(
        optionalRequire.mockElectron.ipcRenderer.invoke
      ).mockRejectedValueOnce(new Error('Fake blob download error'));
      mockFn(
        optionalRequire.mockElectron.ipcRenderer.invoke
      ).mockResolvedValueOnce();
      mockFn(axios.get).mockResolvedValue({
        data: 'fake-array-buffer-content',
      });

      const options = makeMoveAllProjectResourcesOptions(project);
      const fetchedResources = await moveUrlResourcesToLocalFiles(options);

      // Verify that one download was attempted and the other done
      expect(
        optionalRequire.mockElectron.ipcRenderer.invoke
      ).toHaveBeenCalledWith(
        'local-file-save-from-arraybuffer',
        'fake-array-buffer-content',
        path.join('assets', 'MyBlobResourceFailingToDownload')
      );
      expect(
        optionalRequire.mockElectron.ipcRenderer.invoke
      ).toHaveBeenCalledWith(
        'local-file-save-from-arraybuffer',
        'fake-array-buffer-content',
        // Metadata was invalid, so the name was inferred.
        path.join('assets', 'MyOtherBlobResourceWithInvalidMetadata')
      );
      expect(fetchedResources.erroredResources).toEqual([
        {
          error: expect.any(Error),
          resourceName: 'MyBlobResourceFailingToDownload',
        },
      ]);
    });
  });
});
