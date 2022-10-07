// @flow
import {
  getCredentialsForCloudProject,
  uploadProjectResourceFiles,
} from '../../Utils/GDevelopServices/Project';
import {
  downloadUrlsToBlobs,
  convertBlobToFiles,
} from '../../Utils/BlobDownloader';
import { makeTestProject } from '../../fixtures/TestProject';
import { moveUrlResourcesToCloudFilesIfPrivate } from './CloudResourceFetcher';
import { fakeIndieAuthenticatedUser } from '../../fixtures/GDevelopServicesTestData';
const gd: libGDevelop = global.gd;

jest.mock('../../Utils/GDevelopServices/Project');
jest.mock('../../Utils/BlobDownloader');

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

const makeTestProjectWithResourcesToDownload = () => {
  const { project } = makeTestProject(gd);

  // Resource with a private URL
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyResourceToDownloadAndReupload');
    newResource.setFile(
      'https://private-assets.gdevelop.io/file-to-download.png?token=123'
    );
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }

  // Resource with a public URL
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyResourceToLeaveAsIs');
    newResource.setFile('https://somepublic.domain.io/file.png');
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }

  return project;
};

const makeMoveUrlResourcesToCloudFilesIfPrivateOptions = (
  project: gdProject
) => ({
  project,
  fileMetadata: { fileIdentifier: 'fake-cloud-project-id' },
  authenticatedUser: fakeIndieAuthenticatedUser,
  onProgress: jest.fn(),
});

describe('CloudResourceFetcher', () => {
  beforeEach(() => {
    mockFn(getCredentialsForCloudProject).mockReset();
    mockFn(uploadProjectResourceFiles).mockReset();
    mockFn(downloadUrlsToBlobs).mockReset();
    mockFn(convertBlobToFiles).mockReset();
  });

  it('fetches resources and can download them', async () => {
    const project = makeTestProjectWithResourcesToDownload();
    const resource = project
      .getResourcesManager()
      .getResource('MyResourceToDownloadAndReupload');

    mockFn(downloadUrlsToBlobs).mockImplementation(() => [
      {
        item: {
          url:
            'https://private-assets.gdevelop.io/file-to-download.png?token=123',
          resource,
          filename: 'file-to-download.png',
        },
        blob: 'some blob',
        error: null,
      },
    ]);
    mockFn(convertBlobToFiles).mockImplementation(() => [
      {
        resource,
        file: 'some file',
      },
    ]);
    mockFn(getCredentialsForCloudProject).mockImplementation(async () => {});
    mockFn(uploadProjectResourceFiles).mockImplementation(() => [
      {
        url:
          'https://project-resources.gdevelop.io/fake-cloud-project-id/file-to-download.png',
        error: null,
      },
    ]);

    const options = makeMoveUrlResourcesToCloudFilesIfPrivateOptions(project);
    await moveUrlResourcesToCloudFilesIfPrivate(options);

    expect(downloadUrlsToBlobs).toHaveBeenCalledWith({
      urlContainers: [
        {
          url:
            'https://private-assets.gdevelop.io/file-to-download.png?token=123',
          resource: expect.any(gd.Resource),
          filename: 'file-to-download.png',
        },
      ],
      onProgress: expect.any(Function), // onProgress
    });
    expect(convertBlobToFiles).toHaveBeenCalledWith(
      [
        {
          item: {
            url:
              'https://private-assets.gdevelop.io/file-to-download.png?token=123',
            resource: expect.any(gd.Resource),
            filename: 'file-to-download.png',
          },
          blob: 'some blob',
          error: null,
        },
      ],
      expect.any(Function) // onError
    );
    expect(getCredentialsForCloudProject).toHaveBeenCalledWith(
      fakeIndieAuthenticatedUser,
      'fake-cloud-project-id'
    );
    expect(uploadProjectResourceFiles).toHaveBeenCalledWith(
      fakeIndieAuthenticatedUser,
      'fake-cloud-project-id',
      ['some file'],
      expect.any(Function) // onProgress
    );

    const updatedResource = project
      .getResourcesManager()
      .getResource('MyResourceToDownloadAndReupload');
    expect(updatedResource.getFile()).toBe(
      'https://project-resources.gdevelop.io/fake-cloud-project-id/file-to-download.png'
    );
  });
});
