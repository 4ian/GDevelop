import path from 'path';
import { uploadObject } from '../../Utils/GDevelopServices/Preview';
const gd = global.gd;

export default class BrowserS3FileSystem {
  constructor({ filesContent, prefix, bucketBaseUrl }) {
    this.filesContent = filesContent;
    this.prefix = prefix;
    this.bucketBaseUrl = bucketBaseUrl;

    // Store all the objects that should be written on the S3 bucket.
    // Call uploadPendingObjects to send them
    this._pendingUploadObjects = [];

    // Store a set of all external URLs copied so that we can simulate
    // readDir result.
    this._allCopiedExternalUrls = new Set();
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

  mkDir = path => {
    // Assume required directories always exist.
  };
  dirExists = path => {
    // Assume required directories always exist.
    return true;
  };
  clearDir = path => {
    // Assume path is cleared.
  };
  getTempDir = () => {
    return '/virtual-unused-tmp-dir';
  };
  fileNameFrom = fullpath => {
    if (this._isExternalURL(fullpath)) return fullpath;

    return path.basename(fullpath);
  };
  dirNameFrom = fullpath => {
    if (this._isExternalURL(fullpath)) return '';

    return path.dirname(fullpath);
  };
  makeAbsolute = (filename, baseDirectory) => {
    if (this._isExternalURL(filename)) return filename;

    if (!this.isAbsolute(baseDirectory))
      baseDirectory = path.resolve(baseDirectory);

    return path.resolve(baseDirectory, path.normalize(filename));
  };
  makeRelative = (filename, baseDirectory) => {
    if (this._isExternalURL(filename)) return filename;

    return path.relative(baseDirectory, path.normalize(filename));
  };
  isAbsolute = fullpath => {
    if (this._isExternalURL(fullpath)) return true;

    if (fullpath.length === 0) return true;
    return (
      (fullpath.length > 0 && fullpath.charAt(0) === '/') ||
      (fullpath.length > 1 && fullpath.charAt(1) === ':')
    );
  };
  copyFile = (source, dest) => {
    //URL are not copied.
    if (this._isExternalURL(source)) {
      this._allCopiedExternalUrls.add(source);
      return true;
    }

    console.warn('Copy not done from', source, 'to', dest);
    return true;
  };
  writeToFile = (fullPath, contents) => {
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

  readFile = file => {
    if (this.filesContent.hasOwnProperty(file)) return this.filesContent[file];

    console.error(`Unknown file ${file}, returning an empty string`);
    return '';
  };

  readDir = (path, ext) => {
    ext = ext.toUpperCase();
    var output = new gd.VectorString();

    // Simulate ReadDir by returning all external URL s
    // with the filename matching the extension.
    this._allCopiedExternalUrls.forEach(url => {
      const upperCaseUrl = url.toUpperCase();
      if (upperCaseUrl.indexOf(ext) === upperCaseUrl.length - ext.length) {
        output.push_back(url);
      }
    });

    return output;
  };

  fileExists = filename => {
    if (this._isExternalURL(filename)) return true;

    // Assume all files asked for exists.
    return true;
  };

  _isExternalURL = filename => {
    return (
      filename.substr(0, 7) === 'http://' ||
      filename.substr(0, 8) === 'https://' ||
      filename.substr(0, 6) === 'ftp://'
    );
  };
}
