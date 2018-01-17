import path from 'path';
const gd = global.gd;

export default class BrowserS3FileSystem {
  constructor({ filesContent, awsS3Client, bucket, prefix, bucketBaseUrl }) {
    this.filesContent = filesContent;
    this.awsS3Client = awsS3Client;
    this.bucket = bucket;
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
    return Promise.all(this._pendingUploadObjects.map(this._uploadObject)).then(
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

  _uploadObject = params => {
    return new Promise((resolve, reject) => {
      this.awsS3Client.putObject(params, (err, data) => {
        if (err) return reject(err);

        resolve(data);
      });
    });
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

    fullpath = this._translateURL(fullpath);
    return path.basename(fullpath);
  };
  dirNameFrom = fullpath => {
    if (this._isExternalURL(fullpath)) return '';

    fullpath = this._translateURL(fullpath);
    return path.dirname(fullpath);
  };
  makeAbsolute = (filename, baseDirectory) => {
    if (this._isExternalURL(filename)) return filename;

    filename = this._translateURL(filename);
    if (!this.isAbsolute(baseDirectory))
      baseDirectory = path.resolve(baseDirectory);

    return path.resolve(baseDirectory, path.normalize(filename));
  };
  makeRelative = (filename, baseDirectory) => {
    if (this._isExternalURL(filename)) return filename;

    filename = this._translateURL(filename);
    return path.relative(baseDirectory, path.normalize(filename));
  };
  isAbsolute = fullpath => {
    if (this._isExternalURL(fullpath)) return true;

    if (fullpath.length === 0) return true;
    fullpath = this._translateURL(fullpath);
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

    source = this._translateURL(source);
    console.warn('Copy not done from', source, 'to', dest);
    return true;
  };
  copyDir = (source, dest) => {
    throw new Error('Not implemented');
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
      Bucket: this.bucket,
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

  /**
   * Return the filename associated to the URL on the server, relative to the games directory.
   * (i.e: Transform g/mydirectory/myfile.png to mydirectory/myfile.png).
   */
  _translateURL = filename => {
    if (filename.substr(0, 2) === 'g/' || filename.substr(0, 2) === 'g\\')
      filename = filename.substr(2);

    return filename;
  };
}
