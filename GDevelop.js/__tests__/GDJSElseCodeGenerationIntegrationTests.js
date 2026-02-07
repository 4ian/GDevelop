const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS "Else" Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  it('can generate a simple Else event (pure else)', function () {
    // Standard event with a false condition, followed by Else.
    // The Else branch should run since the Standard condition fails.
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '999'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '2'],
          },
        ],
        events: [],
      },
    ]);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);
    expect(runtimeScene.getVariables().has('Result')).toBe(true);
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(2);
  });

  it('does not run Else event when Standard event conditions are satisfied', function () {
    // Standard event with no conditions (always true), followed by Else.
    // The Else branch should NOT run.
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '2'],
          },
        ],
        events: [],
      },
    ]);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);
    expect(runtimeScene.getVariables().has('Result')).toBe(true);
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(1);
  });

  it('can generate an Else-If chain', function () {
    // If Counter == 999 -> Result = 1 (won't run)
    // Else if Counter == 0 -> Result = 2 (will run since Counter defaults to 0)
    // Else -> Result = 3 (won't run since previous else-if matched)
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '999'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '0'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '2'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '3'],
          },
        ],
        events: [],
      },
    ]);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);
    expect(runtimeScene.getVariables().has('Result')).toBe(true);
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(2);
  });

  it('can generate an Else chain that falls through to pure else', function () {
    // If Counter == 999 -> Result = 1 (won't run)
    // Else if Counter == 888 -> Result = 2 (won't run)
    // Else -> Result = 3 (will run)
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '999'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '888'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '2'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '3'],
          },
        ],
        events: [],
      },
    ]);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);
    expect(runtimeScene.getVariables().has('Result')).toBe(true);
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(3);
  });

  it('resets Else chain when a new Standard event starts', function () {
    // First chain: Standard (true) -> Else (should not run)
    // Second chain: Standard (false) -> Else (should run)
    const serializerElement = gd.Serializer.fromJSObject([
      // First chain
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result1', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result1', '=', '2'],
          },
        ],
        events: [],
      },
      // Second chain
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '999'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result2', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result2', '=', '2'],
          },
        ],
        events: [],
      },
    ]);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);
    // First chain: Standard runs (no conditions = always true)
    expect(runtimeScene.getVariables().get('Result1').getAsNumber()).toBe(1);
    // Second chain: Standard fails, Else runs
    expect(runtimeScene.getVariables().get('Result2').getAsNumber()).toBe(2);
  });

  it('can generate Else events with sub-events', function () {
    // Standard (false) -> Else runs, and sub-events also run
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '999'],
          },
        ],
        actions: [],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '1'],
          },
        ],
        events: [
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['SubResult', '=', '10'],
              },
            ],
            events: [],
          },
        ],
      },
    ]);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(1);
    expect(runtimeScene.getVariables().get('SubResult').getAsNumber()).toBe(10);
  });

  it('runs an Else event like a Standard event when not preceded by Standard/Else', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '5'],
          },
        ],
        events: [],
      },
    ]);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(5);
  });

  it('runs an Else event like a Standard event when previous event is disabled', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        disabled: true,
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '2'],
          },
        ],
        events: [],
      },
    ]);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(2);
  });

  it('can generate three nested levels of Else if/else chains with surrounding events', function () {
    // Level 1: else-if matches (Counter == 0, which is the default)
    // Level 2 (sub-events of L1 else-if): final else runs
    // Level 3 (sub-events of L2 else): first else-if matches (Counter == 0)
    // At each level, events before and after the else chain verify execution flow.
    const serializerElement = gd.Serializer.fromJSObject([
      // --- Before Level 1 chain ---
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['BeforeL1', '=', '1'],
          },
        ],
        events: [],
      },
      // --- Level 1 chain ---
      // If Counter == 999 (false)
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '999'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['L1Result', '=', '1'],
          },
        ],
        events: [],
      },
      // Else if Counter == 0 (true - this branch runs)
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '0'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['L1Result', '=', '2'],
          },
        ],
        events: [
          // --- Before Level 2 chain ---
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['BeforeL2', '=', '1'],
              },
            ],
            events: [],
          },
          // --- Level 2 chain ---
          // If Counter == 999 (false)
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [
              {
                type: { value: 'VarScene' },
                parameters: ['Counter', '=', '999'],
              },
            ],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['L2Result', '=', '1'],
              },
            ],
            events: [],
          },
          // Else if Counter == 888 (false)
          {
            type: 'BuiltinCommonInstructions::Else',
            conditions: [
              {
                type: { value: 'VarScene' },
                parameters: ['Counter', '=', '888'],
              },
            ],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['L2Result', '=', '2'],
              },
            ],
            events: [],
          },
          // Else (true - final else runs)
          {
            type: 'BuiltinCommonInstructions::Else',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['L2Result', '=', '3'],
              },
            ],
            events: [
              // --- Before Level 3 chain ---
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [],
                actions: [
                  {
                    type: { value: 'ModVarScene' },
                    parameters: ['BeforeL3', '=', '1'],
                  },
                ],
                events: [],
              },
              // --- Level 3 chain ---
              // If Counter == 999 (false)
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [
                  {
                    type: { value: 'VarScene' },
                    parameters: ['Counter', '=', '999'],
                  },
                ],
                actions: [
                  {
                    type: { value: 'ModVarScene' },
                    parameters: ['L3Result', '=', '1'],
                  },
                ],
                events: [],
              },
              // Else if Counter == 0 (true - first else-if matches)
              {
                type: 'BuiltinCommonInstructions::Else',
                conditions: [
                  {
                    type: { value: 'VarScene' },
                    parameters: ['Counter', '=', '0'],
                  },
                ],
                actions: [
                  {
                    type: { value: 'ModVarScene' },
                    parameters: ['L3Result', '=', '2'],
                  },
                ],
                events: [],
              },
              // Else (won't run - previous else-if matched)
              {
                type: 'BuiltinCommonInstructions::Else',
                conditions: [],
                actions: [
                  {
                    type: { value: 'ModVarScene' },
                    parameters: ['L3Result', '=', '3'],
                  },
                ],
                events: [],
              },
              // --- After Level 3 chain ---
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [],
                actions: [
                  {
                    type: { value: 'ModVarScene' },
                    parameters: ['AfterL3', '=', '1'],
                  },
                ],
                events: [],
              },
            ],
          },
          // --- After Level 2 chain ---
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['AfterL2', '=', '1'],
              },
            ],
            events: [],
          },
        ],
      },
      // Else (won't run - previous else-if matched)
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['L1Result', '=', '3'],
          },
        ],
        events: [],
      },
      // --- After Level 1 chain ---
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['AfterL1', '=', '1'],
          },
        ],
        events: [],
      },
    ]);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    // Events before each chain ran.
    expect(runtimeScene.getVariables().get('BeforeL1').getAsNumber()).toBe(1);
    expect(runtimeScene.getVariables().get('BeforeL2').getAsNumber()).toBe(1);
    expect(runtimeScene.getVariables().get('BeforeL3').getAsNumber()).toBe(1);
    // Level 1: else-if matched (Counter == 0).
    expect(runtimeScene.getVariables().get('L1Result').getAsNumber()).toBe(2);
    // Level 2: final else ran (Counter != 999 and Counter != 888).
    expect(runtimeScene.getVariables().get('L2Result').getAsNumber()).toBe(3);
    // Level 3: first else-if matched (Counter == 0).
    expect(runtimeScene.getVariables().get('L3Result').getAsNumber()).toBe(2);
    // Events after each chain ran.
    expect(runtimeScene.getVariables().get('AfterL1').getAsNumber()).toBe(1);
    expect(runtimeScene.getVariables().get('AfterL2').getAsNumber()).toBe(1);
    expect(runtimeScene.getVariables().get('AfterL3').getAsNumber()).toBe(1);
  });

  it('stress test: combinations of standard, disabled, else, and repeat events', function () {
    // Helpers to build events concisely.
    // All conditions compare scene variable "X" which is never modified
    // (defaults to 0), so "X == 0" is always true, "X == 999" is always false.
    const trueCondition = [
      { type: { value: 'VarScene' }, parameters: ['X', '=', '0'] },
    ];
    const falseCondition = [
      { type: { value: 'VarScene' }, parameters: ['X', '=', '999'] },
    ];
    const setVar = (name, value) => ({
      type: { value: 'ModVarScene' },
      parameters: [name, '=', String(value)],
    });
    const addVar = (name, value) => ({
      type: { value: 'ModVarScene' },
      parameters: [name, '+', String(value)],
    });

    /** Standard event that sets `varName = value`. */
    const std = (varName, value, { conditions, subEvents } = {}) => ({
      type: 'BuiltinCommonInstructions::Standard',
      conditions: conditions || [],
      actions: [setVar(varName, value)],
      events: subEvents || [],
    });

    /** Standard event with a condition that is always false. */
    const stdFalse = (varName, value, { subEvents } = {}) =>
      std(varName, value, { conditions: falseCondition, subEvents });

    /** Standard event with a condition that is always true. */
    const stdTrue = (varName, value, { subEvents } = {}) =>
      std(varName, value, { conditions: trueCondition, subEvents });

    /** Else event (pure else or else-if depending on conditions). */
    const elseEv = (varName, value, { conditions, subEvents } = {}) => ({
      type: 'BuiltinCommonInstructions::Else',
      conditions: conditions || [],
      actions: [setVar(varName, value)],
      events: subEvents || [],
    });

    /** Else-if event with a condition that is always true. */
    const elseIfTrue = (varName, value, { subEvents } = {}) =>
      elseEv(varName, value, { conditions: trueCondition, subEvents });

    /** Else-if event with a condition that is always false. */
    const elseIfFalse = (varName, value, opts) =>
      elseEv(varName, value, { ...opts, conditions: falseCondition });

    /** Disabled standard event (removed at codegen). */
    const disabledStd = (varName, value, { conditions } = {}) => ({
      type: 'BuiltinCommonInstructions::Standard',
      disabled: true,
      conditions: conditions || [],
      actions: [setVar(varName, value)],
      events: [],
    });

    /** Disabled else event (removed at codegen). */
    const disabledElse = (varName, value, { conditions } = {}) => ({
      type: 'BuiltinCommonInstructions::Else',
      disabled: true,
      conditions: conditions || [],
      actions: [setVar(varName, value)],
      events: [],
    });

    /** Repeat event. */
    const repeat = (times, subEvents) => ({
      type: 'BuiltinCommonInstructions::Repeat',
      repeatExpression: String(times),
      conditions: [],
      actions: [],
      events: subEvents || [],
    });

    /**
     * A no-op Repeat(1) event used to break else chains between scenarios.
     * Since all scenarios live in one flat event list, a scenario that starts
     * with only disabled events or Else events would otherwise inherit the
     * chain state from the previous scenario. A Repeat event is neither
     * Standard nor Else, so it fully disconnects the if/else chain.
     */
    const chainBreaker = () => repeat(1, []);

    // Build a large sequence of scenarios. Each scenario uses uniquely named
    // variables so they can all be verified independently.
    // A sep() is inserted before any scenario whose first non-disabled event
    // is an Else, to prevent chain bleed from the previous scenario.
    const serializerElement = gd.Serializer.fromJSObject([
      // ---------------------------------------------------------------
      // Scenario 1: Standard(true) → Else → should NOT run
      // ---------------------------------------------------------------
      stdTrue('S01_if', 1),
      elseEv('S01_else', 1),

      // ---------------------------------------------------------------
      // Scenario 2: Standard(false) → Else → should run
      // ---------------------------------------------------------------
      stdFalse('S02_if', 1),
      elseEv('S02_else', 1),

      // ---------------------------------------------------------------
      // Scenario 3: Standard(false) → ElseIf(true) → Else
      //   Only ElseIf runs.
      // ---------------------------------------------------------------
      stdFalse('S03_if', 1),
      elseIfTrue('S03_elseif', 1),
      elseEv('S03_else', 1),

      // ---------------------------------------------------------------
      // Scenario 4: Standard(false) → ElseIf(false) → ElseIf(true) → Else
      //   Only second ElseIf runs.
      // ---------------------------------------------------------------
      stdFalse('S04_if', 1),
      elseIfFalse('S04_elseif1', 1),
      elseIfTrue('S04_elseif2', 1),
      elseEv('S04_else', 1),

      // ---------------------------------------------------------------
      // Scenario 5: Standard(true) → ElseIf(true) → Else
      //   Standard matched, none of the elses run.
      // ---------------------------------------------------------------
      stdTrue('S05_if', 1),
      elseIfTrue('S05_elseif', 1),
      elseEv('S05_else', 1),

      // ---------------------------------------------------------------
      // Scenario 6: Disabled Standard → Else
      //   Disabled is removed, Else becomes standalone → acts as Standard.
      // ---------------------------------------------------------------
      chainBreaker(), // break chain from S05
      disabledStd('S06_disabled', 1),
      elseEv('S06_else', 1),

      // ---------------------------------------------------------------
      // Scenario 7: Standard(false) → Disabled Else → Else
      //   Disabled Else removed → sequence becomes Standard(false) → Else.
      //   Else runs.
      // ---------------------------------------------------------------
      stdFalse('S07_if', 1),
      disabledElse('S07_disabledElse', 1),
      elseEv('S07_else', 1),

      // ---------------------------------------------------------------
      // Scenario 8: Standard(true) → Disabled Else → Else
      //   Disabled Else removed → Standard(true) → Else.
      //   Else does NOT run.
      // ---------------------------------------------------------------
      stdTrue('S08_if', 1),
      disabledElse('S08_disabledElse', 1),
      elseEv('S08_else', 1),

      // ---------------------------------------------------------------
      // Scenario 9: Repeat → Else
      //   Repeat is not Standard/Else, so Else acts as standalone Standard.
      // ---------------------------------------------------------------
      repeat(3, [std('S09_inner', 0)]),
      elseEv('S09_else', 1),

      // ---------------------------------------------------------------
      // Scenario 10: Standard(false) → Repeat → Else
      //   Repeat breaks the chain. Else acts as standalone Standard.
      // ---------------------------------------------------------------
      stdFalse('S10_if', 1),
      repeat(1, []),
      elseEv('S10_else', 1),

      // ---------------------------------------------------------------
      // Scenario 11: Long chain of false else-ifs falling through to else
      //   Standard(false) → ElseIf(false) × 4 → Else
      // ---------------------------------------------------------------
      stdFalse('S11_if', 1),
      elseIfFalse('S11_ei1', 1),
      elseIfFalse('S11_ei2', 1),
      elseIfFalse('S11_ei3', 1),
      elseIfFalse('S11_ei4', 1),
      elseEv('S11_else', 1),

      // ---------------------------------------------------------------
      // Scenario 12: Two consecutive if/else chains
      //   Chain A: Standard(true) → Else (doesn't run)
      //   Chain B: Standard(false) → Else (runs)
      // ---------------------------------------------------------------
      stdTrue('S12a_if', 1),
      elseEv('S12a_else', 1),
      stdFalse('S12b_if', 1),
      elseEv('S12b_else', 1),

      // ---------------------------------------------------------------
      // Scenario 13: Disabled Standard → Disabled Else → Else
      //   Both disabled removed → Else is standalone → runs.
      // ---------------------------------------------------------------
      chainBreaker(), // break chain from S12b
      disabledStd('S13_disStd', 1),
      disabledElse('S13_disElse', 1),
      elseEv('S13_else', 1),

      // ---------------------------------------------------------------
      // Scenario 14: Standard(false) → Disabled ElseIf(true) → ElseIf(false) → Else
      //   Disabled removed → Standard(false) → ElseIf(false) → Else.
      //   Else runs.
      // ---------------------------------------------------------------
      stdFalse('S14_if', 1),
      disabledElse('S14_disElseIf', 1, { conditions: trueCondition }),
      elseIfFalse('S14_elseif', 1),
      elseEv('S14_else', 1),

      // ---------------------------------------------------------------
      // Scenario 15: Standard(false) → ElseIf(true) → Disabled Else → Standard(false) → Else
      //   Disabled removed → Standard(false) → ElseIf(true) → Standard(false) → Else.
      //   ElseIf runs. Standard starts new chain. Else runs.
      // ---------------------------------------------------------------
      stdFalse('S15_if', 1),
      elseIfTrue('S15_elseif', 1),
      disabledElse('S15_disElse', 1),
      stdFalse('S15_if2', 1),
      elseEv('S15_else', 1),

      // ---------------------------------------------------------------
      // Scenario 16: Standalone Else (no preceding Standard/Else)
      //   Acts as Standard → always runs (no conditions).
      // ---------------------------------------------------------------
      chainBreaker(), // break chain from S15
      elseEv('S16_else', 1),

      // ---------------------------------------------------------------
      // Scenario 17: Standalone ElseIf(false) → Else
      //   ElseIf acts as Standard(false) → Else runs.
      // ---------------------------------------------------------------
      chainBreaker(), // break chain from S16
      elseIfFalse('S17_elseif', 1),
      elseEv('S17_else', 1),

      // ---------------------------------------------------------------
      // Scenario 18: Repeat containing an if/else chain inside
      //   The inner else runs on each of the 3 iterations.
      // ---------------------------------------------------------------
      repeat(3, [
        stdFalse('S18_innerIf', 1),
        elseEv('S18_innerElse', 1),
      ]),

      // ---------------------------------------------------------------
      // Scenario 19: Standard(true) → Else → Repeat → Else
      //   Standard runs. First Else doesn't run. Repeat breaks chain.
      //   Second Else acts as standalone → runs.
      // ---------------------------------------------------------------
      stdTrue('S19_if', 1),
      elseEv('S19_else1', 1),
      repeat(1, []),
      elseEv('S19_else2', 1),

      // ---------------------------------------------------------------
      // Scenario 20: Three disabled events in a row → Else
      //   All disabled removed → Else is standalone → runs.
      // ---------------------------------------------------------------
      chainBreaker(), // break chain from S19
      disabledStd('S20_dis1', 1),
      disabledStd('S20_dis2', 1),
      disabledStd('S20_dis3', 1),
      elseEv('S20_else', 1),

      // ---------------------------------------------------------------
      // Scenario 21: Standard(false) → many disabled elses → Else
      //   All disabled removed → Standard(false) → Else → runs.
      // ---------------------------------------------------------------
      stdFalse('S21_if', 1),
      disabledElse('S21_dis1', 1),
      disabledElse('S21_dis2', 1),
      disabledElse('S21_dis3', 1),
      elseEv('S21_else', 1),

      // ---------------------------------------------------------------
      // Scenario 22: ElseIf(true) with sub-events containing its own chain
      //   Standard(false) → ElseIf(true) with sub: [Standard(false) → Else]
      // ---------------------------------------------------------------
      stdFalse('S22_if', 1),
      elseIfTrue('S22_elseif', 1, {
        subEvents: [
          stdFalse('S22_sub_if', 1),
          elseEv('S22_sub_else', 1),
        ],
      }),
      elseEv('S22_else', 1),

      // ---------------------------------------------------------------
      // Scenario 23: Repeat containing if/else, followed by if/else outside
      //   Inner and outer chains are independent.
      // ---------------------------------------------------------------
      repeat(2, [
        stdTrue('S23_repIf', 1),
        elseEv('S23_repElse', 1),
      ]),
      stdFalse('S23_if', 1),
      elseEv('S23_else', 1),

      // ---------------------------------------------------------------
      // Scenario 24: Standard(false) → ElseIf(true) → ElseIf(true) → Else
      //   Only first ElseIf runs (chain short-circuits).
      // ---------------------------------------------------------------
      stdFalse('S24_if', 1),
      elseIfTrue('S24_elseif1', 1),
      elseIfTrue('S24_elseif2', 1),
      elseEv('S24_else', 1),

      // ---------------------------------------------------------------
      // Scenario 25: Disabled Else between two valid chain elements
      //   Standard(false) → Disabled ElseIf(false) → Disabled Else → ElseIf(false) → Else
      //   After removing disabled: Standard(false) → ElseIf(false) → Else.
      //   Else runs.
      // ---------------------------------------------------------------
      stdFalse('S25_if', 1),
      disabledElse('S25_disEi', 1, { conditions: falseCondition }),
      disabledElse('S25_disElse', 1),
      elseIfFalse('S25_elseif', 1),
      elseEv('S25_else', 1),

      // ---------------------------------------------------------------
      // Scenario 26: Standard(unconditional/true) → Standard(false) → Else
      //   First Standard always runs. Second Standard starts a NEW chain
      //   (it fails). Else follows second Standard → runs.
      // ---------------------------------------------------------------
      std('S26_std1', 1),
      stdFalse('S26_std2', 1),
      elseEv('S26_else', 1),

      // ---------------------------------------------------------------
      // Scenario 27: Nested else chains at two levels with repeat in between
      //   Standard(false) → Else with sub-events:
      //     [Repeat(2, [Standard(false), Else]), Standard after repeat]
      // ---------------------------------------------------------------
      stdFalse('S27_if', 1),
      elseEv('S27_else', 1, {
        subEvents: [
          repeat(2, [
            stdFalse('S27_rep_if', 1),
            elseEv('S27_rep_else', 1),
          ]),
          std('S27_after_rep', 1),
        ],
      }),
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    const v = (name) =>
      runtimeScene.getVariables().has(name)
        ? runtimeScene.getVariables().get(name).getAsNumber()
        : 0;

    // Scenario 1: Standard(true) → Else not run
    expect(v('S01_if')).toBe(1);
    expect(v('S01_else')).toBe(0);

    // Scenario 2: Standard(false) → Else runs
    expect(v('S02_if')).toBe(0);
    expect(v('S02_else')).toBe(1);

    // Scenario 3: Standard(false) → ElseIf(true) runs, Else skipped
    expect(v('S03_if')).toBe(0);
    expect(v('S03_elseif')).toBe(1);
    expect(v('S03_else')).toBe(0);

    // Scenario 4: Standard(false) → ElseIf(false) → ElseIf(true) runs → Else skipped
    expect(v('S04_if')).toBe(0);
    expect(v('S04_elseif1')).toBe(0);
    expect(v('S04_elseif2')).toBe(1);
    expect(v('S04_else')).toBe(0);

    // Scenario 5: Standard(true) runs → all elses skipped
    expect(v('S05_if')).toBe(1);
    expect(v('S05_elseif')).toBe(0);
    expect(v('S05_else')).toBe(0);

    // Scenario 6: Disabled Standard removed → Else standalone → runs
    expect(v('S06_disabled')).toBe(0);
    expect(v('S06_else')).toBe(1);

    // Scenario 7: Standard(false) → Disabled Else removed → Else runs
    expect(v('S07_if')).toBe(0);
    expect(v('S07_disabledElse')).toBe(0);
    expect(v('S07_else')).toBe(1);

    // Scenario 8: Standard(true) → Disabled Else removed → Else not run
    expect(v('S08_if')).toBe(1);
    expect(v('S08_disabledElse')).toBe(0);
    expect(v('S08_else')).toBe(0);

    // Scenario 9: Repeat → Else acts as standalone → runs
    expect(v('S09_else')).toBe(1);

    // Scenario 10: Standard(false) → Repeat breaks chain → Else standalone → runs
    expect(v('S10_if')).toBe(0);
    expect(v('S10_else')).toBe(1);

    // Scenario 11: Long chain, all false, falls through to else
    expect(v('S11_if')).toBe(0);
    expect(v('S11_ei1')).toBe(0);
    expect(v('S11_ei2')).toBe(0);
    expect(v('S11_ei3')).toBe(0);
    expect(v('S11_ei4')).toBe(0);
    expect(v('S11_else')).toBe(1);

    // Scenario 12: Two consecutive chains
    expect(v('S12a_if')).toBe(1);
    expect(v('S12a_else')).toBe(0);
    expect(v('S12b_if')).toBe(0);
    expect(v('S12b_else')).toBe(1);

    // Scenario 13: Disabled Standard + Disabled Else → Else standalone → runs
    expect(v('S13_disStd')).toBe(0);
    expect(v('S13_disElse')).toBe(0);
    expect(v('S13_else')).toBe(1);

    // Scenario 14: Standard(false) → Disabled ElseIf(true) removed → ElseIf(false) → Else runs
    expect(v('S14_if')).toBe(0);
    expect(v('S14_disElseIf')).toBe(0);
    expect(v('S14_elseif')).toBe(0);
    expect(v('S14_else')).toBe(1);

    // Scenario 15: Standard(false) → ElseIf(true) runs → Disabled removed → Standard(false) new chain → Else runs
    expect(v('S15_if')).toBe(0);
    expect(v('S15_elseif')).toBe(1);
    expect(v('S15_disElse')).toBe(0);
    expect(v('S15_if2')).toBe(0);
    expect(v('S15_else')).toBe(1);

    // Scenario 16: Standalone Else → runs
    expect(v('S16_else')).toBe(1);

    // Scenario 17: Standalone ElseIf(false) acts as Standard(false) → Else runs
    expect(v('S17_elseif')).toBe(0);
    expect(v('S17_else')).toBe(1);

    // Scenario 18: Repeat with inner if/else - inner else runs each iteration
    expect(v('S18_innerIf')).toBe(0);
    expect(v('S18_innerElse')).toBe(1);

    // Scenario 19: Standard(true) → Else skipped → Repeat breaks chain → Else standalone → runs
    expect(v('S19_if')).toBe(1);
    expect(v('S19_else1')).toBe(0);
    expect(v('S19_else2')).toBe(1);

    // Scenario 20: Three disabled removed → Else standalone → runs
    expect(v('S20_dis1')).toBe(0);
    expect(v('S20_dis2')).toBe(0);
    expect(v('S20_dis3')).toBe(0);
    expect(v('S20_else')).toBe(1);

    // Scenario 21: Standard(false) → three disabled elses removed → Else runs
    expect(v('S21_if')).toBe(0);
    expect(v('S21_dis1')).toBe(0);
    expect(v('S21_dis2')).toBe(0);
    expect(v('S21_dis3')).toBe(0);
    expect(v('S21_else')).toBe(1);

    // Scenario 22: Standard(false) → ElseIf(true) runs with sub-events (inner chain)
    expect(v('S22_if')).toBe(0);
    expect(v('S22_elseif')).toBe(1);
    expect(v('S22_sub_if')).toBe(0);
    expect(v('S22_sub_else')).toBe(1);
    expect(v('S22_else')).toBe(0);

    // Scenario 23: Repeat with inner chain, then outer chain
    expect(v('S23_repIf')).toBe(1);
    expect(v('S23_repElse')).toBe(0);
    expect(v('S23_if')).toBe(0);
    expect(v('S23_else')).toBe(1);

    // Scenario 24: Standard(false) → first ElseIf(true) runs, second ElseIf skipped
    expect(v('S24_if')).toBe(0);
    expect(v('S24_elseif1')).toBe(1);
    expect(v('S24_elseif2')).toBe(0);
    expect(v('S24_else')).toBe(0);

    // Scenario 25: Standard(false) → disabled removed → ElseIf(false) → Else runs
    expect(v('S25_if')).toBe(0);
    expect(v('S25_disEi')).toBe(0);
    expect(v('S25_disElse')).toBe(0);
    expect(v('S25_elseif')).toBe(0);
    expect(v('S25_else')).toBe(1);

    // Scenario 26: Standard(uncond) runs → Standard(false) new chain → Else runs
    expect(v('S26_std1')).toBe(1);
    expect(v('S26_std2')).toBe(0);
    expect(v('S26_else')).toBe(1);

    // Scenario 27: Standard(false) → Else runs, with sub: repeat(if/else) + standard after
    expect(v('S27_if')).toBe(0);
    expect(v('S27_else')).toBe(1);
    expect(v('S27_rep_if')).toBe(0);
    expect(v('S27_rep_else')).toBe(1);
    expect(v('S27_after_rep')).toBe(1);
  });
});
