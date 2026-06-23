// Benchmark events code generation on synthetic scenes (the work done by
// "Events code export" on every preview/export), scaling objects, events and
// object-group usage independently.
//
// This isolates how code generation scales, which is useful to catch
// regressions in the per-instruction work. In particular, object/behavior type
// resolution (gd::ObjectsContainersList::GetTypeOfObject) is a linear scan over
// the objects, so referencing a large object GROUP in many events is the
// pathological case (each reference expands to every member, each resolved with
// an O(objects) scan).
//
// To profile a REAL project's per-scene code generation instead, see
// scripts/profile-events-code-generation.js.
//
// Requires GDevelop.js to be built (Binaries/embuild/GDevelop.js/libGD.js).
//
// Usage:
//   node scripts/bench-events-code-generation.js

const path = require('path');
const init = require(
  path.join(__dirname, '../../Binaries/embuild/GDevelop.js/libGD.js')
);

// Build a single scene with `numObjects` objects and `numEvents` events. Each
// event has a position condition targeting either a single object or a group
// containing all objects (`useGroup`), and a variable action whose expression
// is `exprLen` operands long.
function buildLayout(gd, project, name, numObjects, numEvents, useGroup, exprLen) {
  const layout = project.insertNewLayout(name, project.getLayoutsCount());
  for (let o = 0; o < numObjects; o++) {
    layout.getObjects().insertNewObject(project, 'Sprite', 'Obj' + o, o);
  }
  if (useGroup) {
    const group = layout.getObjects().getObjectGroups().insertNew('AllObjects', 0);
    for (let o = 0; o < numObjects; o++) group.addObject('Obj' + o);
  }
  const target = useGroup ? 'AllObjects' : 'Obj0';

  const events = layout.getEvents();
  for (let e = 0; e < numEvents; e++) {
    const event = gd.asStandardEvent(
      events.insertNewEvent(project, 'BuiltinCommonInstructions::Standard', e)
    );

    const condition = new gd.Instruction();
    condition.setType('PosX');
    condition.setParametersCount(3);
    condition.setParameter(0, target);
    condition.setParameter(1, '<');
    condition.setParameter(2, '100');
    event.getConditions().insert(condition, 0);
    condition.delete();

    const expression =
      exprLen > 0
        ? Array.from({ length: exprLen }, (_, i) => (i % 9) + 1).join('+')
        : '1';
    const action = new gd.Instruction();
    action.setType('BuiltinCommonInstructions::SetNumberVariable');
    action.setParametersCount(3);
    action.setParameter(0, 'MyVar');
    action.setParameter(1, '=');
    action.setParameter(2, expression);
    event.getActions().insert(action, 0);
    action.delete();
  }
  return layout;
}

function timeCodegen(gd, project, layout, runs) {
  let best = Infinity;
  for (let i = 0; i < runs; i++) {
    const includeFiles = new gd.SetString();
    const generator = new gd.LayoutCodeGenerator(project);
    const report = new gd.DiagnosticReport();
    const t = process.hrtime.bigint();
    generator.generateLayoutCompleteCode(layout, includeFiles, report, true);
    best = Math.min(best, Number(process.hrtime.bigint() - t) / 1e6);
    generator.delete();
    includeFiles.delete();
    report.delete();
  }
  return best;
}

(async () => {
  const gd = await init({ print: () => {}, printErr: () => {} });

  const scenarios = [
    // Vary object count, fixed events (single-object reference -> flat).
    { label: 'objects', objects: 500, events: 2000, group: false, exprLen: 1 },
    { label: 'objects', objects: 2000, events: 2000, group: false, exprLen: 1 },
    // Vary event count (linear).
    { label: 'events', objects: 200, events: 2000, group: false, exprLen: 1 },
    { label: 'events', objects: 200, events: 8000, group: false, exprLen: 1 },
    // Object groups: each reference expands to every member (pathological).
    { label: 'group', objects: 100, events: 200, group: true, exprLen: 1 },
    { label: 'group', objects: 200, events: 200, group: true, exprLen: 1 },
    { label: 'group', objects: 400, events: 200, group: true, exprLen: 1 },
    // Large expressions.
    { label: 'big expr', objects: 50, events: 200, group: false, exprLen: 4000 },
  ];

  console.log('scenario | objects | events | group | exprLen | codegen ms');
  let i = 0;
  for (const s of scenarios) {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = buildLayout(
      gd, project, 'Scene' + i++, s.objects, s.events, s.group, s.exprLen
    );
    const ms = timeCodegen(gd, project, layout, 2);
    console.log(
      `${s.label.padEnd(8)} | ${String(s.objects).padStart(7)} | ${String(
        s.events
      ).padStart(6)} | ${String(s.group).padStart(5)} | ${String(
        s.exprLen
      ).padStart(7)} | ${ms.toFixed(0).padStart(8)}`
    );
    project.delete();
  }
})();
