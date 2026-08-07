// @flow

/**
 * The ".gdpak" resource pack format.
 *
 * A pack is a single binary file holding the content of many game resources,
 * so that an exported game stays below the file count limits of hosting
 * services (itch.io refuses HTML5 archives containing more than 1000 files).
 *
 * Layout:
 *
 *   offset 0    "GDPK"                        4 bytes, ASCII magic
 *   offset 4    uint32 LE version             format version (1)
 *   offset 8    uint32 LE indexByteLength     byte length of the JSON index
 *   offset 12   index JSON (UTF-8)            indexByteLength bytes
 *               zero padding                  up to the next 16 bytes boundary
 *               file contents                 each padded to 16 bytes
 *
 * The index is stored at the *beginning* of the file (unlike a zip, whose
 * central directory is at the end) so that a future implementation can read it
 * with a single HTTP range request.
 *
 * Contents are stored uncompressed: images, audio and 3D models are already
 * compressed formats, and web servers compress the rest on the fly. This also
 * keeps reading a file a simple `Blob.slice`, which the browser can do without
 * copying anything into memory.
 */

export const PACK_MAGIC = 'GDPK';
export const PACK_VERSION = 1;
export const PACK_HEADER_SIZE = 12;

/**
 * Contents are aligned so that a `Blob.slice` never straddles a boundary
 * unnecessarily, and so that the layout stays readable when debugging a pack.
 */
export const PACK_ALIGNMENT = 16;

export type PackEntryInput = {|
  /** The name of the file inside the pack. This is the `file` field of a resource. */
  filePath: string,
  /** The byte length of the file content. */
  size: number,
|};

export type PackEntry = {|
  path: string,
  offset: number,
  size: number,
  type: string,
|};

export type PackLayout = {|
  /** The bytes to write before any file content (magic, version, index, padding). */
  headerBytes: Uint8Array,
  /** The entries, in the order their content must be written. */
  entries: Array<PackEntry>,
  /**
   * The number of padding bytes to write after each entry content, in the same
   * order as `entries`.
   */
  paddings: Array<number>,
  /** The total byte length of the resulting pack. */
  totalSize: number,
|};

const encodeUtf8 = (text: string): Uint8Array => new TextEncoder().encode(text);

const alignUp = (value: number): number => {
  const remainder = value % PACK_ALIGNMENT;
  return remainder === 0 ? value : value + (PACK_ALIGNMENT - remainder);
};

const RESOURCE_MIME_TYPES: { [extension: string]: string } = {
  // Images
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  ktx: 'image/ktx',
  ktx2: 'image/ktx2',
  basis: 'application/octet-stream',

  // Audio
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  opus: 'audio/ogg',
  wav: 'audio/wav',
  aac: 'audio/aac',
  m4a: 'audio/mp4',
  flac: 'audio/flac',
  weba: 'audio/webm',

  // Videos
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogv: 'video/ogg',
  m4v: 'video/mp4',

  // Fonts
  ttf: 'font/ttf',
  otf: 'font/otf',
  woff: 'font/woff',
  woff2: 'font/woff2',
  eot: 'application/vnd.ms-fontobject',

  // Data
  json: 'application/json',
  tmj: 'application/json',
  tsj: 'application/json',
  ldtk: 'application/json',
  tmx: 'application/xml',
  tsx: 'application/xml',
  xml: 'application/xml',
  fnt: 'text/plain',
  atlas: 'text/plain',
  txt: 'text/plain',
  csv: 'text/csv',

  // 3D models
  glb: 'model/gltf-binary',
  gltf: 'model/gltf+json',
  obj: 'text/plain',

  // Spine
  skel: 'application/octet-stream',
};

/**
 * Return the MIME type to give to the `Blob` holding this file's content.
 *
 * This matters: once packed, resources are handed to the game engine as `blob:`
 * URLs, which carry no file extension. `<audio>` and `<video>` elements rely on
 * the Blob type to pick a decoder.
 */
export const getResourceMimeType = (filePath: string): string => {
  const lastDotIndex = filePath.lastIndexOf('.');
  if (lastDotIndex === -1) return 'application/octet-stream';

  const extension = filePath
    .slice(lastDotIndex + 1)
    .toLowerCase()
    // Resource files can keep a query string or a fragment when they come from
    // a URL.
    .replace(/[?#].*$/, '');

  return RESOURCE_MIME_TYPES[extension] || 'application/octet-stream';
};

const buildIndexJson = (entries: Array<PackEntry>): string =>
  JSON.stringify({
    files: entries.map(({ path, offset, size, type }) => ({
      path,
      offset,
      size,
      type,
    })),
  });

/**
 * Compute the layout of a pack containing the given files.
 *
 * The caller is responsible for writing, in order: `headerBytes`, then for each
 * entry its content followed by `paddings[index]` zero bytes.
 */
export const buildPackLayout = (
  entryInputs: Array<PackEntryInput>
): PackLayout => {
  const entries: Array<PackEntry> = entryInputs.map(({ filePath, size }) => ({
    path: filePath,
    offset: 0,
    size,
    type: getResourceMimeType(filePath),
  }));

  // The offsets are stored in the index, but the index length is what
  // determines where the contents start - so the two depend on each other.
  // Iterate until it settles, only ever growing the index length so that the
  // computation is guaranteed to converge (a longer index can only push offsets
  // further, which can only make the numbers longer or leave them unchanged).
  let indexByteLength = 0;
  let indexJsonByteLength = 0;
  let indexJson = '';
  for (let attempt = 0; ; attempt++) {
    if (attempt > 8) {
      throw new Error('Could not compute a stable resource pack layout.');
    }

    let offset = alignUp(PACK_HEADER_SIZE + indexByteLength);
    for (const entry of entries) {
      entry.offset = offset;
      offset = alignUp(offset + entry.size);
    }

    indexJson = buildIndexJson(entries);
    indexJsonByteLength = encodeUtf8(indexJson).length;
    // Leaving the loop here guarantees that `entries` offsets were computed
    // with the `indexByteLength` that is about to be written in the header.
    if (indexJsonByteLength <= indexByteLength) break;
    indexByteLength = indexJsonByteLength;
  }

  // The index may now be shorter than the length the offsets were computed
  // with. Pad it with spaces, which `JSON.parse` ignores, rather than
  // recomputing everything.
  const indexBytes = encodeUtf8(
    indexJson + ' '.repeat(indexByteLength - indexJsonByteLength)
  );

  const contentStart = alignUp(PACK_HEADER_SIZE + indexByteLength);
  const headerBytes = new Uint8Array(contentStart);
  for (let index = 0; index < PACK_MAGIC.length; index++) {
    headerBytes[index] = PACK_MAGIC.charCodeAt(index);
  }
  const headerView = new DataView(headerBytes.buffer);
  headerView.setUint32(4, PACK_VERSION, true);
  headerView.setUint32(8, indexByteLength, true);
  headerBytes.set(indexBytes, PACK_HEADER_SIZE);

  const paddings = entries.map(
    entry => alignUp(entry.offset + entry.size) - (entry.offset + entry.size)
  );

  const lastEntry = entries[entries.length - 1];
  const totalSize = lastEntry
    ? alignUp(lastEntry.offset + lastEntry.size)
    : contentStart;

  return { headerBytes, entries, paddings, totalSize };
};

/**
 * Read back the index of a pack. Only used by tests and tooling - the game
 * engine has its own reader in `GDJS/Runtime/ResourcePackManager.ts`.
 */
export const parsePackIndex = (
  packBytes: Uint8Array
): {| version: number, entries: Array<PackEntry> |} => {
  const view = new DataView(
    packBytes.buffer,
    packBytes.byteOffset,
    packBytes.byteLength
  );

  const magic = String.fromCharCode(
    packBytes[0],
    packBytes[1],
    packBytes[2],
    packBytes[3]
  );
  if (magic !== PACK_MAGIC) {
    throw new Error(`Not a resource pack (unexpected magic "${magic}").`);
  }

  const version = view.getUint32(4, true);
  const indexByteLength = view.getUint32(8, true);
  const indexBytes = packBytes.slice(
    PACK_HEADER_SIZE,
    PACK_HEADER_SIZE + indexByteLength
  );
  const indexJson = new TextDecoder().decode(indexBytes);

  return { version, entries: JSON.parse(indexJson).files };
};
