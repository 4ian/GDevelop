/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('ResourcePackManager');

  const PACK_MAGIC = 'GDPK';
  const PACK_HEADER_SIZE = 12;
  const SUPPORTED_PACK_VERSION = 1;

  /**
   * An entry of the index stored at the beginning of a pack.
   */
  type ResourcePackEntryData = {
    path: string;
    offset: integer;
    size: integer;
    type: string;
  };

  /**
   * The list of packs of an exported game, and the pack each resource file
   * lives in.
   *
   * This is written by the exporter at the end of `data.js`, and is left
   * undefined when the game was exported without packing its resources (which
   * is the case for previews and for in-game edition).
   * @category Resources
   */
  export type ResourcePacksManifest = {
    version: integer;
    /** The pack file names, relative to the game index.html. */
    packs: Array<string>;
    /** Resource file name -> index in `packs`. */
    files: Record<string, integer>;
    /**
     * Packs that must be downloaded before the first scene starts, even though
     * no loading task refers to their files.
     *
     * A resource that is only reachable dynamically - a sound played by name
     * from an expression, an animation picked by an expression - appears in no
     * `usedResources` list, so nothing would ever trigger the download of its
     * pack, and the engine asks for its URL synchronously when it is used.
     * Those resources are gathered in a pack listed here.
     */
    startupPacks?: Array<integer>;
  };

  /**
   * Set by the exported `data.js` when the game resources were packed.
   * @category Resources
   */
  export let resourcePacks: ResourcePacksManifest | null = null;

  /**
   * A single ".gdpak" archive, downloaded as one file and then sliced to give
   * each resource its own `blob:` URL.
   *
   * See `newIDE/app/src/ExportAndShare/ResourcePacking/PackFormat.js` for the
   * description of the format.
   */
  class ResourcePack {
    private readonly _url: string;
    /** Resource file name -> a slice of the downloaded archive. */
    private _entries = new Map<string, Blob>();
    /** Resource file name -> the object URL handed out for it. */
    private _objectUrls = new Map<string, string>();

    constructor(url: string) {
      this._url = url;
    }

    async load(
      onProgress?: (loadedBytes: integer, totalBytes: integer) => void
    ): Promise<void> {
      const response = await fetch(this._url);
      if (!response.ok) {
        throw new Error(
          `Could not download the resource pack "${this._url}" (status ${
            response.status
          }).`
        );
      }

      const blob = await ResourcePack._readResponseBlob(response, onProgress);

      const headerBytes = await blob.slice(0, PACK_HEADER_SIZE).arrayBuffer();
      if (headerBytes.byteLength < PACK_HEADER_SIZE) {
        throw new Error(`The resource pack "${this._url}" is truncated.`);
      }

      const headerBytesArray = new Uint8Array(headerBytes);
      const magic = String.fromCharCode(
        headerBytesArray[0],
        headerBytesArray[1],
        headerBytesArray[2],
        headerBytesArray[3]
      );
      if (magic !== PACK_MAGIC) {
        throw new Error(
          `"${this._url}" is not a resource pack (unexpected magic "${magic}").`
        );
      }

      const headerView = new DataView(headerBytes);
      const version = headerView.getUint32(4, true);
      if (version !== SUPPORTED_PACK_VERSION) {
        throw new Error(
          `The resource pack "${
            this._url
          }" uses the unsupported version ${version}.`
        );
      }

      const indexByteLength = headerView.getUint32(8, true);
      const indexJson = await blob
        .slice(PACK_HEADER_SIZE, PACK_HEADER_SIZE + indexByteLength)
        .text();
      const entries: Array<ResourcePackEntryData> = JSON.parse(indexJson).files;

      // Slicing a Blob does not copy anything: the browser owns the downloaded
      // bytes (and may keep them out of memory), and each entry is only a view
      // on them.
      for (const entry of entries) {
        this._entries.set(
          entry.path,
          blob.slice(entry.offset, entry.offset + entry.size, entry.type)
        );
      }
    }

    /**
     * Read the whole response, reporting progress as bytes come in when the
     * server announced a content length. Falls back to a plain `blob()` when
     * streaming is not available.
     */
    private static async _readResponseBlob(
      response: Response,
      onProgress?: (loadedBytes: integer, totalBytes: integer) => void
    ): Promise<Blob> {
      const contentLength = Number(
        response.headers.get('Content-Length') || '0'
      );
      if (!onProgress || !contentLength || !response.body) {
        return await response.blob();
      }

      const reader = response.body.getReader();
      const chunks: Array<Uint8Array> = [];
      let loadedBytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loadedBytes += value.length;
          onProgress(loadedBytes, contentLength);
        }
      }

      return new Blob(chunks);
    }

    /**
     * @returns a `blob:` URL for this file, or null if the pack does not
     * contain it. The same URL is returned for subsequent calls.
     */
    getObjectUrl(filePath: string): string | null {
      const existingUrl = this._objectUrls.get(filePath);
      if (existingUrl !== undefined) return existingUrl;

      const blob = this._entries.get(filePath);
      if (!blob) return null;

      const objectUrl = URL.createObjectURL(blob);
      this._objectUrls.set(filePath, objectUrl);
      return objectUrl;
    }

    getFilePaths(): Array<string> {
      return Array.from(this._entries.keys());
    }

    /**
     * Release the archive and every URL handed out for it.
     */
    dispose(): void {
      for (const objectUrl of this._objectUrls.values()) {
        URL.revokeObjectURL(objectUrl);
      }
      this._objectUrls.clear();
      this._entries.clear();
    }
  }

  /**
   * Gives access to the resources of a game whose export packed them into
   * ".gdpak" archives, so that the exported game stays below the file count
   * limits of hosting services (itch.io refuses archives with more than 1000
   * files).
   *
   * When a game was exported without packing, every method is a no-op and the
   * engine downloads each resource file as usual.
   * @category Resources
   */
  export class ResourcePackManager {
    private _manifest: ResourcePacksManifest | null = null;
    private _packs: Array<ResourcePack | null> = [];
    /** In-flight downloads, so that a pack is only ever downloaded once. */
    private _loadingPromises: Array<Promise<void> | null> = [];
    private _onProgress:
      | ((loadedBytes: integer, totalBytes: integer) => void)
      | null = null;
    /**
     * The download progress of the packs currently being downloaded, so that
     * progress can be reported for all of them at once rather than having each
     * pack fight over the loading bar.
     */
    private _pendingDownloads = new Map<
      integer,
      { loadedBytes: integer; totalBytes: integer }
    >();
    /**
     * Incremented every time the packs are released, so that a download
     * started before does not resurrect a pack that was disposed in between.
     */
    private _generation: integer = 0;

    /**
     * Read the manifest written by the exporter. Called by the resource loader
     * when the game data is set, so that hot-reloading picks up changes too.
     */
    setManifest(manifest: ResourcePacksManifest | null): void {
      if (manifest && manifest.version !== SUPPORTED_PACK_VERSION) {
        logger.error(
          `Unsupported resource pack manifest version ${
            manifest.version
          }, resources will be loaded as individual files.`
        );
        manifest = null;
      }

      this.dispose();
      this._manifest = manifest;
      this._packs = manifest ? manifest.packs.map(() => null) : [];
      this._loadingPromises = manifest ? manifest.packs.map(() => null) : [];
    }

    /**
     * Register a callback notified while a pack is being downloaded, so that
     * the loading screen can show something is happening.
     */
    setOnProgressCallback(
      onProgress: ((loadedBytes: integer, totalBytes: integer) => void) | null
    ): void {
      this._onProgress = onProgress;
    }

    isPacked(filePath: string): boolean {
      return !!this._manifest && this._manifest.files[filePath] !== undefined;
    }

    /**
     * Download the pack containing this file, if any and if not already done.
     *
     * @returns null when there is nothing to wait for: the game was exported
     * without packing, the file was left as an individual file, or its pack is
     * already downloaded. Callers must not await unconditionally, so that
     * loading a resource keeps starting synchronously.
     */
    ensureLoadedFor(filePath: string): Promise<void> | null {
      const manifest = this._manifest;
      if (!manifest) return null;

      const packIndex = manifest.files[filePath];
      if (packIndex === undefined) return null;

      return this._ensurePackLoaded(packIndex);
    }

    /**
     * Download the packs holding the resources that no loading task refers to.
     * To be awaited before the first scene is loaded.
     *
     * @returns null when there is nothing to wait for.
     */
    ensureStartupPacksLoaded(): Promise<void> | null {
      const manifest = this._manifest;
      if (!manifest || !manifest.startupPacks) return null;

      const loadingPromises: Array<Promise<void>> = [];
      for (const packIndex of manifest.startupPacks) {
        const loadingPromise = this._ensurePackLoaded(packIndex);
        if (loadingPromise) loadingPromises.push(loadingPromise);
      }
      if (!loadingPromises.length) return null;

      return Promise.all(loadingPromises).then(() => {});
    }

    private _ensurePackLoaded(packIndex: integer): Promise<void> | null {
      const manifest = this._manifest;
      if (!manifest || !manifest.packs[packIndex]) return null;

      if (this._packs[packIndex]) return null;

      const existingPromise = this._loadingPromises[packIndex];
      if (existingPromise) return existingPromise;

      const generation = this._generation;
      const pack = new ResourcePack(manifest.packs[packIndex]);
      const loadingPromise = pack
        .load((loadedBytes, totalBytes) => {
          if (generation !== this._generation) return;
          this._pendingDownloads.set(packIndex, { loadedBytes, totalBytes });
          this._reportProgress();
        })
        .then(() => {
          if (generation !== this._generation) {
            // The packs were released while this one was downloading.
            pack.dispose();
            return;
          }
          this._packs[packIndex] = pack;
          this._pendingDownloads.delete(packIndex);
        })
        .catch(error => {
          if (generation !== this._generation) throw error;
          // Forget the failed download, so that the retries done by the
          // resource loader actually try again.
          this._loadingPromises[packIndex] = null;
          this._pendingDownloads.delete(packIndex);
          throw error;
        });

      this._loadingPromises[packIndex] = loadingPromise;
      return loadingPromise;
    }

    private _reportProgress(): void {
      const onProgress = this._onProgress;
      if (!onProgress) return;

      let loadedBytes = 0;
      let totalBytes = 0;
      for (const pendingDownload of this._pendingDownloads.values()) {
        loadedBytes += pendingDownload.loadedBytes;
        totalBytes += pendingDownload.totalBytes;
      }
      if (totalBytes) onProgress(loadedBytes, totalBytes);
    }

    /**
     * @returns the `blob:` URL to read this file from its pack, or null if the
     * file is not packed or its pack is not downloaded yet.
     */
    getObjectUrl(filePath: string): string | null {
      const manifest = this._manifest;
      if (!manifest) return null;

      const packIndex = manifest.files[filePath];
      if (packIndex === undefined) return null;

      const pack = this._packs[packIndex];
      if (!pack) return null;

      return pack.getObjectUrl(filePath);
    }

    /**
     * Release every pack that holds none of the given files.
     *
     * Called when scenes are unloaded: as each scene has its own pack, the
     * memory used by the archive of a scene that is not needed anymore can be
     * given back.
     */
    unloadPacksWithNoFileIn(stillLoadedFilePaths: Set<string>): void {
      for (let packIndex = 0; packIndex < this._packs.length; packIndex++) {
        const pack = this._packs[packIndex];
        if (!pack) continue;
        // A pack being downloaded must not be disposed: the promise waiting for
        // it would then resolve on a pack that gives out nothing.
        if (this._pendingDownloads.has(packIndex)) continue;

        const isStillNeeded = pack
          .getFilePaths()
          .some(filePath => stillLoadedFilePaths.has(filePath));
        if (isStillNeeded) continue;

        pack.dispose();
        this._packs[packIndex] = null;
        this._loadingPromises[packIndex] = null;
      }
    }

    /**
     * Release every downloaded pack, but keep the manifest so that they are
     * downloaded again when needed. Used when hot-reloading.
     */
    unloadAllPacks(): void {
      this._generation++;
      for (let packIndex = 0; packIndex < this._packs.length; packIndex++) {
        const pack = this._packs[packIndex];
        if (pack) pack.dispose();
        this._packs[packIndex] = null;
        this._loadingPromises[packIndex] = null;
      }
      this._pendingDownloads.clear();
    }

    dispose(): void {
      this.unloadAllPacks();
      this._manifest = null;
      this._packs = [];
      this._loadingPromises = [];
    }
  }
}
