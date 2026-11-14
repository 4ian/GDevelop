// What the game knows about its files without reading them: computed by the export script (scripts/build.js) and
// embedded in the bundle as `globalThis.__GDJS_THREERT_MANIFEST__`.

export type ModelInfo = {
  /** Bounding box of the scene of the glTF file, in its own units (POSITION accessors through the node transforms). */
  min: [number, number, number];
  max: [number, number, number];
  animations: Array<{ name: string; duration: number }>;
  /** The triangles of the model (base64 of Float32 / Uint32 arrays), in the file's coordinates. */
  meshes?: Array<{ matrix: number[]; material: number; name: string; position: string; normal?: string; uv?: string; index?: string }>;
  materials?: Array<{
    color: number[];
    map: string | null;
    roughness: number;
    metalness: number;
    emissive: number[];
    alphaTest: number;
    transparent: boolean;
    doubleSided: boolean;
    name: string;
  }>;
};

export type FileInfo = {
  /** Path of the file for the engine (relative to the package root, like `assets/Car.glb`). */
  assetPath?: string;
  width?: number;
  height?: number;
  /** Average sRGB colour of an image, RGBA 0-255. */
  averageColor?: number[];
  model?: ModelInfo;
  /** Content of text files (JSON...). */
  text?: string;
};

export type Manifest = {
  files: Record<string, FileInfo>;
  /** Which input the game reads: "look" captures the pointer (first person games), "free" leaves it. */
  pointer?: 'look' | 'free';
};

let manifest: Manifest | null = null;

export const getManifest = (): Manifest => {
  if (!manifest) {
    manifest = ((globalThis as any).__GDJS_THREERT_MANIFEST__ as Manifest) || { files: {} };
  }
  return manifest;
};

/** The file path of a URL as used by the game (`./a/b.png?x=1` -> `a/b.png`), decoded. */
export const normalizeFilePath = (url: string): string => {
  let path = String(url || '');
  path = path.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]*\//i, '');
  path = path.replace(/[?#].*$/, '');
  while (path.startsWith('./')) path = path.substring(2);
  while (path.startsWith('/')) path = path.substring(1);
  try {
    if (!getManifest().files[path]) {
      const decoded = decodeURIComponent(path);
      if (getManifest().files[decoded]) return decoded;
    }
  } catch (error) {}
  return path;
};

export const getFileInfo = (url: string): FileInfo | null => getManifest().files[normalizeFilePath(url)] || null;
