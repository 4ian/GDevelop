// Profile the events code generation of a GDevelop project, per layout.
//
// This runs the same work as ExporterHelper::ExportScenesEventsCode (what
// happens on every preview/export): for each scene it calls
// LayoutCodeGenerator::generateLayoutCompleteCode and times it. It's handy to
// find which scene(s) dominate code generation time and why (e.g. a huge
// expression, a large object group, lots of events...).
//
// It:
//   - loads the project, resolving GDevelop "split project" references
//     (__REFERENCE_TO_SPLIT_OBJECT) on the fly, so it works on both split and
//     single-file projects;
//   - declares the project's events-functions extensions into the platform, so
//     object/behavior/function metadata resolves exactly like the real export;
//   - times generateLayoutCompleteCode per layout and prints a sorted report.
//
// Requires GDevelop.js to be built (Binaries/embuild/GDevelop.js/libGD.js).
//
// Usage:
//   node scripts/profile-events-code-generation.js <path/to/Project.json> [runs]
//
//   <path/to/Project.json>  Project file (game.json). For a "split" project,
//                           pass the main file; referenced files are resolved
//                           relative to it.
//   [runs]                  Optional number of timing runs per layout (the best
//                           time is reported). Default: 1.

const path = require('path');
const fs = require('fs');
const init = require(path.join(__dirname, '../../Binaries/embuild/GDevelop.js/libGD.js'));

const projectFileArg = process.argv[2];
const runs = Math.max(1, parseInt(process.argv[3], 10) || 1);

if (!projectFileArg) {
  console.error(
    'Usage: node scripts/profile-events-code-generation.js <path/to/Project.json> [runs]'
  );
  process.exit(1);
}

const projectFile = path.resolve(projectFileArg);
const projectDir = path.dirname(projectFile);

// Recursively inline GDevelop "split project" references. A reference looks like
// { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/layouts/MyScene' } and
// points to <projectDir>/layouts/MyScene.json. Non-split projects have none.
function resolveSplitReferences(value) {
  if (Array.isArray(value)) return value.map(resolveSplitReferences);
  if (value && typeof value === 'object') {
    if (value.__REFERENCE_TO_SPLIT_OBJECT) {
      const refPath = path.join(
        projectDir,
        value.referenceTo.replace(/^\//, '') + '.json'
      );
      return resolveSplitReferences(JSON.parse(fs.readFileSync(refPath, 'utf8')));
    }
    const out = {};
    for (const key of Object.keys(value)) out[key] = resolveSplitReferences(value[key]);
    return out;
  }
  return value;
}

// Declare every events-functions extension's metadata into the JsPlatform, so
// object/behavior/function lookups during code generation find real metadata
// (otherwise instructions referencing custom extensions would be skipped, which
// would make the timings unrepresentative).
function declareAllExtensions(gd, project) {
  for (let i = 0; i < project.getEventsFunctionsExtensionsCount(); i++) {
    const efe = project.getEventsFunctionsExtensionAt(i);
    const ext = new gd.PlatformExtension();
    gd.MetadataDeclarationHelper.declareExtension(ext, efe);

    const behaviors = efe.getEventsBasedBehaviors();
    for (let b = 0; b < behaviors.getCount(); b++) {
      const mangled = new gd.MapStringString();
      gd.MetadataDeclarationHelper.generateBehaviorMetadata(project, ext, efe, behaviors.getAt(b), mangled);
      mangled.delete();
    }
    const objects = efe.getEventsBasedObjects();
    for (let o = 0; o < objects.getCount(); o++) {
      const mangled = new gd.MapStringString();
      gd.MetadataDeclarationHelper.generateObjectMetadata(project, ext, efe, objects.getAt(o), mangled);
      mangled.delete();
    }
    const freeFns = efe.getEventsFunctions();
    for (let f = 0; f < freeFns.getEventsFunctionsCount(); f++) {
      const helper = new gd.MetadataDeclarationHelper();
      helper.generateFreeFunctionMetadata(project, ext, efe, freeFns.getEventsFunctionAt(f));
      helper.delete();
    }
    gd.JsPlatform.get().addNewExtension(ext);
    ext.delete();
  }
}

function timeLayout(gd, project, layout) {
  let best = Infinity;
  let codeLength = 0;
  for (let r = 0; r < runs; r++) {
    const includeFiles = new gd.SetString();
    const gen = new gd.LayoutCodeGenerator(project);
    const report = new gd.DiagnosticReport();
    const t = process.hrtime.bigint();
    const code = gen.generateLayoutCompleteCode(layout, includeFiles, report, true);
    const ms = Number(process.hrtime.bigint() - t) / 1e6;
    codeLength = code.length;
    gen.delete();
    includeFiles.delete();
    report.delete();
    best = Math.min(best, ms);
  }
  return { ms: best, codeLength };
}

(async () => {
  // Silence the C++ stdout/stderr (parsing errors, STATUS logs...) so the report
  // is clean; we only care about timings here.
  const gd = await init({ print: () => {}, printErr: () => {} });

  console.log(`Project: ${projectFile}`);
  const fullProject = resolveSplitReferences(JSON.parse(fs.readFileSync(projectFile, 'utf8')));

  const element = gd.Serializer.fromJSON(JSON.stringify(fullProject));
  const project = new gd.ProjectHelper.createNewGDJSProject();
  project.unserializeFrom(element);
  element.delete();

  const tDecl = process.hrtime.bigint();
  declareAllExtensions(gd, project);
  console.log(
    `Layouts: ${project.getLayoutsCount()}, extensions: ${project.getEventsFunctionsExtensionsCount()} ` +
      `(declared in ${(Number(process.hrtime.bigint() - tDecl) / 1e6).toFixed(0)}ms)` +
      (runs > 1 ? `, ${runs} runs/layout (best reported)` : '')
  );
  console.log('');

  let total = 0;
  const rows = [];
  for (let i = 0; i < project.getLayoutsCount(); i++) {
    const layout = project.getLayoutAt(i);
    const { ms, codeLength } = timeLayout(gd, project, layout);
    total += ms;
    rows.push([layout.getName(), ms, codeLength]);
  }
  rows.sort((a, b) => b[1] - a[1]);

  const nameWidth = Math.max(20, ...rows.map(r => r[0].length));
  console.log('Per-layout events code generation (slowest first):');
  for (const [name, ms, len] of rows)
    console.log(`  ${name.padEnd(nameWidth)}  ${ms.toFixed(0).padStart(8)} ms  | ${(len / 1024).toFixed(0).padStart(7)} KB`);
  console.log('');
  console.log(`TOTAL: ${total.toFixed(0)} ms across ${rows.length} layouts`);

  project.delete();
})();
