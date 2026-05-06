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
 *   the action acts on objects that some other branch did pick but the
 *   firing branch doesn't reference (TextInput + SubmitButton pattern).
 *
 * Each test seeds three instances per object (MyVariable=1, 2 and 3) so a
 * picking condition such as `VarObjet(ObjectX, "MyVariable", "=", N)`
 * deterministically picks the Nth instance. After running, an
 * `ModVarObjet(..., "Touched", "+", "1")` action is used per relevant object
 * to reveal exactly which instances were picked at action time — the test
 * asserts on the per-instance `Touched` array, not just on totals, so
 * each instance's fate is checked individually.
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
    };
  };

  // Returns [touched1, touched2, touched3] for the given instance array,
  // where each entry is the value of the "Touched" object variable. A 0 in
  // the array means "the action did not run on this instance".
  const touchedFlags = (insts) =>
    insts.map((o) => o.getVariables().get('Touched').getAsNumber());

  const pickByVar = (objectName, expectedValue) => ({
    type: { value: 'VarObjet' },
    parameters: [objectName, 'MyVariable', '=', String(expectedValue)],
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
  describe('Or — Door/Coin (act on the touched object)', () => {
    it('only branch A matches: only A2 is touched, no B is touched', () => {
      // Branch A picks A=2 (matches A2). Branch B picks B=999 (no
      // instance has var=999, so the branch is false). The action
      // touches whatever survives in each picked list.
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

    it('only branch B matches: only B3 is touched, no A is touched', () => {
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
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orOf(pickAByVar(2), pickBByVar(2))],
          actions: [touchA, touchB, setScene('OrFired', 1)],
          events: [],
        },
      ];
      const { runtimeScene, aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
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
    it('keeps the outside-Or pick (A2) when only the free branch is true', () => {
      // Outside the Or, ObjectA is filtered to A2. Inside the Or:
      //   branch 1: pickA=999 — references A but is false.
      //   branch 2: free, true — does not reference A.
      // No true branch contributed for A, so the bug-fixed Or leaves
      // the outside pick of A2 alone. Only A2 should be touched.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            pickAByVar(2),
            orOf(pickAByVar(999), freeCondition(true)),
          ],
          actions: [touchA, setScene('OrFired', 1)],
          events: [],
        },
      ];
      const { runtimeScene, aInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
    });

    it('keeps the outside-Or pick (A2) when the free branch comes BEFORE the false A-branch', () => {
      // Branch order matters: this test exercises the boolean-reset
      // fix. Without it, the true free branch would leak its truth
      // value into the next branch's "if(isConditionTrue)" check, and
      // the false pickA(999) branch would be wrongly treated as a
      // contribution — collapsing parent.A to the empty filtered list.
      const events = [
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
        runEventsWithThreeObjectsThreeInstances(events);
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
    });
  });

  /* ================================================================== */
  /* 3. All-false Or returns false (sanity check that the Or correctly  */
  /*    fails the parent event so the action does not run).             */
  /* ================================================================== */
  describe('Or — all-false returns false', () => {
    it('Or: action does not run when both branches are false', () => {
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orOf(pickAByVar(999), pickBByVar(999))],
          actions: [touchA, touchB, setScene('OrFired', 1)],
          events: [],
        },
      ];
      const { runtimeScene, aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(runtimeScene.getVariables().has('OrFired')).toBe(false);
      expect(touchedFlags(aInsts)).toEqual([0, 0, 0]);
      expect(touchedFlags(bInsts)).toEqual([0, 0, 0]);
    });

    it('OrDistributive: action does not run when both branches are false', () => {
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orDistributiveOf(pickAByVar(999), pickBByVar(999))],
          actions: [touchA, touchB, setScene('OrFired', 1)],
          events: [],
        },
      ];
      const { runtimeScene, aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(runtimeScene.getVariables().has('OrFired')).toBe(false);
      expect(touchedFlags(aInsts)).toEqual([0, 0, 0]);
      expect(touchedFlags(bInsts)).toEqual([0, 0, 0]);
    });
  });

  /* ================================================================== */
  /* 4. Input + SubmitButton — canonical case for OrDistributive.       */
  /*    A branch references A (and is false), the other branch does     */
  /*    not reference A. With OrDistributive every A is preserved at    */
  /*    action time; with the regular Or, parent.A collapses to empty.  */
  /* ================================================================== */
  describe('OrDistributive vs Or — Input/Button (act on ObjectA regardless)', () => {
    it('OrDistributive: every A stays picked when only the free branch is true', () => {
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            orDistributiveOf(pickAByVar(999), freeCondition(true)),
          ],
          actions: [touchA, setScene('OrFired', 1)],
          events: [],
        },
      ];
      const { runtimeScene, aInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(touchedFlags(aInsts)).toEqual([1, 1, 1]);
    });

    it('OrDistributive: when both branches true, every A is still picked (union of constrained + unconstrained = all)', () => {
      // Branch 1 contributes only A2. Branch 2 is unconstrained on A so
      // it contributes the parent's full A list. Union = all three.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orDistributiveOf(pickAByVar(2), freeCondition(true))],
          actions: [touchA, setScene('OrFired', 1)],
          events: [],
        },
      ];
      const { aInsts } = runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([1, 1, 1]);
    });

    it('preserve-picks Or fails on this pattern: action runs on zero A (documents why a separate condition is needed)', () => {
      // With the regular Or, branch 1 is false and branch 2 does not
      // reference A. No true branch contributed for A, so the bug-fixed
      // Or leaves A at whatever it was at the start of the Or — and
      // because A is registered by the Or as "empty if just declared",
      // that's the empty list. The action runs zero times.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orOf(pickAByVar(999), freeCondition(true))],
          actions: [touchA, setScene('OrFired', 1)],
          events: [],
        },
      ];
      const { runtimeScene, aInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      // The Or itself is true (the free branch is true), so the action
      // block runs — but it sees no picked A.
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(touchedFlags(aInsts)).toEqual([0, 0, 0]);
    });
  });

  /* ================================================================== */
  /* 5. Distributive vs Or with the action acting on B, where exactly   */
  /*    one branch references B (and is false). This isolates the       */
  /*    distinguishing behavior on the action's target.                 */
  /* ================================================================== */
  describe('OrDistributive vs Or — action on B, only one branch references B and is false', () => {
    it('OrDistributive: every B is touched (the unconstrained free branch contributes parent.B)', () => {
      // Branch 1 references B and fails (no B has var=999). Branch 2
      // is free and true. Distributive Or treats branch 2 as
      // unconstrained on B, contributing parent's full B list.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            orDistributiveOf(pickBByVar(999), freeCondition(true)),
          ],
          actions: [touchB],
          events: [],
        },
      ];
      const { bInsts } = runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(bInsts)).toEqual([1, 1, 1]);
    });

    it('Or: zero B is touched on the same shape (the false B-branch wipes parent.B)', () => {
      // Same shape with the regular Or: parent.B starts as the
      // "empty if just declared" list (because the Or registers B),
      // branch 1 is false → no contribution for B, branch 2 does not
      // reference B → no contribution. parent.B stays empty.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orOf(pickBByVar(999), freeCondition(true))],
          actions: [touchB],
          events: [],
        },
      ];
      const { bInsts } = runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(bInsts)).toEqual([0, 0, 0]);
    });
  });

  /* ================================================================== */
  /* 6. Sanity check: OrDistributive is NOT a drop-in replacement for   */
  /*    Or in the Door/Coin pattern. This test documents the leak.       */
  /* ================================================================== */
  describe('OrDistributive — Door/Coin shows why both operators are needed', () => {
    it('only A=2 matches but distributive Or also touches every B (use regular Or for this case)', () => {
      // Branch 1 picks A=2. Branch 2 picks B=999 (false). With
      // distributive semantics, branch 1 leaves B unconstrained and
      // contributes B's entire parent list, so the action ends up
      // touching every B.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orDistributiveOf(pickAByVar(2), pickBByVar(999))],
          actions: [touchA, touchB],
          events: [],
        },
      ];
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
      // Branch 1: And{A=1, B=1} — both match → contribute A1, B1.
      // Branch 2: And{A=3, B=3} — both match → contribute A3, B3.
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
      // Branch 2: And{A=2, B=999} — A=2 picks A2 but B=999 picks
      // nothing, so the And is false → no contribution.
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
    it('OrDistributive: when every branch references both A and B, the result is identical to the regular Or', () => {
      // The unconstrained-fill of OrDistributive only engages for an
      // object that some branch leaves unreferenced. Here every branch
      // references both A and B, so the result is identical to the
      // regular Or above.
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

    it('OrDistributive: asymmetric branches — And{A=1,B=1} + pickA=3 → every B in the union, only the picked A', () => {
      // Branch 1: And{A=1, B=1} — references both A and B, both true,
      //   contributes A1 + B1.
      // Branch 2: pickA=3 — references only A, contributes A3 from
      //   its own pick AND parent's full B list (B is unconstrained
      //   on this branch). Union B = all three.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            orDistributiveOf(
              andOf(pickAByVar(1), pickBByVar(1)),
              pickAByVar(3)
            ),
          ],
          actions: [touchA, touchB],
          events: [],
        },
      ];
      const { aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([1, 0, 1]);
      expect(touchedFlags(bInsts)).toEqual([1, 1, 1]);
    });

    it('Or: same asymmetric shape only touches the picked B (preserve-picks)', () => {
      // Same branches as the asymmetric OrDistributive case above, but
      // with the regular Or: branch 2 doesn't reference B, so it
      // contributes nothing for B. Only A's union (A1, A3) and B1
      // survive.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            orOf(andOf(pickAByVar(1), pickBByVar(1)), pickAByVar(3)),
          ],
          actions: [touchA, touchB],
          events: [],
        },
      ];
      const { aInsts, bInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([1, 0, 1]);
      expect(touchedFlags(bInsts)).toEqual([1, 0, 0]);
    });
  });

  /* ================================================================== */
  /* 8. Unrelated objects — within the same event, picks for objects    */
  /*    the Or doesn't reference must follow their own conditions       */
  /*    (and lack of conditions = unconstrained). The Or must not       */
  /*    register or alter the picked list of an object it doesn't       */
  /*    constrain.                                                      */
  /* ================================================================== */
  describe('Or — unrelated ObjectC is untouched by the Or in the same event', () => {
    it('no condition on C: action acts on every C even though the Or above on A/B is constrained', () => {
      // The Or only references A and B. C has no condition, so the
      // action should run on every C instance.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orOf(pickAByVar(2), pickBByVar(999))],
          actions: [touchA, touchB, touchC],
          events: [],
        },
      ];
      const { aInsts, bInsts, cInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
      expect(touchedFlags(bInsts)).toEqual([0, 0, 0]);
      expect(touchedFlags(cInsts)).toEqual([1, 1, 1]);
    });

    it('C picked by a sibling condition BEFORE the Or: only the picked C is touched, the Or does not erase it', () => {
      // pickC=2 picks C2 outside the Or. Then the Or runs (true via
      // branch A). The Or does not reference C, so C2 must survive
      // into the action.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [pickCByVar(2), orOf(pickAByVar(2), pickBByVar(999))],
          actions: [touchA, touchC],
          events: [],
        },
      ];
      const { aInsts, cInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
      expect(touchedFlags(cInsts)).toEqual([0, 1, 0]);
    });

    it('C picked by a sibling condition AFTER the Or: only the picked C is touched, the Or does not pre-empt it', () => {
      // The Or runs first, then pickC=3 filters C. The Or must not
      // have side-effected C's picked list in any way.
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orOf(pickAByVar(2), pickBByVar(999)), pickCByVar(3)],
          actions: [touchA, touchC],
          events: [],
        },
      ];
      const { aInsts, cInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
      expect(touchedFlags(cInsts)).toEqual([0, 0, 1]);
    });
  });

  describe('OrDistributive — unrelated ObjectC is untouched by the OrDistributive in the same event', () => {
    it('no condition on C: action acts on every C even though OrDistributive above on A/B is constrained', () => {
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [orDistributiveOf(pickAByVar(2), pickBByVar(999))],
          actions: [touchA, touchB, touchC],
          events: [],
        },
      ];
      const { aInsts, bInsts, cInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      // ObjectA picked from branch 1; ObjectB unconstrained on branch 1
      // (distributive) so all three B's contributed; C never referenced.
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
      expect(touchedFlags(bInsts)).toEqual([1, 1, 1]);
      expect(touchedFlags(cInsts)).toEqual([1, 1, 1]);
    });

    it('C picked by a sibling condition BEFORE the OrDistributive: only the picked C is touched', () => {
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            pickCByVar(2),
            orDistributiveOf(pickAByVar(2), pickBByVar(999)),
          ],
          actions: [touchA, touchC],
          events: [],
        },
      ];
      const { aInsts, cInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
      expect(touchedFlags(cInsts)).toEqual([0, 1, 0]);
    });

    it('C picked by a sibling condition AFTER the OrDistributive: only the picked C is touched', () => {
      const events = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            orDistributiveOf(pickAByVar(2), pickBByVar(999)),
            pickCByVar(3),
          ],
          actions: [touchA, touchC],
          events: [],
        },
      ];
      const { aInsts, cInsts } =
        runEventsWithThreeObjectsThreeInstances(events);
      expect(touchedFlags(aInsts)).toEqual([0, 1, 0]);
      expect(touchedFlags(cInsts)).toEqual([0, 0, 1]);
    });
  });
});
