import path from 'path';
const gd = global.gd;

export const makeBrowserS3FileSystem = (
  { filesContent, awsS3Client, bucket, prefix }
) => ({
  mkDir: function(path) {
    console.log('mkDir(' + path + ') skipped.');
  },
  dirExists: function(path) {
    console.log('Assume directory ' + path + ' exists.');
    return true;
  },
  clearDir: function(path) {
    console.log('Assume ' + path + ' is cleared.');
  },
  getTempDir: function() {
    return '/tmp'; //TODO
  },
  fileNameFrom: function(fullpath) {
    if (this._isExternalURL(fullpath)) return fullpath;

    fullpath = this._translateURL(fullpath);
    return path.basename(fullpath);
  },
  dirNameFrom: function(fullpath) {
    if (this._isExternalURL(fullpath)) return '';

    fullpath = this._translateURL(fullpath);
    return path.dirname(fullpath);
  },
  makeAbsolute: function(filename, baseDirectory) {
    if (this._isExternalURL(filename)) return filename;

    filename = this._translateURL(filename);
    if (!this.isAbsolute(baseDirectory))
      baseDirectory = path.resolve(baseDirectory);

    return path.resolve(baseDirectory, path.normalize(filename));
  },
  makeRelative: function(filename, baseDirectory) {
    if (this._isExternalURL(filename)) return filename;

    filename = this._translateURL(filename);
    return path.relative(baseDirectory, path.normalize(filename));
  },
  isAbsolute: function(fullpath) {
    if (this._isExternalURL(fullpath)) return true;

    if (fullpath.length === 0) return true;
    fullpath = this._translateURL(fullpath);
    return (fullpath.length > 0 && fullpath.charAt(0) === '/') ||
      (fullpath.length > 1 && fullpath.charAt(1) === ':');
  },
  copyFile: function(source, dest) {
    //URL are not copied.
    if (this._isExternalURL(source)) return true;

    source = this._translateURL(source);
    console.warn('Copy not done from', source, 'to', dest);
    return true;
  },
  copyDir: function(source, dest) {
    throw new Error('Not implemented');
  },
  writeToFile: function(file, contents) {
    awsS3Client.putObject(
      {
        Bucket: bucket,
        Key: prefix + file,
        Body: contents,
        //TODO: ContentType
      },
      (err, data) => {
        if (err)
          console.log(err, err.stack); // an error occurred
        else
          console.log(data); // successful response
      }
    );
    //TODO: Add to a queue of promises.

    return true;
  },
  readFile: function(file) {
    if (filesContent.hasOwnProperty(file)) return filesContent[file];

    console.error(`Unknown file ${file}, returning an empty string`);
    return '';
  },
  readDir: function(path, ext) {
    ext = ext.toUpperCase();
    var output = new gd.VectorString();

    console.warn('Assume', path, 'is empty for extension', ext);
    return output;
  },
  fileExists: function(filename) {
    if (this._isExternalURL(filename)) return true;

    // // Do as if the virtual GDJS folder is empty so that the exporter
    // // keeps the absolute URL.
    // if (filename.indexOf(gdjsRoot) === 0) return false;

    return true;
  },
  _isExternalURL: function(filename) {
    return filename.substr(0, 7) === 'http://' ||
      filename.substr(0, 8) === 'https://' ||
      filename.substr(0, 6) === 'ftp://';
  },
  /**
   * Return the filename associated to the URL on the server, relative to the games directory.
   * (i.e: Transform g/mydirectory/myfile.png to mydirectory/myfile.png).
   */
  _translateURL: function(filename) {
    if (filename.substr(0, 2) === 'g/' || filename.substr(0, 2) === 'g\\')
      filename = filename.substr(2);

    return filename;
  },
});
