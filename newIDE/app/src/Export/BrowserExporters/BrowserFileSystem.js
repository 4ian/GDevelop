// @flow
import path from 'path';
const gd = global.gd;

export type BlobFileDescriptor = {|
  filePath: string,
  blob: Blob,
|};

export type TextFileDescriptor = {|
  filePath: string,
  text: string,
|};

export type UrlFileDescriptor = {|
  filePath: string,
  url: string,
|};

type ConstructorArgs = {|
  textFiles: Array<TextFileDescriptor>,
|};

const isURL = (filename: string) => {
  return (
    filename.substr(0, 7) === 'http://' ||
    filename.substr(0, 8) === 'https://' ||
    filename.substr(0, 6) === 'ftp://'
  );
};

// TODO: Merge BrowserS3FileSystem into this?

/**
 * An in-memory "file system" that can be used for GDevelop exports.
 */
export default class BrowserFileSystem {
  // The representation of the "file system":

  /**
   * Store all the text files (filepath => content)
   * @private
   */
  _textFiles: { [string]: string } = {};

  /**
   * Store all the files that should be downloaded (filepath => url)
   * @private
   */
  _filesToDownload: { [string]: string } = {};

  /**
   * Create a new in-memory file system.
   */
  constructor({ textFiles }: ConstructorArgs) {
    textFiles.forEach(textFileDescriptor => {
      this._textFiles[textFileDescriptor.filePath] = textFileDescriptor.text;
    });
  }

  /**
   * Returns all the in memory text files with the specified path prefix.
   */
  getAllTextFilesIn = (pathPrefix: string): Array<TextFileDescriptor> => {
    return Object.keys(this._textFiles)
      .filter(filePath => filePath.indexOf(pathPrefix) === 0)
      .map(filePath => ({
        filePath,
        text: this._textFiles[filePath],
      }));
  };

  /**
   * Returns all the files that should be downloaded from a URL, with the specified path prefix.
   */
  getAllUrlFilesIn = (pathPrefix: string): Array<UrlFileDescriptor> => {
    return Object.keys(this._filesToDownload)
      .filter(filePath => filePath.indexOf(pathPrefix) === 0)
      .map(filePath => ({
        filePath,
        url: this._filesToDownload[filePath],
      }));
  };

  mkDir = (path: string) => {
    // "Directories" are assumed to exist.
    return true;
  };
  dirExists = (path: string) => {
    // TODO: To be changed to be EnsureDirExists.
    // "Directories" are assumed to exist.
    return true;
  };
  clearDir = (path: string) => {
    // Clear the files to be written in the specified directory.
    const filePaths = Object.keys(this._textFiles);
    filePaths.forEach(filePath => {
      if (filePath.indexOf(path) === 0) {
        delete this._textFiles[filePath];
      }
    });

    return true;
  };
  getTempDir = () => {
    return '/browser-file-system-tmp-dir';
  };
  fileNameFrom = (fullpath: string) => {
    return path.basename(fullpath);
  };
  dirNameFrom = (fullpath: string) => {
    return path.dirname(fullpath);
  };
  makeAbsolute = (filePathOrURL: string, baseDirectoryOrURL: string) => {
    // URLs are always absolute
    if (isURL(filePathOrURL)) return filePathOrURL;

    if (!this.isAbsolute(baseDirectoryOrURL))
      baseDirectoryOrURL = path.resolve(baseDirectoryOrURL);

    return path.resolve(baseDirectoryOrURL, path.normalize(filePathOrURL));
  };
  makeRelative = (filePathOrURL: string, baseDirectoryOrURL: string) => {
    if (isURL(filePathOrURL)) {
      // Cutting the start if the URL is relative to the base URL
      if (filePathOrURL.indexOf(baseDirectoryOrURL) === 0) {
        return filePathOrURL.substring(baseDirectoryOrURL.length);
      }

      // Keep the URL "absolute" if on different domains.
      console.warn(
        `${filePathOrURL} cannot be made relative to ${baseDirectoryOrURL}, please double check this behavior is correct.`
      );
      return filePathOrURL;
    }

    // Paths are treated as usual paths.
    return path.relative(baseDirectoryOrURL, path.normalize(filePathOrURL));
  };
  isAbsolute = (fullpath: string) => {
    // URLs are always absolute
    if (isURL(fullpath)) return true;

    // Paths are absolute if starting from the root
    return fullpath.length > 0 && fullpath.charAt(0) === '/';
  };

  copyFile = (source: string, dest: string) => {
    // URLs are not copied, but marked as to be downloaded.
    if (isURL(source)) {
      if (isURL(dest)) {
        console.error(
          `Destination can't be a URL in copyFile (from ${source} to ${dest}).`
        );
        return false;
      }

      this._filesToDownload[path.normalize(dest)] = source;
      return true;
    }

    // If this is a file that we have already in memory,
    // copy its path.
    if (!!this._textFiles[source]) {
      this._textFiles[path.normalize(dest)] = this._textFiles[source];
      return true;
    }

    console.error(`File not found in copyFile (from ${source} to ${dest}).`);
    return false;
  };

  writeToFile = (filePath: string, content: string) => {
    this._textFiles[path.normalize(filePath)] = content;
    return true;
  };

  readFile = (file: string): string => {
    if (this._textFiles[file]) return this._textFiles[file];

    console.error(`Unknown file ${file}, returning an empty string`);
    return '';
  };

  readDir = (path: string, ext: string) => {
    ext = ext.toUpperCase();
    var output = new gd.VectorString();

    // Simulate ReadDir by returning all external URLs
    // with the filename matching the extension.
    Object.keys(this._filesToDownload).forEach(filePath => {
      const upperCaseFilePath = filePath.toUpperCase();
      if (
        upperCaseFilePath.indexOf(ext) ===
        upperCaseFilePath.length - ext.length
      ) {
        output.push_back(filePath);
      }
    });

    return output;
  };

  fileExists = (filePath: string) => {
    if (isURL(filePath)) return true;

    const normalizedFilePath = path.normalize(filePath);
    return (
      !!this._textFiles[normalizedFilePath] ||
      !!this._filesToDownload[normalizedFilePath]
    );
  };
}
