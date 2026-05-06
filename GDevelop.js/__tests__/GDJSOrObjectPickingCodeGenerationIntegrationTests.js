/**
 * Regression tests for the object-picking semantics of the two "Or" sub-event
 * conditions:
 *
 * - "BuiltinCommonInstructions::Or" (the existing Or, with a fix that stops
 *   overwriting the parent's picked list when no true branch contributed for a
 *   given object). Mental model: each branch contributes only the instances
 *   it actually picked; objects that no true branch referenced are left as
 *   they were before the Or. Use this when the action should act on the
 *   specific object whose state was tested in the branch that fired
 *   (Door/Coin pattern).
 *
 * - "BuiltinCommonInstructions::OrDistributive" (new condition). Mental
 *   model: a branch that does not constrain a given object behaves as if it
 *   contributed the parent's full picked list for that object. The picked
 *   list at the action is the union over all true branches. Use this when
 *   the action acts on objects unrelated to the branch that fired
 *   (TextInput + SubmitButton pattern).
 *
 * Each test seeds three instances per object (MyVariable=1, 2 and 3) so a
 * picking condition such as `VarObjet(ObjectX, "MyVariable", "=", N)`
 * deterministically picks the Nth instance. After running, an
 * `ModVarObjet(..., "Touched", "+", "1")` action is used per relevant object
 * to reveal exactly which instances were picked at action time — the test
 * asserts on the `Touched` array, not just on totals, so each instance's
 * fate is checked individually. An unrelated `ObjectC` is included (and
 * picked by a sibling condition outside the Or) to verify that the Or
 * never disturbs picks for objects it does not reference.
 *
 * The canonical patterns covered below:
 *   1. Door/Coin                 — preserve-picks Or only.
 *   2. AllowedArea pair          — preserve-picks Or only (bug-fix path).
 *   3. All-false                 — both Or variants must return false
 *                                  (no action runs).
 *   4. Input + Submit            — distributive Or only.
 *   5. Score-on-trigger          — distributive Or only.
 *   6. Door/Coin sanity (negative test for OrDistributive).
 *   7. Branches with `And`       — multi-condition branches that pick
 *                                  several objects at once.
 *   8. Unrelated objects         — picks for objects the Or doesn't
 *                                  reference are never disturbed.
 */

const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Or object picking semantics integration tests', () => {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  /**
   * Build a small project with three object parameters (ObjectA, ObjectB,
   * ObjectC), seed each with three instances whose `MyVariable` is 1, 2 and
   * 3 respectively, run the supplied events, and return both the runtime
   * scene and the per-object instance arrays so tests can assert on the
   * `Touched` flag of each individual instance.
   */
  const runEventsWithThreeObjectsThreeInstances = (events, logCode) => {
    const serializerElement = gd.Serializer.fromJSObject(events);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        parameterTypes: {
          ObjectA: 'object',
          ObjectB: 'object',
          ObjectC: 'object',
        },
        logCode: !!logCode,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();

    const makeInstances = (objectName) => {
      const insts = [1, 2, 3].map((value) => {
        const obj = runtimeScene.createObject(objectName);
        obj.getVariables().get('MyVariable').setNumber(value);
        return obj;
      });
      const lists = new gdjs.Hashtable();
      // Pre-pick every instance so the picked list starts populated. The
      // generated events function uses `eventsFunctionContext.getObjects` for
      // the parameter as the source for picking, so a pre-populated list is
      // what conditions filter against.
      lists.put(objectName, insts.slice());
      return { insts, lists };
    };

    const a = makeInstances('ObjectA');
    const b = makeInstances('ObjectB');
    const c = makeInstances('ObjectC');

    runCompiledEvents(gdjs, runtimeScene, [a.lists, b.lists, c.lists]);

    return {
      runtimeScene,
      aInsts: a.insts,
      bInsts: b.insts,
      cInsts: c.insts,
      aLists: a.lists,
      bLists: b.lists,
      cLists: c.lists,
    };
  };

  // Returns [touched1, touched2, touched3] for the given instance array,
  // where each entry is the value of the "Touched" object variable. A 0 in
  // the array means "the action did not run on this instance".
  const touchedFlags = (insts) =>
    insts.map((o) => o.getVariables().get('Touched').getAsNumber());

  const pickByVar = (objectName, expectedValue) => ({
    type: { value: 'VarObjet' },
    parameters: [
      objectName,
      'MyVariable',
      '=',
      String(expectedValue),
    ],
  });
  const pickAByVar = (v) => pickByVar('ObjectA', v);
  const pickBByVar = (v) => pickByVar('ObjectB', v);
  const pickCByVar = (v) => pickByVar('ObjectC', v);

  // Free condition with constant truth value (does not reference any object).
  const freeCondition = (alwaysTrue) => ({
    type: { value: 'Egal' },
    parameters: ['1', '=', alwaysTrue ? '1' : '0'],
  });

  // Action that increments the per-instance "Touched" variable. Runs once
  // per picked instance.
  const touch = (objectName) => ({
    type: { value: 'ModVarObjet' },
    parameters: [objectName, 'Touched', '+', '1'],
  });
  const touchA = touch('ObjectA');
  const touchB = touch('ObjectB');
  const touchC = touch('ObjectC');

  // Action that sets a scene variable, runs once regardless of picks. Used
  // to confirm the Or's truth value (whether the action block ran at all).
  const setScene = (name, value) => ({
    type: { value: 'ModVarScene' },
    parameters: [name, '=', String(value)],
  });

  const andOf = (...subInstructions) => ({
    type: { value: 'BuiltinCommonInstructions::And' },
    parameters: [],
    subInstructions,
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

  /* ================================================================== */
  /* 1. Door/Coin — the preserve-picks Or scopes picks to the branch    */
  /*    that fired. Only the matching instance(s) get touched.          */
  /* ================================================================== */
  describe('Or — Door/Coin (act on the touched object), three instances each', () => {
    const buildEvents = () => [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [orOf(pickAByVar(2), pickBByVar(2))],
        actions: [touchA, touchB, setScene('OrFired', 1)],
        events: [],
      },
    ];

    it('only A=2 matches: only A2 is touched, no B is touched', () => {
      // Branch A picks A=2 (matches A2 only). Branch B picks B=2 (B has
      // value 2 too — but with multi-instance we need to control which B
      // values exist). Here B values are [1, 2, 3] so branch B is also
      // true and picks B2. To exercise "only A matches", make branch B
      // false: pick B=999.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orOf(pickAByVar(2), pickBByVar(999))],
          actions: [touchA, touchB, setScene('OrFired', 1)],
          events: [],
        },
      ];
      const { runtimeScene, aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
      expect(touchedFlags(bInsts)).toEqual([0, 0, 0]);
    });

    it('only B=3 matches: only B3 is touched, no A is touched', () => {
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orOf(pickAByVar(999), pickBByVar(3))],
          actions: [touchA, touchB, setScene('OrFired', 1)],
          events: [],
        },
      ];
      const { runtimeScene, aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(touchedFlags(aInsts)).toEqual([0, 0, 0]);
      expect(touchedFlags(bInsts)).toEqual([0, 0, 1]);
    });

    it('both branches match: only the picked instances get touched, others stay untouched', () => {
      const { runtimeScene, aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(buildEvents());
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
      expect(touchedFlags(bInsts)).toEqual([0, 1, 0]);
    });
  });

  /* ================================================================== */
  /* 2. AllowedArea pair — outside-Or picking that the Or must not      */
  /*    erase (the bug fix). Only the originally picked A2 should be    */
  /*    touched.                                                        */
  /* ================================================================== */
  describe('Or — preserves outside picks when no true branch contributed', () => {
    // Outside the Or, ObjectA is filtered to A2. Inside the Or:
    //   branch B: pickA=999 — references A but is false.
    //   branch C: free, true — does not reference A.
    // No true branch contributed for A, so the bug-fixed Or leaves the
    // outside pick of A2 alone. Only A2 should be touched.
    const events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [pickAByVar(2), orOf(pickAByVar(999), freeCondition(true))],
        actions: [touchA, setScene('OrFired', 1)],
        events: [],
      },
    ];

    it('keeps the outside-Or pick (A2) when only the free branch is true', () => {
      const { runtimeScene, aInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
    });

    it('keeps the outside-Or pick (A2) when the free branch comes BEFORE the false A-branch', () => {
      // Branch order matters: this test exercises the boolean-reset fix.
      // Without it, the true free branch would leak its truth value into
      // the next branch's "if(isConditionTrue)" check, and the false
      // pickA(999) branch would be wrongly treated as a contribution
      // — collapsing parent.A to the empty filtered list.
      const eventsReversed = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            pickAByVar(2),
            orOf(freeCondition(true), pickAByVar(999)),
          ],
          actions: [touchA, setScene('OrFired', 1)],
          events: [],
        },
      ];
      const { runtimeScene, aInsts } =
        runEventsWithThreeObjectsThreeInstances(eventsReversed);
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
    });
  });

  /* ================================================================== */
  /* 3. All-false Or returns false (sanity check that the Or correctly  */
  /*    fails the parent event so the action does not run).             */
  /* ================================================================== */
  describe('Or — all-false returns false', () => {
    const buildEvents = (orWrapper) => [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [orWrapper(pickAByVar(999), pickBByVar(999))],
        actions: [touchA, touchB, setScene('OrFired', 1)],
        events: [],
      },
    ];

    it('Or: action does not run when both branches are false', () => {
      const { runtimeScene, aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(buildEvents(orOf));
      expect(runtimeScene.getVariables().has('OrFired')).toBe(false);
      expect(touchedFlags(aInsts)).toEqual([0, 0, 0]);
      expect(touchedFlags(bInsts)).toEqual([0, 0, 0]);
    });

    it('OrDistributive: action does not run when both branches are false', () => {
      const { runtimeScene, aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(buildEvents(orDistributiveOf));
      expect(runtimeScene.getVariables().has('OrFired')).toBe(false);
      expect(touchedFlags(aInsts)).toEqual([0, 0, 0]);
      expect(touchedFlags(bInsts)).toEqual([0, 0, 0]);
    });
  });

  /* ================================================================== */
  /* 4. Input + SubmitButton — canonical case for OrDistributive.       */
  /*    A branch that doesn't reference ObjectA must keep ObjectA       */
  /*    available to the action.                                        */
  /* ================================================================== */
  describe('OrDistributive — Input/Button (act on ObjectA regardless)', () => {
    // branch 1: pickA=999 — references A, false (no instance has var=999).
    // branch 2: free, true — does not reference A.
    // With OrDistributive, all three A instances stay available.
    const events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [orDistributiveOf(pickAByVar(999), freeCondition(true))],
        actions: [touchA, setScene('OrFired', 1)],
        events: [],
      },
    ];

    it('OrDistributive: all A instances stay picked when only the free branch is true', () => {
      const { runtimeScene, aInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(touchedFlags(aInsts)).toEqual([1, 1, 1]);
    });

    it('OrDistributive: when both branches true, every A is still picked (union over all branches)', () => {
      const events2 = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            orDistributiveOf(pickAByVar(2), freeCondition(true)),
          ],
          actions: [touchA, setScene('OrFired', 1)],
          events: [],
        },
      ];
      const { aInsts } = runEventsWithThreeObjectsThreeInstances(events2);
      // Branch 1 contributes only A2. Branch 2 is unconstrained so it
      // contributes the parent's full A list (A1, A2, A3). Union = all
      // three.
      expect(touchedFlags(aInsts)).toEqual([1, 1, 1]);
    });

    it('preserve-picks Or fails on this pattern (expected; documents why a separate condition exists)', () => {
      // With the regular Or, branch 1 is false and branch 2 does not
      // reference A. No true branch contributed for A, so the bug-fixed
      // Or leaves A at whatever it was at the start of the Or — and
      // because A is registered as "empty if just declared", that's an
      // empty list. The action runs zero times.
      const events3 = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orOf(pickAByVar(999), freeCondition(true))],
          actions: [touchA, setScene('OrFired', 1)],
          events: [],
        },
      ];
      const { aInsts } = runEventsWithThreeObjectsThreeInstances(events3);
      expect(touchedFlags(aInsts)).toEqual([0, 0, 0]);
    });
  });

  /* ================================================================== */
  /* 5. "Score on trigger" — OrDistributive lets unrelated objects be   */
  /*    available regardless of which branch fired.                     */
  /* ================================================================== */
  describe('OrDistributive — score-on-trigger (unrelated object stays available)', () => {
    const events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [orDistributiveOf(pickAByVar(2), freeCondition(true))],
        // Action acts on B although neither branch references B.
        actions: [touchB, setScene('OrFired', 1)],
        events: [],
      },
    ];

    it('action acts on every B instance even though no branch references B', () => {
      const { runtimeScene, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(touchedFlags(bInsts)).toEqual([1, 1, 1]);
    });
  });

  /* ================================================================== */
  /* 6. Sanity check: OrDistributive is NOT a drop-in replacement for   */
  /*    Or in the Door/Coin pattern. This test documents the leak.       */
  /* ================================================================== */
  describe('OrDistributive — Door/Coin shows why both operators are needed', () => {
    // Branch 1 picks A=2. Branch 2 picks B=999 (false). With distributive
    // semantics, branch 1 leaves B unconstrained and contributes B's
    // entire parent list, so the action ends up touching every B.
    const events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [orDistributiveOf(pickAByVar(2), pickBByVar(999))],
        actions: [touchA, touchB],
        events: [],
      },
    ];

    it('only A=2 matches but distributive Or also touches every B (use regular Or for this case)', () => {
      const { aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
      expect(touchedFlags(bInsts)).toEqual([1, 1, 1]);
    });
  });

  /* ================================================================== */
  /* 7. Branches with `And` — a single branch can constrain several     */
  /*    objects at once. The branch is true only when every             */
  /*    sub-condition is true; when true, every sub-condition's picks   */
  /*    contribute to the corresponding object's picked list.           */
  /* ================================================================== */
  describe('Or — branches with And { picks A and B together }', () => {
    it('Or: each true And-branch contributes its own A and B picks; others untouched', () => {
      // Branch 1: And{A=1, B=1} — both match → branch 1 true → contribute
      // A1, B1.
      // Branch 2: And{A=3, B=3} — both match → branch 2 true → contribute
      // A3, B3.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            orOf(
              andOf(pickAByVar(1), pickBByVar(1)),
              andOf(pickAByVar(3), pickBByVar(3))
            ),
          ],
          actions: [touchA, touchB],
          events: [],
        },
      ];
      const { aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([1, 0, 1]);
      expect(touchedFlags(bInsts)).toEqual([1, 0, 1]);
    });

    it('Or: And-branch is false if any sub-condition fails → no contribution from that branch', () => {
      // Branch 1: And{A=1, B=1} — both match → contribute A1, B1.
      // Branch 2: And{A=2, B=999} — A=2 picks A2 but B=999 picks nothing,
      //                              so And is false → no contribution.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            orOf(
              andOf(pickAByVar(1), pickBByVar(1)),
              andOf(pickAByVar(2), pickBByVar(999))
            ),
          ],
          actions: [touchA, touchB],
          events: [],
        },
      ];
      const { aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([1, 0, 0]);
      expect(touchedFlags(bInsts)).toEqual([1, 0, 0]);
    });
  });

  describe('OrDistributive — branches with And { picks A and B together }', () => {
    it('OrDistributive: each true And-branch is symmetric to Or because every branch references both A and B', () => {
      // When every branch references every object in the union, the
      // unconstrained-fill of OrDistributive does not engage and the
      // result is identical to the regular Or above.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            orDistributiveOf(
              andOf(pickAByVar(1), pickBByVar(1)),
              andOf(pickAByVar(3), pickBByVar(3))
            ),
          ],
          actions: [touchA, touchB],
          events: [],
        },
      ];
      const { aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([1, 0, 1]);
      expect(touchedFlags(bInsts)).toEqual([1, 0, 1]);
    });

    it('OrDistributive: asymmetric branches — branch with And{A=1} leaves B unconstrained, the lone B-branch leaves A unconstrained', () => {
      // Branch 1: And{A=1} — references only A; B is unconstrained for
      //   this branch (contributes the parent's full B list when branch
      //   is true).
      // Branch 2: pickB=2 — references only B; A is unconstrained for
      //   this branch (contributes the parent's full A list when branch
      //   is true).
      // Both branches are true → every A and every B end up in the union.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            orDistributiveOf(andOf(pickAByVar(1)), pickBByVar(2)),
          ],
          actions: [touchA, touchB],
          events: [],
        },
      ];
      const { aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([1, 1, 1]);
      expect(touchedFlags(bInsts)).toEqual([1, 1, 1]);
    });

    it('OrDistributive: same asymmetric branches with the regular Or only touch the picked instances', () => {
      // Same shape as above but with the preserve-picks Or — branches
      // contribute only what they actually picked, so only A1 and B2
      // are touched.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orOf(andOf(pickAByVar(1)), pickBByVar(2))],
          actions: [touchA, touchB],
          events: [],
        },
      ];
      const { aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([1, 0, 0]);
      expect(touchedFlags(bInsts)).toEqual([0, 1, 0]);
    });
  });

  /* ================================================================== */
  /* 8. Unrelated objects — picks for objects the Or doesn't reference  */
  /*    are never disturbed. ObjectC is picked by a sibling top-level   */
  /*    event whose conditions reference only C, and that should yield  */
  /*    the same C picks regardless of how the Or above behaved.        */
  /* ================================================================== */
  describe('Or / OrDistributive — unrelated ObjectC is picked independently', () => {
    const buildTwoEvents = (orWrapper) => [
      // Event 1 — exercises Or behavior on A and B. ObjectC is never
      // mentioned in this event.
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [orWrapper(pickAByVar(2), pickBByVar(2))],
        actions: [touchA, touchB],
        events: [],
      },
      // Event 2 — sibling event picking ObjectC by its variable. This
      // event has no relation to the Or above; its picks must be
      // unaffected by what happened in event 1.
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [pickCByVar(3)],
        actions: [touchC],
        events: [],
      },
    ];

    it('Or: ObjectC=3 is picked independently of the Or on A and B', () => {
      const { aInsts, bInsts, cInsts } =
        runEventsWithThreeObjectsThreeInstances(buildTwoEvents(orOf));
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
      expect(touchedFlags(bInsts)).toEqual([0, 1, 0]);
      expect(touchedFlags(cInsts)).toEqual([0, 0, 1]);
    });

    it('OrDistributive: ObjectC=3 is picked independently of the OrDistributive on A and B', () => {
      const { cInsts } = runEventsWithThreeObjectsThreeInstances(
        buildTwoEvents(orDistributiveOf)
      );
      expect(touchedFlags(cInsts)).toEqual([0, 0, 1]);
    });

    it('Or with Or false: ObjectC is still picked correctly by the sibling event', () => {
      // The Or in event 1 is false, so event 1's actions do not run. The
      // sibling event 2 picks ObjectC normally because event contexts
      // are independent.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orOf(pickAByVar(999), pickBByVar(999))],
          actions: [touchA, touchB],
          events: [],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [pickCByVar(1)],
          actions: [touchC],
          events: [],
        },
      ];
      const { aInsts, bInsts, cInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([0, 0, 0]);
      expect(touchedFlags(bInsts)).toEqual([0, 0, 0]);
      expect(touchedFlags(cInsts)).toEqual([1, 0, 0]);
    });
  });
});
