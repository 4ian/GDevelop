// @flow

// Flow type definitions for zip.js 2.x
// Adapted from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/zip.js/index.d.ts
// Project: https://github.com/gildas-lormeau/zip.js
// Definitions by: Louis Grignon <https://github.com/lgrignon>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface FileEntry {}

declare export class ZipJs$Reader {
  size: number;
  init(callback: () => void, onerror: (error: any) => void): void;
  readUint8Array(
    index: number,
    length: number,
    callback: (result: Uint8Array) => void,
    onerror?: (error: any) => void
  ): void;
}

declare export class ZipJs$ZipReader {
  getEntries(callback: (entries: ZipJs$Entry[]) => void): void;
  close(callback?: () => void): void;
}

declare export class ZipJs$Writer {
  init(callback: () => void, onerror?: (error: any) => void): void;
  writeUint8Array(
    array: Uint8Array,
    callback: () => void,
    onerror?: (error: any) => void
  ): void;
  getData(callback: (data: any) => void, onerror?: (error: any) => void): void;
}

export interface ZipJs$Entry {
  filename: string;
  directory: boolean;
  compressedSize: number;
  uncompressedSize: number;
  lastModDate: Date;
  lastModDateRaw: number;
  comment: string;
  crc32: number;

  getData(
    writer: ZipJs$Writer,
    onend: (result: any) => void,
    onprogress?: (progress: number, total: number) => void,
    checkCrc32?: boolean
  ): void;
}

export interface ZipJs$WriteOptions {
  directory?: boolean;
  level?: number;
  comment?: string;
  lastModDate?: Date;
  version?: number;
}

declare export class ZipJs$ZipWriter {
  add(
    name: string,
    reader: ZipJs$Reader,
    onend: () => void,
    onprogress?: (progress: number, total: number) => void,
    options?: ZipJs$WriteOptions
  ): void;
  close(callback: (result: any) => void): void;
}

declare type ZipJs = {|
  useWebWorkers: boolean,
  workerScriptsPath: string,
  workerScripts: {
    deflater?: string[],
    inflater?: string[],
  },
  createReader: (
    reader: ZipJs$Reader,
    callback: (zipReader: ZipJs$ZipReader) => void,
    onerror?: (error: any) => void
  ) => void,

  createWriter: (
    writer: ZipJs$Writer,
    callback: (zipWriter: ZipJs$ZipWriter) => void,
    onerror?: (error: any) => void,
    dontDeflate?: boolean
  ) => void,
  TextReader: (text: string) => ZipJs$Reader,
  BlobReader: (blob: Blob) => ZipJs$Reader,
  Data64URIReader: (dataURI: string) => ZipJs$Reader,
  HttpReader: (url: string) => ZipJs$Reader,
  ZipReader: () => ZipJs$ZipReader,

  TextWriter: (encoding: ?string) => ZipJs$Writer,
  BlobWriter: (contentType: string) => ZipJs$Writer,
  FileWriter: (fileEntry: FileEntry) => ZipJs$Writer,
  Data64URIWriter: (mimeString?: string) => ZipJs$Writer,
  ZipWriter: () => ZipJs$ZipWriter,
|};
