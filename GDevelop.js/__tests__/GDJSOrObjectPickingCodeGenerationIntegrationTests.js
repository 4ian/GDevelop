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
 * The canonical patterns covered below:
 *   1. Door/Coin           — preserve-picks Or only.
 *   2. AllowedArea pair    — preserve-picks Or only (bug-fix path).
 *   3. Both branches false — both Or variants must leave parent picks alone.
 *   4. Input + Submit      — distributive Or only.
 *   5. "Score on trigger"  — distributive Or only.
 *   6. Sanity              — distributive Or breaks Door/Coin (documents the
 *                            difference between the two operators).
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
   * Build a small project with two object parameters, run the supplied events,
   * and return the resulting (mutated) parameter object lists plus the
   * runtime scene so tests can assert on picked lists and scene variables.
   *
   * The events function is given two object parameters: ObjectA and ObjectB.
   * Each test seeds these with a single instance whose 'MyVariable' is set
   * to a value the test controls, so that picking conditions of the form
   * `VarObjet(ObjectX, "MyVariable", "=", N)` deterministically pick or skip
   * the instance.
   */
  const runEventsWithTwoObjects = (events, { aValue, bValue }) => {
    const serializerElement = gd.Serializer.fromJSObject(events);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        parameterTypes: {
          ObjectA: 'object',
          ObjectB: 'object',
        },
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();

    const a1 = runtimeScene.createObject('ObjectA');
    a1.getVariables().get('MyVariable').setNumber(aValue);
    const objectAList = new gdjs.Hashtable();
    objectAList.put('ObjectA', [a1]);

    const b1 = runtimeScene.createObject('ObjectB');
    b1.getVariables().get('MyVariable').setNumber(bValue);
    const objectBList = new gdjs.Hashtable();
    objectBList.put('ObjectB', [b1]);

    runCompiledEvents(gdjs, runtimeScene, [objectAList, objectBList]);

    return { runtimeScene, objectAList, objectBList, a1, b1 };
  };

  // Picks ObjectA where MyVariable === expectedAValue.
  const pickAByVar = (expectedAValue) => ({
    type: { value: 'VarObjet' },
    parameters: ['ObjectA', 'MyVariable', '=', String(expectedAValue)],
  });
  // Picks ObjectB where MyVariable === expectedBValue.
  const pickBByVar = (expectedBValue) => ({
    type: { value: 'VarObjet' },
    parameters: ['ObjectB', 'MyVariable', '=', String(expectedBValue)],
  });
  // Free condition with constant truth value (does not reference any object).
  const freeCondition = (alwaysTrue) => ({
    type: { value: 'Egal' },
    parameters: ['1', '=', alwaysTrue ? '1' : '0'],
  });

  // Action: increment ObjectA's "Touched" variable. Runs once per picked
  // ObjectA instance, so the post-condition variable reveals how many were
  // picked when the action ran.
  const touchA = {
    type: { value: 'ModVarObjet' },
    parameters: ['ObjectA', 'Touched', '+', '1'],
  };
  const touchB = {
    type: { value: 'ModVarObjet' },
    parameters: ['ObjectB', 'Touched', '+', '1'],
  };
  // Action: set scene variable, runs once regardless of picks. Used to
  // confirm the Or's truth value (whether the action block ran at all).
  const setScene = (name, value) => ({
    type: { value: 'ModVarScene' },
    parameters: [name, '=', String(value)],
  });

  /* ------------------------------------------------------------------ */
  /* 1. Door/Coin — the preserve-picks Or must scope picks to the       */
  /*    branch that fired.                                              */
  /* ------------------------------------------------------------------ */
  describe('Or — Door/Coin (act on the touched object)', () => {
    const buildEvents = (orType) => [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: orType },
            parameters: [],
            subInstructions: [pickAByVar(5), pickBByVar(7)],
          },
        ],
        actions: [touchA, touchB, setScene('OrFired', 1)],
        events: [],
      },
    ];

    it('Or picks A only when A matches', () => {
      const { runtimeScene, a1, b1 } = runEventsWithTwoObjects(
        buildEvents('BuiltinCommonInstructions::Or'),
        { aValue: 5, bValue: 999 }
      );
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(a1.getVariables().get('Touched').getAsNumber()).toBe(1);
      expect(b1.getVariables().get('Touched').getAsNumber()).toBe(0);
    });

    it('Or picks B only when B matches', () => {
      const { runtimeScene, a1, b1 } = runEventsWithTwoObjects(
        buildEvents('BuiltinCommonInstructions::Or'),
        { aValue: 999, bValue: 7 }
      );
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(a1.getVariables().get('Touched').getAsNumber()).toBe(0);
      expect(b1.getVariables().get('Touched').getAsNumber()).toBe(1);
    });

    it('Or picks both when both match', () => {
      const { runtimeScene, a1, b1 } = runEventsWithTwoObjects(
        buildEvents('BuiltinCommonInstructions::Or'),
        { aValue: 5, bValue: 7 }
      );
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(a1.getVariables().get('Touched').getAsNumber()).toBe(1);
      expect(b1.getVariables().get('Touched').getAsNumber()).toBe(1);
    });
  });

  /* ------------------------------------------------------------------ */
  /* 2. AllowedArea pair — outside-Or picking that the Or must not      */
  /*    erase (the bug fix).                                            */
  /* ------------------------------------------------------------------ */
  describe('Or — preserves outside picks when no true branch contributed', () => {
    // Outside the Or, ObjectA is filtered to the instance with var=5. Then
    // the Or runs:
    //   branch B: VarObjet(ObjectA, "MyVariable", "=", 999)  — references A,
    //                                                          but is false.
    //   branch C: Egal(1, 1)                                  — true, free.
    // No true branch contributed for A, so the action should still run on
    // the previously picked A. Before the fix, the Or overwrote A with the
    // empty "final" list and the action saw nothing.
    const events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          pickAByVar(5),
          {
            type: { value: 'BuiltinCommonInstructions::Or' },
            parameters: [],
            subInstructions: [pickAByVar(999), freeCondition(true)],
          },
        ],
        actions: [touchA, setScene('OrFired', 1)],
        events: [],
      },
    ];

    it('keeps the outside-Or pick of ObjectA when only the free branch is true', () => {
      const { runtimeScene, a1 } = runEventsWithTwoObjects(events, {
        aValue: 5,
        bValue: 0,
      });
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(a1.getVariables().get('Touched').getAsNumber()).toBe(1);
    });
  });

  /* ------------------------------------------------------------------ */
  /* 3. All-false Or returns false (sanity check that a both-false      */
  /*    Or properly fails the parent event so the action does not run). */
  /*    The "preserve parent picks when no branch contributed" path is  */
  /*    fully exercised by case 2 above; once the Or is false, the      */
  /*    parent event short-circuits before any action can observe the   */
  /*    picked-list state, so there is nothing more to assert here.     */
  /* ------------------------------------------------------------------ */
  describe('Or — all-false returns false', () => {
    const buildEvents = (orType) => [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: orType },
            parameters: [],
            subInstructions: [pickAByVar(999), pickBByVar(999)],
          },
        ],
        actions: [setScene('OrFired', 1)],
        events: [],
      },
    ];

    it('Or: action does not run when both branches are false', () => {
      const { runtimeScene } = runEventsWithTwoObjects(
        buildEvents('BuiltinCommonInstructions::Or'),
        { aValue: 5, bValue: 0 }
      );
      expect(runtimeScene.getVariables().has('OrFired')).toBe(false);
    });

    it('OrDistributive: action does not run when both branches are false', () => {
      const { runtimeScene } = runEventsWithTwoObjects(
        buildEvents('BuiltinCommonInstructions::OrDistributive'),
        { aValue: 5, bValue: 0 }
      );
      expect(runtimeScene.getVariables().has('OrFired')).toBe(false);
    });
  });

  /* ------------------------------------------------------------------ */
  /* 4. Input + SubmitButton — the canonical case for OrDistributive.   */
  /*    A branch that doesn't reference ObjectA must keep ObjectA       */
  /*    available to the action.                                        */
  /* ------------------------------------------------------------------ */
  describe('OrDistributive — Input/Button (act on ObjectA regardless)', () => {
    // branch A: pickAByVar(5)        — references A, may be true or false.
    // branch B: free, always true    — does NOT reference A.
    // Action: touch A. The action should run on ObjectA whenever the Or
    // returns true, even if branch A failed to pick A.
    const buildEvents = (orType) => [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: orType },
            parameters: [],
            subInstructions: [pickAByVar(5), freeCondition(true)],
          },
        ],
        actions: [touchA, setScene('OrFired', 1)],
        events: [],
      },
    ];

    it('OrDistributive picks A when only the free branch is true', () => {
      const { runtimeScene, a1 } = runEventsWithTwoObjects(
        buildEvents('BuiltinCommonInstructions::OrDistributive'),
        { aValue: 999, bValue: 0 } // branch A is false (var != 5)
      );
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(a1.getVariables().get('Touched').getAsNumber()).toBe(1);
    });

    it('OrDistributive picks A when branch A also matches', () => {
      const { runtimeScene, a1 } = runEventsWithTwoObjects(
        buildEvents('BuiltinCommonInstructions::OrDistributive'),
        { aValue: 5, bValue: 0 }
      );
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(a1.getVariables().get('Touched').getAsNumber()).toBe(1);
    });

    it('preserve-picks Or fails on this pattern (expected; documents why a separate condition exists)', () => {
      // With the regular Or, branch A is false and branch B does not
      // reference A. No true branch contributed for A, so the bug-fixed Or
      // leaves the parent's A list at whatever it was at the start of the
      // Or. Because A is registered by the Or as "empty if just declared",
      // its list starts empty here — and so the action runs on zero
      // instances. This is the case where users need OrDistributive.
      const { a1 } = runEventsWithTwoObjects(
        buildEvents('BuiltinCommonInstructions::Or'),
        { aValue: 999, bValue: 0 }
      );
      expect(a1.getVariables().get('Touched').getAsNumber()).toBe(0);
    });
  });

  /* ------------------------------------------------------------------ */
  /* 5. "Score on trigger" — OrDistributive lets unrelated objects be   */
  /*    available regardless of which branch fired.                     */
  /* ------------------------------------------------------------------ */
  describe('OrDistributive — score-on-trigger (unrelated object stays available)', () => {
    // Same pattern as Input/Button but the action targets ObjectB while the
    // branches test ObjectA / a free condition. With OrDistributive,
    // ObjectB stays unconstrained and the action runs on it.
    const events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'BuiltinCommonInstructions::OrDistributive' },
            parameters: [],
            subInstructions: [pickAByVar(5), freeCondition(true)],
          },
        ],
        actions: [touchB, setScene('OrFired', 1)],
        events: [],
      },
    ];

    it('action acts on ObjectB even though no branch references it', () => {
      const { runtimeScene, b1 } = runEventsWithTwoObjects(events, {
        aValue: 999,
        bValue: 42,
      });
      expect(runtimeScene.getVariables().get('OrFired').getAsNumber()).toBe(1);
      expect(b1.getVariables().get('Touched').getAsNumber()).toBe(1);
    });
  });

  /* ------------------------------------------------------------------ */
  /* 6. Sanity check: OrDistributive is NOT a drop-in replacement for   */
  /*    Or in the Door/Coin pattern. This test documents that distributive */
  /*    Or, when used on Door/Coin, "leaks" the unrelated-branch object */
  /*    into the action — which is exactly why we keep both operators.  */
  /* ------------------------------------------------------------------ */
  describe('OrDistributive — Door/Coin shows why both operators are needed', () => {
    const events = [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'BuiltinCommonInstructions::OrDistributive' },
            parameters: [],
            subInstructions: [pickAByVar(5), pickBByVar(7)],
          },
        ],
        actions: [touchA, touchB],
        events: [],
      },
    ];

    it('only A matches: OrDistributive still touches B (use regular Or for this case)', () => {
      // Branch A picks A=5. Branch B is false. Distributive Or keeps B
      // unconstrained for branch A's contribution, so B ends up picked too.
      // This is the documented mis-fit between distributive Or and the
      // Door/Coin pattern.
      const { a1, b1 } = runEventsWithTwoObjects(events, {
        aValue: 5,
        bValue: 999,
      });
      expect(a1.getVariables().get('Touched').getAsNumber()).toBe(1);
      expect(b1.getVariables().get('Touched').getAsNumber()).toBe(1);
    });
  });
});
