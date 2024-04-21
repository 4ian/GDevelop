// @flow
import path from 'path-browserify';
import { uploadObject } from '../../Utils/GDevelopServices/Preview';
const gd: libGDevelop = global.gd;

export type TextFileDescriptor = {|
  filePath: string,
  text: string,
|};

type PendingUploadFileDescriptor = {|
  Key: string,
  Body: string,
  ContentType: 'text/javascript' | 'text/html',
|};

type ConstructorArgs = {|
  filesContent: Array<TextFileDescriptor>,
  prefix: string,
  bucketBaseUrl: string,
|};

const isURL = (filename: string) => {
  return (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('ftp://') ||
    filename.startsWith('blob:') ||
    filename.startsWith('data:')
  );
};

/**
 * An in-memory "file system" that can be used for GDevelop previews.
 */
export default class BrowserS3FileSystem {
  prefix: string;
  bucketBaseUrl: string;

  // Store the content of some files.
  _indexedFilesContent: { [string]: TextFileDescriptor };

  // Store all the objects that should be written on the S3 bucket.
  // Call uploadPendingObjects to send them
  _pendingUploadObjects: Array<PendingUploadFileDescriptor> = [];

  // Store a set of all external URLs copied so that we can simulate
  // readDir result.
  _allCopiedExternalUrls = new Set<string>();

  constructor({ filesContent, prefix, bucketBaseUrl }: ConstructorArgs) {
    this.prefix = prefix;
    this.bucketBaseUrl = bucketBaseUrl;

    this._indexedFilesContent = {};
    filesContent.forEach(textFileDescriptor => {
      this._indexedFilesContent[
        textFileDescriptor.filePath
      ] = textFileDescriptor;
    });
  }

  uploadPendingObjects = () => {
    return Promise.all(this._pendingUploadObjects.map(uploadObject)).then(
      result => {
        console.log('Uploaded all objects:', result);
        this._pendingUploadObjects = [];
      },
      error => {
        console.error("Can't upload all objects:", error);
        throw error;
      }
    );
  };

  mkDir = (path: string) => {
    // Assume required directories always exist.
  };
  dirExists = (path: string) => {
    // Assume required directories always exist.
    return true;
  };
  clearDir = (path: string) => {
    // Assume path is cleared.
  };
  getTempDir = () => {
    return '/virtual-unused-tmp-dir';
  };
  fileNameFrom = (fullpath: string) => {
    if (isURL(fullpath)) return fullpath;

    return path.basename(fullpath);
  };
  dirNameFrom = (fullpath: string) => {
    if (isURL(fullpath)) return '';

    return path.dirname(fullpath);
  };
  makeAbsolute = (filename: string, baseDirectory: string) => {
    if (isURL(filename)) return filename;

    if (!this.isAbsolute(baseDirectory))
      baseDirectory = path.resolve(baseDirectory);

    return path.resolve(baseDirectory, path.normalize(filename));
  };
  makeRelative = (filename: string, baseDirectory: string) => {
    if (isURL(filename)) return filename;

    return path.relative(baseDirectory, path.normalize(filename));
  };
  isAbsolute = (fullpath: string) => {
    if (isURL(fullpath)) return true;

    if (fullpath.length === 0) return true;
    return (
      (fullpath.length > 0 && fullpath.charAt(0) === '/') ||
      (fullpath.length > 1 && fullpath.charAt(1) === ':')
    );
  };
  copyFile = (source: string, dest: string) => {
    //URL are not copied.
    if (isURL(source)) {
      this._allCopiedExternalUrls.add(source);
      return true;
    }

    console.warn('Copy not done from', source, 'to', dest);
    return true;
  };
  writeToFile = (fullPath: string, contents: string) => {
    const key = fullPath.replace(this.bucketBaseUrl, '');
    const mime = {
      '.js': 'text/javascript',
      '.html': 'text/html',
    };
    const fileExtension = path.extname(fullPath);

    // Defer real upload until it's triggered by calling
    // uploadPendingObjects.
    this._pendingUploadObjects.push({
      Key: key,
      Body: contents,
      ContentType: mime[fileExtension],
    });
    return true;
  };

  readFile = (file: string) => {
    if (!!this._indexedFilesContent[file])
      return this._indexedFilesContent[file].text;

    console.error(`Unknown file ${file}, returning an empty string`);
    return '';
  };

  readDir = (path: string, ext: string) => {
    ext = ext.toUpperCase();
    var output = new gd.VectorString();

    // Simulate ReadDir by returning all external URLs
    // with the filename matching the extension.
    this._allCopiedExternalUrls.forEach(url => {
      const upperCaseUrl = url.toUpperCase();
      if (upperCaseUrl.indexOf(ext) === upperCaseUrl.length - ext.length) {
        output.push_back(url);
      }
    });

    return output;
  };

  fileExists = (filename: string) => {
    if (isURL(filename)) return true;

    // Assume all files asked for exists.
    return true;
  };
}
