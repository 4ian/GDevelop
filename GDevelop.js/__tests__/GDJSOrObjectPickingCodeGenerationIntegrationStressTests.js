/**
 * Stress tests for the object-picking semantics of the "Or" and
 * "OrDistributive" sub-event conditions, focused on the per-object
 * union dedup that runs at the end of every Or branch.
 *
 * The dedup loop pushes each branch's contributed instances into the
 * per-object "final" list while skipping ones already present. The
 * Or codegen uses a Set to do the "already present" check in O(1),
 * which turns the overall dedup work for an Or with K branches each
 * contributing N instances from O(K · N²) (pre-optimization, when the
 * check was an `indexOf` scan over the growing final array) to
 * O(K · N).
 *
 * The tests below pick K and N high enough that the difference between
 * O(K · N²) and O(K · N) is meaningful (millions of comparisons vs.
 * thousands of Set ops). Each test asserts on the per-instance Touched
 * variable so the dedup at scale is verified for correctness, not just
 * for runtime.
 */

const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Or object picking stress tests', () => {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  /**
   * Generic stress-test fixture. Pass an object spec of the form
   *   { ObjectName: arrayOfMyVariableValuesPerInstance, ... }
   * and the supplied events run with `ObjectName` parameters and the
   * matching number of pre-picked instances. Returns the runtime scene
   * and the per-object instance arrays so tests can inspect each
   * instance's Touched variable.
   */
  const runEventsWithObjects = (events, objectsSpec) => {
    const serializerElement = gd.Serializer.fromJSObject(events);
    const parameterTypes = {};
    for (const objectName in objectsSpec) {
      parameterTypes[objectName] = 'object';
    }
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      { parameterTypes, logCode: false }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();

    const allInsts = {};
    const argLists = [];
    for (const objectName in objectsSpec) {
      const insts = objectsSpec[objectName].map((value) => {
        const obj = runtimeScene.createObject(objectName);
        obj.getVariables().get('MyVariable').setNumber(value);
        return obj;
      });
      const lists = new gdjs.Hashtable();
      // Pre-pick every instance so the picked list starts populated.
      lists.put(objectName, insts.slice());
      allInsts[objectName] = insts;
      argLists.push(lists);
    }

    runCompiledEvents(gdjs, runtimeScene, argLists);
    return { runtimeScene, allInsts };
  };

  const touchedFlags = (insts) =>
    insts.map((o) => o.getVariables().get('Touched').getAsNumber());

  const pickByVar = (objectName, expectedValue) => ({
    type: { value: 'VarObjet' },
    parameters: [objectName, 'MyVariable', '=', String(expectedValue)],
  });
  const freeCondition = (alwaysTrue) => ({
    type: { value: 'Egal' },
    parameters: ['1', '=', alwaysTrue ? '1' : '0'],
  });
  const touch = (objectName) => ({
    type: { value: 'ModVarObjet' },
    parameters: [objectName, 'Touched', '+', '1'],
  });
  const orOf = (...subInstructions) => ({
    type: { value: 'BuiltinCommonInstructions::Or' },
    parameters: [],
    subInstructions,
  });
  const orDistributiveOf = (...subInstructions) => ({
    type: { value: 'BuiltinCommonInstructions::OrDistributive' },
    parameters: [],
    subInstructions,
  });
  const andOf = (...subInstructions) => ({
    type: { value: 'BuiltinCommonInstructions::And' },
    parameters: [],
    subInstructions,
  });

  /* ------------------------------------------------------------------ */
  /* 1. Or — many branches all picking the same large set of instances. */
  /*                                                                    */
  /*    Worst-case dedup scenario for the regular Or: every branch       */
  /*    contributes the same N instances, so the final list never       */
  /*    grows but every push is rejected by the dedup check.
  /*    O(K · N) (Set membership check).
  /* ------------------------------------------------------------------ */
  it('Or: 100 identical branches each picking 20000 instances', () => {
    const N = 20000;
    const K = 100;
    const aValues = new Array(N).fill(1); // every instance matches MyVariable=1
    const branches = new Array(K).fill(null).map(() => pickByVar('ObjectA', 1));

    const events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [orOf(...branches)],
        actions: [touch('ObjectA')],
        events: [],
      },
    ];
    const { allInsts } = runEventsWithObjects(events, { ObjectA: aValues });

    const touched = touchedFlags(allInsts.ObjectA);
    expect(touched.length).toBe(N);
    // Every instance touched exactly once — the dedup must not let any
    // duplicate through, and must not drop any either.
    expect(touched.every((t) => t === 1)).toBe(true);
    // Sum sanity-check (cheap to compute and protects against the
    // tautological `every === 1` if Touched ever became something odd).
    expect(touched.reduce((a, b) => a + b, 0)).toBe(N);
  });

  /* ------------------------------------------------------------------ */
  /* 2. OrDistributive — many branches, one referencing each of many    */
  /*    objects, plus one free branch that contributes parent.X for     */
  /*    every object it doesn't reference.                              */
  /*                                                                    */
  /*    OrDistributive's per-branch contribution iterates over          */
  /*    `allReferencedObjects`, so every true branch pushes every       */
  /*    union object's list into the corresponding final list. With K  */
  /*    objects, M branches, and N instances per object that's          */
  /*    M · K · N dedup attempts. With M = 5, K = 5, N = 500 that's     */
  /*    12 500 attempts of which 2500 are unique — the Set keeps each  */
  /*    O(1).                                                           */
  /* ------------------------------------------------------------------ */
  it('OrDistributive: 5 branches × 5 objects × 500 instances → every object fully picked once', () => {
    const N = 500;
    const objectNames = [
      'ObjectA',
      'ObjectB',
      'ObjectC',
      'ObjectD',
      'ObjectE',
    ];
    const objectsSpec = {};
    objectNames.forEach((name) => {
      objectsSpec[name] = new Array(N).fill(1);
    });

    // 5 branches, each picks one of the 5 objects. Every branch is
    // true (every instance has MyVariable=1), so each branch contributes
    // its own filtered object's instances and parent's full list for the
    // four other "unconstrained" objects → 5 × 5 × 500 = 12 500
    // contributions per Or, deduplicated to 5 × 500 = 2500 picks.
    const branches = objectNames.map((name) => pickByVar(name, 1));

    const events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [orDistributiveOf(...branches)],
        actions: objectNames.map(touch),
        events: [],
      },
    ];
    const { allInsts } = runEventsWithObjects(events, objectsSpec);

    for (const objectName of objectNames) {
      const touched = touchedFlags(allInsts[objectName]);
      expect(touched.length).toBe(N);
      expect(touched.every((t) => t === 1)).toBe(true);
    }
  });

  /* ------------------------------------------------------------------ */
  /* 3. Or — many branches each picking a partially overlapping subset  */
  /*    of one large object. Shows that dedup correctness is preserved  */
  /*    across non-trivial overlap, not just full overlap.              */
  /*                                                                    */
  /*    Each instance has MyVariable in [0, K). Branch i picks          */
  /*    MyVariable = i, so each instance ends up in exactly one         */
  /*    branch's filtered list — the union is a partition of the        */
  /*    instances.
  /* ------------------------------------------------------------------ */
  it('Or: many partition branches over many instances → every instance touched once', () => {
    const K = 100;
    const N = 200;
    const aValues = [];
    for (let i = 0; i < K; i++) {
      for (let j = 0; j < N; j++) aValues.push(i);
    }
    const branches = [];
    for (let i = 0; i < K; i++) branches.push(pickByVar('ObjectA', i));

    const events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [orOf(...branches)],
        actions: [touch('ObjectA')],
        events: [],
      },
    ];
    const { allInsts } = runEventsWithObjects(events, { ObjectA: aValues });

    const touched = touchedFlags(allInsts.ObjectA);
    expect(touched.length).toBe(K * N);
    expect(touched.every((t) => t === 1)).toBe(true);
  });

  /* ------------------------------------------------------------------ */
  /* 4. OrDistributive — many free branches that all leave A            */
  /*    unconstrained. Every true free branch contributes the parent's  */
  /*    full A list, so the union accumulates K copies of N instances   */
  /*    that all dedup back to N.
  /*    K · N Set ops.
  /* ------------------------------------------------------------------ */
  it('OrDistributive: 1 picking branch + 100 free branches over 20000 instances → all touched once', () => {
    const N = 20000;
    const numFreeBranches = 100;
    const aValues = new Array(N).fill(1);

    const branches = [pickByVar('ObjectA', 1)];
    for (let i = 0; i < numFreeBranches; i++) {
      branches.push(freeCondition(true));
    }

    const events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [orDistributiveOf(...branches)],
        actions: [touch('ObjectA')],
        events: [],
      },
    ];
    const { allInsts } = runEventsWithObjects(events, { ObjectA: aValues });

    const touched = touchedFlags(allInsts.ObjectA);
    expect(touched.length).toBe(N);
    expect(touched.every((t) => t === 1)).toBe(true);
  });

  /* ------------------------------------------------------------------ */
  /* 5. Or with And-inside — multi-condition branches that pick several */
  /*    objects together at scale.
  /* ------------------------------------------------------------------ */
  it('Or: And-branches inside', () => {
    const K = 15;
    const PER_BRANCH = 250;
    // Instances are partitioned by branch: aValues = [0,...,0, 1,...,1, ...].
    // Branch i is And{ pickA=i, pickB=i }, picking its own A-slice and
    // B-slice. Every instance is in exactly one branch's slice, so the
    // unions across branches add up to K · PER_BRANCH for both A and B.
    const aValues = [];
    const bValues = [];
    for (let i = 0; i < K; i++) {
      for (let j = 0; j < PER_BRANCH; j++) {
        aValues.push(i);
        bValues.push(i);
      }
    }
    const branches = [];
    for (let i = 0; i < K; i++) {
      branches.push(andOf(pickByVar('ObjectA', i), pickByVar('ObjectB', i)));
    }

    const events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [orOf(...branches)],
        actions: [touch('ObjectA'), touch('ObjectB')],
        events: [],
      },
    ];
    const { allInsts } = runEventsWithObjects(events, {
      ObjectA: aValues,
      ObjectB: bValues,
    });

    const total = K * PER_BRANCH;
    const aTouched = touchedFlags(allInsts.ObjectA);
    const bTouched = touchedFlags(allInsts.ObjectB);
    expect(aTouched.length).toBe(total);
    expect(bTouched.length).toBe(total);
    expect(aTouched.every((t) => t === 1)).toBe(true);
    expect(bTouched.every((t) => t === 1)).toBe(true);
  });

  /* ------------------------------------------------------------------ */
  /* 6. Pathological — many branches all picking the SAME single        */
  /*    instance.
  /* ------------------------------------------------------------------ */
  it('Or: many branches all picking the same single instance → Touched = 1', () => {
    const K = 1000;
    const branches = new Array(K).fill(null).map(() => pickByVar('ObjectA', 1));
    const events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [orOf(...branches)],
        actions: [touch('ObjectA')],
        events: [],
      },
    ];
    const { allInsts } = runEventsWithObjects(events, { ObjectA: [1] });
    expect(touchedFlags(allInsts.ObjectA)).toEqual([1]);
  });
});
