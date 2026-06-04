// @flow
import {
  serializeToJSObject,
  serializeToJSON,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import optionalRequire from '../Utils/OptionalRequire';
import {
  enumerateBehaviorsMetadata,
  isBehaviorDefaultCapability,
} from '../BehaviorsEditor/EnumerateBehaviorsMetadata';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const zlib = optionalRequire('zlib');
const electronRemote = optionalRequire('@electron/remote');
const nativeImage = electronRemote ? electronRemote.nativeImage : null;

const asAudioResource = (resource: gdResource): any =>
  gd.castObject(resource, gd.AudioResource);

const setResourceBooleanProperty = (
  resource: gdResource,
  propertyName: string,
  value: boolean
) => {
  if (typeof resource.updateProperty === 'function') {
    resource.updateProperty(propertyName, value ? '1' : '0');
  }
};

type SceneToolCallbacks = {|
  onSceneEventsModifiedOutsideEditor?: Function,
  onInstancesModifiedOutsideEditor?: Function,
  onObjectsModifiedOutsideEditor?: Function,
|};

const getRequiredString = (args: Object, name: string): string => {
  const value = args && args[name];
  if (typeof value !== 'string' || !value) {
    throw new Error(`Missing ${name}.`);
  }
  return value;
};

const getOptionalString = (args: Object, name: string): string | null => {
  const value = args && args[name];
  return typeof value === 'string' ? value : null;
};

const getFiniteNumber = (value: any): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const firstNonNullNumber = (...values: Array<any>): number | null => {
  for (const value of values) {
    const number = getFiniteNumber(value);
    if (number !== null) return number;
  }
  return null;
};

const stringifyPropertyValue = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
};

const getScene = (project: gdProject, sceneName: string): gdLayout => {
  if (!project.hasLayoutNamed(sceneName)) {
    throw new Error(`Scene not found: "${sceneName}".`);
  }
  return project.getLayout(sceneName);
};

const getObjectIndex = (
  objectsContainer: gdObjectsContainer,
  objectName: string
): number => {
  for (let i = 0; i < objectsContainer.getObjectsCount(); i++) {
    if (objectsContainer.getObjectAt(i).getName() === objectName) return i;
  }
  return -1;
};

const getSceneObject = (
  project: gdProject,
  scene: gdLayout,
  objectName: string
): { object: gdObject, isGlobal: boolean, container: gdObjectsContainer } => {
  if (scene.getObjects().hasObjectNamed(objectName)) {
    return {
      object: scene.getObjects().getObject(objectName),
      isGlobal: false,
      container: scene.getObjects(),
    };
  }

  if (project.getObjects().hasObjectNamed(objectName)) {
    return {
      object: project.getObjects().getObject(objectName),
      isGlobal: true,
      container: project.getObjects(),
    };
  }

  throw new Error(
    `Object not found: "${objectName}" in scene "${scene.getName()}" nor globally.`
  );
};

const createResourceForKind = (kind: string): gdResource | null => {
  switch (kind) {
    case 'audio':
      return new gd.AudioResource();
    case 'image':
      return new gd.ImageResource();
    case 'font':
      return new gd.FontResource();
    case 'video':
      return new gd.VideoResource();
    case 'json':
      return new gd.JsonResource();
    case 'tilemap':
      return new gd.TilemapResource();
    case 'tileset':
      return new gd.TilesetResource();
    case 'bitmapFont':
      return new gd.BitmapFontResource();
    case 'model3D':
      return new gd.Model3DResource();
    case 'atlas':
      return new gd.AtlasResource();
    case 'spine':
      return new gd.SpineResource();
    case 'javascript':
      return new gd.JavaScriptResource();
    default:
      return null;
  }
};

const isUrlResourceFile = (file: string): boolean =>
  file.startsWith('http://') ||
  file.startsWith('https://') ||
  file.startsWith('ftp://') ||
  file.startsWith('blob:') ||
  file.startsWith('data:');

const resolveLocalResourceFile = (
  project: gdProject,
  file: string
): string | null => {
  if (!file || !path || isUrlResourceFile(file)) return null;
  if (path.isAbsolute(file)) return file;

  const projectFile = project.getProjectFile();
  if (!projectFile) return null;
  return path.resolve(path.dirname(projectFile), file);
};

const getResourceFileStatus = (
  project: gdProject,
  resource: gdResource
): Object => {
  const file = resource.getFile();
  if (!file) {
    return {
      file,
      fileExists: false,
      fileStatus: 'error',
      issue: 'empty-file',
    };
  }

  if (isUrlResourceFile(file)) {
    return {
      file,
      fileExists: null,
      fileStatus: 'url',
      issue: null,
    };
  }

  const resolvedFile = resolveLocalResourceFile(project, file);
  if (!resolvedFile || !fs) {
    return {
      file,
      resolvedFile,
      fileExists: null,
      fileStatus: 'unchecked',
      issue: null,
    };
  }

  const fileExists = fs.existsSync(resolvedFile);
  return {
    file,
    resolvedFile,
    fileExists,
    fileStatus: fileExists ? 'ok' : 'error',
    issue: fileExists ? null : 'missing-file',
  };
};

const serializeResource = (resource: gdResource): Object => {
  let serializedResource = {};
  try {
    serializedResource = serializeToJSObject(resource);
  } catch (error) {
    serializedResource = {};
  }

  const result = {
    ...serializedResource,
    name: resource.getName(),
    file: resource.getFile(),
    kind: resource.getKind(),
  };

  if (typeof resource.isUserAdded === 'function') {
    result.userAdded = resource.isUserAdded();
  }

  if (resource.getKind() === 'audio') {
    const audioResource = asAudioResource(resource);
    result.preloadAsMusic =
      typeof audioResource.preloadAsMusic === 'function'
        ? audioResource.preloadAsMusic()
        : !!serializedResource.preloadAsMusic;
    result.preloadAsSound =
      typeof audioResource.preloadAsSound === 'function'
        ? audioResource.preloadAsSound()
        : !!serializedResource.preloadAsSound;
    result.preloadInCache =
      typeof audioResource.preloadInCache === 'function'
        ? audioResource.preloadInCache()
        : !!serializedResource.preloadInCache;
  }

  return result;
};

const applyResourceMetadata = (resource: gdResource, metadata: Object) => {
  if (typeof metadata.userAdded === 'boolean') {
    if (typeof resource.setUserAdded === 'function') {
      resource.setUserAdded(metadata.userAdded);
    }
  }

  if (resource.getKind() === 'image' && typeof metadata.smooth === 'boolean') {
    gd.asImageResource(resource).setSmooth(metadata.smooth);
  }

  if (resource.getKind() === 'audio') {
    const audioResource = asAudioResource(resource);
    if (typeof metadata.preloadAsSound === 'boolean') {
      if (typeof audioResource.setPreloadAsSound === 'function') {
        audioResource.setPreloadAsSound(metadata.preloadAsSound);
      } else {
        setResourceBooleanProperty(
          resource,
          'Preload as sound',
          metadata.preloadAsSound
        );
      }
    }
    if (typeof metadata.preloadAsMusic === 'boolean') {
      if (typeof audioResource.setPreloadAsMusic === 'function') {
        audioResource.setPreloadAsMusic(metadata.preloadAsMusic);
      } else {
        setResourceBooleanProperty(
          resource,
          'Preload as music',
          metadata.preloadAsMusic
        );
      }
    }
    if (typeof metadata.preloadInCache === 'boolean') {
      if (typeof audioResource.setPreloadInCache === 'function') {
        audioResource.setPreloadInCache(metadata.preloadInCache);
      } else {
        setResourceBooleanProperty(
          resource,
          'Preload in cache',
          metadata.preloadInCache
        );
      }
    }
  }
};

// Write a minimal RGBA PNG (solid fill, with an optional centered filled
// rectangle/ellipse) using only Node zlib — no image libraries. Used by
// generate_placeholder_asset so a zero-to-playable demo can stay inside MCP.
const encodePlaceholderPng = (
  width: number,
  height: number,
  rgba: [number, number, number, number]
): Buffer => {
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c >>> 0;
  }
  const crc32 = (buf: Buffer): number => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++)
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer): Buffer => {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // Raw image data: each row prefixed by a filter byte (0 = none).
  const row = Buffer.alloc(1 + width * 4);
  const raw = Buffer.alloc((1 + width * 4) * height);
  for (let y = 0; y < height; y++) {
    row[0] = 0;
    for (let x = 0; x < width; x++) {
      const o = 1 + x * 4;
      row[o] = rgba[0];
      row[o + 1] = rgba[1];
      row[o + 2] = rgba[2];
      row[o + 3] = rgba[3];
    }
    row.copy(raw, (1 + width * 4) * y);
  }
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

// Write a minimal mono 16-bit PCM WAV beep (sine or short noise burst).
const encodePlaceholderWav = (
  durationMs: number,
  frequency: number,
  kind: string
): Buffer => {
  const sampleRate = 44100;
  const samples = Math.max(1, Math.floor((sampleRate * durationMs) / 1000));
  const data = Buffer.alloc(samples * 2);
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    // Linear fade-out envelope to avoid clicks.
    const env = 1 - i / samples;
    let value;
    if (kind === 'noise') {
      // Deterministic pseudo-noise (no Math.random for reproducibility).
      value = (((i * 1103515245 + 12345) % 2048) / 1024 - 1) * env;
    } else {
      value = Math.sin(2 * Math.PI * frequency * t) * env;
    }
    data.writeInt16LE(Math.max(-32767, Math.min(32767, value * 32767)), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
};

const parseRgbaColor = (value: any): [number, number, number, number] => {
  // Accept "r;g;b" or "r;g;b;a" (GDevelop style) or default opaque magenta.
  if (typeof value === 'string' && value.includes(';')) {
    const parts = value.split(';').map(p => parseInt(p.trim(), 10));
    return [
      parts[0] || 0,
      parts[1] || 0,
      parts[2] || 0,
      parts.length > 3 && !Number.isNaN(parts[3]) ? parts[3] : 255,
    ];
  }
  return [255, 0, 255, 255];
};

// Generate a simple placeholder asset (PNG image or WAV sound) on disk and
// register it as a project resource — so a from-scratch playable demo can be
// built entirely through MCP without external image/audio tooling.
export const generatePlaceholderAsset = (
  project: gdProject,
  args: Object
): Object => {
  if (!fs || !zlib) {
    throw new Error('Filesystem/zlib access is not available.');
  }
  const name = getRequiredString(args, 'name');
  const assetType = getOptionalString(args, 'asset_type') || 'image';
  const relativeFile =
    getOptionalString(args, 'file') ||
    `assets/${name}.${assetType === 'sound' ? 'wav' : 'png'}`;

  const projectFile = project.getProjectFile && project.getProjectFile();
  const absFile =
    path && !path.isAbsolute(relativeFile) && projectFile
      ? path.resolve(path.dirname(projectFile), relativeFile)
      : relativeFile;
  if (path) {
    const dir = path.dirname(absFile);
    if (dir && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  let buffer;
  let kind;
  if (assetType === 'sound') {
    const durationMs =
      getFiniteNumber(args.duration_ms) !== null ? args.duration_ms : 150;
    const frequency =
      getFiniteNumber(args.frequency) !== null ? args.frequency : 440;
    const soundKind = getOptionalString(args, 'sound_kind') || 'sine';
    buffer = encodePlaceholderWav(durationMs, frequency, soundKind);
    kind = 'audio';
  } else {
    const width = getFiniteNumber(args.width) !== null ? args.width : 64;
    const height = getFiniteNumber(args.height) !== null ? args.height : 64;
    const rgba = parseRgbaColor(args.color);
    buffer = encodePlaceholderPng(width, height, rgba);
    kind = 'image';
  }

  fs.writeFileSync(absFile, buffer);

  // Register as a resource (reuse addOrUpdateResource semantics).
  const resourceResult = addOrUpdateResource(project, {
    name,
    file: relativeFile,
    kind,
    metadata:
      kind === 'audio' ? { preloadAsSound: true, userAdded: true } : undefined,
  });

  return {
    success: true,
    name,
    assetType,
    file: relativeFile,
    resolvedFile: absFile,
    bytesWritten: buffer.length,
    resource: resourceResult.resource,
    note:
      'Placeholder asset generated and registered. Replace it later with real art/audio by overwriting the file and re-importing the same resource name.',
  };
};

export const addOrUpdateResource = (
  project: gdProject,
  args: Object
): Object => {
  const name = getRequiredString(args, 'name');
  const file = getRequiredString(args, 'file');
  const kind = getRequiredString(args, 'kind');
  if (!file.trim()) {
    throw new Error('Resource file must not be empty.');
  }
  const resourcesManager = project.getResourcesManager();

  let resource = null;
  let created = false;

  if (resourcesManager.hasResource(name)) {
    resource = resourcesManager.getResource(name);
    if (resource.getKind() !== kind) {
      if (args && args.replace_kind === true) {
        resourcesManager.removeResource(name);
        resource = null;
      } else {
        throw new Error(
          `Resource "${name}" already exists with kind "${resource.getKind()}"; pass replace_kind: true to recreate it as "${kind}".`
        );
      }
    }
  }

  if (!resource) {
    resource = createResourceForKind(kind);
    if (!resource) {
      throw new Error(`Unsupported resource kind: "${kind}".`);
    }
    created = true;
  }

  resource.setFile(file);
  resource.setName(name);

  const metadata =
    args && args.metadata && typeof args.metadata === 'object'
      ? args.metadata
      : {};
  applyResourceMetadata(resource, metadata);

  if (created) {
    resourcesManager.addResource(resource);
  }
  const storedResource = resourcesManager.hasResource(name)
    ? resourcesManager.getResource(name)
    : resource;

  return {
    success: true,
    created,
    resource: serializeResource(storedResource),
    fileStatus: getResourceFileStatus(project, storedResource),
  };
};

const visitSerializedStrings = (
  value: any,
  pathParts: Array<string>,
  visitor: (string, Array<string>) => void
) => {
  if (typeof value === 'string') {
    visitor(value, pathParts);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      visitSerializedStrings(item, [...pathParts, String(index)], visitor)
    );
    return;
  }

  if (value && typeof value === 'object') {
    Object.keys(value).forEach(key =>
      visitSerializedStrings(value[key], [...pathParts, key], visitor)
    );
  }
};

const collectSpriteFrameReferences = (
  serializedProject: Object,
  resourcesByName: { [string]: Object }
): Array<Object> => {
  const references = [];
  const inspectObject = (object, scope) => {
    if (
      !object ||
      object.type !== 'Sprite' ||
      !Array.isArray(object.animations)
    ) {
      return;
    }

    object.animations.forEach((animation, animationIndex) => {
      const directions = Array.isArray(animation.directions)
        ? animation.directions
        : [];
      directions.forEach((direction, directionIndex) => {
        const sprites = Array.isArray(direction.sprites)
          ? direction.sprites
          : [];
        sprites.forEach((sprite, frameIndex) => {
          const resourceName =
            sprite && typeof sprite.image === 'string' ? sprite.image : '';
          if (!resourceName) return;
          references.push({
            resourceName,
            exists: !!resourcesByName[resourceName],
            scope,
            objectName: object.name,
            animationIndex,
            directionIndex,
            frameIndex,
          });
        });
      });
    });
  };

  (serializedProject.objects || []).forEach(object =>
    inspectObject(object, 'global')
  );
  (serializedProject.layouts || []).forEach(scene => {
    (scene.objects || []).forEach(object =>
      inspectObject(object, `scene:${scene.name || ''}`)
    );
  });

  return references;
};

// Detect Sprite frames whose collision mask is contradictory: the frame claims
// to use a custom collision mask (hasCustomCollisionMask === true) but provides
// an empty polygon list. At runtime this is an empty collision region, so all
// collision checks against that object silently fail (bullets pass through,
// platformer floors are non-solid, etc.). This is the "looks fine, isn't
// playable" failure mode. The healthy alternatives are either
// hasCustomCollisionMask:false (full image / bounding box mask) or a non-empty
// customCollisionMask. See applySpriteCollisionMask for how new frames default.
const collectSuspiciousCollisionMasks = (
  serializedProject: Object
): Array<Object> => {
  const suspicious = [];
  const inspectObject = (object, scope) => {
    if (
      !object ||
      object.type !== 'Sprite' ||
      !Array.isArray(object.animations)
    ) {
      return;
    }

    object.animations.forEach((animation, animationIndex) => {
      const directions = Array.isArray(animation.directions)
        ? animation.directions
        : [];
      directions.forEach((direction, directionIndex) => {
        const sprites = Array.isArray(direction.sprites)
          ? direction.sprites
          : [];
        sprites.forEach((sprite, frameIndex) => {
          if (!sprite || sprite.hasCustomCollisionMask !== true) return;
          const mask = sprite.customCollisionMask;
          const isEmpty = !Array.isArray(mask) || mask.length === 0;
          if (!isEmpty) return;
          suspicious.push({
            scope,
            objectName: object.name,
            animationName:
              typeof animation.name === 'string' ? animation.name : undefined,
            animationIndex,
            directionIndex,
            frameIndex,
            issue:
              'hasCustomCollisionMask is true but customCollisionMask is empty: ' +
              'the collision region is empty, so collisions against this object never trigger. ' +
              'Set fullImageCollisionMask to use the bounding box, or provide a non-empty collisionMask.',
          });
        });
      });
    });
  };

  (serializedProject.objects || []).forEach(object =>
    inspectObject(object, 'global')
  );
  (serializedProject.layouts || []).forEach(scene => {
    (scene.objects || []).forEach(object =>
      inspectObject(object, `scene:${scene.name || ''}`)
    );
  });

  return suspicious;
};

const getSerializedInstructionType = (instruction: any): string =>
  instruction && instruction.type && typeof instruction.type.value === 'string'
    ? instruction.type.value
    : instruction && typeof instruction.type === 'string'
    ? instruction.type
    : '';

const getInstructionMetadataForResourceReferences = (
  project: gdProject,
  instructionType: string,
  isCondition: boolean
): any | null => {
  if (!instructionType) return null;
  const metadata = isCondition
    ? gd.MetadataProvider.getConditionMetadata(
        project.getCurrentPlatform(),
        instructionType
      )
    : gd.MetadataProvider.getActionMetadata(
        project.getCurrentPlatform(),
        instructionType
      );
  return gd.MetadataProvider.isBadInstructionMetadata(metadata)
    ? null
    : metadata;
};

const isResourceParameterMetadata = (parameterMetadata: any): boolean => {
  const valueTypeMetadata = parameterMetadata.getValueTypeMetadata();
  return !!(
    valueTypeMetadata &&
    valueTypeMetadata.isResource &&
    valueTypeMetadata.isResource()
  );
};

const collectInstructionResourceReferences = ({
  project,
  instructions,
  resourcesByName,
  sceneName,
  eventPath,
  isCondition,
}: {|
  project: gdProject,
  instructions: Array<any>,
  resourcesByName: { [string]: Object },
  sceneName: string,
  eventPath: string,
  isCondition: boolean,
|}): Array<Object> => {
  const references = [];
  instructions.forEach((instruction, instructionIndex) => {
    const instructionType = getSerializedInstructionType(instruction);
    const metadata = getInstructionMetadataForResourceReferences(
      project,
      instructionType,
      isCondition
    );
    const parameters = Array.isArray(instruction.parameters)
      ? instruction.parameters
      : [];
    parameters.forEach((parameter, parameterIndex) => {
      if (typeof parameter !== 'string') return;
      if (!metadata || parameterIndex >= metadata.getParametersCount()) return;
      const parameterMetadata = metadata.getParameter(parameterIndex);
      if (
        parameterMetadata.isCodeOnly() ||
        !isResourceParameterMetadata(parameterMetadata)
      ) {
        return;
      }
      if (!resourcesByName[parameter]) return;
      references.push({
        sceneName,
        eventPath,
        isCondition,
        instructionIndex,
        instructionType,
        parameterIndex,
        parameterType: parameterMetadata.getType(),
        resourceName: parameter,
        resourceKind: resourcesByName[parameter].kind,
      });
    });

    const subInstructions = Array.isArray(instruction.subInstructions)
      ? instruction.subInstructions
      : [];
    references.push(
      ...collectInstructionResourceReferences({
        project,
        instructions: subInstructions,
        resourcesByName,
        sceneName,
        eventPath,
        isCondition,
      })
    );
  });
  return references;
};

const collectEventResourceReferences = (
  project: gdProject,
  serializedProject: Object,
  resourcesByName: { [string]: Object }
): Array<Object> => {
  const references = [];

  const visitEvents = (events, sceneName, parentPath) => {
    if (!Array.isArray(events)) return;
    events.forEach((event, eventIndex) => {
      const eventPathParts = [...parentPath, eventIndex];
      const eventPath = `event-${eventPathParts.join('.')}`;
      references.push(
        ...collectInstructionResourceReferences({
          project,
          instructions: Array.isArray(event.conditions) ? event.conditions : [],
          resourcesByName,
          sceneName,
          eventPath,
          isCondition: true,
        }),
        ...collectInstructionResourceReferences({
          project,
          instructions: Array.isArray(event.actions) ? event.actions : [],
          resourcesByName,
          sceneName,
          eventPath,
          isCondition: false,
        })
      );
      visitEvents(event.events, sceneName, eventPathParts);
    });
  };

  (serializedProject.layouts || []).forEach(scene => {
    visitEvents(scene.events, scene.name || '', []);
  });

  return references;
};

export const inspectProjectResources = (
  project: gdProject,
  args: Object = {}
): Object => {
  const resourcesManager = project.getResourcesManager();
  const resourceNames = resourcesManager.getAllResourceNames().toJSArray();
  const serializedProject = serializeToJSObject(project);
  const resourcesByName = {};
  const invalidResources = [];

  resourceNames.forEach(name => {
    const resource = resourcesManager.getResource(name);
    const serializedResource = serializeResource(resource);
    const fileStatus = getResourceFileStatus(project, resource);
    const resourceSummary = {
      ...serializedResource,
      ...fileStatus,
    };
    resourcesByName[name] = resourceSummary;
    if (fileStatus.issue) {
      invalidResources.push({
        name,
        kind: resource.getKind(),
        issue: fileStatus.issue,
        file: resource.getFile(),
        resolvedFile: fileStatus.resolvedFile || null,
      });
    }
  });

  const stringReferences = [];
  visitSerializedStrings(serializedProject, [], (value, referencePath) => {
    if (resourcesByName[value]) {
      stringReferences.push({
        resourceName: value,
        path: referencePath.join('/'),
      });
    }
  });

  const spriteFrameReferences = collectSpriteFrameReferences(
    serializedProject,
    resourcesByName
  );
  const eventResourceReferences = collectEventResourceReferences(
    project,
    serializedProject,
    resourcesByName
  );
  const uselessResourceNames = gd.ProjectResourcesAdder.getAllUseless(
    project,
    ''
  ).toJSArray();

  const missingSpriteFrameReferences = spriteFrameReferences.filter(
    reference => !reference.exists
  );
  const suspiciousCollisionMasks = collectSuspiciousCollisionMasks(
    serializedProject
  );
  const summary = {
    totalResources: resourceNames.length,
    invalidResourcesCount: invalidResources.length,
    unusedResourcesCount: uselessResourceNames.length,
    spriteFrameReferencesCount: spriteFrameReferences.length,
    eventResourceReferencesCount: eventResourceReferences.length,
    missingSpriteFrameReferencesCount: missingSpriteFrameReferences.length,
    suspiciousCollisionMasksCount: suspiciousCollisionMasks.length,
    stringReferencesCount: stringReferences.length,
  };

  if (args && (args.compact === true || args.summary_only === true)) {
    return {
      success: true,
      compact: true,
      projectName: project.getName(),
      summary,
      invalidResources,
      unusedResources: uselessResourceNames,
      missingSpriteFrameReferences,
      suspiciousCollisionMasks,
      eventResourceReferences,
    };
  }

  return {
    success: true,
    projectName: project.getName(),
    summary,
    resources: resourceNames.map(name => resourcesByName[name]),
    resourcesByName,
    invalidResources,
    unusedResources: uselessResourceNames,
    spriteFrameReferences,
    eventResourceReferences,
    missingSpriteFrameReferences,
    suspiciousCollisionMasks,
    stringReferences,
    includeSerializedProject: !!(args && args.include_serialized_project),
    serializedProject:
      args && args.include_serialized_project ? serializedProject : undefined,
  };
};

const readPoint = (value: any): { x: number, y: number } | null => {
  if (!value || typeof value !== 'object') return null;
  const x = getFiniteNumber(value.x);
  const y = getFiniteNumber(value.y);
  if (x === null || y === null) return null;
  return { x, y };
};

const assertResourceIsImage = (project: gdProject, imageName: string) => {
  if (!project.getResourcesManager().hasResource(imageName)) {
    throw new Error(`Image resource not found: "${imageName}".`);
  }

  const resource = project.getResourcesManager().getResource(imageName);
  if (resource.getKind() !== 'image') {
    throw new Error(
      `Resource "${imageName}" has kind "${resource.getKind()}" but Sprite frames require "image".`
    );
  }
};

const applySpritePoints = (sprite: gdSprite, frame: Object) => {
  const origin = readPoint(frame.origin);
  if (origin) {
    sprite.getOrigin().setX(origin.x);
    sprite.getOrigin().setY(origin.y);
  }

  const center = readPoint(frame.center);
  if (center) {
    sprite.setDefaultCenterPoint(false);
    sprite.getCenter().setX(center.x);
    sprite.getCenter().setY(center.y);
  } else if (frame.center === null || frame.defaultCenter === true) {
    sprite.setDefaultCenterPoint(true);
  }

  if (Array.isArray(frame.points)) {
    frame.points.forEach(pointData => {
      if (!pointData || typeof pointData !== 'object') return;
      if (typeof pointData.name !== 'string' || !pointData.name) return;
      const point = readPoint(pointData);
      if (!point) return;
      const customPoint = new gd.Point(pointData.name);
      customPoint.setX(point.x);
      customPoint.setY(point.y);
      sprite.addPoint(customPoint);
      customPoint.delete();
    });
  }
};

const applySpriteCollisionMask = (sprite: gdSprite, frame: Object) => {
  if (frame.fullImageCollisionMask === true) {
    sprite.setFullImageCollisionMask(true);
    return;
  }

  // When no explicit custom collision mask is provided, default to the full
  // image (bounding box) collision mask, like the GDevelop editor does for new
  // sprites. A freshly-constructed gd.Sprite has fullImageCollisionMask=false
  // with an empty customCollisionMask; leaving it untouched would serialize to
  // hasCustomCollisionMask:true with an empty mask, i.e. an empty collision
  // region, so collisions would never trigger.
  if (!Array.isArray(frame.collisionMask) || frame.collisionMask.length === 0) {
    sprite.setFullImageCollisionMask(true);
    return;
  }

  sprite.setFullImageCollisionMask(false);
  sprite.getCustomCollisionMask().clear();

  frame.collisionMask.forEach(polygonData => {
    if (!Array.isArray(polygonData) || polygonData.length < 3) {
      throw new Error(
        'Each collisionMask polygon must contain at least 3 vertices.'
      );
    }

    const polygon = new gd.Polygon2d();
    polygonData.forEach(vertexData => {
      const vertex = readPoint(vertexData);
      if (!vertex) {
        polygon.delete();
        throw new Error('Collision mask vertices must be { x, y } numbers.');
      }

      const vector = new gd.Vector2f();
      vector.x = vertex.x;
      vector.y = vertex.y;
      polygon.getVertices().push_back(vector);
      vector.delete();
    });
    sprite.getCustomCollisionMask().push_back(polygon);
    polygon.delete();
  });
};

const validateSpriteAnimationsData = (
  project: gdProject,
  animationsData: Array<any>
) => {
  animationsData.forEach((animationData, animationIndex) => {
    if (!animationData || typeof animationData !== 'object') {
      throw new Error(`Invalid animation at index ${animationIndex}.`);
    }
    const directionsData = Array.isArray(animationData.directions)
      ? animationData.directions
      : [
          {
            frames: Array.isArray(animationData.frames)
              ? animationData.frames
              : [],
          },
        ];
    if (!directionsData.length) {
      throw new Error(
        `Animation at index ${animationIndex} has no directions.`
      );
    }
    directionsData.forEach((directionData, directionIndex) => {
      const frames =
        directionData && Array.isArray(directionData.frames)
          ? directionData.frames
          : [];
      if (!frames.length) {
        throw new Error(
          `Animation ${animationIndex}, direction ${directionIndex} has no frames.`
        );
      }
      frames.forEach((frameData, frameIndex) => {
        if (!frameData || typeof frameData !== 'object') {
          throw new Error(
            `Invalid frame at animation ${animationIndex}, direction ${directionIndex}, frame ${frameIndex}.`
          );
        }
        const imageName =
          typeof frameData.image === 'string'
            ? frameData.image
            : typeof frameData.resourceName === 'string'
            ? frameData.resourceName
            : typeof frameData.imageName === 'string'
            ? frameData.imageName
            : '';
        if (!imageName) {
          throw new Error(
            `Missing image for animation ${animationIndex}, direction ${directionIndex}, frame ${frameIndex}.`
          );
        }
        assertResourceIsImage(project, imageName);

        if (Array.isArray(frameData.collisionMask)) {
          frameData.collisionMask.forEach(polygonData => {
            if (!Array.isArray(polygonData) || polygonData.length < 3) {
              throw new Error(
                'Each collisionMask polygon must contain at least 3 vertices.'
              );
            }
            polygonData.forEach(vertexData => {
              if (!readPoint(vertexData)) {
                throw new Error(
                  'Collision mask vertices must be { x, y } numbers.'
                );
              }
            });
          });
        }
      });
    });
  });
};

export const setSpriteAnimations = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const animationsData =
    args && Array.isArray(args.animations) ? args.animations : null;
  if (!animationsData) {
    throw new Error('Missing animations array.');
  }

  const scene = getScene(project, sceneName);
  const { object } = getSceneObject(project, scene, objectName);
  if (object.getType() !== 'Sprite') {
    throw new Error(
      `Object "${objectName}" has type "${object.getType()}" but set_sprite_animations only supports Sprite objects.`
    );
  }
  validateSpriteAnimationsData(project, animationsData);

  const spriteConfiguration = gd.asSpriteConfiguration(
    object.getConfiguration()
  );
  const animations = spriteConfiguration.getAnimations();
  for (let index = animations.getAnimationsCount() - 1; index >= 0; index--) {
    animations.removeAnimation(index);
  }

  animationsData.forEach((animationData, animationIndex) => {
    if (!animationData || typeof animationData !== 'object') {
      throw new Error(`Invalid animation at index ${animationIndex}.`);
    }
    const directionsData = Array.isArray(animationData.directions)
      ? animationData.directions
      : [
          {
            frames: Array.isArray(animationData.frames)
              ? animationData.frames
              : [],
          },
        ];
    if (!directionsData.length) {
      throw new Error(
        `Animation at index ${animationIndex} has no directions.`
      );
    }

    const animation = new gd.Animation();
    if (typeof animationData.name === 'string') {
      animation.setName(animationData.name);
    }
    if (typeof animationData.useMultipleDirections === 'boolean') {
      animation.setUseMultipleDirections(animationData.useMultipleDirections);
    } else if (directionsData.length > 1) {
      animation.setUseMultipleDirections(true);
    }
    animation.setDirectionsCount(directionsData.length);

    directionsData.forEach((directionData, directionIndex) => {
      const frames =
        directionData && Array.isArray(directionData.frames)
          ? directionData.frames
          : [];
      if (!frames.length) {
        animation.delete();
        throw new Error(
          `Animation ${animationIndex}, direction ${directionIndex} has no frames.`
        );
      }

      const direction = animation.getDirection(directionIndex);

      // Loop and frame timing are core animation properties. Accept them on the
      // direction or, as a convenience, on the animation (applied to every
      // direction). Without an explicit timeBetweenFrames the engine default can
      // make multi-frame animations play oddly, and a non-looping animation is
      // required for HasAnimationEnded to ever become true.
      const loopValue =
        typeof directionData.loop === 'boolean'
          ? directionData.loop
          : typeof directionData.looping === 'boolean'
          ? directionData.looping
          : typeof animationData.loop === 'boolean'
          ? animationData.loop
          : typeof animationData.looping === 'boolean'
          ? animationData.looping
          : null;
      if (loopValue !== null) {
        direction.setLoop(loopValue);
      }
      const timeBetweenFramesValue = getFiniteNumber(
        directionData.timeBetweenFrames !== undefined
          ? directionData.timeBetweenFrames
          : animationData.timeBetweenFrames
      );
      if (timeBetweenFramesValue !== null && timeBetweenFramesValue >= 0) {
        direction.setTimeBetweenFrames(timeBetweenFramesValue);
      }

      frames.forEach((frameData, frameIndex) => {
        if (!frameData || typeof frameData !== 'object') {
          animation.delete();
          throw new Error(
            `Invalid frame at animation ${animationIndex}, direction ${directionIndex}, frame ${frameIndex}.`
          );
        }
        const imageName =
          typeof frameData.image === 'string'
            ? frameData.image
            : typeof frameData.resourceName === 'string'
            ? frameData.resourceName
            : typeof frameData.imageName === 'string'
            ? frameData.imageName
            : '';
        if (!imageName) {
          animation.delete();
          throw new Error(
            `Missing image for animation ${animationIndex}, direction ${directionIndex}, frame ${frameIndex}.`
          );
        }
        assertResourceIsImage(project, imageName);

        const sprite = new gd.Sprite();
        sprite.setImageName(imageName);
        applySpritePoints(sprite, frameData);
        applySpriteCollisionMask(sprite, frameData);
        direction.addSprite(sprite);
        sprite.delete();
      });
    });

    animations.addAnimation(animation);
    animation.delete();
  });

  scene.updateBehaviorsSharedData(project);
  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: false,
    });
  }

  return {
    success: true,
    sceneName,
    objectName,
    animationsCount: animations.getAnimationsCount(),
    serializedObject: serializeToJSObject(object),
  };
};

export const replaceObjectDefinition = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const serializedObject =
    (args &&
    args.serialized_object &&
    typeof args.serialized_object === 'object'
      ? args.serialized_object
      : null) ||
    (args && args.serializedObject && typeof args.serializedObject === 'object'
      ? args.serializedObject
      : null);
  if (!serializedObject) {
    throw new Error('Missing serialized_object.');
  }

  const objectType =
    getOptionalString(args, 'object_type') ||
    (typeof serializedObject.type === 'string' ? serializedObject.type : null);
  if (!objectType) {
    throw new Error(
      'Missing object type in object_type or serialized_object.type.'
    );
  }

  const objectMetadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    objectType
  );
  if (gd.MetadataProvider.isBadObjectMetadata(objectMetadata)) {
    throw new Error(`Object type "${objectType}" does not exist.`);
  }

  // Validate before mutating the real scene. Losing the previous object because
  // a serialized replacement cannot be unserialized would be worse than failing.
  // $FlowFixMe[invalid-constructor]
  const validationProject = new gd.ProjectHelper.createNewGDJSProject();
  try {
    const validationScene = validationProject.insertNewLayout(sceneName, 0);
    const validationObject = validationScene
      .getObjects()
      .insertNewObject(validationProject, objectType, objectName, 0);
    unserializeFromJSObject(
      validationObject,
      {
        ...serializedObject,
        name: objectName,
        type: objectType,
      },
      'unserializeFrom',
      project
    );
    serializeToJSObject(validationObject);
  } finally {
    validationProject.delete();
  }

  const scene = getScene(project, sceneName);
  const objects = scene.getObjects();
  const previousIndex = getObjectIndex(objects, objectName);
  const insertionIndex =
    previousIndex >= 0 ? previousIndex : objects.getObjectsCount();
  const didReplace = previousIndex >= 0;
  const isTheFirstOfItsTypeInProject = !gd.UsedObjectTypeFinder.scanProject(
    project,
    objectType
  );

  if (didReplace) {
    objects.removeObject(objectName);
  }

  const object = objects.insertNewObject(
    project,
    objectType,
    objectName,
    Math.min(insertionIndex, objects.getObjectsCount())
  );
  unserializeFromJSObject(
    object,
    {
      ...serializedObject,
      name: objectName,
      type: objectType,
    },
    'unserializeFrom',
    project
  );
  object.setName(objectName);

  scene.updateBehaviorsSharedData(project);
  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: isTheFirstOfItsTypeInProject,
    });
  }

  return {
    success: true,
    sceneName,
    objectName,
    didReplace,
    objectType: object.getType(),
    serializedObject: serializeToJSObject(object),
  };
};

const iterateInitialInstances = (
  initialInstances: gdInitialInstancesContainer,
  callback: gdInitialInstance => void
) => {
  const instanceGetter = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe[cannot-write]
  instanceGetter.invoke = instancePtr => {
    const instance: gdInitialInstance = gd.wrapPointer(
      // $FlowFixMe[incompatible-type]
      instancePtr,
      gd.InitialInstance
    );
    callback(instance);
  };
  // $FlowFixMe[incompatible-type]
  initialInstances.iterateOverInstances(instanceGetter);
  instanceGetter.delete();
};

const findInstanceByShortId = (
  initialInstances: gdInitialInstancesContainer,
  id: string
): gdInitialInstance | null => {
  let foundInstance = null;
  iterateInitialInstances(initialInstances, instance => {
    if (!foundInstance && instance.getPersistentUuid().startsWith(id)) {
      foundInstance = instance;
    }
  });
  return foundInstance;
};

export const deleteSceneObject = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const scene = getScene(project, sceneName);
  const objects = scene.getObjects();

  if (!objects.hasObjectNamed(objectName)) {
    throw new Error(`Scene object not found: "${objectName}".`);
  }

  gd.WholeProjectRefactorer.objectRemovedInScene(project, scene, objectName);
  objects.removeObject(objectName);

  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: false,
    });
  }
  if (callbacks.onInstancesModifiedOutsideEditor) {
    callbacks.onInstancesModifiedOutsideEditor({ scene });
  }

  return {
    success: true,
    sceneName,
    objectName,
    deleted: true,
  };
};

const findObjectPropertyName = (
  properties: any,
  requestedName: string
): string | null => {
  if (properties.has(requestedName)) return requestedName;

  const normalizedRequest = requestedName.toLowerCase().replace(/[-_ ]/g, '');
  const propertyNames = properties.keys().toJSArray();
  return (
    propertyNames.find(
      propertyName =>
        propertyName.toLowerCase().replace(/[-_ ]/g, '') === normalizedRequest
    ) || null
  );
};

export const setObjectProperties = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const requestedProperties =
    args && args.properties && typeof args.properties === 'object'
      ? args.properties
      : null;
  if (!requestedProperties) {
    throw new Error('Missing properties object.');
  }

  const scene = getScene(project, sceneName);
  const { object } = getSceneObject(project, scene, objectName);
  const objectConfiguration = object.getConfiguration();
  const objectProperties = objectConfiguration.getProperties();
  const changes = [];
  const warnings = [];

  Object.keys(requestedProperties).forEach(requestedName => {
    const propertyName = findObjectPropertyName(
      objectProperties,
      requestedName
    );
    if (!propertyName) {
      warnings.push(
        `Property "${requestedName}" not found on "${objectName}".`
      );
      return;
    }

    const property = objectProperties.get(propertyName);
    const newValue = stringifyPropertyValue(requestedProperties[requestedName]);

    if (property.getType() === 'resource') {
      if (!project.getResourcesManager().hasResource(newValue)) {
        warnings.push(
          `"${propertyName}" on "${objectName}": resource "${newValue}" does not exist.`
        );
        return;
      }

      const expectedKind = (
        property.getExtraInfo().toJSArray()[0] || ''
      ).toLowerCase();
      const resource = project.getResourcesManager().getResource(newValue);
      if (expectedKind && resource.getKind().toLowerCase() !== expectedKind) {
        warnings.push(
          `"${propertyName}" on "${objectName}": resource "${newValue}" has kind "${resource.getKind()}" but expected "${expectedKind}".`
        );
        return;
      }
    }

    if (!objectConfiguration.updateProperty(propertyName, newValue)) {
      warnings.push(
        `Could not set "${propertyName}" on "${objectName}": invalid value or type.`
      );
      return;
    }

    changes.push({
      propertyName,
      newValue,
    });
  });

  if (!changes.length && warnings.length) {
    throw new Error(`No changes. Issues: ${warnings.join(' ')}`);
  }

  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: false,
    });
  }

  return {
    success: true,
    sceneName,
    objectName,
    changes,
    warnings,
    serializedObject: serializeToJSObject(object),
  };
};

const readTextObjectProperties = (textObjectConfiguration: any): Object => ({
  text: textObjectConfiguration.getText(),
  characterSize: textObjectConfiguration.getCharacterSize(),
  color: textObjectConfiguration.getColor(),
  bold: textObjectConfiguration.isBold(),
  italic: textObjectConfiguration.isItalic(),
  textAlignment: textObjectConfiguration.getTextAlignment(),
  verticalTextAlignment: textObjectConfiguration.getVerticalTextAlignment(),
  fontName: textObjectConfiguration.getFontName(),
  outlineEnabled: textObjectConfiguration.isOutlineEnabled(),
  outlineColor: textObjectConfiguration.getOutlineColor(),
  outlineThickness: textObjectConfiguration.getOutlineThickness(),
  shadowEnabled: textObjectConfiguration.isShadowEnabled(),
  shadowColor: textObjectConfiguration.getShadowColor(),
  shadowDistance: textObjectConfiguration.getShadowDistance(),
  shadowAngle: textObjectConfiguration.getShadowAngle(),
  shadowOpacity: textObjectConfiguration.getShadowOpacity(),
  shadowBlurRadius: textObjectConfiguration.getShadowBlurRadius(),
  lineHeight: textObjectConfiguration.getLineHeight(),
});

export const setTextObjectProperties = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const scene = getScene(project, sceneName);
  const { object } = getSceneObject(project, scene, objectName);

  if (object.getType() !== 'TextObject::Text') {
    throw new Error(
      `Object "${objectName}" has type "${object.getType()}" but set_text_object_properties only supports TextObject::Text.`
    );
  }

  const textObjectConfiguration = gd.asTextObjectConfiguration(
    object.getConfiguration()
  );
  const changes = [];
  const setValue = (name, value, setter) => {
    if (value === undefined || value === null) return;
    setter(value);
    changes.push(name);
  };

  setValue('text', args.text, value =>
    textObjectConfiguration.setText(String(value))
  );
  setValue(
    'characterSize',
    firstNonNullNumber(args.character_size, args.characterSize),
    value => textObjectConfiguration.setCharacterSize(value)
  );
  setValue('color', args.color, value =>
    textObjectConfiguration.setColor(String(value))
  );
  setValue(
    'bold',
    typeof args.bold === 'boolean' ? args.bold : undefined,
    value => textObjectConfiguration.setBold(value)
  );
  setValue(
    'italic',
    typeof args.italic === 'boolean' ? args.italic : undefined,
    value => textObjectConfiguration.setItalic(value)
  );
  setValue('fontName', args.font_name || args.fontName, value =>
    textObjectConfiguration.setFontName(String(value))
  );
  setValue('textAlignment', args.text_alignment || args.textAlignment, value =>
    textObjectConfiguration.setTextAlignment(String(value))
  );
  setValue(
    'verticalTextAlignment',
    args.vertical_text_alignment || args.verticalTextAlignment,
    value => textObjectConfiguration.setVerticalTextAlignment(String(value))
  );
  setValue(
    'lineHeight',
    firstNonNullNumber(args.line_height, args.lineHeight),
    value => textObjectConfiguration.setLineHeight(value)
  );

  const outline =
    args && args.outline && typeof args.outline === 'object'
      ? args.outline
      : {};
  setValue(
    'outlineEnabled',
    typeof outline.enabled === 'boolean'
      ? outline.enabled
      : typeof args.outline_enabled === 'boolean'
      ? args.outline_enabled
      : undefined,
    value => textObjectConfiguration.setOutlineEnabled(value)
  );
  setValue('outlineColor', outline.color || args.outline_color, value =>
    textObjectConfiguration.setOutlineColor(String(value))
  );
  setValue(
    'outlineThickness',
    firstNonNullNumber(outline.thickness, args.outline_thickness),
    value => textObjectConfiguration.setOutlineThickness(value)
  );

  const shadow =
    args && args.shadow && typeof args.shadow === 'object' ? args.shadow : {};
  setValue(
    'shadowEnabled',
    typeof shadow.enabled === 'boolean'
      ? shadow.enabled
      : typeof args.shadow_enabled === 'boolean'
      ? args.shadow_enabled
      : undefined,
    value => textObjectConfiguration.setShadowEnabled(value)
  );
  setValue('shadowColor', shadow.color || args.shadow_color, value =>
    textObjectConfiguration.setShadowColor(String(value))
  );
  setValue(
    'shadowDistance',
    firstNonNullNumber(shadow.distance, args.shadow_distance),
    value => textObjectConfiguration.setShadowDistance(value)
  );
  setValue(
    'shadowAngle',
    firstNonNullNumber(shadow.angle, args.shadow_angle),
    value => textObjectConfiguration.setShadowAngle(value)
  );
  setValue(
    'shadowOpacity',
    firstNonNullNumber(shadow.opacity, args.shadow_opacity),
    value => textObjectConfiguration.setShadowOpacity(value)
  );
  setValue(
    'shadowBlurRadius',
    firstNonNullNumber(
      shadow.blur_radius,
      shadow.blurRadius,
      args.shadow_blur_radius
    ),
    value => textObjectConfiguration.setShadowBlurRadius(value)
  );

  if (!changes.length) {
    throw new Error('No supported text object properties were provided.');
  }

  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: false,
    });
  }

  return {
    success: true,
    sceneName,
    objectName,
    changes,
    properties: readTextObjectProperties(textObjectConfiguration),
    serializedObject: serializeToJSObject(object),
  };
};

const applyInstanceFields = (
  instance: gdInitialInstance,
  instanceData: Object
) => {
  const objectName =
    getOptionalString(instanceData, 'object_name') ||
    getOptionalString(instanceData, 'objectName');
  if (objectName) instance.setObjectName(objectName);

  const layer =
    getOptionalString(instanceData, 'layer_name') ||
    getOptionalString(instanceData, 'layer');
  if (layer !== null) instance.setLayer(layer);

  const x = getFiniteNumber(instanceData.x);
  const y = getFiniteNumber(instanceData.y);
  const z = getFiniteNumber(instanceData.z);
  const angle = firstNonNullNumber(instanceData.angle, instanceData.rotation);
  const zOrder = firstNonNullNumber(instanceData.z_order, instanceData.zOrder);
  const opacity = getFiniteNumber(instanceData.opacity);

  if (x !== null) instance.setX(x);
  if (y !== null) instance.setY(y);
  if (z !== null) instance.setZ(z);
  if (angle !== null) instance.setAngle(angle);
  if (zOrder !== null) instance.setZOrder(zOrder);
  if (opacity !== null) instance.setOpacity(opacity);

  const rotationX = getFiniteNumber(instanceData.rotationX);
  const rotationY = getFiniteNumber(instanceData.rotationY);
  if (rotationX !== null) instance.setRotationX(rotationX);
  if (rotationY !== null) instance.setRotationY(rotationY);

  const customSize = instanceData.custom_size || instanceData.customSize;
  const width = firstNonNullNumber(
    instanceData.width,
    customSize && customSize.width
  );
  const height = firstNonNullNumber(
    instanceData.height,
    customSize && customSize.height
  );
  const depth = firstNonNullNumber(
    instanceData.depth,
    customSize && customSize.depth
  );
  if (width !== null || height !== null) {
    instance.setHasCustomSize(true);
    if (width !== null) instance.setCustomWidth(width);
    if (height !== null) instance.setCustomHeight(height);
  }
  if (depth !== null) {
    instance.setHasCustomDepth(true);
    instance.setCustomDepth(depth);
  }

  if (typeof instanceData.locked === 'boolean') {
    instance.setLocked(instanceData.locked);
  }
  if (typeof instanceData.sealed === 'boolean') {
    instance.setSealed(instanceData.sealed);
    if (instanceData.sealed) instance.setLocked(true);
  }
};

export const putStructured2dInstances = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
  const instancesData =
    args && Array.isArray(args.instances) ? args.instances : null;
  if (!instancesData) {
    throw new Error('Missing instances array.');
  }

  const defaultOperation =
    getOptionalString(args, 'operation') ||
    getOptionalString(args, 'op') ||
    'upsert';
  const initialInstances = scene.getInitialInstances();

  const plannedOperations = instancesData.map((instanceData, index) => {
    if (!instanceData || typeof instanceData !== 'object') {
      throw new Error(`Invalid instance at index ${index}.`);
    }

    const operation =
      getOptionalString(instanceData, 'operation') ||
      getOptionalString(instanceData, 'op') ||
      defaultOperation;
    const id = getOptionalString(instanceData, 'id');
    const existingInstance = id
      ? findInstanceByShortId(initialInstances, id)
      : null;

    if (operation === 'delete' || operation === 'remove') {
      if (!id) throw new Error(`Missing id for delete at instances[${index}].`);
      return { operation, id, existingInstance, instanceData };
    }

    if (operation === 'update' && !existingInstance) {
      throw new Error(`Instance id not found for update: "${id || ''}".`);
    }

    const objectName =
      getOptionalString(instanceData, 'object_name') ||
      getOptionalString(instanceData, 'objectName') ||
      (existingInstance ? existingInstance.getObjectName() : null);
    if (!objectName) {
      throw new Error(
        `Missing object_name for new instance at index ${index}.`
      );
    }
    if (
      !scene.getObjects().hasObjectNamed(objectName) &&
      !project.getObjects().hasObjectNamed(objectName)
    ) {
      throw new Error(
        `Object "${objectName}" not found for instance at index ${index}.`
      );
    }

    const layer =
      getOptionalString(instanceData, 'layer_name') ||
      getOptionalString(instanceData, 'layer') ||
      (existingInstance ? existingInstance.getLayer() : '');
    if (layer !== '' && !scene.hasLayerNamed(layer)) {
      throw new Error(
        `Layer "${layer}" not found for instance at index ${index}.`
      );
    }

    return { operation, id, existingInstance, instanceData };
  });

  const changes = [];

  plannedOperations.forEach(
    ({ operation, id, existingInstance, instanceData }) => {
      if (operation === 'delete' || operation === 'remove') {
        if (!existingInstance) {
          changes.push({ operation: 'delete', id, deleted: false });
          return;
        }
        initialInstances.removeInstance(existingInstance);
        changes.push({ operation: 'delete', id, deleted: true });
        return;
      }

      const instance =
        existingInstance || initialInstances.insertNewInitialInstance();
      applyInstanceFields(instance, instanceData);
      changes.push({
        operation: existingInstance ? 'update' : 'create',
        id: instance.getPersistentUuid().slice(0, 10),
        objectName: instance.getObjectName(),
      });
    }
  );

  if (callbacks.onInstancesModifiedOutsideEditor) {
    callbacks.onInstancesModifiedOutsideEditor({ scene });
  }

  return {
    success: true,
    sceneName,
    changes,
    instances: serializeToJSObject(scene.getInitialInstances()),
  };
};

const createOrReplaceSceneObjectOfType = (
  project: gdProject,
  scene: gdLayout,
  objectName: string,
  objectType: string,
  callbacks: SceneToolCallbacks
): {|
  object: gdObject,
  didCreate: boolean,
  didReplace: boolean,
|} => {
  const objectMetadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    objectType
  );
  if (gd.MetadataProvider.isBadObjectMetadata(objectMetadata)) {
    throw new Error(`Object type "${objectType}" does not exist.`);
  }

  const objects = scene.getObjects();
  const previousIndex = getObjectIndex(objects, objectName);
  if (previousIndex >= 0) {
    const existingObject = objects.getObject(objectName);
    if (existingObject.getType() === objectType) {
      return {
        object: existingObject,
        didCreate: false,
        didReplace: false,
      };
    }
    objects.removeObject(objectName);
  }

  const isTheFirstOfItsTypeInProject = !gd.UsedObjectTypeFinder.scanProject(
    project,
    objectType
  );
  const object = objects.insertNewObject(
    project,
    objectType,
    objectName,
    previousIndex >= 0 ? previousIndex : objects.getObjectsCount()
  );
  object.setName(objectName);
  scene.updateBehaviorsSharedData(project);

  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: isTheFirstOfItsTypeInProject,
    });
  }

  return {
    object,
    didCreate: previousIndex < 0,
    didReplace: previousIndex >= 0,
  };
};

const topLevelInstanceFieldNames = [
  'x',
  'y',
  'z',
  'angle',
  'rotation',
  'rotationX',
  'rotationY',
  'layer',
  'layer_name',
  'zOrder',
  'z_order',
  'opacity',
  'width',
  'height',
  'depth',
  'customSize',
  'custom_size',
  'locked',
  'sealed',
];

const buildOptionalInstancePayload = (
  args: Object,
  objectName: string
): Object | null => {
  const instanceArg =
    args && args.instance && typeof args.instance === 'object'
      ? args.instance
      : null;
  const hasTopLevelInstanceFields = topLevelInstanceFieldNames.some(
    fieldName => args && args[fieldName] !== undefined
  );
  const shouldCreateInstance =
    args &&
    (args.create_instance === true ||
      (args.create_instance !== false &&
        (instanceArg || hasTopLevelInstanceFields)));

  if (!shouldCreateInstance) return null;

  const instance = instanceArg ? { ...instanceArg } : {};
  topLevelInstanceFieldNames.forEach(fieldName => {
    if (args[fieldName] !== undefined) {
      instance[fieldName] = args[fieldName];
    }
  });
  instance.object_name = objectName;
  return instance;
};

const textPropertyNames = [
  'text',
  'character_size',
  'characterSize',
  'color',
  'bold',
  'italic',
  'font_name',
  'fontName',
  'text_alignment',
  'textAlignment',
  'vertical_text_alignment',
  'verticalTextAlignment',
  'line_height',
  'lineHeight',
  'outline',
  'outline_enabled',
  'outline_color',
  'outline_thickness',
  'shadow',
  'shadow_enabled',
  'shadow_color',
  'shadow_distance',
  'shadow_angle',
  'shadow_opacity',
  'shadow_blur_radius',
];

const hasTextProperties = (args: Object): boolean =>
  textPropertyNames.some(
    propertyName => args && args[propertyName] !== undefined
  );

export const createSpriteObjectFromResource = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const resourceName =
    getOptionalString(args, 'resource_name') ||
    getOptionalString(args, 'image_resource') ||
    getOptionalString(args, 'image');
  if (!resourceName) {
    throw new Error('Missing resource_name.');
  }
  assertResourceIsImage(project, resourceName);

  const scene = getScene(project, sceneName);
  const objectResult = createOrReplaceSceneObjectOfType(
    project,
    scene,
    objectName,
    'Sprite',
    callbacks
  );

  const frame: Object = {
    image: resourceName,
  };
  [
    'origin',
    'center',
    'collisionMask',
    'fullImageCollisionMask',
    'points',
  ].forEach(propertyName => {
    if (args[propertyName] !== undefined) {
      frame[propertyName] = args[propertyName];
    }
  });

  const animationResult = setSpriteAnimations(
    project,
    {
      scene_name: sceneName,
      object_name: objectName,
      animations: [
        {
          name: getOptionalString(args, 'animation_name') || 'Default',
          frames: [frame],
        },
      ],
    },
    callbacks
  );

  const instancePayload = buildOptionalInstancePayload(args, objectName);
  const instanceResult = instancePayload
    ? putStructured2dInstances(
        project,
        {
          scene_name: sceneName,
          operation: 'create',
          instances: [instancePayload],
        },
        callbacks
      )
    : null;

  return {
    success: true,
    sceneName,
    objectName,
    objectType: 'Sprite',
    didCreate: objectResult.didCreate,
    didReplace: objectResult.didReplace,
    resourceName,
    animationsCount: animationResult.animationsCount,
    instanceCreated: !!instanceResult,
    instanceResult,
    serializedObject: serializeToJSObject(objectResult.object),
  };
};

export const createTextObject = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const scene = getScene(project, sceneName);
  const objectResult = createOrReplaceSceneObjectOfType(
    project,
    scene,
    objectName,
    'TextObject::Text',
    callbacks
  );

  let textResult = null;
  if (hasTextProperties(args)) {
    textResult = setTextObjectProperties(project, args, callbacks);
  }

  const instancePayload = buildOptionalInstancePayload(args, objectName);
  const instanceResult = instancePayload
    ? putStructured2dInstances(
        project,
        {
          scene_name: sceneName,
          operation: 'create',
          instances: [instancePayload],
        },
        callbacks
      )
    : null;
  const textObjectConfiguration = gd.asTextObjectConfiguration(
    objectResult.object.getConfiguration()
  );

  return {
    success: true,
    sceneName,
    objectName,
    objectType: 'TextObject::Text',
    didCreate: objectResult.didCreate,
    didReplace: objectResult.didReplace,
    changes: textResult ? textResult.changes : [],
    properties: readTextObjectProperties(textObjectConfiguration),
    instanceCreated: !!instanceResult,
    instanceResult,
    serializedObject: serializeToJSObject(objectResult.object),
  };
};

const getObjectNamesFromContainer = (
  objectsContainer: gdObjectsContainer
): Array<string> => {
  const objectNames = [];
  for (let index = 0; index < objectsContainer.getObjectsCount(); index++) {
    objectNames.push(objectsContainer.getObjectAt(index).getName());
  }
  return objectNames;
};

const getInstanceCountsByObject = (
  initialInstances: gdInitialInstancesContainer
): { [string]: number } => {
  const counts: { [string]: number } = {};
  iterateInitialInstances(initialInstances, instance => {
    const objectName = instance.getObjectName();
    counts[objectName] = (counts[objectName] || 0) + 1;
  });
  return counts;
};

export const inspectProjectCleanup = (
  project: gdProject,
  args: Object = {}
): Object => {
  const sceneSummaries = [];
  const emptyScenes = [];
  const possiblyUnusedSceneObjects = [];
  const firstLayout = project.getFirstLayout();

  for (let index = 0; index < project.getLayoutsCount(); index++) {
    const scene = project.getLayoutAt(index);
    const sceneName = scene.getName();
    const objectNames = getObjectNamesFromContainer(scene.getObjects());
    const instanceCountsByObject = getInstanceCountsByObject(
      scene.getInitialInstances()
    );
    const serializedEvents = serializeToJSObject(scene.getEvents());
    const eventStringValues: Set<string> = new Set();
    visitSerializedStrings(serializedEvents, [], value => {
      eventStringValues.add(value);
    });

    objectNames.forEach(objectName => {
      const initialInstancesCount = instanceCountsByObject[objectName] || 0;
      if (initialInstancesCount === 0 && !eventStringValues.has(objectName)) {
        possiblyUnusedSceneObjects.push({
          sceneName,
          objectName,
          reason:
            'No initial instances and no exact event parameter/string match.',
        });
      }
    });

    const objectsCount = objectNames.length;
    const initialInstancesCount = scene
      .getInitialInstances()
      .getInstancesCount();
    const rootEventsCount = scene.getEvents().getEventsCount();
    const summary = {
      sceneName,
      index,
      isStartupScene: firstLayout ? firstLayout === sceneName : index === 0,
      objectsCount,
      initialInstancesCount,
      rootEventsCount,
      isEmpty:
        objectsCount === 0 &&
        initialInstancesCount === 0 &&
        rootEventsCount === 0,
    };
    sceneSummaries.push(summary);
    if (summary.isEmpty) emptyScenes.push(summary);
  }

  const resourceAudit = inspectProjectResources(project, {
    compact: true,
  });

  return {
    success: true,
    projectName: project.getName(),
    summary: {
      scenesCount: sceneSummaries.length,
      emptyScenesCount: emptyScenes.length,
      possiblyUnusedSceneObjectsCount: possiblyUnusedSceneObjects.length,
      invalidResourcesCount: resourceAudit.summary.invalidResourcesCount,
      unusedResourcesCount: resourceAudit.summary.unusedResourcesCount,
      suspiciousCollisionMasksCount:
        resourceAudit.summary.suspiciousCollisionMasksCount,
    },
    scenes:
      args && args.include_scene_summaries === false
        ? undefined
        : sceneSummaries,
    emptyScenes,
    possiblyUnusedSceneObjects,
    invalidResources: resourceAudit.invalidResources,
    unusedResources: resourceAudit.unusedResources,
    missingSpriteFrameReferences: resourceAudit.missingSpriteFrameReferences,
    suspiciousCollisionMasks: resourceAudit.suspiciousCollisionMasks,
  };
};

// List the behavior types available in the project, with the exact
// `behavior_type` string to pass to add_behavior and the default behavior name.
// When `object_name` (+ optional `scene_name`) is given, only behaviors
// compatible with that object's type are returned (a behavior is compatible
// when its required object type is empty or matches the object's type).
export const listAvailableBehaviors = (
  project: gdProject,
  args: Object = {}
): Object => {
  const platform = project.getCurrentPlatform();
  const searchText = getOptionalString(args, 'search') || '';
  const objectName = getOptionalString(args, 'object_name');
  const sceneName = getOptionalString(args, 'scene_name');
  const includeHidden = !!(args && args.include_hidden === true);

  let filterObjectType: string | null = null;
  let resolvedObjectName: string | null = null;
  let resolvedObject: gdObject | null = null;
  if (objectName) {
    let object: gdObject | null = null;
    if (sceneName) {
      const scene = getScene(project, sceneName);
      if (scene.getObjects().hasObjectNamed(objectName)) {
        object = scene.getObjects().getObject(objectName);
      }
    }
    if (!object && project.getObjects().hasObjectNamed(objectName)) {
      object = project.getObjects().getObject(objectName);
    }
    // Fall back to searching all scenes so callers can pass just the object
    // name without knowing which scene owns it.
    if (!object) {
      for (let i = 0; i < project.getLayoutsCount(); ++i) {
        const scene = project.getLayoutAt(i);
        if (scene.getObjects().hasObjectNamed(objectName)) {
          object = scene.getObjects().getObject(objectName);
          break;
        }
      }
    }
    if (!object) {
      throw new Error(
        `Object not found: "${objectName}"${
          sceneName ? ` in scene "${sceneName}"` : ''
        } nor globally nor in any scene.`
      );
    }
    resolvedObjectName = objectName;
    resolvedObject = object;
    filterObjectType = object.getType();
  }

  const normalizedSearch = searchText.toLowerCase().trim();
  const searchTokens = normalizedSearch
    ? normalizedSearch.split(/\s+/).filter(Boolean)
    : [];

  const all = enumerateBehaviorsMetadata(platform, project, null);
  const behaviors = all
    .filter(metadata => {
      if (
        !includeHidden &&
        isBehaviorDefaultCapability(metadata.behaviorMetadata)
      ) {
        // Default capabilities (e.g. text/effect/opacity capabilities) cannot
        // be added manually, so hide them unless explicitly requested.
        return false;
      }
      if (
        filterObjectType !== null &&
        metadata.objectType &&
        metadata.objectType !== filterObjectType
      ) {
        return false;
      }
      if (searchTokens.length) {
        const haystack = [
          metadata.type,
          metadata.fullName,
          metadata.description,
          metadata.category,
          (metadata.tags || []).join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!searchTokens.every(token => haystack.includes(token))) {
          return false;
        }
      }
      return true;
    })
    .map(metadata => ({
      // The exact value to pass to add_behavior as behavior_type.
      behaviorType: metadata.type,
      // The default behavior_name add_behavior uses if you omit behavior_name.
      // This is the name you reference in instruction behavior parameters.
      defaultName: metadata.defaultName,
      fullName: metadata.fullName,
      description: metadata.description,
      // Empty string means the behavior works on any object type.
      requiredObjectType: metadata.objectType || '',
      category: metadata.category || undefined,
    }));

  // When inspecting a specific object, also report the behaviors it ALREADY has
  // (including hidden default-capability behaviors like Text/Animation/Effect),
  // with the implicit NAME to use in instruction behavior parameters. This
  // answers "what is the behavior name for this capability on this object?".
  let objectBehaviors;
  if (resolvedObject) {
    const behaviorNames =
      typeof resolvedObject.getAllBehaviorNames === 'function'
        ? resolvedObject.getAllBehaviorNames().toJSArray()
        : [];
    objectBehaviors = behaviorNames.map(name => {
      const behavior = resolvedObject.getBehavior(name);
      const behaviorType =
        behavior && typeof behavior.getTypeName === 'function'
          ? behavior.getTypeName()
          : '';
      let fullName = '';
      if (behaviorType) {
        const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
          platform,
          behaviorType
        );
        if (!gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) {
          fullName = behaviorMetadata.getFullName();
        }
      }
      return {
        // The NAME to pass in an instruction's behavior parameter (e.g. Text,
        // Animation, Effect, Opacity, Resizable, Scale, Flippable for the
        // built-in capabilities, or your own behavior names).
        behaviorName: name,
        behaviorType,
        fullName: fullName || undefined,
        isDefaultCapability:
          behavior && typeof behavior.isDefaultBehavior === 'function'
            ? behavior.isDefaultBehavior()
            : undefined,
      };
    });
  }

  return {
    success: true,
    objectName: resolvedObjectName,
    objectType: filterObjectType,
    behaviorsCount: behaviors.length,
    behaviors,
    // Present only when object_name was given: the behavior names already on the
    // object, including capability behaviors and their implicit names.
    objectBehaviors,
  };
};

export const readSerializedScene = (
  project: gdProject,
  args: Object
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
  const serializedScene = serializeToJSObject(scene);

  // Granular reads: when object_name(s) are given, return only those objects'
  // serialized definitions (and optionally their initial instances) instead of
  // the whole 75KB+ scene. This avoids dumping the entire scene to a file just
  // to inspect one object's animation/behavior config.
  const objectNamesArg =
    (args && args.object_names) ||
    (args && args.object_name ? [args.object_name] : null);
  if (Array.isArray(objectNamesArg) && objectNamesArg.length) {
    const wanted = new Set(objectNamesArg.map(name => String(name)));
    const sceneObjects = Array.isArray(serializedScene.objects)
      ? serializedScene.objects.filter(object => wanted.has(object.name))
      : [];
    const globalObjects =
      serializeToJSObject(project.getObjects()).objects || [];
    const matchedGlobalObjects = Array.isArray(globalObjects)
      ? globalObjects.filter(object => wanted.has(object.name))
      : [];
    const includeInstances = !(args && args.include_instances === false);
    const instances =
      includeInstances && Array.isArray(serializedScene.instances)
        ? serializedScene.instances.filter(instance =>
            wanted.has(instance.name)
          )
        : undefined;
    const foundNames = new Set([
      ...sceneObjects.map(object => object.name),
      ...matchedGlobalObjects.map(object => object.name),
    ]);
    const notFound = [...wanted].filter(name => !foundNames.has(name));
    return {
      success: true,
      sceneName,
      filteredByObjectNames: [...wanted],
      objects: sceneObjects,
      globalObjects: matchedGlobalObjects,
      instances,
      notFound: notFound.length ? notFound : undefined,
    };
  }

  return {
    success: true,
    sceneName,
    serializedScene,
  };
};

export const readSceneEventsSerialized = (
  project: gdProject,
  args: Object
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
  const serializedEvents = serializeToJSObject(scene.getEvents());
  const rootEvents = Array.isArray(serializedEvents) ? serializedEvents : [];

  // summary_only: return a compact overview (root event count + per-type counts)
  // instead of the full, potentially huge, serialized event tree.
  if (args && (args.summary_only === true || args.summaryOnly === true)) {
    const typeCounts = {};
    rootEvents.forEach(event => {
      const type = (event && event.type) || 'unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    return {
      success: true,
      sceneName,
      summary: {
        rootEventsCount: rootEvents.length,
        rootEventTypeCounts: typeCounts,
      },
      note:
        'Compact summary. Omit summary_only to get the full serialized events; pass include_json:true to also get the JSON string.',
    };
  }

  const result: Object = {
    success: true,
    sceneName,
    serializedEvents,
  };
  // The JSON string duplicates serializedEvents and can be very large, so only
  // include it when explicitly requested.
  if (args && (args.include_json === true || args.includeJson === true)) {
    result.serializedEventsJson = serializeToJSON(scene.getEvents());
  }
  return result;
};

// Slice a single sprite-sheet PNG into a grid of frames, writing each cell as
// its own image resource, then bind them as one Sprite animation. GDevelop
// Sprite frames reference whole image resources (not sub-rects), so an actual
// image cut is required — done here with Electron's nativeImage (no new dep).
export const sliceSpriteSheet = (project: gdProject, args: Object): Object => {
  if (!fs || !path) {
    throw new Error('Filesystem access is not available.');
  }
  if (!nativeImage) {
    throw new Error(
      'Sprite-sheet slicing requires the Electron runtime (nativeImage); it is not available in this environment.'
    );
  }
  const sheetFile = getRequiredString(args, 'sheet_file');
  const objectName = getRequiredString(args, 'object_name');
  const sceneName = getOptionalString(args, 'scene_name') || undefined;
  const animationName = getOptionalString(args, 'animation_name') || 'Default';

  const absSheet = resolveLocalResourceFile(project, sheetFile) || sheetFile;
  if (!fs.existsSync(absSheet)) {
    throw new Error(`Sprite sheet not found: ${absSheet}`);
  }

  const sheet = nativeImage.createFromPath(absSheet);
  const size = sheet.getSize();
  const sheetWidth = size.width;
  const sheetHeight = size.height;
  if (!sheetWidth || !sheetHeight) {
    throw new Error(
      `Could not decode sprite sheet "${absSheet}" (got ${sheetWidth}x${sheetHeight}).`
    );
  }

  // Two ways to describe the grid: explicit columns/rows, or per-frame size.
  const columns = getFiniteNumber(args.columns);
  const rows = getFiniteNumber(args.rows);
  let frameWidth = getFiniteNumber(args.frame_width);
  let frameHeight = getFiniteNumber(args.frame_height);
  let cols;
  let rws;
  if (frameWidth && frameHeight) {
    cols = Math.floor(sheetWidth / frameWidth);
    rws = Math.floor(sheetHeight / frameHeight);
  } else if (columns && rows) {
    cols = Math.floor(columns);
    rws = Math.floor(rows);
    frameWidth = Math.floor(sheetWidth / cols);
    frameHeight = Math.floor(sheetHeight / rws);
  } else {
    throw new Error(
      'Provide either frame_width + frame_height, or columns + rows, to describe the grid.'
    );
  }
  if (cols < 1 || rws < 1) {
    throw new Error(
      `Grid resolves to ${cols}x${rws} frames; check the sheet size (${sheetWidth}x${sheetHeight}) and grid params.`
    );
  }

  const maxFrames =
    getFiniteNumber(args.frame_count) !== null
      ? Math.floor(args.frame_count)
      : cols * rws;
  const projectFile = project.getProjectFile && project.getProjectFile();
  const outDir =
    getOptionalString(args, 'output_dir') ||
    `assets/${objectName}_${animationName}`;
  const absOutDir =
    !path.isAbsolute(outDir) && projectFile
      ? path.resolve(path.dirname(projectFile), outDir)
      : outDir;
  if (!fs.existsSync(absOutDir)) fs.mkdirSync(absOutDir, { recursive: true });

  const frames = [];
  let frameIndex = 0;
  for (let row = 0; row < rws && frameIndex < maxFrames; row++) {
    for (let col = 0; col < cols && frameIndex < maxFrames; col++) {
      const cell = sheet.crop({
        x: col * frameWidth,
        y: row * frameHeight,
        width: frameWidth,
        height: frameHeight,
      });
      const buffer = cell.toPNG();
      const frameFileName = `${animationName}_${frameIndex}.png`;
      const relativeFrameFile = path
        .join(outDir, frameFileName)
        .split(path.sep)
        .join('/');
      fs.writeFileSync(path.join(absOutDir, frameFileName), buffer);

      const resourceName = `${objectName}_${animationName}_${frameIndex}`;
      addOrUpdateResource(project, {
        name: resourceName,
        file: relativeFrameFile,
        kind: 'image',
      });
      frames.push({ image: resourceName });
      frameIndex++;
    }
  }

  if (!frames.length) {
    throw new Error('No frames were produced from the sprite sheet.');
  }

  // Bind the produced frames as a single animation on the object.
  const animationResult = setSpriteAnimations(project, {
    scene_name: sceneName,
    object_name: objectName,
    animations: [
      {
        name: animationName,
        frames,
      },
    ],
  });

  return {
    success: true,
    objectName,
    animationName,
    sheetSize: { width: sheetWidth, height: sheetHeight },
    grid: { columns: cols, rows: rws, frameWidth, frameHeight },
    framesProduced: frames.length,
    outputDir: outDir,
    animation: animationResult,
    note:
      'Sprite sheet sliced into individual frame resources and bound as one animation. Re-run with different grid params to re-slice.',
  };
};

export const bulkEditSceneAssets = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  getScene(project, sceneName);

  const resources = Array.isArray(args.resources) ? args.resources : [];
  const objects = Array.isArray(args.objects) ? args.objects : [];
  const spriteAnimations = Array.isArray(args.sprite_animations)
    ? args.sprite_animations
    : Array.isArray(args.spriteAnimations)
    ? args.spriteAnimations
    : [];
  const behaviors = Array.isArray(args.behaviors) ? args.behaviors : [];
  const variables = Array.isArray(args.variables) ? args.variables : [];
  const instances = Array.isArray(args.instances) ? args.instances : [];

  const results = {
    resources: [],
    objects: [],
    spriteAnimations: [],
    behaviors: [],
    variables: [],
    instances: null,
  };

  resources.forEach((resourceArgs, index) => {
    if (!resourceArgs || typeof resourceArgs !== 'object') {
      throw new Error(`Invalid resource at resources[${index}].`);
    }
    const result = addOrUpdateResource(project, resourceArgs);
    results.resources.push({
      name: result.resource.name,
      kind: result.resource.kind,
      file: result.resource.file,
      created: result.created,
      fileStatus: result.fileStatus,
    });
  });

  objects.forEach((objectArgs, index) => {
    if (!objectArgs || typeof objectArgs !== 'object') {
      throw new Error(`Invalid object at objects[${index}].`);
    }
    const result = replaceObjectDefinition(
      project,
      {
        ...objectArgs,
        scene_name: objectArgs.scene_name || objectArgs.sceneName || sceneName,
      },
      callbacks
    );
    results.objects.push({
      objectName: result.objectName,
      objectType: result.objectType,
      didReplace: result.didReplace,
    });
  });

  spriteAnimations.forEach((animationArgs, index) => {
    if (!animationArgs || typeof animationArgs !== 'object') {
      throw new Error(
        `Invalid Sprite animation payload at sprite_animations[${index}].`
      );
    }
    const result = setSpriteAnimations(
      project,
      {
        ...animationArgs,
        scene_name:
          animationArgs.scene_name || animationArgs.sceneName || sceneName,
      },
      callbacks
    );
    results.spriteAnimations.push({
      objectName: result.objectName,
      animationsCount: result.animationsCount,
    });
  });

  // Behaviors: [{ object_name, behavior_type, behavior_name? }]. Adds the
  // behavior (and its required behaviors) to a scene or global object.
  behaviors.forEach((behaviorArgs, index) => {
    if (!behaviorArgs || typeof behaviorArgs !== 'object') {
      throw new Error(`Invalid behavior payload at behaviors[${index}].`);
    }
    const objectName =
      behaviorArgs.object_name || behaviorArgs.objectName || '';
    const behaviorType =
      behaviorArgs.behavior_type || behaviorArgs.behaviorType || '';
    if (!objectName || !behaviorType) {
      throw new Error(
        `behaviors[${index}] needs object_name and behavior_type.`
      );
    }
    const scene = getScene(project, sceneName);
    let object: gdObject | null = null;
    if (scene.getObjects().hasObjectNamed(objectName)) {
      object = scene.getObjects().getObject(objectName);
    } else if (project.getObjects().hasObjectNamed(objectName)) {
      object = project.getObjects().getObject(objectName);
    }
    if (!object) {
      throw new Error(
        `behaviors[${index}]: object "${objectName}" not found in scene "${sceneName}" nor globally.`
      );
    }
    const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
      project.getCurrentPlatform(),
      behaviorType
    );
    if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) {
      throw new Error(
        `behaviors[${index}]: behavior type "${behaviorType}" does not exist.`
      );
    }
    const behaviorName =
      behaviorArgs.behavior_name ||
      behaviorArgs.behaviorName ||
      behaviorMetadata.getDefaultName();
    if (!object.hasBehaviorNamed(behaviorName)) {
      gd.WholeProjectRefactorer.addBehaviorAndRequiredBehaviors(
        project,
        object,
        behaviorType,
        behaviorName
      );
    }
    results.behaviors.push({
      objectName,
      behaviorType,
      behaviorName,
      added: object.hasBehaviorNamed(behaviorName),
    });
  });

  // Variables: [{ scope: 'scene'|'global', name, value, type? }]. Object-scope
  // variables should use the dedicated variable tool; here we cover scene/global.
  variables.forEach((variableArgs, index) => {
    if (!variableArgs || typeof variableArgs !== 'object') {
      throw new Error(`Invalid variable payload at variables[${index}].`);
    }
    const scope = variableArgs.scope || variableArgs.variable_scope || 'scene';
    const name = variableArgs.name || variableArgs.variable_name_or_path || '';
    if (!name) {
      throw new Error(`variables[${index}] needs a name.`);
    }
    const rawValue = variableArgs.value !== undefined ? variableArgs.value : '';
    let container;
    if (scope === 'global') {
      container = project.getVariables();
    } else if (scope === 'object') {
      const objectName =
        variableArgs.object_name || variableArgs.objectName || '';
      if (!objectName) {
        throw new Error(
          `variables[${index}] has scope "object" but no object_name.`
        );
      }
      const scene = getScene(project, sceneName);
      let object = null;
      if (scene.getObjects().hasObjectNamed(objectName)) {
        object = scene.getObjects().getObject(objectName);
      } else if (project.getObjects().hasObjectNamed(objectName)) {
        object = project.getObjects().getObject(objectName);
      }
      if (!object) {
        throw new Error(
          `variables[${index}]: object "${objectName}" not found in scene "${sceneName}" nor globally.`
        );
      }
      container = object.getVariables();
    } else {
      container = getScene(project, sceneName).getVariables();
    }
    const variable = container.has(name)
      ? container.get(name)
      : container.insertNew(name, container.count());
    // Type coercion: number unless the value is non-numeric or type says string.
    const declaredType = (variableArgs.type || '').toLowerCase();
    const numberValue = Number(rawValue);
    if (
      declaredType === 'string' ||
      (declaredType !== 'number' &&
        (typeof rawValue !== 'number' &&
          (typeof rawValue !== 'string' ||
            rawValue.trim() === '' ||
            Number.isNaN(numberValue))))
    ) {
      variable.setString(String(rawValue));
    } else {
      variable.setValue(numberValue);
    }
    results.variables.push({
      scope,
      name,
      value: rawValue,
      objectName: variableArgs.object_name || variableArgs.objectName,
    });
  });

  if (instances.length) {
    results.instances = putStructured2dInstances(
      project,
      {
        scene_name: sceneName,
        operation:
          getOptionalString(args, 'instances_operation') ||
          getOptionalString(args, 'instancesOperation') ||
          'create',
        instances,
      },
      callbacks
    );
  }

  return {
    success: true,
    sceneName,
    counts: {
      resources: results.resources.length,
      objects: results.objects.length,
      spriteAnimations: results.spriteAnimations.length,
      behaviors: results.behaviors.length,
      variables: results.variables.length,
      instances: results.instances ? results.instances.changes.length : 0,
    },
    results,
  };
};

const parseJsonPointer = (path: string): Array<string> => {
  if (path === '') return [];
  if (!path.startsWith('/')) {
    throw new Error(`JSON patch path must start with "/": "${path}".`);
  }
  return path
    .slice(1)
    .split('/')
    .map(part => part.replace(/~1/g, '/').replace(/~0/g, '~'));
};

const assertSafePathParts = (parts: Array<string>) => {
  parts.forEach(part => {
    if (
      part === '__proto__' ||
      part === 'constructor' ||
      part === 'prototype'
    ) {
      throw new Error(`Unsafe JSON patch path segment: "${part}".`);
    }
  });
};

const getPatchTarget = (
  document: any,
  path: string
): { container: any, key: string } => {
  const parts = parseJsonPointer(path);
  assertSafePathParts(parts);
  if (!parts.length) {
    throw new Error('Patching the scene root is not supported.');
  }

  let container = document;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (Array.isArray(container)) {
      const index = Number(part);
      if (!Number.isInteger(index) || index < 0 || index >= container.length) {
        throw new Error(`Invalid array index in patch path: "${path}".`);
      }
      container = container[index];
    } else if (
      container &&
      typeof container === 'object' &&
      Object.prototype.hasOwnProperty.call(container, part)
    ) {
      container = container[part];
    } else {
      throw new Error(`Patch path does not exist: "${path}".`);
    }
  }

  return {
    container,
    key: parts[parts.length - 1],
  };
};

const applySinglePatchOperation = (document: any, operation: Object) => {
  if (!operation || typeof operation !== 'object') {
    throw new Error('Patch operations must be objects.');
  }
  const op = getRequiredString(operation, 'op');
  const path = getRequiredString(operation, 'path');
  const { container, key } = getPatchTarget(document, path);

  if (Array.isArray(container)) {
    if (op === 'add' && key === '-') {
      container.push(operation.value);
      return;
    }
    const index = Number(key);
    if (!Number.isInteger(index) || index < 0) {
      throw new Error(`Invalid array index in patch path: "${path}".`);
    }
    if (op === 'add') {
      if (index > container.length) {
        throw new Error(`Array add index out of bounds: "${path}".`);
      }
      container.splice(index, 0, operation.value);
      return;
    }
    if (index >= container.length) {
      throw new Error(`Array index out of bounds: "${path}".`);
    }
    if (op === 'replace') {
      container[index] = operation.value;
      return;
    }
    if (op === 'remove') {
      container.splice(index, 1);
      return;
    }
  } else if (container && typeof container === 'object') {
    if (op === 'add' || op === 'replace') {
      if (
        op === 'replace' &&
        !Object.prototype.hasOwnProperty.call(container, key)
      ) {
        throw new Error(`Patch replace path does not exist: "${path}".`);
      }
      container[key] = operation.value;
      return;
    }
    if (op === 'remove') {
      if (!Object.prototype.hasOwnProperty.call(container, key)) {
        throw new Error(`Patch remove path does not exist: "${path}".`);
      }
      delete container[key];
      return;
    }
  }

  throw new Error(`Unsupported JSON patch operation: "${op}".`);
};

const validateSerializedSceneStructure = (serializedScene: Object) => {
  if (!serializedScene || typeof serializedScene !== 'object') {
    throw new Error('Patched scene must be an object.');
  }
  if (typeof serializedScene.name !== 'string' || !serializedScene.name) {
    throw new Error('Patched scene must keep a non-empty name.');
  }
  if (!Array.isArray(serializedScene.objects)) {
    throw new Error('Patched scene must keep an objects array.');
  }
  serializedScene.objects.forEach((object, index) => {
    if (!object || typeof object !== 'object') {
      throw new Error(
        `Patched scene object at index ${index} must be an object.`
      );
    }
    if (typeof object.name !== 'string' || !object.name) {
      throw new Error(
        `Patched scene object at index ${index} must keep a name.`
      );
    }
    if (typeof object.type !== 'string' || !object.type) {
      throw new Error(
        `Patched scene object "${object.name}" must keep a type.`
      );
    }
  });
  if (!Array.isArray(serializedScene.instances)) {
    throw new Error('Patched scene must keep an instances array.');
  }
  if (!Array.isArray(serializedScene.events)) {
    throw new Error('Patched scene must keep an events array.');
  }
  if (!Array.isArray(serializedScene.layers)) {
    throw new Error('Patched scene must keep a layers array.');
  }
};

const validateSceneCanBeUnserialized = (
  project: gdProject,
  serializedScene: Object
) => {
  // $FlowFixMe[invalid-constructor]
  const validationProject = new gd.ProjectHelper.createNewGDJSProject();
  try {
    const validationScene = validationProject.insertNewLayout(
      serializedScene.name || 'Scene',
      0
    );
    unserializeFromJSObject(
      validationScene,
      serializedScene,
      'unserializeFrom',
      project
    );
    serializeToJSObject(validationScene);
  } finally {
    validationProject.delete();
  }
};

export const applyValidatedScenePatch = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);
  let patch = args && Array.isArray(args.patch) ? args.patch : null;
  const patchFile = getOptionalString(args || {}, 'patch_file');
  if (!patch && patchFile) {
    if (!fs) throw new Error('Filesystem access is not available.');
    const resolvedPatchFile =
      path && !path.isAbsolute(patchFile) && project.getProjectFile()
        ? path.resolve(path.dirname(project.getProjectFile()), patchFile)
        : patchFile;
    if (!fs.existsSync(resolvedPatchFile)) {
      throw new Error(
        `Patch file not found: "${patchFile}"${
          resolvedPatchFile !== patchFile
            ? ` (resolved to "${resolvedPatchFile}")`
            : ''
        }.`
      );
    }
    const parsedPatch = JSON.parse(fs.readFileSync(resolvedPatchFile, 'utf8'));
    if (!Array.isArray(parsedPatch)) {
      throw new Error('patch_file must contain a JSON patch array.');
    }
    patch = parsedPatch;
  }
  if (!patch) {
    throw new Error('Missing patch array or patch_file.');
  }

  const originalSerializedScene = serializeToJSObject(scene);
  const patchedSerializedScene = JSON.parse(
    JSON.stringify(originalSerializedScene)
  );
  patch.forEach(operation =>
    applySinglePatchOperation(patchedSerializedScene, operation)
  );

  validateSerializedSceneStructure(patchedSerializedScene);
  validateSceneCanBeUnserialized(project, patchedSerializedScene);

  if (args && args.dry_run === true) {
    return {
      success: true,
      dryRun: true,
      sceneName,
      patchOperations: patch.length,
      serializedScene: patchedSerializedScene,
    };
  }

  unserializeFromJSObject(
    scene,
    patchedSerializedScene,
    'unserializeFrom',
    project
  );
  if (callbacks.onSceneEventsModifiedOutsideEditor) {
    callbacks.onSceneEventsModifiedOutsideEditor({
      scene,
      newOrChangedAiGeneratedEventIds: new Set(),
    });
  }
  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: false,
    });
  }
  if (callbacks.onInstancesModifiedOutsideEditor) {
    callbacks.onInstancesModifiedOutsideEditor({ scene });
  }

  return {
    success: true,
    dryRun: false,
    sceneName,
    patchOperations: patch.length,
    serializedScene: serializeToJSObject(scene),
  };
};
