// @flow
import { downloadResourcesAsBlobs } from './DownloadFileSaveAsDialog';
import { downloadUrlsToBlobs } from '../../Utils/BlobDownloader';
const gd: libGDevelop = global.gd;

jest.mock('../../Utils/BlobDownloader');
jest.mock('../../Utils/OptionalRequire');

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

const makeTestProjectWithResourcesToDownload = () => {
  const project = new gd.ProjectHelper.createNewGDJSProject();

  // Add a resource that uses a URL, which will be left as is.
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyResourceToDownload');
    newResource.setFile('http://example/file-to-download.png');
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }

  // Add a local resource which can't be downloaded, as unsupported.
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyAlreadyLocalResource');
    newResource.setFile('some-local-file.png');
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }

  // Add a resource from the GDevelop cloud bucket.
  {
    const newResource = new gd.ImageResource();
    newResource.setName('Happy Pea');
    newResource.setFile(
      'https://project-resources.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/resources/6ef87bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy.png'
    );
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }
  // Add another resource with the same "filename" but a different hash.
  {
    const newResource = new gd.ImageResource();
    newResource.setName('Another Happy Pea');
    newResource.setFile(
      'https://project-resources.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/resources/12345bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Pea-Happy.png'
    );
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }
  // Add another resource that will error during the download
  {
    const newResource = new gd.ImageResource();
    newResource.setName('Failing download');
    newResource.setFile(
      'https://project-resources.gdevelop.io/a9fe5bce-de39-4147-a669-93fc5cd69632/resources/12345bc678921eb4bfa2d04e5dc6a16b75f7b239f3163d0c5efe64d4cc501711-Test.png'
    );
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }

  return project;
};

describe('DownloadFileSaveAsDialog', () => {
  describe('downloadResourcesAsBlobs', () => {
    let project: ?gdProject;
    beforeEach(() => {
      project = makeTestProjectWithResourcesToDownload();
    });
    afterEach(() => {
      if (project) project.delete();
      project = null;
    });

    it('downloads files as blobs', async () => {
      if (!project)
        throw new Error('Missing project, test is not properly setup.');
      const onAddBlobFile = jest.fn();
      mockFn(downloadUrlsToBlobs).mockImplementationOnce(({ urlContainers }) =>
        urlContainers.map(({ filename, resource }) => ({
          item: { resource, filename },
          error:
            resource.getName() === 'Failing download'
              ? new Error('Fake download error')
              : null,
          blob: { blob: 'this-is-a-fake-blob' },
        }))
      );

      const result = await downloadResourcesAsBlobs({
        project,
        onAddBlobFile,
        onProgress: () => {},
      });

      // Local resources are expected to be erroring, as they can't be fetched.
      // We should also get an error for the resource that is set to fail to download.
      expect(result).toMatchInlineSnapshot(`
        Object {
          "erroredResources": Array [
            Object {
              "error": [Error: Unsupported relative file when downloading a copy.],
              "resourceName": "MyAlreadyLocalResource",
            },
            Object {
              "error": [Error: Fake download error],
              "resourceName": "Failing download",
            },
          ],
        }
      `);

      // GDevelop cloud resources have been downloaded as blobs:
      expect(onAddBlobFile).toHaveBeenCalledTimes(2);
      expect(onAddBlobFile.mock.calls[0][0]).toMatchInlineSnapshot(`
        Object {
          "blob": Object {
            "blob": "this-is-a-fake-blob",
          },
          "filePath": "assets/image/Pea-Happy.png",
        }
      `);
      expect(onAddBlobFile.mock.calls[1][0]).toMatchInlineSnapshot(`
        Object {
          "blob": Object {
            "blob": "this-is-a-fake-blob",
          },
          "filePath": "assets/image/Pea-Happy2.png",
        }
      `);
    });
  });
});
