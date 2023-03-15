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
import { fakeSilverAuthenticatedUser } from '../../fixtures/GDevelopServicesTestData';
const gd: libGDevelop = global.gd;

jest.mock('../../Utils/GDevelopServices/Project');
jest.mock('../../Utils/BlobDownloader');

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

const blobResourceName =
  'My Blob Resource To Download with 汉字 and funk¥/\\character$*\'"';

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

  // Resource with a blob URL
  {
    const newResource = new gd.ImageResource();
    newResource.setName(blobResourceName);
    newResource.setFile('blob:http://something.com/123456');
    newResource.setMetadata('{"extension":".png"}');
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
  authenticatedUser: fakeSilverAuthenticatedUser,
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
    const resourceToDownloadAndReupload = project
      .getResourcesManager()
      .getResource('MyResourceToDownloadAndReupload');
    const blobResourceToUpload = project
      .getResourcesManager()
      .getResource(blobResourceName);

    mockFn(downloadUrlsToBlobs).mockImplementationOnce(() => [
      {
        item: {
          url:
            'https://private-assets.gdevelop.io/file-to-download.png?token=123',
          resource: resourceToDownloadAndReupload,
          filename: 'file-to-download.png',
        },
        blob: 'some blob',
        error: null,
      },
      {
        item: {
          url: 'blob:http://something.com/123456',
          resource: blobResourceToUpload,
          filename:
            "My Blob Resource To Download with 汉字 and funk¥__character__'_.png",
        },
        blob: 'some blob',
        error: null,
      },
    ]);
    mockFn(convertBlobToFiles).mockImplementation(() => [
      {
        resource: resourceToDownloadAndReupload,
        file: 'some file',
      },
      {
        resource: blobResourceToUpload,
        file: 'some other file',
      },
    ]);
    mockFn(getCredentialsForCloudProject).mockImplementation(async () => {});
    mockFn(uploadProjectResourceFiles).mockImplementation(() => [
      {
        url:
          'https://project-resources.gdevelop.io/fake-cloud-project-id/file-to-download.png',
        error: null,
      },
      {
        url:
          "https://project-resources.gdevelop.io/fake-cloud-project-id/My Blob Resource To Download with 汉字 and funk¥__character__'_.png",
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
        {
          url: 'blob:http://something.com/123456',
          resource: expect.any(gd.Resource),
          filename:
            "My Blob Resource To Download with 汉字 and funk¥__character__'_.png",
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
        {
          item: {
            url: 'blob:http://something.com/123456',
            resource: expect.any(gd.Resource),
            filename:
              "My Blob Resource To Download with 汉字 and funk¥__character__'_.png",
          },
          blob: 'some blob',
          error: null,
        },
      ],
      expect.any(Function) // onError
    );
    expect(getCredentialsForCloudProject).toHaveBeenCalledWith(
      fakeSilverAuthenticatedUser,
      'fake-cloud-project-id'
    );
    expect(uploadProjectResourceFiles).toHaveBeenCalledWith(
      fakeSilverAuthenticatedUser,
      'fake-cloud-project-id',
      ['some file', 'some other file'],
      expect.any(Function) // onProgress
    );

    const updatedResource = project
      .getResourcesManager()
      .getResource('MyResourceToDownloadAndReupload');
    expect(updatedResource.getFile()).toBe(
      'https://project-resources.gdevelop.io/fake-cloud-project-id/file-to-download.png'
    );

    const updatedBlobResource = project
      .getResourcesManager()
      .getResource(blobResourceName);
    expect(updatedBlobResource.getFile()).toBe(
      "https://project-resources.gdevelop.io/fake-cloud-project-id/My Blob Resource To Download with 汉字 and funk¥__character__'_.png"
    );
  });
});
