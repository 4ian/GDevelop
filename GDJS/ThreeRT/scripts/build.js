#!/usr/bin/env node
// @ts-check
/**
 * Makes a ThreeRT game from a GDevelop game exported for HTML5.
 *
 *   node GDJS/ThreeRT/scripts/build.js --export <HTML5 export folder> --threert <ThreeRT repository> --out <folder>
 *
 * or, to export the project first with the GDevelop command line (a GDevelop executable, like the one of the
 * portable Linux build; it is run with `--run-command EXPORT_HTML5_EXTERNAL`, under `xvfb-run` if there is no display):
 *
 *   node GDJS/ThreeRT/scripts/build.js --project <game.json> --gdevelop <path to gdevelop> --threert <ThreeRT> --out <folder>
 *
 * The output folder is a ThreeRT package:
 *   game.js       the bundle: the game, GDJS and the ThreeRT runtime in one script, for `threert-render play game.js`
 *   assets/       the files of the game (images, 3D models, sounds...), read by the engine
 *   threert.json  the manifest of the package
 *
 * Options:
 *   --jolt <jolt-physics.js>  the JavaScript (non WebAssembly) build of Jolt Physics, for games using the 3D physics
 *                             (downloaded from npm, in the version GDJS uses, if not given).
 *   --pointer look|free       how the game reads the mouse (by default "look" when the game locks the pointer).
 *   --name <name>             the id of the game in threert.json.
 *   --profile                 log the time spent in the frame script every 20 frames.
 *   --jolt-wasm2js            convert the WebAssembly Jolt of the export with wasm2js, as other WebAssembly libraries
 *                             (instead of the JavaScript build of Jolt from npm).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

/** @type {Record<string, string>} */
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const match = /^--([a-z-]+)(=(.*))?$/.exec(process.argv[i]);
  if (!match) continue;
  args[match[1]] = match[3] !== undefined ? match[3] : process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : 'true';
}

const fail = (message) => {
  console.error('❌ ' + message);
  process.exit(1);
};

const threertRoot = path.resolve(args.threert || path.join(__dirname, '../../../../ThreeRT'));
if (!fs.existsSync(path.join(threertRoot, 'packages/scene'))) fail(`ThreeRT repository not found at ${threertRoot} (use --threert).`);
const requireFromThreeRT = (name) => require(require.resolve(name, { paths: [threertRoot] }));
const esbuild = requireFromThreeRT('esbuild');
const sharp = requireFromThreeRT('sharp');

/** Exports the project with the GDevelop command line, returns the export folder. */
const exportProject = (projectFile, gdevelopExecutable) => {
  if (!gdevelopExecutable) fail('--gdevelop (the GDevelop executable) is required with --project.');
  const commandArgs = ['--no-sandbox', '--disable-update-check', '--disable-gpu', '--run-command', 'EXPORT_HTML5_EXTERNAL', path.resolve(projectFile)];
  const hasDisplay = !!process.env.DISPLAY;
  console.log(`ℹ️ Exporting ${projectFile} with GDevelop...`);
  if (hasDisplay) execFileSync(gdevelopExecutable, commandArgs, { stdio: 'inherit' });
  else execFileSync('xvfb-run', ['-a', gdevelopExecutable, ...commandArgs], { stdio: 'inherit' });
  return path.join(path.dirname(path.resolve(projectFile)), 'build');
};

const exportDir = path.resolve(args.export || exportProject(args.project, args.gdevelop));
const outDir = path.resolve(args.out || path.join(exportDir, '..', 'threert'));
const indexHtmlPath = path.join(exportDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) fail(`No index.html in ${exportDir}: is it an HTML5 export of a GDevelop game?`);

// ---------------------------------------------------------------------------
// The scripts of the game, in the order of index.html.

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const scriptFiles = [...indexHtml.matchAll(/<script[^>]*src="([^"]+)"/g)].map((match) => decodeURIComponent(match[1]));

/** Scripts replaced by the adapter (src/), or not needed. */
const replacedScripts = new Set([
  'pixi-renderers/ThreeAddons.js', // three.js add-ons: see three.ts (createThreeAddonsShim)
  'howler-sound-manager/howler.min.js', // Howler: see audio.ts
  'fontfaceobserver-font-manager/fontfaceobserver.js', // see gdjs-patches.ts
]);

/** ES modules imported by the scripts (`import("./x.js")`), by their path in the export. */
const importedModules = new Set();

/** Changes to the scripts of the export, for what can't be done from outside. */
const patchScript = (file, code) => {
  if (code.includes('import("./jolt-physics.wasm.js")') && args['jolt-wasm2js'] === undefined) {
    // Jolt is its JavaScript build, embedded in the bundle (no WebAssembly in ThreeRT's JavaScript engine).
    code = code.split('import("./jolt-physics.wasm.js")').join('__GDJS_THREERT__.getJoltModule()');
  }
  // Other modules imported dynamically are embedded in the bundle (`embedModule`).
  code = code.replace(/\bimport\(\s*["'](\.\.?\/[^"']+)["']\s*\)/g, (match, relativePath) => {
    const modulePath = path.posix.normalize(path.posix.join(path.posix.dirname(file), relativePath));
    if (!fs.existsSync(path.join(exportDir, modulePath))) {
      console.warn(`⚠️ ${file} imports ${relativePath}, not found in the export.`);
      return match;
    }
    importedModules.add(modulePath);
    return `__GDJS_THREERT__.importModule(${JSON.stringify(modulePath)})`;
  });
  const dynamicImports = code.match(/\bimport\(\s*["'][^"']+["']\s*\)/g);
  if (dynamicImports) console.warn(`⚠️ ${file} imports modules dynamically (not supported by ThreeRT): ${dynamicImports.join(', ')}`);
  return code;
};

/** An ES module of the export as a script registering its exports (`__GDJS_THREERT_MODULES__`). */
const embedModule = (modulePath) => {
  let code = fs.readFileSync(path.join(exportDir, modulePath), 'utf8');
  code = code.split('import.meta.url').join(JSON.stringify('threert://game/' + modulePath));
  code = code.replace(/\bexport\s+default\s+([\w$]+)\s*;?/g, '__exports.default = $1;');
  code = code.replace(/\bexport\s*\{([^}]*)\}\s*;?/g, (match, list) =>
    list
      .split(',')
      .map((entry) => entry.trim().split(/\s+as\s+/))
      .filter((parts) => parts[0])
      .map(([local, exported]) => `__exports[${JSON.stringify(exported || local)}] = ${local};`)
      .join('')
  );
  if (/^\s*import\s/m.test(code)) console.warn(`⚠️ ${modulePath} has static imports (not supported).`);
  return `globalThis.__GDJS_THREERT_MODULES__ = globalThis.__GDJS_THREERT_MODULES__ || {};\n` +
    `globalThis.__GDJS_THREERT_MODULES__[${JSON.stringify(modulePath)}] = (function () { var __exports = {};\n${code}\n;return __exports; })();`;
};

/** A WebAssembly module converted to JavaScript by binaryen's wasm2js, registered by its file name (see wasm.ts). */
const embedWasmModule = (wasmPath) => {
  const cacheDir = path.join(__dirname, '../.cache');
  fs.mkdirSync(cacheDir, { recursive: true });
  const content = fs.readFileSync(path.join(exportDir, wasmPath));
  const cachedFile = path.join(cacheDir, 'wasm2js-' + crypto.createHash('md5').update(content).digest('hex') + '.js');
  if (!fs.existsSync(cachedFile)) {
    console.log(`ℹ️ Converting ${wasmPath} to JavaScript (binaryen wasm2js)...`);
    const features = ['--enable-bulk-memory', '--enable-nontrapping-float-to-int', '--enable-sign-ext', '--enable-mutable-globals'];
    execFileSync('npx', ['--yes', '-p', 'binaryen@132.0.0', 'wasm2js', path.join(exportDir, wasmPath), ...features, '-O2', '-o', cachedFile], { stdio: 'inherit', cwd: cacheDir });
  }
  let code = fs.readFileSync(cachedFile, 'utf8');
  code = code.replace(/^import \* as [\w$]+ from '[^']*';\s*$/gm, '');
  const end = code.indexOf('var retasmFunc = asmFunc(');
  if (end === -1) fail(`Unexpected output of wasm2js for ${wasmPath}.`);
  code = code.substring(0, end);
  return `globalThis.__GDJS_THREERT_WASM__ = globalThis.__GDJS_THREERT_WASM__ || {};\n` +
    `globalThis.__GDJS_THREERT_WASM__[${JSON.stringify(path.posix.basename(wasmPath))}] = function (imports) {\n${code}\nreturn asmFunc(imports); };`;
};

// ---------------------------------------------------------------------------
// Jolt Physics, JavaScript build.

/** Downloads (once) the npm package of Jolt Physics in a version, returns its folder. */
const getJoltPackage = (version) => {
  const cacheDir = path.join(__dirname, '../.cache', 'jolt-physics-' + version);
  if (!fs.existsSync(path.join(cacheDir, 'package/dist/jolt-physics.js'))) {
    console.log(`ℹ️ Downloading jolt-physics@${version} from npm...`);
    fs.mkdirSync(cacheDir, { recursive: true });
    const tarball = execFileSync('npm', ['pack', `jolt-physics@${version}`, '--silent'], { cwd: cacheDir }).toString().trim().split('\n').pop();
    execFileSync('tar', ['xzf', String(tarball)], { cwd: cacheDir });
    fs.rmSync(path.join(cacheDir, String(tarball)), { force: true });
  }
  return path.join(cacheDir, 'package/dist');
};

/**
 * The JavaScript build of Jolt Physics in the version of the WebAssembly one of the export: the npm version whose
 * `jolt-physics.wasm.wasm` is the same file (the 15 newest versions are tried, newest first).
 */
const findJoltFile = () => {
  const exportedWasm = path.join(exportDir, 'Extensions/Physics3DBehavior/jolt-physics.wasm.wasm');
  const hash = (file) => crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');
  if (!fs.existsSync(exportedWasm)) fail('No Jolt in the export (Extensions/Physics3DBehavior/jolt-physics.wasm.wasm): use --jolt.');
  const exportedHash = hash(exportedWasm);
  const versions = JSON.parse(execFileSync('npm', ['view', 'jolt-physics', 'versions', '--json']).toString())
    .filter((version) => /^\d+\.\d+\.\d+$/.test(version))
    .reverse()
    .slice(0, 15);
  for (const version of versions) {
    const dist = getJoltPackage(version);
    const wasm = path.join(dist, 'jolt-physics.wasm.wasm');
    if (fs.existsSync(wasm) && hash(wasm) === exportedHash) {
      console.log(`ℹ️ Jolt Physics: jolt-physics@${version} (JavaScript build).`);
      return path.join(dist, 'jolt-physics.js');
    }
    fs.rmSync(path.dirname(path.dirname(dist)), { recursive: true, force: true });
  }
  fail('No recent version of jolt-physics on npm matches the Jolt of the export: use --jolt.');
};

const getJoltCode = () => {
  const joltFile = args.jolt ? path.resolve(args.jolt) : findJoltFile();
  let code = fs.readFileSync(joltFile, 'utf8');
  // The ES module as a script: no import.meta, no Node code path, the factory on globalThis.
  code = code.split('import.meta.url').join('""');
  code = code.split('import("module")').join('Promise.resolve({})');
  code = code.replace(/export default Jolt;\s*$/, 'globalThis.__GDJS_THREERT_JOLT__ = Jolt;');
  if (!code.includes('__GDJS_THREERT_JOLT__')) fail(`Unexpected content in ${joltFile} (no "export default Jolt;").`);
  return code;
};

// ---------------------------------------------------------------------------
// The manifest: what the game knows about its files (it can't read them in ThreeRT).

/** The JSON and binary chunk of a glTF binary (.glb) or JSON (.gltf) file. */
const readGltf = (file) => {
  const buffer = fs.readFileSync(file);
  if (buffer.readUInt32LE(0) === 0x46546c67) {
    const jsonLength = buffer.readUInt32LE(12);
    const json = JSON.parse(buffer.slice(20, 20 + jsonLength).toString('utf8'));
    const binStart = 20 + jsonLength;
    const bin = binStart + 8 <= buffer.length ? buffer.slice(binStart + 8, binStart + 8 + buffer.readUInt32LE(binStart)) : null;
    return { json, bin };
  }
  return { json: JSON.parse(buffer.toString('utf8')), bin: null };
};

const componentArrays = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const componentCounts = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };

/** The values of an accessor, as floats (normalized integers are divided) or as indices. */
const readAccessor = (gltf, buffers, accessorIndex, asFloat) => {
  const accessor = gltf.json.accessors[accessorIndex];
  const ArrayType = componentArrays[accessor.componentType];
  const itemSize = componentCounts[accessor.type];
  const out = asFloat ? new Float32Array(accessor.count * itemSize) : new Uint32Array(accessor.count * itemSize);
  if (accessor.bufferView === undefined) return out;
  const view = gltf.json.bufferViews[accessor.bufferView];
  const buffer = buffers[view.buffer];
  if (!buffer) throw new Error('missing buffer ' + view.buffer);
  const elementBytes = ArrayType.BYTES_PER_ELEMENT;
  const stride = view.byteStride || itemSize * elementBytes;
  const base = (view.byteOffset || 0) + (accessor.byteOffset || 0);
  const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const getters = { 5120: 'getInt8', 5121: 'getUint8', 5122: 'getInt16', 5123: 'getUint16', 5125: 'getUint32', 5126: 'getFloat32' };
  const get = getters[accessor.componentType];
  const normalizer = accessor.normalized ? { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 }[accessor.componentType] || 1 : 1;
  for (let i = 0; i < accessor.count; i++) {
    for (let k = 0; k < itemSize; k++) {
      const value = dataView[get](base + i * stride + k * elementBytes, true);
      out[i * itemSize + k] = asFloat && normalizer !== 1 ? Math.max(value / normalizer, -1) : value;
    }
  }
  return out;
};

const toBase64 = (typedArray) => Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength).toString('base64');

const multiplyMatrices = (a, b) => {
  const out = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) out[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
  return out;
};
const nodeMatrix = (node) => {
  if (node.matrix) return node.matrix;
  const [tx, ty, tz] = node.translation || [0, 0, 0];
  const [x, y, z, w] = node.rotation || [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale || [1, 1, 1];
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;
  return [
    (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
    (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
    (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
    tx, ty, tz, 1,
  ];
};

/**
 * Bounds, animations and (for code reading the meshes of models, like the scattered models of Terrain3D) the
 * geometry and materials of a glTF file. Images embedded in the file are written to `imagesDir`.
 */
const readModelInfo = (file, writeImage) => {
  const gltf = readGltf(file);
  const json = gltf.json;
  const nodes = json.nodes || [];
  const accessors = json.accessors || [];
  const meshes = json.meshes || [];
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  const buffers = (json.buffers || []).map((buffer, index) => {
    if (index === 0 && gltf.bin && !buffer.uri) return gltf.bin;
    if (buffer.uri && buffer.uri.startsWith('data:')) return Buffer.from(buffer.uri.split(',')[1], 'base64');
    if (buffer.uri) {
      const bufferPath = path.join(path.dirname(file), decodeURIComponent(buffer.uri));
      return fs.existsSync(bufferPath) ? fs.readFileSync(bufferPath) : null;
    }
    return null;
  });
  const usesDraco = (json.extensionsUsed || []).includes('KHR_draco_mesh_compression');

  // Images and materials (base colour, its texture, roughness, metalness, transparency).
  const imagePaths = (json.images || []).map((image, index) => {
    try {
      if (image.bufferView !== undefined) {
        const view = json.bufferViews[image.bufferView];
        const data = buffers[view.buffer].slice(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
        const extension = image.mimeType === 'image/jpeg' ? 'jpg' : 'png';
        return writeImage(index, extension, data);
      }
      if (image.uri && image.uri.startsWith('data:')) {
        const extension = image.uri.startsWith('data:image/jpeg') ? 'jpg' : 'png';
        return writeImage(index, extension, Buffer.from(image.uri.split(',')[1], 'base64'));
      }
    } catch (error) {
      console.warn(`⚠️ Can't read image ${index} of ${file}: ${error}`);
    }
    return null;
  });
  const textureImage = (textureInfo) => {
    if (!textureInfo) return null;
    const texture = (json.textures || [])[textureInfo.index];
    return texture && texture.source !== undefined ? imagePaths[texture.source] : null;
  };
  const materials = (json.materials || []).map((material) => {
    const pbr = material.pbrMetallicRoughness || {};
    return {
      color: pbr.baseColorFactor || [1, 1, 1, 1],
      map: textureImage(pbr.baseColorTexture),
      roughness: pbr.roughnessFactor !== undefined ? pbr.roughnessFactor : 1,
      metalness: pbr.metallicFactor !== undefined ? pbr.metallicFactor : 1,
      emissive: material.emissiveFactor || [0, 0, 0],
      alphaTest: material.alphaMode === 'MASK' ? (material.alphaCutoff !== undefined ? material.alphaCutoff : 0.5) : 0,
      transparent: material.alphaMode === 'BLEND',
      doubleSided: !!material.doubleSided,
      name: material.name || '',
    };
  });

  const meshParts = [];
  const visit = (nodeIndex, parentMatrix) => {
    const node = nodes[nodeIndex];
    if (!node) return;
    const matrix = multiplyMatrices(parentMatrix, nodeMatrix(node));
    if (node.mesh !== undefined && meshes[node.mesh]) {
      for (const primitive of meshes[node.mesh].primitives || []) {
        const attributes = primitive.attributes || {};
        const accessor = accessors[attributes.POSITION];
        if (!accessor || !accessor.min || !accessor.max) continue;
        for (let c = 0; c < 8; c++) {
          const p = [c & 1 ? accessor.max[0] : accessor.min[0], c & 2 ? accessor.max[1] : accessor.min[1], c & 4 ? accessor.max[2] : accessor.min[2]];
          for (let i = 0; i < 3; i++) {
            const v = matrix[i] * p[0] + matrix[4 + i] * p[1] + matrix[8 + i] * p[2] + matrix[12 + i];
            min[i] = Math.min(min[i], v);
            max[i] = Math.max(max[i], v);
          }
        }
        if (usesDraco || (primitive.mode !== undefined && primitive.mode !== 4)) continue;
        try {
          const part = { matrix, material: primitive.material !== undefined ? primitive.material : -1, name: node.name || '' };
          part.position = toBase64(readAccessor(gltf, buffers, attributes.POSITION, true));
          if (attributes.NORMAL !== undefined) part.normal = toBase64(readAccessor(gltf, buffers, attributes.NORMAL, true));
          if (attributes.TEXCOORD_0 !== undefined) part.uv = toBase64(readAccessor(gltf, buffers, attributes.TEXCOORD_0, true));
          if (primitive.indices !== undefined) part.index = toBase64(readAccessor(gltf, buffers, primitive.indices, false));
          meshParts.push(part);
        } catch (error) {
          console.warn(`⚠️ Can't read a mesh of ${file}: ${error}`);
        }
      }
    }
    for (const child of node.children || []) visit(child, matrix);
  };
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const scene = (json.scenes || [])[json.scene || 0];
  const rootNodes = scene ? scene.nodes || [] : nodes.map((_, i) => i);
  for (const root of rootNodes) visit(root, identity);
  if (!Number.isFinite(min[0])) {
    min.fill(0);
    max.fill(0);
  }
  const animations = (json.animations || []).map((animation, index) => {
    let duration = 0;
    for (const sampler of animation.samplers || []) {
      const input = accessors[sampler.input];
      if (input && input.max) duration = Math.max(duration, input.max[0]);
    }
    return { name: animation.name || 'Animation ' + index, duration };
  });
  return { min, max, animations, meshes: meshParts, materials };
};

const readImageInfo = async (file) => {
  const image = sharp(file);
  const metadata = await image.metadata();
  const stats = await image.stats();
  const averageColor = [0, 1, 2, 3].map((i) => (stats.channels[i] ? Math.round(stats.channels[i].mean) : 255));
  return { width: metadata.width, height: metadata.height, averageColor };
};

const textKinds = new Set(['json', 'tilemap', 'tileset', 'spine', 'atlas', 'javascript', 'internal-in-game-editor-only-svg']);

const build = async () => {
  console.log(`ℹ️ HTML5 export: ${exportDir}`);
  console.log(`ℹ️ ThreeRT: ${threertRoot}`);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });

  // The game data, to list the resources.
  const dataCode = fs.readFileSync(path.join(exportDir, 'data.js'), 'utf8');
  const sandbox = { gdjs: {} };
  new Function('gdjs', dataCode)(sandbox.gdjs);
  const projectData = sandbox.gdjs.projectData;
  if (!projectData) fail('data.js has no gdjs.projectData.');

  /** @type {{files: Record<string, any>, pointer?: string}} */
  const manifest = { files: {} };
  const resources = (projectData.resources && projectData.resources.resources) || [];
  const assetFiles = [];
  for (const resource of resources) {
    const file = resource.file;
    if (!file || /^[a-z]+:/i.test(file)) continue;
    const sourcePath = path.join(exportDir, file);
    if (!fs.existsSync(sourcePath) || manifest.files[file]) continue;
    const info = {};
    if (textKinds.has(resource.kind)) {
      info.text = fs.readFileSync(sourcePath, 'utf8');
    } else {
      const assetPath = 'assets/' + file;
      fs.mkdirSync(path.dirname(path.join(outDir, assetPath)), { recursive: true });
      fs.copyFileSync(sourcePath, path.join(outDir, assetPath));
      assetFiles.push(assetPath);
      info.assetPath = assetPath;
      try {
        if (resource.kind === 'image') Object.assign(info, await readImageInfo(sourcePath));
        if (resource.kind === 'model3D') {
          info.model = readModelInfo(sourcePath, (index, extension, data) => {
            const imagePath = `${assetPath}.image${index}.${extension}`;
            fs.writeFileSync(path.join(outDir, imagePath), data);
            assetFiles.push(imagePath);
            return imagePath;
          });
        }
      } catch (error) {
        console.warn(`⚠️ Can't read ${file}: ${error}`);
      }
    }
    manifest.files[file] = info;
  }

  // The pointer is captured for games locking it (first person, third person cameras with the mouse).
  const usesPointerLock = scriptFiles.some((file) => file.includes('mousepointerlock'));
  manifest.pointer = args.pointer || (usesPointerLock ? 'look' : 'free');
  if (args.profile !== undefined) manifest.profile = true;

  // The adapter and the ThreeRT runtime.
  const adapterEntry = path.join(__dirname, '../src/index.ts');
  const adapterBuild = await esbuild.build({
    stdin: {
      contents: [
        `import game from ${JSON.stringify(adapterEntry)};`,
        `import { installNodeHost } from "@threert/gameplay";`,
        `installNodeHost(game);`,
      ].join('\n'),
      resolveDir: threertRoot,
      sourcefile: 'gdjs-threert-entry.js',
    },
    bundle: true,
    nodePaths: [path.join(threertRoot, 'node_modules')],
    format: 'iife',
    platform: 'neutral',
    target: 'es2022',
    legalComments: 'none',
    write: false,
    logLevel: 'warning',
  });

  const parts = [];
  parts.push(`globalThis.__GDJS_THREERT_MANIFEST__ = ${JSON.stringify(manifest)};`);
  parts.push(adapterBuild.outputFiles[0].text);
  // Jolt first: the Physics3D behavior asks for it as soon as it is loaded.
  if (args['jolt-wasm2js'] === undefined && scriptFiles.some((file) => file.includes('Physics3DBehavior'))) parts.push('// ---- Jolt Physics (JavaScript build)\n' + getJoltCode());
  for (const file of scriptFiles) {
    if (replacedScripts.has(file)) continue;
    const scriptPath = path.join(exportDir, file);
    if (!fs.existsSync(scriptPath)) {
      console.warn(`⚠️ Script ${file} not found in the export.`);
      continue;
    }
    parts.push(`// ---- ${file}\n` + patchScript(file, fs.readFileSync(scriptPath, 'utf8')));
    if (file === 'pixi-renderers/three.js') parts.push('__GDJS_THREERT__.installThree();');
  }
  for (const modulePath of importedModules) {
    parts.push(`// ---- ${modulePath} (module)\n` + embedModule(modulePath));
    const wasmPath = modulePath.replace(/\.js$/, '.wasm');
    if (fs.existsSync(path.join(exportDir, wasmPath))) parts.push(`// ---- ${wasmPath} (wasm2js)\n` + embedWasmModule(wasmPath));
  }
  parts.push('__GDJS_THREERT__.installGDJSPatches();');

  const bundle = parts.join('\n;\n');
  fs.writeFileSync(path.join(outDir, 'game.js'), bundle);

  // threert.json, the manifest of the package.
  const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
  const name = args.name || String(projectData.properties.name || 'gdevelop-game');
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'gdevelop-game';
  const packageManifest = {
    format: 'threert/1',
    id,
    name: projectData.properties.name || id,
    version: projectData.properties.version || '1.0.0',
    hash: sha256(bundle).substring(0, 16),
    entry: 'game.js',
    assets: Object.fromEntries(
      assetFiles.map((assetPath) => {
        const content = fs.readFileSync(path.join(outDir, assetPath));
        return [assetPath, { size: content.length, sha256: sha256(content) }];
      })
    ),
  };
  fs.writeFileSync(path.join(outDir, 'threert.json'), JSON.stringify(packageManifest, null, 2));

  console.log(`✅ ${path.relative(process.cwd(), outDir) || outDir}: game.js (${(bundle.length / 1024 / 1024).toFixed(1)} MB), ${assetFiles.length} assets, pointer: ${manifest.pointer}`);
  console.log(`   threert-render play ${path.join(outDir, 'game.js')} --assets ${outDir}`);
};

build().catch((error) => fail(error && error.stack ? error.stack : String(error)));
