// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import { getUID } from '../../Utils/LocalUserInfo';
import { isURL } from '../../ResourcesList/ResourceUtils';
const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');
const os = optionalRequire('os');

const gd: libGDevelop = global.gd;

export type UrlFileDescriptor = {|
  filePath: string,
  url: string,
|};

// For some reason, `path.posix` is undefined when packaged
// with webpack, so we're using `path` directly. As it's for the web-app,
// it should always be the posix version. In tests on Windows,
// it's necessary to use path.posix.
// Search for "pathPosix" in the codebase for other places where this is used.
const pathPosix = path.posix || path;

/**
 * Gives access to the local filesystem, but returns paths
 * that are using "/" as a path separator, even on Windows
 * (so that in exported games, paths are slashs, which is
 * supported everywhere).
 */
class LocalFileSystem {
  /**
   * True if URLs should be downloaded (useful for an export, but not for a preview).
   * @private
   */
  _downloadUrlsToLocalFiles: boolean;

  /**
   * Store all the files that should be downloaded (filepath => url)
   * @private
   */
  _filesToDownload: { [string]: string } = {};

  constructor(
    options: ?{|
      downloadUrlsToLocalFiles: boolean,
    |}
  ) {
    this._downloadUrlsToLocalFiles =
      !!options && options.downloadUrlsToLocalFiles;
  }

  /**
   * Returns all the files that should be downloaded from a URL, with the specified destination path prefix.
   */
  getAllUrlFilesIn = (pathPrefix: string): Array<UrlFileDescriptor> => {
    // Ensure the path prefix we're searching the files in is normalized,
    // because everything that we stored was normalized. If we don't do this,
    // we risk missing files on Windows (as pathPrefix can contain backslashes).
    const normalizedPathPrefix = pathPosix
      .normalize(pathPrefix)
      .replace(/\\/g, '/');

    return Object.keys(this._filesToDownload)
      .filter(filePath => filePath.indexOf(normalizedPathPrefix) === 0)
      .map(filePath => ({
        filePath,
        url: this._filesToDownload[filePath],
      }));
  };

  mkDir = (path: string) => {
    if (isURL(path)) {
      // URLs are always assumed to exist.
      return;
    }

    try {
      fs.mkdirsSync(path);
    } catch (e) {
      console.error('mkDir(' + path + ') failed: ' + e);
      return false;
    }
    return true;
  };
  dirExists = (path: string) => {
    if (isURL(path)) {
      // URLs are always assumed to exist.
      return true;
    }

    return fs.existsSync(path);
  };
  clearDir = (path: string) => {
    try {
      fs.emptyDirSync(path);
    } catch (e) {
      console.error('clearDir(' + path + ') failed: ' + e);
    }
  };
  getTempDir = () => {
    return path.join(os.tmpdir(), `GDTMP-${getUID()}`);
  };
  fileNameFrom = (fullPath: string) => {
    // If URLs are not downloaded, then filenames are not changed.
    if (!this._downloadUrlsToLocalFiles && isURL(fullPath)) return fullPath;

    return path.basename(fullPath);
  };
  dirNameFrom = (fullPath: string) => {
    return path.dirname(fullPath).replace(/\\/g, '/');
  };
  makeAbsolute = (filename: string, baseDirectory: string) => {
    if (isURL(filename)) return filename;

    if (!this.isAbsolute(baseDirectory))
      baseDirectory = path.resolve(baseDirectory);

    return path
      .resolve(baseDirectory, path.normalize(filename))
      .replace(/\\/g, '/');
  };
  makeRelative = (filename: string, baseDirectory: string) => {
    if (isURL(filename)) return filename;

    return path
      .relative(baseDirectory, path.normalize(filename))
      .replace(/\\/g, '/');
  };
  isAbsolute = (fullPath: string) => {
    if (isURL(fullPath)) return true;

    if (fullPath.length === 0) return true;
    return (
      (fullPath.length > 0 && fullPath.charAt(0) === '/') ||
      (fullPath.length > 1 && fullPath.charAt(1) === ':')
    );
  };
  copyFile = (source: string, dest: string) => {
    if (isURL(source)) {
      // If URLs are not downloaded, then there is nothing to copy.
      if (!this._downloadUrlsToLocalFiles) return true;

      if (isURL(dest)) {
        console.error(
          `Destination can't be a URL in copyFile (from ${source} to ${dest}).`
        );
        return false;
      }

      this._filesToDownload[pathPosix.normalize(dest)] = source;
      return true;
    }

    try {
      if (source !== dest) fs.copySync(source, dest);
    } catch (e) {
      console.error('copyFile(' + source + ', ' + dest + ') failed: ' + e);
      return false;
    }
    return true;
  };
  writeToFile = (file: string, contents: string) => {
    try {
      fs.outputFileSync(file, contents);
    } catch (e) {
      console.error('writeToFile(' + file + ', ...) failed: ' + e);
      return false;
    }
    return true;
  };
  readFile = (file: string) => {
    try {
      var contents = fs.readFileSync(file);
      return contents.toString();
    } catch (e) {
      console.error('readFile(' + file + ') failed: ' + e);
      return '';
    }
  };
  readDir = (path: string, ext: string) => {
    ext = ext.toUpperCase();
    var output = new gd.VectorString();
    try {
      var files = [];
      if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function(file) {
          if (
            ext.length === 0 ||
            file.toUpperCase().indexOf(ext, file.length - ext.length) !== -1
          ) {
            output.push_back(path + '/' + file);
          }
        });
      }
    } catch (e) {
      console.error('readDir(' + path + ',' + ext + ') failed: ' + e);
    }

    return output;
  };
  fileExists = (filePath: string) => {
    // Check if a file WILL exists once downloaded.
    const normalizedFilePath = pathPosix.normalize(filePath);
    const shouldTheFileBeDownloaded = !!this._filesToDownload[
      normalizedFilePath
    ];
    if (shouldTheFileBeDownloaded) {
      return true;
    }

    // Check if a local file exists.
    try {
      const stat = fs.statSync(filePath);
      return stat.isFile();
    } catch (e) {
      return false;
    }
  };
}

export default LocalFileSystem;
