// @flow
import { makeTestProject } from '../fixtures/TestProject';
import optionalRequire from '../Utils/OptionalRequire';
import path from 'path';
import {
  downloadUrlsToBlobs,
  convertBlobToDataURL,
} from '../Utils/BlobDownloader';
import { downloadAndPrepareExternalEditorBase64Resources } from './LocalResourceExternalEditors';
const gd: libGDevelop = global.gd;

jest.mock('../Utils/BlobDownloader');
jest.mock('../Utils/OptionalRequire');

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

const classicUrl = 'https://www.example.com/file-to-download.png';
const localFile = 'some/local-file.png';

const makeTestProjectWithResourcesToDownload = () => {
  const { project } = makeTestProject(gd);

  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyResourceToDownload');
    newResource.setFile(classicUrl);
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }
  {
    const newResource = new gd.ImageResource();
    newResource.setName('MyLocalFile');
    newResource.setFile(localFile);
    project.getResourcesManager().addResource(newResource);
    newResource.delete();
  }

  return project;
};

describe('LocalResourceExternalEditors', () => {
  describe('downloadAndPrepareExternalEditorBase64Resources', () => {
    let project = null;
    beforeEach(() => {
      mockFn(downloadUrlsToBlobs).mockReset();
      mockFn(optionalRequire.mockFs.promises.readFile).mockReset();
    });
    afterEach(() => {
      if (project) project.delete();
      project = null;
    });
    test('Can download files or read local files', async () => {
      project = makeTestProjectWithResourcesToDownload();

      // Mock the successful download of a resource.
      mockFn(downloadUrlsToBlobs).mockImplementation(
        async ({ urlContainers }) => {
          return urlContainers.map(urlContainer => ({
            error: null,
            blob: { content: 'fake-blob' },
            item: urlContainer,
          }));
        }
      );
      mockFn(convertBlobToDataURL).mockImplementation(async () => {
        return 'data:fake/data-url;base64,0123456789ABCDEF';
      });

      // Mock the reading of a local file.
      mockFn(optionalRequire.mockFs.promises.readFile).mockImplementation(
        async () => 'somefakecontent'
      );

      const result = await downloadAndPrepareExternalEditorBase64Resources({
        project,
        resourceNames: ['NotExisting', 'MyResourceToDownload', 'MyLocalFile'],
      });

      // Check that the file were downloaded/read.
      expect(optionalRequire.mockFs.promises.readFile).toHaveBeenCalledWith(
        path.resolve('some/local-file.png')
      );
      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "dataUrl": "",
            "name": "NotExisting",
          },
          Object {
            "dataUrl": "data:fake/data-url;base64,0123456789ABCDEF",
            "localFilePath": undefined,
            "name": "MyResourceToDownload",
          },
          Object {
            "dataUrl": "data:text/plain;base64,somefakecontent",
            "localFilePath": "some/local-file.png",
            "name": "MyLocalFile",
          },
        ]
      `);
    });
  });
});
