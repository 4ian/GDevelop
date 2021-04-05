const path = require('path');

module.exports = {
  /**
   * Create a fake file system to be used in tests. Useful to test
   * things like exports.
   * @param {libGDevelop} gd
   * @param {Record<string, string>} fakeFileContents - Content of files that would be read by the file system.
   * @returns
   */
  makeFakeAbstractFileSystem: (gd, fakeFileContents) => {
    const fs = new gd.AbstractFileSystemJS();
    fs.mkDir = fs.clearDir = function () {};
    fs.getTempDir = function (path) {
      return '/tmp/';
    };
    fs.fileNameFrom = function (fullPath) {
      return path.posix.basename(fullPath);
    };
    fs.dirNameFrom = function (fullPath) {
      return path.posix.dirname(fullPath);
    };
    fs.makeAbsolute = function (relativePath, baseDirectory) {
      return path.posix.resolve(baseDirectory, relativePath);
    };
    fs.makeRelative = function (absolutePath, baseDirectory) {
      return path.posix.relative(baseDirectory, absolutePath);
    };
    fs.isAbsolute = function (fullPath) {
      return path.posix.isAbsolute(fullPath);
    };
    fs.dirExists = function (directoryPath) {
      return true; // Fake that all directory required exist.
    };
    fs.fileExists = function (directoryPath) {
      return true; // Fake that all files required exist.
    };
    fs.readDir = function () {
      return new gd.VectorString(); // Return nothing, but "readDir" is deprecated anyway.
    };
    fs.readFile = function (filePath) {
      if (!fakeFileContents.hasOwnProperty(filePath)) {
        throw new Error(
          `FakeAbstractFileSystem tried to access "${filePath}", but content for this file was not specified.`
        );
      }
      return fakeFileContents[filePath];
    };

    // In particular, create a mock copyFile, that we can track to verify
    // files are properly copied.
    fs.copyFile = jest.fn();
    fs.copyFile.mockImplementation(function (srcPath, destPath) {
      return true;
    });

    fs.writeToFile = jest.fn();
    fs.writeToFile.mockImplementation(function (filePath, content) {
      // Uncomment to log what is being written:
      // console.log('writeToFile called with', filePath, content);
      return true;
    });

    return fs;
  },
};
