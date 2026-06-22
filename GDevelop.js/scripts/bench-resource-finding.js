// Benchmark resource finding on a synthetic project (the work done by
// "Resource export" and "Project data export" on every preview/export).
//
// It runs `gd::ResourceExposer::ExposeWholeProjectResources` (which walks every
// scene's objects and events looking for used resources) and times it while
// scaling the number of resources. This is handy to catch regressions where a
// per-parameter/per-object resource lookup becomes expensive: resource
// containers look resources up with a linear scan, so an O(1)-looking call in a
// hot loop is actually O(resources).
//
// To profile a REAL project's per-scene code generation instead, see
// scripts/profile-events-code-generation.js.
//
// Requires GDevelop.js to be built (Binaries/embuild/GDevelop.js/libGD.js).
//
// Usage:
//   node scripts/bench-resource-finding.js [scenes] [objects] [events]
//     [scenes]   Scenes in the project. Default: 10.
//     [objects]  Objects per scene. Default: 50.
//     [events]   Events per scene (each with non-resource parameters, the
//                worst case for the resource lookup). Default: 600.

const path = require('path');
const init = require(
  path.join(__dirname, '../../Binaries/embuild/GDevelop.js/libGD.js')
);

const numScenes = Math.max(1, parseInt(process.argv[2], 10) || 10);
const numObjects = Math.max(1, parseInt(process.argv[3], 10) || 50);
const numEvents = Math.max(1, parseInt(process.argv[4], 10) || 600);

// Build a project with `numResources` image resources and, in every scene,
// `numObjects` objects and `numEvents` events made of non-resource instructions
// (a variable action and an object condition). Non-resource parameters are the
// worst case: each one is looked up against every resource and not found.
function buildProject(gd, numResources) {
  const project = gd.ProjectHelper.createNewGDJSProject();
  const resourcesManager = project.getResourcesManager();
  for (let r = 0; r < numResources; r++) {
    const resource = new gd.ImageResource();
    resource.setName('res' + r + '.png');
    resourcesManager.addResource(resource);
    resource.delete();
  }

  for (let s = 0; s < numScenes; s++) {
    const layout = project.insertNewLayout('Scene' + s, project.getLayoutsCount());
    for (let o = 0; o < numObjects; o++) {
      layout.getObjects().insertNewObject(project, 'Sprite', 'Obj' + o, o);
    }
    const events = layout.getEvents();
    for (let e = 0; e < numEvents; e++) {
      const event = gd.asStandardEvent(
        events.insertNewEvent(project, 'BuiltinCommonInstructions::Standard', e)
      );

      const action = new gd.Instruction();
      action.setType('BuiltinCommonInstructions::SetNumberVariable');
      action.setParametersCount(3);
      action.setParameter(0, 'MyVar');
      action.setParameter(1, '=');
      action.setParameter(2, String(e % 100));
      event.getActions().insert(action, 0);
      action.delete();

      const condition = new gd.Instruction();
      condition.setType('PosX');
      condition.setParametersCount(3);
      condition.setParameter(0, 'Obj' + (e % numObjects));
      condition.setParameter(1, '<');
      condition.setParameter(2, '100');
      event.getConditions().insert(condition, 0);
      condition.delete();
    }
  }
  return project;
}

function timeResourceFinding(gd, project, runs) {
  let best = Infinity;
  for (let i = 0; i < runs; i++) {
    const worker = new gd.ResourcesInUseHelper(project.getResourcesManager());
    const t = process.hrtime.bigint();
    gd.ResourceExposer.exposeWholeProjectResources(project, worker);
    best = Math.min(best, Number(process.hrtime.bigint() - t) / 1e6);
    worker.delete();
  }
  return best;
}

(async () => {
  const gd = await init({ print: () => {}, printErr: () => {} });

  console.log(
    `Scenes: ${numScenes}, objects/scene: ${numObjects}, events/scene: ${numEvents}`
  );
  console.log('');
  console.log('resources | resource finding (best of 3)');
  for (const numResources of [200, 400, 800, 1600, 3200]) {
    const project = buildProject(gd, numResources);
    const ms = timeResourceFinding(gd, project, 3);
    console.log(`${String(numResources).padStart(9)} | ${ms.toFixed(0).padStart(6)} ms`);
    project.delete();
  }
})();
