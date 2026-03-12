// @flow
import { t } from '@lingui/macro';
import optionalRequire from '../Utils/OptionalRequire';
import ResourcesLoader from '../ResourcesLoader';
import { isURL, updateResourceJsonMetadata } from './ResourceUtils';
import { type ResourceKind } from './ResourceSource';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';

const fs = optionalRequire('fs');
const path = optionalRequire('path');
const gd: libGDevelop = global.gd;

const IMPORT_SETTINGS_METADATA_KEY = 'assetImportSettings';
const IMPORT_CACHE_METADATA_KEY = 'assetImportCache';
const IMPORT_CACHE_VERSION = 1;

export type AssetImportSettings = {|
  importerId: string,
  options: { [string]: any },
|};

export type AssetImportCache = {|
  version: number,
  importerId: string,
  settingsHash: string,
  sourceHash: string,
  importedAt: number,
  data: { [string]: any },
|};

type FileInfo = {|
  filePath: ?string,
  absolutePath: ?string,
  size: ?number,
  mtimeMs: ?number,
  sourceHash: string,
  isUrl: boolean,
|};

type ImportArgs = {|
  project: gdProject,
  resource: gdResource,
  resourceUrl: ?string,
  fileInfo: FileInfo,
  settings: { [string]: any },
|};

export type Importer = {|
  id: string,
  displayName: MessageDescriptor,
  resourceKinds: Array<ResourceKind>,
  getDefaultOptions: (resource: gdResource) => { [string]: any },
  applySettingsToResource?: (resource: gdResource, options: { [string]: any }) => void,
  importResource: (ImportArgs) => Promise<?{ [string]: any }>,
|};

const getResourceJsonMetadata = (resource: gdResource): { [string]: any } => {
  const metadataAsString = resource.getMetadata();
  if (!metadataAsString) return {};
  try {
    const metadata = JSON.parse(metadataAsString);
    return metadata && typeof metadata === 'object' ? metadata : {};
  } catch (error) {
    return {};
  }
};

const stableStringify = (value: any): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys
      .map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

const getResourceFileInfo = (
  project: gdProject,
  resource: gdResource
): FileInfo => {
  const filePath = resource.getFile();
  if (!filePath) {
    return {
      filePath: null,
      absolutePath: null,
      size: null,
      mtimeMs: null,
      sourceHash: 'missing',
      isUrl: false,
    };
  }

  if (isURL(filePath)) {
    return {
      filePath,
      absolutePath: null,
      size: null,
      mtimeMs: null,
      sourceHash: `url:${filePath}`,
      isUrl: true,
    };
  }

  const projectFilePath = project.getProjectFile();
  const projectFolderPath =
    projectFilePath && path ? path.dirname(projectFilePath) : null;
  const normalizedPath = filePath.replace(/^file:\/\//, '');
  const absolutePath =
    projectFolderPath && path
      ? path.isAbsolute(normalizedPath)
        ? normalizedPath
        : path.resolve(projectFolderPath, normalizedPath)
      : null;

  if (!absolutePath || !fs || !fs.existsSync || !fs.existsSync(absolutePath)) {
    return {
      filePath,
      absolutePath,
      size: null,
      mtimeMs: null,
      sourceHash: absolutePath ? `${absolutePath}:missing` : normalizedPath,
      isUrl: false,
    };
  }

  let size = null;
  let mtimeMs = null;
  if (fs.statSync) {
    try {
      const stats = fs.statSync(absolutePath);
      size = stats.size;
      // $FlowFixMe[prop-missing]
      mtimeMs = stats.mtimeMs || stats.mtime.getTime();
    } catch (error) {
      size = null;
      mtimeMs = null;
    }
  }

  return {
    filePath,
    absolutePath,
    size,
    mtimeMs,
    sourceHash: `${absolutePath}:${size || 'na'}:${mtimeMs || 'na'}`,
    isUrl: false,
  };
};

const loadImageDimensions = async (
  resourceUrl: string
): Promise<?{ width: number, height: number }> => {
  if (typeof Image === 'undefined') return null;

  return new Promise(resolve => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = resourceUrl;
  });
};

const loadAudioDuration = async (resourceUrl: string): Promise<?number> => {
  if (typeof Audio === 'undefined') return null;

  return new Promise(resolve => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => resolve(audio.duration);
    audio.onerror = () => resolve(null);
    audio.src = resourceUrl;
  });
};

const loadVideoMetadata = async (
  resourceUrl: string
): Promise<?{ width: number, height: number, duration: number }> => {
  if (typeof document === 'undefined') return null;

  return new Promise(resolve => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () =>
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      });
    video.onerror = () => resolve(null);
    video.src = resourceUrl;
  });
};

const imageImporter: Importer = {
  id: 'image-basic',
  displayName: (t`Image (basic)`: any),
  resourceKinds: ['image'],
  getDefaultOptions: (resource: gdResource) => {
    if (resource.getKind() === 'image') {
      const imageResource = gd.asImageResource(resource);
      return { smoothing: imageResource.isSmooth() };
    }
    return { smoothing: true };
  },
  applySettingsToResource: (resource: gdResource, options) => {
    if (resource.getKind() !== 'image') return;
    const imageResource = gd.asImageResource(resource);
    imageResource.setSmooth(!!options.smoothing);
  },
  importResource: async ({ fileInfo, resourceUrl, settings }) => {
    const data: { [string]: any } = {};
    if (fileInfo.size != null) data.fileSize = fileInfo.size;
    if (fileInfo.mtimeMs != null) data.mtimeMs = fileInfo.mtimeMs;
    data.smoothing = !!settings.smoothing;

    if (resourceUrl) {
      const dimensions = await loadImageDimensions(resourceUrl);
      if (dimensions) {
        data.width = dimensions.width;
        data.height = dimensions.height;
      }
    }
    return data;
  },
};

const audioImporter: Importer = {
  id: 'audio-basic',
  displayName: (t`Audio (basic)`: any),
  resourceKinds: ['audio'],
  getDefaultOptions: () => ({
    streaming: false,
  }),
  importResource: async ({ fileInfo, resourceUrl, settings }) => {
    const data: { [string]: any } = {};
    if (fileInfo.size != null) data.fileSize = fileInfo.size;
    if (fileInfo.mtimeMs != null) data.mtimeMs = fileInfo.mtimeMs;
    data.streaming = !!settings.streaming;

    if (resourceUrl) {
      const duration = await loadAudioDuration(resourceUrl);
      if (duration != null) data.duration = duration;
    }
    return data;
  },
};

const videoImporter: Importer = {
  id: 'video-basic',
  displayName: (t`Video (basic)`: any),
  resourceKinds: ['video'],
  getDefaultOptions: () => ({
    streaming: true,
  }),
  importResource: async ({ fileInfo, resourceUrl, settings }) => {
    const data: { [string]: any } = {};
    if (fileInfo.size != null) data.fileSize = fileInfo.size;
    if (fileInfo.mtimeMs != null) data.mtimeMs = fileInfo.mtimeMs;
    data.streaming = !!settings.streaming;

    if (resourceUrl) {
      const metadata = await loadVideoMetadata(resourceUrl);
      if (metadata) {
        data.width = metadata.width;
        data.height = metadata.height;
        data.duration = metadata.duration;
      }
    }
    return data;
  },
};

const genericFileImporter: Importer = {
  id: 'file-basic',
  displayName: (t`File (basic)`: any),
  resourceKinds: [
    'font',
    'json',
    'tilemap',
    'tileset',
    'bitmapFont',
    'model3D',
    'atlas',
    'spine',
    'javascript',
  ],
  getDefaultOptions: () => ({}),
  importResource: async ({ fileInfo }) => {
    const data: { [string]: any } = {};
    if (fileInfo.size != null) data.fileSize = fileInfo.size;
    if (fileInfo.mtimeMs != null) data.mtimeMs = fileInfo.mtimeMs;
    return data;
  },
};

const importers: Array<Importer> = [
  imageImporter,
  audioImporter,
  videoImporter,
  genericFileImporter,
];

const getImportersForKind = (kind: ResourceKind): Array<Importer> => {
  const filtered = importers.filter(importer =>
    importer.resourceKinds.includes(kind)
  );
  return filtered.length ? filtered : [genericFileImporter];
};

const getImporterById = (
  kind: ResourceKind,
  importerId: ?string
): Importer => {
  const available = getImportersForKind(kind);
  if (!importerId) return available[0];
  const found = available.find(importer => importer.id === importerId);
  return found || available[0];
};

export const getImportersForResource = (
  resource: gdResource
): Array<Importer> => {
  // $FlowFixMe[incompatible-type]
  const kind: ResourceKind = resource.getKind();
  return getImportersForKind(kind);
};

export const ensureResourceImportSettings = (
  resource: gdResource
): AssetImportSettings => {
  const metadata = getResourceJsonMetadata(resource);
  const stored = metadata[IMPORT_SETTINGS_METADATA_KEY];
  // $FlowFixMe[incompatible-type]
  const kind: ResourceKind = resource.getKind();
  const importer = getImporterById(kind, stored && stored.importerId);
  const defaultOptions = importer.getDefaultOptions(resource);
  const storedOptions =
    stored && typeof stored === 'object' && stored.options
      ? stored.options
      : {};
  const mergedOptions = { ...defaultOptions, ...storedOptions };
  const nextSettings = {
    importerId: importer.id,
    options: mergedOptions,
  };

  if (
    !stored ||
    stored.importerId !== nextSettings.importerId ||
    stableStringify(stored.options || {}) !== stableStringify(mergedOptions)
  ) {
    updateResourceJsonMetadata(resource, {
      [IMPORT_SETTINGS_METADATA_KEY]: nextSettings,
    });
  }

  return nextSettings;
};

export const setResourceImportSettings = (
  resource: gdResource,
  settings: AssetImportSettings
): void => {
  updateResourceJsonMetadata(resource, {
    [IMPORT_SETTINGS_METADATA_KEY]: settings,
  });
};

export const applyImportSettingsToResource = (
  resource: gdResource,
  settings: AssetImportSettings
): void => {
  // $FlowFixMe[incompatible-type]
  const kind: ResourceKind = resource.getKind();
  const importer = getImporterById(kind, settings.importerId);
  if (importer && importer.applySettingsToResource) {
    importer.applySettingsToResource(resource, settings.options);
  }
};

export const getResourceImportCache = (
  resource: gdResource
): ?AssetImportCache => {
  const metadata = getResourceJsonMetadata(resource);
  const cache = metadata[IMPORT_CACHE_METADATA_KEY];
  if (cache && typeof cache === 'object') return cache;
  return null;
};

const inflightImports: Map<string, Promise<?AssetImportCache>> = new Map();

export const runResourceImport = async ({
  project,
  resource,
  force,
}: {|
  project: gdProject,
  resource: gdResource,
  force?: boolean,
|}): Promise<?AssetImportCache> => {
  const resourceKey = resource.getName() || String(resource.ptr);
  if (!force && inflightImports.has(resourceKey)) {
    return inflightImports.get(resourceKey);
  }

  const promise = (async () => {
    const settings = ensureResourceImportSettings(resource);
    applyImportSettingsToResource(resource, settings);
    // $FlowFixMe[incompatible-type]
    const kind: ResourceKind = resource.getKind();
    const importer = getImporterById(kind, settings.importerId);
    if (!importer) return null;

    const fileInfo = getResourceFileInfo(project, resource);
    const settingsHash = stableStringify(settings.options);
    const cache = getResourceImportCache(resource);
    if (
      !force &&
      cache &&
      cache.importerId === importer.id &&
      cache.settingsHash === settingsHash &&
      cache.sourceHash === fileInfo.sourceHash
    ) {
      return cache;
    }

    let resourceUrl = null;
    try {
      resourceUrl = ResourcesLoader.getResourceFullUrl(
        project,
        resource.getName(),
        {}
      );
    } catch (error) {
      resourceUrl = null;
    }

    const data =
      (await importer.importResource({
        project,
        resource,
        resourceUrl,
        fileInfo,
        settings: settings.options,
      })) || {};

    const nextCache: AssetImportCache = {
      version: IMPORT_CACHE_VERSION,
      importerId: importer.id,
      settingsHash,
      sourceHash: fileInfo.sourceHash,
      importedAt: Date.now(),
      data,
    };

    updateResourceJsonMetadata(resource, {
      [IMPORT_CACHE_METADATA_KEY]: nextCache,
      [IMPORT_SETTINGS_METADATA_KEY]: settings,
    });

    return nextCache;
  })();

  inflightImports.set(resourceKey, promise);
  promise.finally(() => inflightImports.delete(resourceKey));
  return promise;
};

export const ensureResourceImportCache = async ({
  project,
  resource,
}: {|
  project: gdProject,
  resource: gdResource,
|}): Promise<?AssetImportCache> => {
  return runResourceImport({ project, resource, force: false });
};

export const ensureProjectResourcesHaveImportSettings = (
  project: gdProject
): void => {
  const resourcesManager = project.getResourcesManager();
  const resourceNames = resourcesManager.getAllResourceNames().toJSArray();
  resourceNames.forEach(resourceName => {
    const resource = resourcesManager.getResource(resourceName);
    const settings = ensureResourceImportSettings(resource);
    applyImportSettingsToResource(resource, settings);
  });
};
