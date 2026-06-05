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
// Encode an RGBA pixel buffer (length width*height*4) as a PNG Buffer. Shared by
// the placeholder generator and the static scene renderer.
const encodeRgbaPng = (
  width: number,
  height: number,
  pixels: Buffer
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
  const raw = Buffer.alloc((1 + width * 4) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = (1 + width * 4) * y;
    raw[rowStart] = 0;
    pixels.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const encodePlaceholderPng = (
  width: number,
  height: number,
  rgba: [number, number, number, number]
): Buffer => {
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    pixels[i * 4] = rgba[0];
    pixels[i * 4 + 1] = rgba[1];
    pixels[i * 4 + 2] = rgba[2];
    pixels[i * 4 + 3] = rgba[3];
  }
  return encodeRgbaPng(width, height, pixels);
};

// Richer procedural image: a filled SHAPE (rectangle/circle/ellipse/triangle/
// diamond) over a transparent background, optionally with a vertical 2-color
// GRADIENT fill. Antialiasing is approximate (hard edges) but produces far more
// usable placeholder art than a solid rectangle.
const encodeShapePng = (
  width: number,
  height: number,
  shape: string,
  color: [number, number, number, number],
  color2: ?[number, number, number, number]
): Buffer => {
  const pixels = Buffer.alloc(width * height * 4); // transparent by default
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const rx = width / 2;
  const ry = height / 2;
  const inside = (x, y) => {
    switch (shape) {
      case 'circle':
      case 'ellipse': {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        return dx * dx + dy * dy <= 1;
      }
      case 'triangle': {
        // Upward triangle: width grows toward the bottom.
        const t = y / (height - 1 || 1);
        const halfW = (t * width) / 2;
        return x >= cx - halfW && x <= cx + halfW;
      }
      case 'diamond': {
        return Math.abs(x - cx) / rx + Math.abs(y - cy) / ry <= 1;
      }
      default:
        return true; // rectangle
    }
  };
  for (let y = 0; y < height; y++) {
    // Vertical gradient blend factor.
    const g = height > 1 ? y / (height - 1) : 0;
    const r = color2
      ? Math.round(color[0] * (1 - g) + color2[0] * g)
      : color[0];
    const gg = color2
      ? Math.round(color[1] * (1 - g) + color2[1] * g)
      : color[1];
    const b = color2
      ? Math.round(color[2] * (1 - g) + color2[2] * g)
      : color[2];
    const a = color2
      ? Math.round(color[3] * (1 - g) + color2[3] * g)
      : color[3];
    for (let x = 0; x < width; x++) {
      if (inside(x, y)) {
        const o = (y * width + x) * 4;
        pixels[o] = r;
        pixels[o + 1] = gg;
        pixels[o + 2] = b;
        pixels[o + 3] = a;
      }
    }
  }
  return encodeRgbaPng(width, height, pixels);
};

// Write a minimal mono 16-bit PCM WAV. Supports a waveform and an optional ADSR
// envelope; falls back to a sine/noise burst with linear fade-out.
const encodePlaceholderWav = (
  durationMs: number,
  frequency: number,
  kind: string,
  options?: Object
): Buffer => {
  const sampleRate = 44100;
  const samples = Math.max(1, Math.floor((sampleRate * durationMs) / 1000));
  const data = Buffer.alloc(samples * 2);
  // Optional ADSR envelope (fractions of total duration) + waveform. Falls back
  // to the original linear fade-out when no ADSR is supplied.
  const adsr = options && options.adsr ? options.adsr : null;
  const waveform =
    (options && options.waveform) || (kind === 'noise' ? 'noise' : 'sine');
  const attack = adsr && adsr.attack != null ? adsr.attack : null;
  const decay = adsr && adsr.decay != null ? adsr.decay : 0;
  const sustain = adsr && adsr.sustain != null ? adsr.sustain : 0.7;
  const release = adsr && adsr.release != null ? adsr.release : 0.2;
  const envelopeAt = i => {
    const p = i / samples; // 0..1 progress
    if (attack === null) return 1 - p; // legacy linear fade-out
    if (p < attack) return attack > 0 ? p / attack : 1;
    if (p < attack + decay)
      return decay > 0 ? 1 - ((p - attack) / decay) * (1 - sustain) : sustain;
    if (p < 1 - release) return sustain;
    return release > 0 ? sustain * ((1 - p) / release) : 0;
  };
  const oscillator = (t, i) => {
    const phase = frequency * t;
    switch (waveform) {
      case 'noise':
        return ((i * 1103515245 + 12345) % 2048) / 1024 - 1;
      case 'square':
        return Math.sin(2 * Math.PI * phase) >= 0 ? 1 : -1;
      case 'saw':
        return 2 * (phase - Math.floor(phase + 0.5));
      case 'triangle':
        return 2 * Math.abs(2 * (phase - Math.floor(phase + 0.5))) - 1;
      default:
        return Math.sin(2 * Math.PI * phase);
    }
  };
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const value = oscillator(t, i) * envelopeAt(i);
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
  let collisionMaskForShape;
  if (assetType === 'sound') {
    const durationMs =
      getFiniteNumber(args.duration_ms) !== null ? args.duration_ms : 150;
    const frequency =
      getFiniteNumber(args.frequency) !== null ? args.frequency : 440;
    const soundKind = getOptionalString(args, 'sound_kind') || 'sine';
    // Optional richer synthesis: waveform (sine/square/saw/triangle/noise) and
    // an ADSR envelope { attack, decay, sustain, release } (fractions of total).
    const waveform = getOptionalString(args, 'waveform') || undefined;
    const adsr =
      args && args.adsr && typeof args.adsr === 'object' ? args.adsr : null;
    buffer = encodePlaceholderWav(durationMs, frequency, soundKind, {
      waveform,
      adsr,
    });
    kind = 'audio';
  } else {
    const width = getFiniteNumber(args.width) !== null ? args.width : 64;
    const height = getFiniteNumber(args.height) !== null ? args.height : 64;
    const rgba = parseRgbaColor(args.color);
    const shape = getOptionalString(args, 'shape');
    const color2 =
      args && args.color2 !== undefined ? parseRgbaColor(args.color2) : null;
    if ((shape && shape !== 'rectangle') || color2) {
      // Shape and/or gradient → richer procedural image.
      buffer = encodeShapePng(
        width,
        height,
        shape || 'rectangle',
        rgba,
        color2
      );
    } else {
      buffer = encodePlaceholderPng(width, height, rgba);
    }
    kind = 'image';
    // #10: for a non-rectangle shape, suggest a collision polygon that fits the
    // shape (instead of the whole bounding box), so transparent corners don't
    // register collisions. Returned for the caller to pass to
    // create_sprite_object_from_resource as collisionMask.
    collisionMaskForShape = collisionPolygonForShape(shape, width, height);
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
    // For non-rectangle shapes, a polygon that fits the shape (pass it as
    // collisionMask to create_sprite_object_from_resource so transparent corners
    // don't collide). Absent for rectangles (the default full-image box is fine).
    collisionMask: collisionMaskForShape || undefined,
    note:
      'Placeholder asset generated and registered. Replace it later with real art/audio by overwriting the file and re-importing the same resource name.',
  };
};

// A collision polygon (array of one polygon = array of {x,y}) fitting a shape
// within a width x height box. Rectangles return null (the default full-image
// box already fits). Curves are approximated with a few vertices.
const collisionPolygonForShape = (
  shape: ?string,
  width: number,
  height: number
): ?Array<Array<{ x: number, y: number }>> => {
  const w = width;
  const h = height;
  switch (shape) {
    case 'triangle':
      return [[{ x: w / 2, y: 0 }, { x: w, y: h }, { x: 0, y: h }]];
    case 'diamond':
      return [
        [
          { x: w / 2, y: 0 },
          { x: w, y: h / 2 },
          { x: w / 2, y: h },
          { x: 0, y: h / 2 },
        ],
      ];
    case 'circle':
    case 'ellipse': {
      // Octagon approximation of the ellipse.
      const cx = w / 2;
      const cy = h / 2;
      const rx = w / 2;
      const ry = h / 2;
      const poly = [];
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI / 4) * i;
        poly.push({
          x: cx + rx * Math.cos(a),
          y: cy + ry * Math.sin(a),
        });
      }
      return [poly];
    }
    default:
      return null; // rectangle / unknown → use full-image box
  }
};

// Statically render a scene's LAYOUT to a PNG without running the game — a
// schematic diagram (one colored, labelled box per initial instance at its
// position/size) so you can verify object placement and layout even when a
// live preview is unavailable (e.g. throttled/occluded window). This does NOT
// decode sprite pixels; it answers "is the layout right / are things where I
// expect" rather than "what does the final art look like".
export const renderSceneToPng = (project: gdProject, args: Object): Object => {
  if (!fs || !zlib) {
    throw new Error('Filesystem/zlib access is not available.');
  }
  const sceneName = getRequiredString(args, 'scene_name');
  const scene = getScene(project, sceneName);

  const sceneWidth = project.getGameResolutionWidth();
  const sceneHeight = project.getGameResolutionHeight();
  // Scale down large scenes so the PNG stays small; default cap ~960px wide.
  const maxWidth =
    getFiniteNumber(args.max_width) !== null ? args.max_width : 960;
  const scale = Math.min(1, maxWidth / Math.max(1, sceneWidth));
  const width = Math.max(1, Math.round(sceneWidth * scale));
  const height = Math.max(1, Math.round(sceneHeight * scale));

  // Background (scene background color if available, else dark gray).
  const bg = [40, 44, 52, 255];
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    pixels[i * 4] = bg[0];
    pixels[i * 4 + 1] = bg[1];
    pixels[i * 4 + 2] = bg[2];
    pixels[i * 4 + 3] = bg[3];
  }

  const setPixel = (x, y, r, g, b, a) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const o = (y * width + x) * 4;
    // Simple alpha blend over existing.
    const alpha = a / 255;
    pixels[o] = Math.round(r * alpha + pixels[o] * (1 - alpha));
    pixels[o + 1] = Math.round(g * alpha + pixels[o + 1] * (1 - alpha));
    pixels[o + 2] = Math.round(b * alpha + pixels[o + 2] * (1 - alpha));
    pixels[o + 3] = 255;
  };

  // Deterministic color per object name (so the same object is always the same
  // hue across renders).
  const colorForName = (name: string): [number, number, number] => {
    let hash = 0;
    for (let i = 0; i < name.length; i++)
      hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return [
      120 + (hash % 110),
      90 + ((hash >> 8) % 140),
      110 + ((hash >> 16) % 120),
    ];
  };

  // Resolve an object's first-frame image resource name (Sprite only), so we can
  // composite the REAL pixels instead of a box. Cached per object name.
  const firstFrameResourceCache = {};
  const getFirstFrameResourceName = (objectName: string): ?string => {
    if (firstFrameResourceCache[objectName] !== undefined)
      return firstFrameResourceCache[objectName];
    let result = null;
    let object = null;
    if (scene.getObjects().hasObjectNamed(objectName))
      object = scene.getObjects().getObject(objectName);
    else if (project.getObjects().hasObjectNamed(objectName))
      object = project.getObjects().getObject(objectName);
    if (object && object.getType() === 'Sprite') {
      try {
        const config = gd.asSpriteConfiguration(object.getConfiguration());
        const anims = config.getAnimations();
        if (anims.getAnimationsCount() > 0) {
          const anim = anims.getAnimation(0);
          if (anim.getDirectionsCount() > 0) {
            const dir = anim.getDirection(0);
            if (dir.getSpritesCount() > 0) {
              result = dir.getSprite(0).getImageName() || null;
            }
          }
        }
      } catch (error) {
        result = null;
      }
    }
    firstFrameResourceCache[objectName] = result;
    return result;
  };

  // Decode + nearest-neighbour scale a resource image into RGBA, cached.
  const decodedImageCache = {};
  const getDecodedImage = (resourceName: string): ?Object => {
    if (decodedImageCache[resourceName] !== undefined)
      return decodedImageCache[resourceName];
    let decoded = null;
    if (nativeImage) {
      const dims = null; // unused
      void dims;
      const rm = project.getResourcesManager();
      if (rm.hasResource(resourceName)) {
        const file = rm.getResource(resourceName).getFile();
        const absImg = resolveLocalResourceFile(project, file) || file;
        if (absImg && (!fs || fs.existsSync(absImg))) {
          try {
            const img = nativeImage.createFromPath(absImg);
            const size = img.getSize();
            if (size.width && size.height) {
              decoded = {
                width: size.width,
                height: size.height,
                rgba: img.toBitmap(), // BGRA on most platforms
              };
            }
          } catch (error) {
            decoded = null;
          }
        }
      }
    }
    decodedImageCache[resourceName] = decoded;
    return decoded;
  };

  const initialInstances = scene.getInitialInstances();
  const drawn = [];
  let spritesComposited = 0;
  iterateInitialInstances(initialInstances, instance => {
    const name = instance.getObjectName();
    const w = instance.hasCustomSize()
      ? instance.getCustomWidth()
      : instance.getDefaultWidth();
    const h = instance.hasCustomSize()
      ? instance.getCustomHeight()
      : instance.getDefaultHeight();
    const effectiveW = w && w > 0 ? w : 32;
    const effectiveH = h && h > 0 ? h : 32;
    const x0 = Math.round(instance.getX() * scale);
    const y0 = Math.round(instance.getY() * scale);
    const x1 = Math.round((instance.getX() + effectiveW) * scale);
    const y1 = Math.round((instance.getY() + effectiveH) * scale);

    // Try to composite the REAL sprite image (#12). nativeImage.toBitmap()
    // returns BGRA bytes; sample nearest-neighbour into the destination rect.
    let composited = false;
    const resourceName = getFirstFrameResourceName(name);
    if (resourceName) {
      const decoded = getDecodedImage(resourceName);
      if (decoded && x1 > x0 && y1 > y0) {
        for (let y = y0; y < y1; y++) {
          const sy = Math.min(
            decoded.height - 1,
            Math.floor(((y - y0) / (y1 - y0)) * decoded.height)
          );
          for (let x = x0; x < x1; x++) {
            const sx = Math.min(
              decoded.width - 1,
              Math.floor(((x - x0) / (x1 - x0)) * decoded.width)
            );
            const so = (sy * decoded.width + sx) * 4;
            // BGRA → RGBA.
            const b = decoded.rgba[so];
            const g = decoded.rgba[so + 1];
            const r = decoded.rgba[so + 2];
            const a = decoded.rgba[so + 3];
            if (a > 0) setPixel(x, y, r, g, b, a);
          }
        }
        composited = true;
        spritesComposited++;
      }
    }

    const [r, g, b] = colorForName(name);
    if (!composited) {
      // Fallback: filled translucent body (e.g. Text objects, or undecodable).
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++) setPixel(x, y, r, g, b, 150);
    }
    // Opaque border (always, so placement is clear even over composited art).
    for (let x = x0; x < x1; x++) {
      setPixel(x, y0, r, g, b, 255);
      setPixel(x, y1 - 1, r, g, b, 255);
    }
    for (let y = y0; y < y1; y++) {
      setPixel(x0, y, r, g, b, 255);
      setPixel(x1 - 1, y, r, g, b, 255);
    }
    drawn.push({
      objectName: name,
      x: instance.getX(),
      y: instance.getY(),
      width: effectiveW,
      height: effectiveH,
      layer: instance.getLayer() || '',
      composited,
    });
  });

  const buffer = encodeRgbaPng(width, height, pixels);

  const relativeFile =
    getOptionalString(args, 'file') || `renders/${sceneName}-layout.png`;
  const projectFile = project.getProjectFile && project.getProjectFile();
  const absFile =
    path && !path.isAbsolute(relativeFile) && projectFile
      ? path.resolve(path.dirname(projectFile), relativeFile)
      : relativeFile;
  if (path) {
    const dir = path.dirname(absFile);
    if (dir && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(absFile, buffer);

  return {
    success: true,
    sceneName,
    file: relativeFile,
    resolvedFile: absFile,
    sceneResolution: { width: sceneWidth, height: sceneHeight },
    renderedSize: { width, height },
    scale,
    instanceCount: drawn.length,
    spritesComposited,
    instances: drawn,
    note:
      'Static LAYOUT render without running the game (works when no preview is available). Sprite instances composite their REAL first-frame image (scaled to the instance size); Text and undecodable objects show a labelled colored box. Each object has a border so placement is clear. For an exact, animated, fully-rendered frame use capture_preview_screenshot on a running preview.',
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

// Replace an EXISTING resource's file in place (e.g. swap a generated
// placeholder for finished art under the same name), so every Sprite frame /
// reference that uses the name automatically picks up the new file. Unlike
// add_or_update_resource this REQUIRES the resource to already exist (it is a
// targeted swap, not a create) and reports which scene objects reference it so
// you can re-verify. The kind must match (pass replace_kind via
// add_or_update_resource if you need to change kind). A running preview needs a
// fresh launch/hot-reload to show the new pixels.
export const replaceProjectResource = (
  project: gdProject,
  args: Object
): Object => {
  const name = getRequiredString(args, 'name');
  const file = getRequiredString(args, 'file');
  const resourcesManager = project.getResourcesManager();
  if (!resourcesManager.hasResource(name)) {
    throw new Error(
      `Resource "${name}" does not exist. Use add_or_update_resource to create it, or check the name with inspect_project_resources.`
    );
  }
  const resource = resourcesManager.getResource(name);
  resource.setFile(file);
  // No longer a generated placeholder once a real file is swapped in.
  if (typeof resource.setUserAdded === 'function') resource.setUserAdded(true);

  // Find scene objects (Sprite frames, etc.) that reference this resource name,
  // so the caller can re-verify what was affected.
  const usedBy = [];
  for (let i = 0; i < project.getLayoutsCount(); i++) {
    const scene = project.getLayoutAt(i);
    const objects = scene.getObjects();
    for (let j = 0; j < objects.getObjectsCount(); j++) {
      const object = objects.getObjectAt(j);
      const serialized = serializeToJSObject(object);
      if (JSON.stringify(serialized).includes(`"${name}"`)) {
        usedBy.push({ scene: scene.getName(), object: object.getName() });
      }
    }
  }

  return {
    success: true,
    name,
    file,
    fileStatus: getResourceFileStatus(project, resource),
    usedBy,
    note:
      'Resource file replaced in place; all references to this name now use the new file. A running preview needs a fresh launch / hot reload to show the new pixels.',
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

// Read an image resource's pixel size from disk (via Electron nativeImage), for
// center-origin computation. Returns { width, height } or null if unavailable.
const readImageResourceSize = (
  project: gdProject,
  imageName: string
): ?{ width: number, height: number } => {
  if (!nativeImage) return null;
  const resourcesManager = project.getResourcesManager();
  if (!resourcesManager.hasResource(imageName)) return null;
  const file = resourcesManager.getResource(imageName).getFile();
  const absFile = resolveLocalResourceFile(project, file) || file;
  if (!absFile || (fs && !fs.existsSync(absFile))) return null;
  try {
    const image = nativeImage.createFromPath(absFile);
    const size = image.getSize();
    if (!size.width || !size.height) return null;
    return { width: size.width, height: size.height };
  } catch (error) {
    return null;
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
    serializedObject:
      args && (args.summary_only === true || args.summaryOnly === true)
        ? undefined
        : serializeToJSObject(object),
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
    serializedObject:
      args && (args.summary_only === true || args.summaryOnly === true)
        ? undefined
        : serializeToJSObject(object),
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
    serializedObject:
      args && (args.summary_only === true || args.summaryOnly === true)
        ? undefined
        : serializeToJSObject(object),
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
    serializedObject:
      args && (args.summary_only === true || args.summaryOnly === true)
        ? undefined
        : serializeToJSObject(object),
  };
};

const applyInstanceFields = (
  instance: gdInitialInstance,
  instanceData: Object,
  layoutContext?: Object
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

  // Per-instance variables (#9): initial instances support instance-level
  // variables (e.g. give each of 3 hearts its own index). Accept
  // variables: { name: value } or [{ name, value, type? }].
  const instanceVariables = instanceData.variables;
  if (instanceVariables && typeof instanceVariables === 'object') {
    const container = instance.getVariables();
    const setOne = (name, rawValue, declaredType) => {
      if (!name) return;
      const variable = container.has(name)
        ? container.get(name)
        : container.insertNew(name, container.count());
      const numberValue = Number(rawValue);
      const t = (declaredType || '').toLowerCase();
      if (typeof rawValue === 'boolean' || t === 'boolean') {
        variable.setBool(!!rawValue);
      } else if (
        t === 'string' ||
        (t !== 'number' && (rawValue === '' || isNaN(numberValue)))
      ) {
        variable.setString('' + rawValue);
      } else {
        variable.setValue(numberValue);
      }
    };
    if (Array.isArray(instanceVariables)) {
      instanceVariables.forEach(entry => {
        if (entry && typeof entry === 'object')
          setOne(entry.name, entry.value, entry.type);
      });
    } else {
      Object.keys(instanceVariables).forEach(name =>
        setOne(name, instanceVariables[name])
      );
    }
  }

  // Alignment helper: center/anchor the instance within the scene's game
  // resolution, so callers don't hand-compute (resolutionWidth - objectWidth)/2.
  // align: "center" | "center-x" | "center-y" | "top" | "bottom" | "left" |
  // "right" (combine with center on the other axis). Uses the instance's
  // effective size (custom size if set, otherwise the object's default size).
  const align =
    getOptionalString(instanceData, 'align') ||
    getOptionalString(instanceData, 'anchor');
  if (align && layoutContext) {
    const effectiveWidth = instance.hasCustomSize()
      ? instance.getCustomWidth()
      : instance.getDefaultWidth();
    const effectiveHeight = instance.hasCustomSize()
      ? instance.getCustomHeight()
      : instance.getDefaultHeight();
    const sceneWidth = layoutContext.sceneWidth || 0;
    const sceneHeight = layoutContext.sceneHeight || 0;
    const tokens = align.toLowerCase().split(/[\s,_-]+/);
    const has = name => tokens.includes(name);
    if (has('center') || has('centerx') || (has('center') && has('x'))) {
      instance.setX((sceneWidth - effectiveWidth) / 2);
    }
    if (has('center') || has('centery') || (has('center') && has('y'))) {
      instance.setY((sceneHeight - effectiveHeight) / 2);
    }
    if (has('left')) instance.setX(0);
    if (has('right')) instance.setX(sceneWidth - effectiveWidth);
    if (has('top')) instance.setY(0);
    if (has('bottom')) instance.setY(sceneHeight - effectiveHeight);
  }

  // "Initially hidden": GDevelop initial instances have NO native visible flag,
  // so the closest instance-level approximation is opacity 0 (the object is not
  // drawn). Note this does NOT disable collisions — for a truly inert hidden
  // object, also add a SceneJustBegins -> Hide <object> event (or pass events to
  // bulk_edit_scene_assets). We surface that caveat in the tool result.
  const initiallyHidden =
    instanceData.initially_hidden === true ||
    instanceData.initiallyHidden === true ||
    instanceData.hidden === true;
  if (initiallyHidden) {
    instance.setOpacity(0);
  }
  return { initiallyHidden };
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
  // Scene size for the align/center helper.
  const layoutContext = {
    sceneWidth: project.getGameResolutionWidth(),
    sceneHeight: project.getGameResolutionHeight(),
  };

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
      const applied = applyInstanceFields(
        instance,
        instanceData,
        layoutContext
      );
      changes.push({
        operation: existingInstance ? 'update' : 'create',
        id: instance.getPersistentUuid().slice(0, 10),
        objectName: instance.getObjectName(),
        initiallyHidden: applied.initiallyHidden || undefined,
      });
    }
  );

  if (callbacks.onInstancesModifiedOutsideEditor) {
    callbacks.onInstancesModifiedOutsideEditor({ scene });
  }

  const anyHidden = changes.some(change => change.initiallyHidden);
  // summary_only trims the response (issue #20): omit the full serialized
  // instance list (which otherwise grows with every instance in the scene).
  const summaryOnly =
    args && (args.summary_only === true || args.summaryOnly === true);
  return {
    success: true,
    sceneName,
    changes,
    instanceCount: scene.getInitialInstances().getInstancesCount(),
    note: anyHidden
      ? 'Some instances were set initially_hidden via opacity 0 (initial instances have no native visible flag). This hides them visually but does NOT stop collisions — for a fully inert hidden object, also add a SceneJustBegins -> Hide <object> event (e.g. via bulk_edit_scene_assets events).'
      : undefined,
    instances: summaryOnly
      ? undefined
      : serializeToJSObject(scene.getInitialInstances()),
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
  'align',
  'anchor',
  'initially_hidden',
  'initiallyHidden',
  'hidden',
];

const buildOptionalInstancePayload = (
  args: Object,
  objectName: string,
  didCreateObject?: boolean
): Object | null => {
  const instanceArg =
    args && args.instance && typeof args.instance === 'object'
      ? args.instance
      : null;
  const hasTopLevelInstanceFields = topLevelInstanceFieldNames.some(
    fieldName => args && args[fieldName] !== undefined
  );
  // #6: only INFER instance creation (from top-level x/y/width/... fields) when
  // the object was just CREATED. When UPDATING an existing object, an instance
  // is created ONLY on an explicit create_instance:true — otherwise updating a
  // property (or passing a sizing field) would silently spawn a stray instance
  // at (0,0). An explicit `instance:{...}` payload still creates one either way.
  const inferFromFields =
    didCreateObject === false
      ? !!instanceArg
      : !!instanceArg || hasTopLevelInstanceFields;
  const shouldCreateInstance =
    args &&
    (args.create_instance === true ||
      (args.create_instance !== false && inferFromFields));

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

  // #9 center_origin: put the frame's ORIGIN at the image center so Create(x,y)
  // places the object by its center and rotation pivots around the middle. We
  // read the image's pixel size from disk (nativeImage) to compute the center.
  if (
    (args.center_origin === true || args.centerOrigin === true) &&
    frame.origin === undefined
  ) {
    const dims = readImageResourceSize(project, resourceName);
    if (dims) {
      frame.origin = { x: dims.width / 2, y: dims.height / 2 };
      // The center point already defaults to the image center, but be explicit.
      if (frame.center === undefined) frame.defaultCenter = true;
    }
  }

  // #17: allow building a multi-frame / multi-animation Sprite in ONE call. If
  // the caller passes a full `animations` array (same shape as
  // set_sprite_animations), use it directly; otherwise fall back to the single
  // default frame built from resource_name.
  const animationsPayload =
    Array.isArray(args.animations) && args.animations.length
      ? args.animations
      : [
          {
            name: getOptionalString(args, 'animation_name') || 'Default',
            loop: typeof args.loop === 'boolean' ? args.loop : undefined,
            timeBetweenFrames:
              getFiniteNumber(args.time_between_frames) !== null
                ? args.time_between_frames
                : undefined,
            frames: [frame],
          },
        ];

  const animationResult = setSpriteAnimations(
    project,
    {
      scene_name: sceneName,
      object_name: objectName,
      animations: animationsPayload,
    },
    callbacks
  );

  const instancePayload = buildOptionalInstancePayload(
    args,
    objectName,
    objectResult.didCreate
  );
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

  const summaryOnly =
    args && (args.summary_only === true || args.summaryOnly === true);
  // Per-animation frame counts (#12), so the caller can confirm a multi-frame
  // animation was bound without a separate read-back.
  let framesPerAnimation;
  try {
    const spriteConfig = gd.asSpriteConfiguration(
      objectResult.object.getConfiguration()
    );
    const anims = spriteConfig.getAnimations();
    framesPerAnimation = [];
    for (let i = 0; i < anims.getAnimationsCount(); i++) {
      const anim = anims.getAnimation(i);
      const direction =
        anim.getDirectionsCount() > 0 ? anim.getDirection(0) : null;
      framesPerAnimation.push({
        name: anim.getName() || undefined,
        framesCount: direction ? direction.getSpritesCount() : 0,
      });
    }
  } catch (error) {
    framesPerAnimation = undefined;
  }
  return {
    success: true,
    sceneName,
    objectName,
    objectType: 'Sprite',
    didCreate: objectResult.didCreate,
    didReplace: objectResult.didReplace,
    resourceName,
    animationsCount: animationResult.animationsCount,
    framesPerAnimation,
    instanceCreated: !!instanceResult,
    instanceResult: summaryOnly
      ? instanceResult
        ? { created: true }
        : null
      : instanceResult,
    serializedObject: summaryOnly
      ? undefined
      : serializeToJSObject(objectResult.object),
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

  const instancePayload = buildOptionalInstancePayload(
    args,
    objectName,
    objectResult.didCreate
  );
  // Text anchoring fix (#6/#18): a freshly created Text object has width 0, so a
  // plain align of "center"/"right" would anchor its LEFT edge (text off-center
  // or pushed off-screen). When the caller anchors a text instance horizontally
  // and gives no explicit width, make the instance span the scene width and set
  // a matching textAlignment, so the text visually sits at the center / right.
  const textAlignArg =
    instancePayload &&
    typeof (instancePayload.align || instancePayload.anchor) === 'string'
      ? (instancePayload.align || instancePayload.anchor).toLowerCase()
      : '';
  const wantsCenterX = /center/.test(textAlignArg);
  const wantsRight = /\bright\b/.test(textAlignArg);
  if (instancePayload && (wantsCenterX || wantsRight)) {
    const hasWidth =
      instancePayload.width !== undefined ||
      (instancePayload.customSize && instancePayload.customSize.width) ||
      (instancePayload.custom_size && instancePayload.custom_size.width);
    if (!hasWidth) {
      instancePayload.width = project.getGameResolutionWidth();
      // The full-width box starts at x=0; the text aligns within it. Drop the
      // align field so put_2d_instances does not also shift x by the new width.
      delete instancePayload.align;
      delete instancePayload.anchor;
      instancePayload.x = 0;
      const textObjectConfig = gd.asTextObjectConfiguration(
        objectResult.object.getConfiguration()
      );
      if (typeof textObjectConfig.setTextAlignment === 'function') {
        textObjectConfig.setTextAlignment(wantsRight ? 'right' : 'center');
      }
    }
  }
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

  const summaryOnly =
    args && (args.summary_only === true || args.summaryOnly === true);
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
    instanceResult: summaryOnly
      ? instanceResult
        ? { created: true }
        : null
      : instanceResult,
    serializedObject: summaryOnly
      ? undefined
      : serializeToJSObject(objectResult.object),
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
// Read a behavior TYPE's default property schema WITHOUT adding it to an object
// (so callers can learn property names/defaults before deciding to add it, e.g.
// DestroyOutside's extra-border-distance). Returns [{ name, label, type, value,
// description, choices? }] or null when the type is unknown.
const describeBehaviorTypeProperties = (
  platform: any,
  behaviorType: string
): ?Array<Object> => {
  const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
    platform,
    behaviorType
  );
  if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) return null;
  let propertiesMap;
  try {
    propertiesMap = behaviorMetadata.getProperties();
  } catch (error) {
    return null;
  }
  if (!propertiesMap) return null;
  const names = propertiesMap.keys().toJSArray();
  return names.map(name => {
    const property = propertiesMap.get(name);
    const out: Object = {
      name,
      label: property.getLabel() || undefined,
      type: property.getType() || undefined,
      value: property.getValue(),
      description: property.getDescription() || undefined,
    };
    try {
      const extra = property.getExtraInfo().toJSArray();
      if (extra && extra.length) out.choices = extra;
    } catch (error) {
      // no choices
    }
    return out;
  });
};

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
      // Property schema (names/defaults/choices) for this behavior TYPE, so you
      // can configure it via change_behavior_property WITHOUT first adding it.
      // Pass include_properties:true (it adds size to the response).
      properties:
        args && (args.include_properties || args.includeProperties)
          ? describeBehaviorTypeProperties(platform, metadata.type) || undefined
          : undefined,
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
    // Serialize each wanted GLOBAL object individually. ObjectsContainer itself
    // is NOT serializable (it has no serializeTo), so serializeToJSObject on the
    // container throws "e[t] is not a function" — serialize per gd::Object.
    const globalObjectsContainer = project.getObjects();
    const matchedGlobalObjects = [];
    [...wanted].forEach(name => {
      if (globalObjectsContainer.hasObjectNamed(name)) {
        matchedGlobalObjects.push(
          serializeToJSObject(globalObjectsContainer.getObject(name))
        );
      }
    });
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

// ===========================================================================
// Built-in Tilemap (TileMap::SimpleTileMap) operations.
//
// GDevelop's "Tile map" object (internal type TileMap::SimpleTileMap) has two
// parts:
//  - Object config (the TILESET): atlasImage (image resource), tileSize (px,
//    square), columnCount/rowCount (derived from the atlas image size), and
//    tilesWithHitBox. Edited via the ObjectJsImplementation.updateProperty API.
//  - The painted GRID: stored PER INITIAL INSTANCE as a raw string property
//    named "tilemap" holding a JSON EditableTileMapAsJsObject:
//      { tileWidth, tileHeight, dimX, dimY,
//        layers: [{ id: 0, alpha, tiles: number[][] }] }
//    where tiles is row-major tiles[y][x]; an EMPTY cell is -1; a filled cell
//    is the tile GID = tileId (0-based row*columnCount+col into the tileset),
//    optionally OR-ed with flip flags. SimpleTileMap always uses a single layer
//    id:0. dimX = map columns, dimY = map rows; pixel size = tileSize*dim.
// ===========================================================================

const SIMPLE_TILEMAP_TYPE = 'TileMap::SimpleTileMap';
const TILE_EMPTY = -1;
// Flip flags live in the top 3 bits of the tile GID (Tiled convention).
const TILEMAP_FLIP_X = 0x80000000;
const TILEMAP_FLIP_Y = 0x40000000;
const TILEMAP_FLIP_DIAGONAL = 0x20000000;
const TILEMAP_ID_MASK = ~(
  TILEMAP_FLIP_X |
  TILEMAP_FLIP_Y |
  TILEMAP_FLIP_DIAGONAL
);

// Convert a tile spec → serialized GID. A spec is: a number (tileId; <0 clears),
// null/undefined (clear), or an object { id|col,row, flipX?, flipY?, clear? }.
const tileSpecToGid = (tile: any, tilesetColumns: ?number): number => {
  if (tile === null || tile === undefined) return TILE_EMPTY;
  if (typeof tile === 'number') return tile < 0 ? TILE_EMPTY : tile;
  if (typeof tile === 'object') {
    if (tile.clear === true) return TILE_EMPTY;
    let id;
    if (typeof tile.id === 'number') {
      id = tile.id;
    } else if (typeof tile.col === 'number' && typeof tile.row === 'number') {
      if (!tilesetColumns || tilesetColumns < 1) {
        throw new Error(
          "To address a tile by { col, row } you must provide tileset_columns (or the tilemap object's columnCount must be known). Otherwise pass a numeric tile id."
        );
      }
      id = tile.row * tilesetColumns + tile.col;
    } else {
      throw new Error(
        'Each tile must be a numeric tile id, { id }, { col, row }, or null/{ clear:true }.'
      );
    }
    if (id < 0) return TILE_EMPTY;
    let gid = id;
    // Bitwise OR yields a signed 32-bit int; that is exactly how GDevelop
    // stores flipped GIDs (the loader extracts the id via & mask).
    if (tile.flipX) gid |= TILEMAP_FLIP_X;
    if (tile.flipY) gid |= TILEMAP_FLIP_Y;
    return gid;
  }
  throw new Error('Invalid tile spec.');
};

// Decode a serialized GID back to a plain tile descriptor for get_tilemap_tiles.
const gidToTileInfo = (gid: number): Object => {
  if (gid === TILE_EMPTY || gid === undefined) return { empty: true };
  const id = gid & TILEMAP_ID_MASK;
  const info: Object = { id };
  if ((gid & TILEMAP_FLIP_X) !== 0) info.flipX = true;
  if ((gid & TILEMAP_FLIP_Y) !== 0) info.flipY = true;
  return info;
};

// Build an empty grid (all cells -1).
const makeEmptyTilemapGrid = (
  tileSize: number,
  dimX: number,
  dimY: number,
  alpha: number
): Object => {
  const tiles = [];
  for (let y = 0; y < dimY; y++) tiles.push(new Array(dimX).fill(TILE_EMPTY));
  return {
    tileWidth: tileSize,
    tileHeight: tileSize,
    dimX,
    dimY,
    layers: [{ id: 0, alpha, tiles }],
  };
};

// Normalize/validate a parsed grid and resize its single layer to dimX x dimY,
// preserving existing tiles and padding new cells with -1.
const normalizeTilemapGrid = (
  grid: Object,
  dimX: number,
  dimY: number,
  tileSize: number,
  alpha: number
): Object => {
  const layer =
    grid.layers && grid.layers[0]
      ? grid.layers[0]
      : { id: 0, alpha, tiles: [] };
  const oldTiles = Array.isArray(layer.tiles) ? layer.tiles : [];
  const tiles = [];
  for (let y = 0; y < dimY; y++) {
    const oldRow = Array.isArray(oldTiles[y]) ? oldTiles[y] : [];
    const row = new Array(dimX);
    for (let x = 0; x < dimX; x++) {
      row[x] = typeof oldRow[x] === 'number' ? oldRow[x] : TILE_EMPTY;
    }
    tiles.push(row);
  }
  return {
    tileWidth: tileSize,
    tileHeight: tileSize,
    dimX,
    dimY,
    layers: [
      {
        id: 0,
        alpha: typeof layer.alpha === 'number' ? layer.alpha : alpha,
        tiles,
      },
    ],
  };
};

// Resolve the columnCount stored on a tilemap object's config, if available
// (only present when the TileMap JS-extension is loaded, i.e. in the editor).
const readTilemapColumnCount = (object: ?gdObject): ?number => {
  if (!object) return null;
  try {
    const config = gd.asObjectJsImplementation(object.getConfiguration());
    const props = config.getProperties();
    if (props.has('columnCount')) {
      const value = parseFloat(props.get('columnCount').getValue());
      if (Number.isFinite(value) && value >= 1) return value;
    }
  } catch (error) {
    // Not a JS-implementation object, or no columnCount property.
  }
  return null;
};

// Create or update a TileMap::SimpleTileMap object from a tileset atlas image.
// columnCount/rowCount are computed from the atlas image size and tileSize
// (overridable). Optionally creates an initial instance and seeds its tile grid.
export const createTilemapObject = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const atlasImage =
    getOptionalString(args, 'atlas_image') ||
    getOptionalString(args, 'atlasImage') ||
    getOptionalString(args, 'image');
  if (!atlasImage) {
    throw new Error('Missing atlas_image (the tileset image resource name).');
  }
  assertResourceIsImage(project, atlasImage);
  const tileSize =
    getFiniteNumber(args.tile_size) !== null
      ? Math.floor(args.tile_size)
      : getFiniteNumber(args.tileSize) !== null
      ? Math.floor(args.tileSize)
      : 16;
  if (tileSize < 1) throw new Error('tile_size must be >= 1.');

  const scene = getScene(project, sceneName);

  // Compute tileset grid from the atlas image, unless explicitly overridden.
  const dims = readImageResourceSize(project, atlasImage);
  let columnCount =
    getFiniteNumber(args.columns) !== null
      ? Math.floor(args.columns)
      : getFiniteNumber(args.column_count) !== null
      ? Math.floor(args.column_count)
      : dims
      ? Math.max(1, Math.floor(dims.width / tileSize))
      : null;
  let rowCount =
    getFiniteNumber(args.rows) !== null
      ? Math.floor(args.rows)
      : getFiniteNumber(args.row_count) !== null
      ? Math.floor(args.row_count)
      : dims
      ? Math.max(1, Math.floor(dims.height / tileSize))
      : null;

  // Create (or reuse) the object. Done via insertNewObject directly because the
  // object metadata is only registered when the TileMap JS-extension is loaded
  // (the editor), whereas insertNewObject preserves the requested type anywhere.
  const objects = scene.getObjects();
  const existingIndex = getObjectIndex(objects, objectName);
  let object;
  let didCreate = false;
  if (existingIndex >= 0) {
    object = objects.getObject(objectName);
    if (object.getType() !== SIMPLE_TILEMAP_TYPE) {
      objects.removeObject(objectName);
      object = objects.insertNewObject(
        project,
        SIMPLE_TILEMAP_TYPE,
        objectName,
        existingIndex
      );
      didCreate = true;
    }
  } else {
    object = objects.insertNewObject(
      project,
      SIMPLE_TILEMAP_TYPE,
      objectName,
      objects.getObjectsCount()
    );
    didCreate = true;
  }

  // Set the tileset config. updateProperty is the editor-canonical path; it is a
  // no-op when the JS-extension schema is absent (outside the editor), reported
  // via configApplied.
  let configApplied = false;
  try {
    const config = gd.asObjectJsImplementation(object.getConfiguration());
    const set = (k, v) => config.updateProperty(k, String(v));
    const okAtlas = set('atlasImage', atlasImage);
    set('tileSize', tileSize);
    if (columnCount !== null) set('columnCount', columnCount);
    if (rowCount !== null) set('rowCount', rowCount);
    const tilesWithHitBox =
      getOptionalString(args, 'tiles_with_hit_box') ||
      getOptionalString(args, 'tilesWithHitBox');
    if (tilesWithHitBox) set('tilesWithHitBox', tilesWithHitBox);
    configApplied = !!okAtlas;
    // Read back the authoritative columnCount if the schema is present.
    const back = readTilemapColumnCount(object);
    if (back) columnCount = back;
  } catch (error) {
    configApplied = false;
  }

  if (callbacks.onObjectsModifiedOutsideEditor) {
    callbacks.onObjectsModifiedOutsideEditor({
      scene,
      isNewObjectTypeUsed: didCreate,
    });
  }

  // Optionally create an instance and seed an initial tile grid on it.
  let instanceResult = null;
  const wantsInstance =
    args.create_instance === true ||
    args.instance ||
    args.tiles ||
    getFiniteNumber(args.map_width) !== null ||
    getFiniteNumber(args.map_height) !== null ||
    args.x !== undefined ||
    args.y !== undefined;
  if (wantsInstance) {
    const setArgs: Object = {
      scene_name: sceneName,
      object_name: objectName,
      create_instance: true,
      tile_size: tileSize,
      tileset_columns: columnCount || undefined,
      x: args.x,
      y: args.y,
      layer: args.layer,
      map_width: args.map_width,
      map_height: args.map_height,
      tiles: args.tiles,
      summary_only: true,
    };
    instanceResult = setTilemapTiles(project, setArgs, callbacks);
  }

  return {
    success: true,
    sceneName,
    objectName,
    objectType: SIMPLE_TILEMAP_TYPE,
    didCreate,
    atlasImage,
    tileSize,
    columnCount,
    rowCount,
    configApplied,
    instance: instanceResult,
    note: configApplied
      ? 'Tilemap object created/updated. Use set_tilemap_tiles to paint tiles on its instance.'
      : 'Tilemap object created with the correct type, but the tileset config (atlasImage/tileSize/columns/rows) could not be applied in this environment (the TileMap extension is only fully wired inside the running editor). In the editor the config applies normally. The tile grid (set_tilemap_tiles) works everywhere.',
  };
};

// Find the initial instance to operate on: by short id if given, else the first
// instance of object_name; optionally create one when create_instance is set.
const findTilemapInstance = (
  scene: gdLayout,
  objectName: string,
  args: Object
): ?gdInitialInstance => {
  const initialInstances = scene.getInitialInstances();
  const id = getOptionalString(args, 'instance_id');
  if (id) {
    return findInstanceByShortId(initialInstances, id);
  }
  let found = null;
  iterateInitialInstances(initialInstances, instance => {
    if (!found && instance.getObjectName() === objectName) found = instance;
  });
  if (!found && args.create_instance === true) {
    found = initialInstances.insertNewInitialInstance();
    found.setObjectName(objectName);
    const x = getFiniteNumber(args.x);
    const y = getFiniteNumber(args.y);
    if (x !== null) found.setX(x);
    if (y !== null) found.setY(y);
    const layer = getOptionalString(args, 'layer');
    if (layer) found.setLayer(layer);
  }
  return found;
};

// Set / clear tiles on a tilemap instance (writes the per-instance "tilemap"
// raw-string grid). Supports resizing the map, individual tile placements, and
// rectangular fills. Empty/clear is -1; a tile id is row*columnCount+col.
export const setTilemapTiles = (
  project: gdProject,
  args: Object,
  callbacks: SceneToolCallbacks = ({}: any)
): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const scene = getScene(project, sceneName);

  const instance = findTilemapInstance(scene, objectName, args);
  if (!instance) {
    throw new Error(
      `No instance of "${objectName}" found in scene "${sceneName}". Pass instance_id, or create_instance:true to create one (or use create_tilemap_object).`
    );
  }

  // Resolve tileSize and tileset columns (for { col, row } tile specs).
  let object = null;
  if (scene.getObjects().hasObjectNamed(objectName))
    object = scene.getObjects().getObject(objectName);
  else if (project.getObjects().hasObjectNamed(objectName))
    object = project.getObjects().getObject(objectName);
  const tilesetColumns =
    getFiniteNumber(args.tileset_columns) !== null
      ? Math.floor(args.tileset_columns)
      : readTilemapColumnCount(object);
  const tileSize =
    getFiniteNumber(args.tile_size) !== null ? Math.floor(args.tile_size) : 16;

  // Parse the existing grid (or start empty).
  let grid;
  const existing = instance.getRawStringProperty('tilemap');
  if (existing) {
    try {
      grid = JSON.parse(existing);
    } catch (error) {
      grid = null;
    }
  }
  const baseTileSize =
    grid && typeof grid.tileWidth === 'number' ? grid.tileWidth : tileSize;
  const baseAlpha =
    grid &&
    grid.layers &&
    grid.layers[0] &&
    typeof grid.layers[0].alpha === 'number'
      ? grid.layers[0].alpha
      : typeof args.opacity === 'number'
      ? Math.max(
          0,
          Math.min(1, args.opacity > 1 ? args.opacity / 255 : args.opacity)
        )
      : 1;

  // Determine target dimensions: explicit map_width/map_height, else grow to fit
  // the provided tiles, else keep the existing size (min 1x1).
  const tileList = Array.isArray(args.tiles) ? args.tiles : [];
  let neededX = 0;
  let neededY = 0;
  tileList.forEach(t => {
    if (t && typeof t.x === 'number' && typeof t.y === 'number') {
      neededX = Math.max(neededX, t.x + 1);
      neededY = Math.max(neededY, t.y + 1);
    }
  });
  const fill = args.fill && typeof args.fill === 'object' ? args.fill : null;
  if (fill) {
    const fx = (fill.x || 0) + (fill.width || 0);
    const fy = (fill.y || 0) + (fill.height || 0);
    neededX = Math.max(neededX, fx);
    neededY = Math.max(neededY, fy);
  }
  const existingX = grid && typeof grid.dimX === 'number' ? grid.dimX : 0;
  const existingY = grid && typeof grid.dimY === 'number' ? grid.dimY : 0;
  const clearAll = args.clear_all === true;
  const dimX = Math.max(
    1,
    getFiniteNumber(args.map_width) !== null
      ? Math.floor(args.map_width)
      : Math.max(clearAll ? 0 : existingX, neededX)
  );
  const dimY = Math.max(
    1,
    getFiniteNumber(args.map_height) !== null
      ? Math.floor(args.map_height)
      : Math.max(clearAll ? 0 : existingY, neededY)
  );

  if (!grid || clearAll) {
    grid = makeEmptyTilemapGrid(baseTileSize, dimX, dimY, baseAlpha);
  } else {
    grid = normalizeTilemapGrid(grid, dimX, dimY, baseTileSize, baseAlpha);
  }
  const layerTiles = grid.layers[0].tiles;
  if (typeof args.opacity === 'number') {
    grid.layers[0].alpha = Math.max(
      0,
      Math.min(1, args.opacity > 1 ? args.opacity / 255 : args.opacity)
    );
  }

  let changedCells = 0;
  const placeTile = (x, y, gid) => {
    if (x < 0 || y < 0 || x >= dimX || y >= dimY) return;
    layerTiles[y][x] = gid;
    changedCells++;
  };

  // Rectangular fill first (so explicit tiles can override).
  if (fill) {
    const gid = tileSpecToGid(
      fill.tile !== undefined ? fill.tile : fill,
      tilesetColumns
    );
    const fx0 = Math.max(0, Math.floor(fill.x || 0));
    const fy0 = Math.max(0, Math.floor(fill.y || 0));
    const fx1 = Math.min(dimX, fx0 + Math.floor(fill.width || dimX - fx0));
    const fy1 = Math.min(dimY, fy0 + Math.floor(fill.height || dimY - fy0));
    for (let y = fy0; y < fy1; y++)
      for (let x = fx0; x < fx1; x++) placeTile(x, y, gid);
  }

  // Individual tile placements.
  tileList.forEach((t, index) => {
    if (!t || typeof t.x !== 'number' || typeof t.y !== 'number') {
      throw new Error(`tiles[${index}] needs numeric x and y.`);
    }
    const gid = tileSpecToGid(
      t.tile !== undefined ? t.tile : t,
      tilesetColumns
    );
    placeTile(Math.floor(t.x), Math.floor(t.y), gid);
  });

  instance.setRawStringProperty('tilemap', JSON.stringify(grid));
  // Match the editor: the instance occupies tileSize*dim pixels.
  instance.setHasCustomSize(true);
  instance.setCustomWidth(baseTileSize * dimX);
  instance.setCustomHeight(baseTileSize * dimY);

  if (callbacks.onInstancesModifiedOutsideEditor) {
    callbacks.onInstancesModifiedOutsideEditor({ scene });
  }

  const summaryOnly =
    args && (args.summary_only === true || args.summaryOnly === true);
  return {
    success: true,
    sceneName,
    objectName,
    instanceId: instance.getPersistentUuid().slice(0, 10),
    mapSize: { columns: dimX, rows: dimY },
    pixelSize: { width: baseTileSize * dimX, height: baseTileSize * dimY },
    tileSize: baseTileSize,
    changedCells,
    tilesetColumns: tilesetColumns || undefined,
    grid: summaryOnly ? undefined : grid,
    note:
      (tilesetColumns
        ? ''
        : 'tileset_columns was not known, so { col, row } tile specs are unavailable — pass tileset_columns or numeric tile ids. ') +
      'Tiles written to the instance. tiles[y][x]: -1 = empty, otherwise tileId = row*columnCount+col. A running preview needs a relaunch/hot-reload to show changes.',
  };
};

// Read a tilemap instance's painted grid.
export const getTilemapTiles = (project: gdProject, args: Object): Object => {
  const sceneName = getRequiredString(args, 'scene_name');
  const objectName = getRequiredString(args, 'object_name');
  const scene = getScene(project, sceneName);
  const instance = findTilemapInstance(scene, objectName, args);
  if (!instance) {
    throw new Error(
      `No instance of "${objectName}" found in scene "${sceneName}".`
    );
  }
  const raw = instance.getRawStringProperty('tilemap');
  if (!raw) {
    return {
      success: true,
      sceneName,
      objectName,
      empty: true,
      note:
        'This instance has no painted tilemap grid yet. Use set_tilemap_tiles to add tiles.',
    };
  }
  let grid;
  try {
    grid = JSON.parse(raw);
  } catch (error) {
    throw new Error('The instance tilemap data is not valid JSON.');
  }
  const layer = grid.layers && grid.layers[0];
  const tiles = layer && Array.isArray(layer.tiles) ? layer.tiles : [];
  const decoded = !(args && args.raw === true)
    ? tiles.map(row => row.map(gid => gidToTileInfo(gid)))
    : undefined;
  return {
    success: true,
    sceneName,
    objectName,
    instanceId: instance.getPersistentUuid().slice(0, 10),
    tileWidth: grid.tileWidth,
    tileHeight: grid.tileHeight,
    mapSize: { columns: grid.dimX, rows: grid.dimY },
    layerAlpha: layer ? layer.alpha : undefined,
    // Raw serialized grid (tiles[y][x]; -1 empty), and a decoded view unless raw:true.
    tiles,
    decodedTiles: decoded,
    note:
      'tiles is the raw serialized grid (tiles[y][x]; -1 = empty, else tileId = row*columnCount+col, possibly OR-ed with flip flags). decodedTiles expands each cell to { id, flipX?, flipY? } or { empty:true }.',
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

  // dry_run (#20): validate the plan WITHOUT mutating the project, mirroring the
  // events validation flow. Reports likely failures (missing resource files,
  // behaviors/instances referencing objects that won't exist, unknown behavior
  // types, malformed payloads) so they can be fixed before applying.
  if (args && (args.dry_run === true || args.dryRun === true)) {
    const scene = getScene(project, sceneName);
    const issues = [];
    // Object names that WILL exist after the objects step (created here) plus
    // those already in the scene / globally.
    const plannedObjectNames = new Set();
    for (let i = 0; i < scene.getObjects().getObjectsCount(); i++)
      plannedObjectNames.add(
        scene
          .getObjects()
          .getObjectAt(i)
          .getName()
      );
    for (let i = 0; i < project.getObjects().getObjectsCount(); i++)
      plannedObjectNames.add(
        project
          .getObjects()
          .getObjectAt(i)
          .getName()
      );
    objects.forEach(o => {
      const n = o && (o.object_name || o.objectName);
      if (n) plannedObjectNames.add(n);
    });
    resources.forEach((r, index) => {
      if (!r || typeof r !== 'object' || !r.name || !r.file)
        issues.push(`resources[${index}]: needs name + file.`);
    });
    behaviors.forEach((b, index) => {
      if (!b || !(b.object_name || b.objectName))
        issues.push(`behaviors[${index}]: missing object_name.`);
      else if (!plannedObjectNames.has(b.object_name || b.objectName))
        issues.push(
          `behaviors[${index}]: object "${b.object_name ||
            b.objectName}" will not exist (not in scene/global nor created in this call).`
        );
      const type = b && (b.behavior_type || b.behaviorType);
      if (type) {
        const bm = gd.MetadataProvider.getBehaviorMetadata(
          project.getCurrentPlatform(),
          type
        );
        if (gd.MetadataProvider.isBadBehaviorMetadata(bm))
          issues.push(`behaviors[${index}]: unknown behavior_type "${type}".`);
      } else {
        issues.push(`behaviors[${index}]: missing behavior_type.`);
      }
    });
    variables.forEach((v, index) => {
      if (!v || !(v.name || v.variable_name_or_path))
        issues.push(`variables[${index}]: missing name.`);
      if (
        v &&
        (v.scope === 'object' || v.variable_scope === 'object') &&
        !(v.object_name || v.objectName)
      )
        issues.push(`variables[${index}]: scope "object" needs object_name.`);
    });
    instances.forEach((inst, index) => {
      const n = inst && (inst.object_name || inst.objectName);
      if (!n) issues.push(`instances[${index}]: missing object_name.`);
      else if (!plannedObjectNames.has(n))
        issues.push(
          `instances[${index}]: object "${n}" will not exist when instances are placed.`
        );
    });
    return {
      success: issues.length === 0,
      dryRun: true,
      // Explicit guarantee that NOTHING was written (dry_run must never mutate).
      mutated: false,
      sceneName,
      planned: {
        resources: resources.length,
        objects: objects.length,
        spriteAnimations: spriteAnimations.length,
        behaviors: behaviors.length,
        variables: variables.length,
        instances: instances.length,
        events:
          typeof args.events_json === 'string' || Array.isArray(args.events)
            ? 'present (validated separately by add_scene_events)'
            : 'none',
      },
      issues,
      note:
        issues.length === 0
          ? 'Dry run passed the structural checks. Re-run without dry_run to apply. (Events, if any, are validated by the add_scene_events path on apply.)'
          : 'Dry run found issues — fix them before applying.',
    };
  }

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
