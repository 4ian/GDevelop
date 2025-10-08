// @flow
import path from 'path-browserify';
import { putFile } from '../../Utils/LocalFileIndexedDB';
const gd: libGDevelop = global.gd;

export type TextFileDescriptor = {|
  filePath: string,
  text: string,
|};

type ConstructorArgs = {|
  filesContent: Array<TextFileDescriptor>,
  prefix: string,
  baseUrl: string,
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
 * Determines the content type based on file extension.
 */
const getContentType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.wasm': 'application/wasm',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * An in-memory "file system" that stores files in IndexedDB
 * and serves them via a service worker for GDevelop previews.
 */
export default class BrowserSWFileSystem {
  prefix: string;
  baseUrl: string;

  // Store the content of some files.
  _indexedFilesContent: { [string]: TextFileDescriptor };

  // Store all the files that should be written to IndexedDB.
  _pendingFiles: Array<{|
    path: string,
    content: string,
    contentType: string,
  |}> = [];

  // Store a set of all external URLs copied so that we can simulate
  // readDir result.
  _allCopiedExternalUrls = new Set<string>();

  constructor({ filesContent, prefix, baseUrl }: ConstructorArgs) {
    this.prefix = prefix;
    this.baseUrl = baseUrl;

    this._indexedFilesContent = {};
    filesContent.forEach(textFileDescriptor => {
      this._indexedFilesContent[
        textFileDescriptor.filePath
      ] = textFileDescriptor;
    });
  }

  /**
   * Uploads all pending files to IndexedDB.
   * This replaces the S3 upload functionality with local IndexedDB storage.
   */
  uploadPendingObjects = async () => {
    try {
      console.log(
        `[BrowserSWFileSystem] Storing ${this._pendingFiles.length} files in IndexedDB for preview...`
      );

      const uploadPromises = this._pendingFiles.map(async (file) => {
        const fullPath = `/${file.path}`; // TODO
        const encoder = new TextEncoder();
        const bytes = encoder.encode(file.content).buffer;

        console.log(
          `[BrowserSWFileSystem] Storing file: ${fullPath} (${bytes.byteLength} bytes, ${file.contentType})`
        );

        await putFile(fullPath, bytes, file.contentType);
      });

      await Promise.all(uploadPromises);

      console.log(
        `[BrowserSWFileSystem] Successfully stored all ${this._pendingFiles.length} preview files in IndexedDB.`
      );
    } catch (error) {
      console.error("[BrowserSWFileSystem] Can't store all files in IndexedDB:", error);
      throw error;
    }
  };

  mkDir = (path: string) => {
    // Assume required directories always exist in a virtual file system.
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
    // URLs are not copied, just tracked.
    if (isURL(source)) {
      this._allCopiedExternalUrls.add(source);
      return true;
    }

    console.warn('[BrowserSWFileSystem] Copy not done from', source, 'to', dest);
    return true;
  };

  writeToFile = (fullPath: string, contents: string) => {
    // Remove the base URL to get the relative path
    const relativePath = fullPath.replace(this.baseUrl, '');
    const contentType = getContentType(fullPath);

    console.log(
      `[BrowserSWFileSystem] Queuing file for IndexedDB: ${relativePath} (${contentType})`
    );

    // Queue the file to be written to IndexedDB
    this._pendingFiles.push({
      path: relativePath,
      content: contents,
      contentType,
    });

    return true;
  };

  readFile = (file: string) => {
    if (!!this._indexedFilesContent[file])
      return this._indexedFilesContent[file].text;

    console.error(`[BrowserSWFileSystem] Unknown file ${file}, returning an empty string`);
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

    // Assume all files asked for exist.
    return true;
  };
}