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
  args[match[1]] = match[3] !== undefined ? match[3] : process.argv[++i];
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

/** Changes to the scripts of the export, for what can't be done from outside. */
const patchScript = (file, code) => {
  if (code.includes('import("./jolt-physics.wasm.js")')) {
    // Jolt is its JavaScript build, embedded in the bundle (no WebAssembly in ThreeRT's JavaScript engine).
    code = code.split('import("./jolt-physics.wasm.js")').join('__GDJS_THREERT__.getJoltModule()');
  }
  const dynamicImports = code.match(/\bimport\(\s*["'][^"']+["']\s*\)/g);
  if (dynamicImports) console.warn(`⚠️ ${file} imports modules dynamically (not supported by ThreeRT): ${dynamicImports.join(', ')}`);
  return code;
};

// ---------------------------------------------------------------------------
// Jolt Physics, JavaScript build.

const getJoltCode = () => {
  let joltFile = args.jolt ? path.resolve(args.jolt) : null;
  if (!joltFile) {
    const readme = path.join(__dirname, '../../../Extensions/Physics3DBehavior/README.md');
    const versionMatch = fs.existsSync(readme) ? /version (\d+\.\d+\.\d+)/.exec(fs.readFileSync(readme, 'utf8')) : null;
    const version = versionMatch ? versionMatch[1] : '0.30.0';
    const cacheDir = path.join(__dirname, '../.cache', 'jolt-physics-' + version);
    joltFile = path.join(cacheDir, 'package/dist/jolt-physics.js');
    if (!fs.existsSync(joltFile)) {
      console.log(`ℹ️ Downloading jolt-physics@${version} (JavaScript build) from npm...`);
      fs.mkdirSync(cacheDir, { recursive: true });
      const tarball = execFileSync('npm', ['pack', `jolt-physics@${version}`, '--silent'], { cwd: cacheDir }).toString().trim().split('\n').pop();
      execFileSync('tar', ['xzf', String(tarball)], { cwd: cacheDir });
    }
  }
  let code = fs.readFileSync(joltFile, 'utf8');
  // The ES module as a script: no import.meta, no Node code path, the factory on globalThis.
  code = code.split('import.meta.url').join('""');
  code = code.split('await import("module")').join('({})');
  code = code.replace(/^export default Jolt;\s*$/m, 'globalThis.__GDJS_THREERT_JOLT__ = Jolt;');
  if (!code.includes('__GDJS_THREERT_JOLT__')) fail(`Unexpected content in ${joltFile} (no "export default Jolt;").`);
  return code;
};

// ---------------------------------------------------------------------------
// The manifest: what the game knows about its files (it can't read them in ThreeRT).

/** Bounds and animations of a glTF binary (.glb) or JSON (.gltf) file. */
const readModelInfo = (file) => {
  const buffer = fs.readFileSync(file);
  let json;
  if (buffer.readUInt32LE(0) === 0x46546c67) {
    const jsonLength = buffer.readUInt32LE(12);
    json = JSON.parse(buffer.slice(20, 20 + jsonLength).toString('utf8'));
  } else {
    json = JSON.parse(buffer.toString('utf8'));
  }
  const nodes = json.nodes || [];
  const accessors = json.accessors || [];
  const meshes = json.meshes || [];
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  const multiply = (a, b) => {
    const out = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) out[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
    return out;
  };
  const localMatrix = (node) => {
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
  const visit = (nodeIndex, parentMatrix) => {
    const node = nodes[nodeIndex];
    if (!node) return;
    const matrix = multiply(parentMatrix, localMatrix(node));
    if (node.mesh !== undefined && meshes[node.mesh]) {
      for (const primitive of meshes[node.mesh].primitives || []) {
        const accessor = accessors[primitive.attributes && primitive.attributes.POSITION];
        if (!accessor || !accessor.min || !accessor.max) continue;
        for (let c = 0; c < 8; c++) {
          const p = [c & 1 ? accessor.max[0] : accessor.min[0], c & 2 ? accessor.max[1] : accessor.min[1], c & 4 ? accessor.max[2] : accessor.min[2]];
          for (let i = 0; i < 3; i++) {
            const v = matrix[i] * p[0] + matrix[4 + i] * p[1] + matrix[8 + i] * p[2] + matrix[12 + i];
            min[i] = Math.min(min[i], v);
            max[i] = Math.max(max[i], v);
          }
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
  return { min, max, animations };
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
        if (resource.kind === 'model3D') info.model = readModelInfo(sourcePath);
      } catch (error) {
        console.warn(`⚠️ Can't read ${file}: ${error}`);
      }
    }
    manifest.files[file] = info;
  }

  // The pointer is captured for games locking it (first person, third person cameras with the mouse).
  const usesPointerLock = scriptFiles.some((file) => file.includes('mousepointerlock'));
  manifest.pointer = args.pointer || (usesPointerLock ? 'look' : 'free');

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
  if (scriptFiles.some((file) => file.includes('Physics3DBehavior'))) parts.push('// ---- Jolt Physics (JavaScript build)\n' + getJoltCode());
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
