const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const {
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Disabled Events Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  // ── Helpers to build events concisely ──────────────────────────────────
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

  /** Standard event (unconditional) that sets `varName = value`. */
  const std = (varName, value, { conditions, subEvents } = {}) => ({
    type: 'BuiltinCommonInstructions::Standard',
    conditions: conditions || [],
    actions: [setVar(varName, value)],
    events: subEvents || [],
  });

  /** Standard event with a condition that is always false. */
  const stdFalse = (varName, value, opts = {}) =>
    std(varName, value, { ...opts, conditions: falseCondition });

  /** Standard event with a condition that is always true. */
  const stdTrue = (varName, value, opts = {}) =>
    std(varName, value, { ...opts, conditions: trueCondition });

  /** Else event (pure else or else-if depending on conditions). */
  const elseEv = (varName, value, { conditions, subEvents } = {}) => ({
    type: 'BuiltinCommonInstructions::Else',
    conditions: conditions || [],
    actions: [setVar(varName, value)],
    events: subEvents || [],
  });

  /** Else-if event with a condition that is always true. */
  const elseIfTrue = (varName, value, opts = {}) =>
    elseEv(varName, value, { ...opts, conditions: trueCondition });

  /** Else-if event with a condition that is always false. */
  const elseIfFalse = (varName, value, opts = {}) =>
    elseEv(varName, value, { ...opts, conditions: falseCondition });

  /** Repeat event that adds 1 to `varName` on each iteration. */
  const repeat = (times, subEvents) => ({
    type: 'BuiltinCommonInstructions::Repeat',
    repeatExpression: String(times),
    conditions: [],
    actions: [],
    events: subEvents || [],
  });

  /** While event: loops while Counter < limit, incrementing Counter each time. */
  const whileLoop = (limit, subEvents) => ({
    type: 'BuiltinCommonInstructions::While',
    whileConditions: [
      {
        type: { value: 'VarScene' },
        parameters: ['Counter', '<', String(limit)],
      },
    ],
    conditions: [],
    actions: [addVar('Counter', 1)],
    events: subEvents || [],
  });

  /** A no-op Repeat(1) to break else chains between scenarios. */
  const chainBreaker = () => repeat(1, []);

  /** Make an event disabled (returns a shallow copy with disabled: true). */
  const disabled = (event) => ({ ...event, disabled: true });

  // ── Test runner helper ─────────────────────────────────────────────────

  /**
   * Compiles and runs a serialized event list, returns a function
   * that retrieves scene variable values (0 if the variable was never set).
   */
  function runEvents(events, options = {}) {
    const serializerElement = gd.Serializer.fromJSObject(events);
    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      options
    );
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    return (name) =>
      runtimeScene.getVariables().has(name)
        ? runtimeScene.getVariables().get(name).getAsNumber()
        : 0;
  }

  // ── Individual tests ───────────────────────────────────────────────────

  it('disabled Standard between Standard(true) and Else is transparent', function () {
    const v = runEvents([
      stdTrue('If', 1),
      disabled(std('Dis', 99)),
      elseEv('Else', 1),
    ]);
    expect(v('If')).toBe(1);
    expect(v('Dis')).toBe(0);
    expect(v('Else')).toBe(0);
  });

  it('disabled Standard between Standard(false) and Else is transparent', function () {
    const v = runEvents([
      stdFalse('If', 1),
      disabled(std('Dis', 99)),
      elseEv('Else', 1),
    ]);
    expect(v('If')).toBe(0);
    expect(v('Dis')).toBe(0);
    expect(v('Else')).toBe(1);
  });

  it('multiple disabled events between Standard(true) and Else are transparent', function () {
    const v = runEvents([
      stdTrue('If', 1),
      disabled(std('Dis1', 99)),
      disabled(stdFalse('Dis2', 99)),
      disabled(elseEv('Dis3', 99)),
      elseEv('Else', 1),
    ]);
    expect(v('If')).toBe(1);
    expect(v('Dis1')).toBe(0);
    expect(v('Dis2')).toBe(0);
    expect(v('Dis3')).toBe(0);
    expect(v('Else')).toBe(0);
  });

  it('multiple disabled events between Standard(false) and Else are transparent', function () {
    const v = runEvents([
      stdFalse('If', 1),
      disabled(std('Dis1', 99)),
      disabled(stdFalse('Dis2', 99)),
      disabled(elseEv('Dis3', 99)),
      elseEv('Else', 1),
    ]);
    expect(v('If')).toBe(0);
    expect(v('Dis1')).toBe(0);
    expect(v('Dis2')).toBe(0);
    expect(v('Dis3')).toBe(0);
    expect(v('Else')).toBe(1);
  });

  it('disabled Else between Standard(false) and Else is transparent', function () {
    const v = runEvents([
      stdFalse('If', 1),
      disabled(elseIfTrue('DisElse', 99)),
      elseEv('Else', 1),
    ]);
    expect(v('If')).toBe(0);
    expect(v('DisElse')).toBe(0);
    expect(v('Else')).toBe(1);
  });

  it('disabled Else between Standard(true) and Else is transparent', function () {
    const v = runEvents([
      stdTrue('If', 1),
      disabled(elseEv('DisElse', 99)),
      elseEv('Else', 1),
    ]);
    expect(v('If')).toBe(1);
    expect(v('DisElse')).toBe(0);
    expect(v('Else')).toBe(0);
  });

  it('all disabled before Else makes it standalone (runs)', function () {
    const v = runEvents([
      chainBreaker(),
      disabled(std('Dis1', 99)),
      disabled(stdFalse('Dis2', 99)),
      elseEv('Else', 1),
    ]);
    expect(v('Dis1')).toBe(0);
    expect(v('Dis2')).toBe(0);
    expect(v('Else')).toBe(1);
  });

  it('disabled event in an else-if chain preserves chain semantics', function () {
    const v = runEvents([
      stdFalse('If', 1),
      disabled(elseIfTrue('DisEi', 99)),
      elseIfFalse('Ei', 1),
      elseEv('Else', 1),
    ]);
    expect(v('If')).toBe(0);
    expect(v('DisEi')).toBe(0);
    expect(v('Ei')).toBe(0);
    expect(v('Else')).toBe(1);
  });

  it('disabled event between two Else events in a chain is transparent', function () {
    const v = runEvents([
      stdFalse('If', 1),
      elseIfFalse('Ei1', 1),
      disabled(elseIfTrue('DisEi', 99)),
      elseIfTrue('Ei2', 1),
      elseEv('Else', 1),
    ]);
    expect(v('If')).toBe(0);
    expect(v('Ei1')).toBe(0);
    expect(v('DisEi')).toBe(0);
    expect(v('Ei2')).toBe(1);
    expect(v('Else')).toBe(0);
  });

  it('disabled Standard does not break an else chain', function () {
    // Standard(false) → ElseIf(false) → [disabled Std] → Else
    // The disabled Std should not break the chain; Else runs.
    const v = runEvents([
      stdFalse('If', 1),
      elseIfFalse('Ei', 1),
      disabled(std('DisStd', 99)),
      elseEv('Else', 1),
    ]);
    expect(v('If')).toBe(0);
    expect(v('Ei')).toBe(0);
    expect(v('DisStd')).toBe(0);
    expect(v('Else')).toBe(1);
  });

  it('disabled event inside Repeat sub-events is transparent', function () {
    const v = runEvents([
      repeat(3, [
        stdFalse('RepIf', 1),
        disabled(std('RepDis', 99)),
        elseEv('RepElse', 0),
      ]),
    ]);
    expect(v('RepIf')).toBe(0);
    expect(v('RepDis')).toBe(0);
    // Else runs on every iteration; last write wins with =0,
    // but let's use addVar to count executions instead:
  });

  it('disabled event inside Repeat does not affect if/else inside', function () {
    // Use addVar to count how many times each branch runs over 3 iterations.
    const events = [
      {
        type: 'BuiltinCommonInstructions::Repeat',
        repeatExpression: '3',
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: falseCondition,
            actions: [addVar('RepIf', 1)],
            events: [],
          },
          { ...std('RepDis', 99), disabled: true },
          {
            type: 'BuiltinCommonInstructions::Else',
            conditions: [],
            actions: [addVar('RepElse', 1)],
            events: [],
          },
        ],
      },
    ];
    const v = runEvents(events);
    expect(v('RepIf')).toBe(0);
    expect(v('RepDis')).toBe(0);
    expect(v('RepElse')).toBe(3);
  });

  it('disabled event inside While sub-events is transparent', function () {
    // While Counter < 3: increment Counter, track if/else.
    const events = [
      {
        type: 'BuiltinCommonInstructions::While',
        whileConditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '<', '3'],
          },
        ],
        conditions: [],
        actions: [addVar('Counter', 1)],
        events: [
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: falseCondition,
            actions: [addVar('WIf', 1)],
            events: [],
          },
          { ...std('WDis', 99), disabled: true },
          {
            type: 'BuiltinCommonInstructions::Else',
            conditions: [],
            actions: [addVar('WElse', 1)],
            events: [],
          },
        ],
      },
    ];
    const v = runEvents(events);
    expect(v('Counter')).toBe(3);
    expect(v('WIf')).toBe(0);
    expect(v('WDis')).toBe(0);
    expect(v('WElse')).toBe(3);
  });

  it('disabled events in sub-events of an Else are transparent', function () {
    const v = runEvents([
      stdFalse('If', 1),
      elseEv('Else', 1, {
        subEvents: [
          stdFalse('SubIf', 1),
          disabled(std('SubDis', 99)),
          elseEv('SubElse', 1),
        ],
      }),
    ]);
    expect(v('If')).toBe(0);
    expect(v('Else')).toBe(1);
    expect(v('SubIf')).toBe(0);
    expect(v('SubDis')).toBe(0);
    expect(v('SubElse')).toBe(1);
  });

  it('disabled events in sub-events of a Standard are transparent', function () {
    const v = runEvents([
      std('Parent', 1, {
        subEvents: [
          stdTrue('SubIf', 1),
          disabled(elseIfTrue('SubDis', 99)),
          elseEv('SubElse', 1),
        ],
      }),
    ]);
    expect(v('Parent')).toBe(1);
    expect(v('SubIf')).toBe(1);
    expect(v('SubDis')).toBe(0);
    expect(v('SubElse')).toBe(0);
  });

  // ── Stress test: insert disabled events at every position ─────────────

  it('stress test: inserting disabled events at every position does not change outcomes', function () {
    // A rich base scenario with various event patterns.
    // We will run it once without disabled events, then once with disabled
    // events inserted at every possible position, and verify identical results.

    const baseEvents = [
      // Chain 1: Standard(false) → ElseIf(false) → ElseIf(true) → Else
      stdFalse('C1_if', 1),
      elseIfFalse('C1_ei1', 1),
      elseIfTrue('C1_ei2', 1),
      elseEv('C1_else', 1),

      // Chain 2: Standard(true) → Else
      stdTrue('C2_if', 1),
      elseEv('C2_else', 1),

      // Chain 3: Repeat with inner if/else
      repeat(2, [stdFalse('C3_repIf', 1), elseEv('C3_repElse', 0)]),

      // Chain 4: Standard(unconditional) → Standard(false) → ElseIf(false) → Else
      std('C4_std1', 1),
      stdFalse('C4_std2', 1),
      elseIfFalse('C4_ei', 1),
      elseEv('C4_else', 1),

      // Chain 5: Standard(false) → Else with sub-events containing a chain
      stdFalse('C5_if', 1),
      elseEv('C5_else', 1, {
        subEvents: [
          stdFalse('C5_subIf', 1),
          elseIfTrue('C5_subEi', 1),
          elseEv('C5_subElse', 1),
        ],
      }),

      // Chain 6: While loop with inner chain
      whileLoop(2, [stdFalse('C6_wIf', 1), elseEv('C6_wElse', 0)]),

      // Chain 7: Standalone events after chains
      std('C7_after', 1),
    ];

    const variableNames = [
      'C1_if',
      'C1_ei1',
      'C1_ei2',
      'C1_else',
      'C2_if',
      'C2_else',
      'C3_repIf',
      'C3_repElse',
      'C4_std1',
      'C4_std2',
      'C4_ei',
      'C4_else',
      'C5_if',
      'C5_else',
      'C5_subIf',
      'C5_subEi',
      'C5_subElse',
      'C6_wIf',
      'C6_wElse',
      'C7_after',
    ];

    // Run the base scenario to capture expected values.
    const vBase = runEvents(baseEvents);
    const expected = {};
    for (const name of variableNames) {
      expected[name] = vBase(name);
    }

    // Sanity-check a few key results to make sure the base works.
    expect(expected['C1_ei2']).toBe(1);
    expect(expected['C1_else']).toBe(0);
    expect(expected['C2_if']).toBe(1);
    expect(expected['C2_else']).toBe(0);
    expect(expected['C4_else']).toBe(1);
    expect(expected['C5_else']).toBe(1);
    expect(expected['C5_subEi']).toBe(1);
    expect(expected['C7_after']).toBe(1);

    // Various disabled events to insert.
    const disabledVariants = [
      disabled(std('_noop_', 99)),
      disabled(stdFalse('_noop_', 99)),
      disabled(stdTrue('_noop_', 99)),
      disabled(elseEv('_noop_', 99)),
      disabled(elseIfTrue('_noop_', 99)),
      disabled(elseIfFalse('_noop_', 99)),
    ];

    /**
     * Insert a disabled event at position `pos` in the top-level list.
     * Returns a new list with the disabled event inserted.
     */
    function insertAt(eventsList, pos, disabledEvent) {
      const copy = [...eventsList];
      copy.splice(pos, 0, disabledEvent);
      return copy;
    }

    // For every position in the base event list (including before and after),
    // insert each disabled variant and verify identical results.
    for (let pos = 0; pos <= baseEvents.length; pos++) {
      for (const disEv of disabledVariants) {
        const modifiedEvents = insertAt(baseEvents, pos, disEv);
        const v = runEvents(modifiedEvents);
        for (const name of variableNames) {
          if (v(name) !== expected[name]) {
            // Provide a useful failure message.
            expect({
              variable: name,
              position: pos,
              disabledType: disEv.type,
              actual: v(name),
              expected: expected[name],
            }).toEqual({
              variable: name,
              position: pos,
              disabledType: disEv.type,
              actual: expected[name],
              expected: expected[name],
            });
          }
        }
      }
    }
  });

  it('stress test: inserting disabled events at every position in sub-events does not change outcomes', function () {
    // Focus on sub-events: the base has a parent Standard event whose
    // sub-events contain a rich if/else chain.
    const baseSubEvents = [
      stdFalse('S_if', 1),
      elseIfFalse('S_ei1', 1),
      elseIfTrue('S_ei2', 1, {
        subEvents: [stdFalse('S_nested_if', 1), elseEv('S_nested_else', 1)],
      }),
      elseEv('S_else', 1),
      std('S_after', 1),
    ];

    const baseEvents = [std('Parent', 1, { subEvents: baseSubEvents })];

    const variableNames = [
      'Parent',
      'S_if',
      'S_ei1',
      'S_ei2',
      'S_nested_if',
      'S_nested_else',
      'S_else',
      'S_after',
    ];

    const vBase = runEvents(baseEvents);
    const expected = {};
    for (const name of variableNames) {
      expected[name] = vBase(name);
    }

    expect(expected['Parent']).toBe(1);
    expect(expected['S_ei2']).toBe(1);
    expect(expected['S_nested_else']).toBe(1);
    expect(expected['S_else']).toBe(0);
    expect(expected['S_after']).toBe(1);

    const disabledVariants = [
      disabled(std('_noop_', 99)),
      disabled(elseEv('_noop_', 99)),
      disabled(elseIfTrue('_noop_', 99)),
    ];

    for (let pos = 0; pos <= baseSubEvents.length; pos++) {
      for (const disEv of disabledVariants) {
        const modifiedSubEvents = [...baseSubEvents];
        modifiedSubEvents.splice(pos, 0, disEv);
        const modifiedEvents = [
          std('Parent', 1, { subEvents: modifiedSubEvents }),
        ];
        const v = runEvents(modifiedEvents);
        for (const name of variableNames) {
          if (v(name) !== expected[name]) {
            expect({
              variable: name,
              position: pos,
              disabledType: disEv.type,
              actual: v(name),
              expected: expected[name],
            }).toEqual({
              variable: name,
              position: pos,
              disabledType: disEv.type,
              actual: expected[name],
              expected: expected[name],
            });
          }
        }
      }
    }
  });

  it('stress test: inserting disabled events at every position inside Repeat does not change outcomes', function () {
    const baseRepeatBody = [
      stdFalse('R_if', 1),
      elseIfFalse('R_ei', 1),
      elseEv('R_else', 0),
      std('R_after', 0),
    ];

    const baseEvents = [repeat(3, baseRepeatBody)];

    const variableNames = ['R_if', 'R_ei', 'R_else', 'R_after'];

    const vBase = runEvents(baseEvents);
    const expected = {};
    for (const name of variableNames) {
      expected[name] = vBase(name);
    }

    const disabledVariants = [
      disabled(std('_noop_', 99)),
      disabled(elseEv('_noop_', 99)),
      disabled(elseIfTrue('_noop_', 99)),
    ];

    for (let pos = 0; pos <= baseRepeatBody.length; pos++) {
      for (const disEv of disabledVariants) {
        const modifiedBody = [...baseRepeatBody];
        modifiedBody.splice(pos, 0, disEv);
        const modifiedEvents = [repeat(3, modifiedBody)];
        const v = runEvents(modifiedEvents);
        for (const name of variableNames) {
          if (v(name) !== expected[name]) {
            expect({
              variable: name,
              position: pos,
              disabledType: disEv.type,
              actual: v(name),
              expected: expected[name],
            }).toEqual({
              variable: name,
              position: pos,
              disabledType: disEv.type,
              actual: expected[name],
              expected: expected[name],
            });
          }
        }
      }
    }
  });

  it('stress test: inserting disabled events at every position inside While does not change outcomes', function () {
    const baseWhileBody = [
      stdFalse('W_if', 1),
      elseIfTrue('W_ei', 0),
      elseEv('W_else', 1),
    ];

    const baseEvents = [whileLoop(3, baseWhileBody)];

    const variableNames = ['Counter', 'W_if', 'W_ei', 'W_else'];

    const vBase = runEvents(baseEvents);
    const expected = {};
    for (const name of variableNames) {
      expected[name] = vBase(name);
    }

    expect(expected['Counter']).toBe(3);
    expect(expected['W_ei']).toBe(0);
    expect(expected['W_else']).toBe(0);

    const disabledVariants = [
      disabled(std('_noop_', 99)),
      disabled(elseEv('_noop_', 99)),
    ];

    for (let pos = 0; pos <= baseWhileBody.length; pos++) {
      for (const disEv of disabledVariants) {
        const modifiedBody = [...baseWhileBody];
        modifiedBody.splice(pos, 0, disEv);
        // Each While test modifies Counter, so we check all vars.
        // Counter must be reset between runs, but since runEvents
        // creates a fresh runtimeScene each time, this is automatic.
        const modifiedEvents = [whileLoop(3, modifiedBody)];
        const v = runEvents(modifiedEvents);
        for (const name of variableNames) {
          if (v(name) !== expected[name]) {
            expect({
              variable: name,
              position: pos,
              disabledType: disEv.type,
              actual: v(name),
              expected: expected[name],
            }).toEqual({
              variable: name,
              position: pos,
              disabledType: disEv.type,
              actual: expected[name],
              expected: expected[name],
            });
          }
        }
      }
    }
  });

  it('stress test: multiple disabled events inserted at every position simultaneously', function () {
    // Insert a cluster of 3 disabled events at each position.
    const baseEvents = [
      stdFalse('M_if', 1),
      elseIfFalse('M_ei1', 1),
      elseIfTrue('M_ei2', 1),
      elseEv('M_else', 1),
      std('M_after', 1),
    ];

    const variableNames = ['M_if', 'M_ei1', 'M_ei2', 'M_else', 'M_after'];

    const vBase = runEvents(baseEvents);
    const expected = {};
    for (const name of variableNames) {
      expected[name] = vBase(name);
    }

    expect(expected['M_ei2']).toBe(1);
    expect(expected['M_else']).toBe(0);
    expect(expected['M_after']).toBe(1);

    const disabledCluster = [
      disabled(std('_n1_', 99)),
      disabled(elseEv('_n2_', 99)),
      disabled(stdTrue('_n3_', 99)),
    ];

    for (let pos = 0; pos <= baseEvents.length; pos++) {
      const modified = [...baseEvents];
      modified.splice(pos, 0, ...disabledCluster);
      const v = runEvents(modified);
      for (const name of variableNames) {
        if (v(name) !== expected[name]) {
          expect({
            variable: name,
            position: pos,
            actual: v(name),
            expected: expected[name],
          }).toEqual({
            variable: name,
            position: pos,
            actual: expected[name],
            expected: expected[name],
          });
        }
      }
    }
  });
});
