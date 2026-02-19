const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const {
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Transparent Events Code Generation integration tests', function () {
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

  const std = (varName, value, { conditions, subEvents } = {}) => ({
    type: 'BuiltinCommonInstructions::Standard',
    conditions: conditions || [],
    actions: [setVar(varName, value)],
    events: subEvents || [],
  });

  const stdFalse = (varName, value, opts = {}) =>
    std(varName, value, { ...opts, conditions: falseCondition });

  const stdTrue = (varName, value, opts = {}) =>
    std(varName, value, { ...opts, conditions: trueCondition });

  const elseEv = (varName, value, { conditions, subEvents } = {}) => ({
    type: 'BuiltinCommonInstructions::Else',
    conditions: conditions || [],
    actions: [setVar(varName, value)],
    events: subEvents || [],
  });

  const elseIfTrue = (varName, value, opts = {}) =>
    elseEv(varName, value, { ...opts, conditions: trueCondition });

  const elseIfFalse = (varName, value, opts = {}) =>
    elseEv(varName, value, { ...opts, conditions: falseCondition });

  const repeat = (times, subEvents) => ({
    type: 'BuiltinCommonInstructions::Repeat',
    repeatExpression: String(times),
    conditions: [],
    actions: [],
    events: subEvents || [],
  });

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

  const chainBreaker = () => repeat(1, []);

  const disabled = (event) => ({ ...event, disabled: true });

  const comment = () => ({ type: 'BuiltinCommonInstructions::Comment' });

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

  // ── Modes: both disabled events and comment events must be transparent ─

  const transparentEventModes = [
    {
      label: 'disabled events',
      // Wraps any event to make it transparent (disabled).
      wrap: (event) => disabled(event),
      // Various transparent events to insert in stress tests.
      variants: () => [
        disabled(std('_noop_', 99)),
        disabled(stdFalse('_noop_', 99)),
        disabled(stdTrue('_noop_', 99)),
        disabled(elseEv('_noop_', 99)),
        disabled(elseIfTrue('_noop_', 99)),
        disabled(elseIfFalse('_noop_', 99)),
      ],
      // A cluster of transparent events for multi-insert stress test.
      cluster: () => [
        disabled(std('_n1_', 99)),
        disabled(elseEv('_n2_', 99)),
        disabled(stdTrue('_n3_', 99)),
      ],
    },
    {
      label: 'comment events',
      wrap: () => comment(),
      variants: () => [comment()],
      cluster: () => [comment(), comment(), comment()],
    },
  ];

  transparentEventModes.forEach(({ label, wrap, variants, cluster }) => {
    describe(`with ${label}`, function () {
      // ── Individual tests ─────────────────────────────────────────

      it('transparent event between Standard(true) and Else does not affect chain', function () {
        const v = runEvents([
          stdTrue('If', 1),
          wrap(std('T', 99)),
          elseEv('Else', 1),
        ]);
        expect(v('If')).toBe(1);
        expect(v('T')).toBe(0);
        expect(v('Else')).toBe(0);
      });

      it('transparent event between Standard(false) and Else does not affect chain', function () {
        const v = runEvents([
          stdFalse('If', 1),
          wrap(std('T', 99)),
          elseEv('Else', 1),
        ]);
        expect(v('If')).toBe(0);
        expect(v('T')).toBe(0);
        expect(v('Else')).toBe(1);
      });

      it('multiple transparent events between Standard(true) and Else do not affect chain', function () {
        const v = runEvents([
          stdTrue('If', 1),
          wrap(std('T1', 99)),
          wrap(stdFalse('T2', 99)),
          wrap(elseEv('T3', 99)),
          elseEv('Else', 1),
        ]);
        expect(v('If')).toBe(1);
        expect(v('T1')).toBe(0);
        expect(v('T2')).toBe(0);
        expect(v('T3')).toBe(0);
        expect(v('Else')).toBe(0);
      });

      it('multiple transparent events between Standard(false) and Else do not affect chain', function () {
        const v = runEvents([
          stdFalse('If', 1),
          wrap(std('T1', 99)),
          wrap(stdFalse('T2', 99)),
          wrap(elseEv('T3', 99)),
          elseEv('Else', 1),
        ]);
        expect(v('If')).toBe(0);
        expect(v('T1')).toBe(0);
        expect(v('T2')).toBe(0);
        expect(v('T3')).toBe(0);
        expect(v('Else')).toBe(1);
      });

      it('transparent Else between Standard(false) and Else does not affect chain', function () {
        const v = runEvents([
          stdFalse('If', 1),
          wrap(elseIfTrue('T', 99)),
          elseEv('Else', 1),
        ]);
        expect(v('If')).toBe(0);
        expect(v('T')).toBe(0);
        expect(v('Else')).toBe(1);
      });

      it('transparent Else between Standard(true) and Else does not affect chain', function () {
        const v = runEvents([
          stdTrue('If', 1),
          wrap(elseEv('T', 99)),
          elseEv('Else', 1),
        ]);
        expect(v('If')).toBe(1);
        expect(v('T')).toBe(0);
        expect(v('Else')).toBe(0);
      });

      it('all transparent events before Else makes it standalone (runs)', function () {
        const v = runEvents([
          chainBreaker(),
          wrap(std('T1', 99)),
          wrap(stdFalse('T2', 99)),
          elseEv('Else', 1),
        ]);
        expect(v('T1')).toBe(0);
        expect(v('T2')).toBe(0);
        expect(v('Else')).toBe(1);
      });

      it('transparent event in an else-if chain preserves chain semantics', function () {
        const v = runEvents([
          stdFalse('If', 1),
          wrap(elseIfTrue('T', 99)),
          elseIfFalse('Ei', 1),
          elseEv('Else', 1),
        ]);
        expect(v('If')).toBe(0);
        expect(v('T')).toBe(0);
        expect(v('Ei')).toBe(0);
        expect(v('Else')).toBe(1);
      });

      it('transparent event between two Else events in a chain is transparent', function () {
        const v = runEvents([
          stdFalse('If', 1),
          elseIfFalse('Ei1', 1),
          wrap(elseIfTrue('T', 99)),
          elseIfTrue('Ei2', 1),
          elseEv('Else', 1),
        ]);
        expect(v('If')).toBe(0);
        expect(v('Ei1')).toBe(0);
        expect(v('T')).toBe(0);
        expect(v('Ei2')).toBe(1);
        expect(v('Else')).toBe(0);
      });

      it('transparent Standard does not break an else chain', function () {
        const v = runEvents([
          stdFalse('If', 1),
          elseIfFalse('Ei', 1),
          wrap(std('T', 99)),
          elseEv('Else', 1),
        ]);
        expect(v('If')).toBe(0);
        expect(v('Ei')).toBe(0);
        expect(v('T')).toBe(0);
        expect(v('Else')).toBe(1);
      });

      it('transparent event inside Repeat does not affect if/else inside', function () {
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
              wrap(std('T', 99)),
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
        expect(v('T')).toBe(0);
        expect(v('RepElse')).toBe(3);
      });

      it('transparent event inside While sub-events does not affect if/else inside', function () {
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
              wrap(std('T', 99)),
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
        expect(v('T')).toBe(0);
        expect(v('WElse')).toBe(3);
      });

      it('transparent events in sub-events of an Else do not affect chains', function () {
        const v = runEvents([
          stdFalse('If', 1),
          elseEv('Else', 1, {
            subEvents: [
              stdFalse('SubIf', 1),
              wrap(std('T', 99)),
              elseEv('SubElse', 1),
            ],
          }),
        ]);
        expect(v('If')).toBe(0);
        expect(v('Else')).toBe(1);
        expect(v('SubIf')).toBe(0);
        expect(v('T')).toBe(0);
        expect(v('SubElse')).toBe(1);
      });

      it('transparent events in sub-events of a Standard do not affect chains', function () {
        const v = runEvents([
          std('Parent', 1, {
            subEvents: [
              stdTrue('SubIf', 1),
              wrap(elseIfTrue('T', 99)),
              elseEv('SubElse', 1),
            ],
          }),
        ]);
        expect(v('Parent')).toBe(1);
        expect(v('SubIf')).toBe(1);
        expect(v('T')).toBe(0);
        expect(v('SubElse')).toBe(0);
      });

      // ── Stress tests ───────────────────────────────────────────

      it('stress test: inserting at every position in top-level events does not change outcomes', function () {
        const baseEvents = [
          stdFalse('C1_if', 1),
          elseIfFalse('C1_ei1', 1),
          elseIfTrue('C1_ei2', 1),
          elseEv('C1_else', 1),

          stdTrue('C2_if', 1),
          elseEv('C2_else', 1),

          repeat(2, [
            stdFalse('C3_repIf', 1),
            elseEv('C3_repElse', 0),
          ]),

          std('C4_std1', 1),
          stdFalse('C4_std2', 1),
          elseIfFalse('C4_ei', 1),
          elseEv('C4_else', 1),

          stdFalse('C5_if', 1),
          elseEv('C5_else', 1, {
            subEvents: [
              stdFalse('C5_subIf', 1),
              elseIfTrue('C5_subEi', 1),
              elseEv('C5_subElse', 1),
            ],
          }),

          whileLoop(2, [
            stdFalse('C6_wIf', 1),
            elseEv('C6_wElse', 0),
          ]),

          std('C7_after', 1),
        ];

        const variableNames = [
          'C1_if', 'C1_ei1', 'C1_ei2', 'C1_else',
          'C2_if', 'C2_else',
          'C3_repIf', 'C3_repElse',
          'C4_std1', 'C4_std2', 'C4_ei', 'C4_else',
          'C5_if', 'C5_else', 'C5_subIf', 'C5_subEi', 'C5_subElse',
          'C6_wIf', 'C6_wElse',
          'C7_after',
        ];

        const vBase = runEvents(baseEvents);
        const expected = {};
        for (const name of variableNames) {
          expected[name] = vBase(name);
        }

        expect(expected['C1_ei2']).toBe(1);
        expect(expected['C1_else']).toBe(0);
        expect(expected['C2_if']).toBe(1);
        expect(expected['C2_else']).toBe(0);
        expect(expected['C4_else']).toBe(1);
        expect(expected['C5_else']).toBe(1);
        expect(expected['C5_subEi']).toBe(1);
        expect(expected['C7_after']).toBe(1);

        const allVariants = variants();

        for (let pos = 0; pos <= baseEvents.length; pos++) {
          for (const transparentEv of allVariants) {
            const modified = [...baseEvents];
            modified.splice(pos, 0, transparentEv);
            const v = runEvents(modified);
            for (const name of variableNames) {
              if (v(name) !== expected[name]) {
                expect({
                  variable: name,
                  position: pos,
                  insertedType: transparentEv.type,
                  actual: v(name),
                  expected: expected[name],
                }).toEqual({
                  variable: name,
                  position: pos,
                  insertedType: transparentEv.type,
                  actual: expected[name],
                  expected: expected[name],
                });
              }
            }
          }
        }
      });

      it('stress test: inserting at every position in sub-events does not change outcomes', function () {
        const baseSubEvents = [
          stdFalse('S_if', 1),
          elseIfFalse('S_ei1', 1),
          elseIfTrue('S_ei2', 1, {
            subEvents: [
              stdFalse('S_nested_if', 1),
              elseEv('S_nested_else', 1),
            ],
          }),
          elseEv('S_else', 1),
          std('S_after', 1),
        ];

        const baseEvents = [
          std('Parent', 1, { subEvents: baseSubEvents }),
        ];

        const variableNames = [
          'Parent', 'S_if', 'S_ei1', 'S_ei2', 'S_nested_if',
          'S_nested_else', 'S_else', 'S_after',
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

        const allVariants = variants();

        for (let pos = 0; pos <= baseSubEvents.length; pos++) {
          for (const transparentEv of allVariants) {
            const modifiedSubEvents = [...baseSubEvents];
            modifiedSubEvents.splice(pos, 0, transparentEv);
            const modifiedEvents = [
              std('Parent', 1, { subEvents: modifiedSubEvents }),
            ];
            const v = runEvents(modifiedEvents);
            for (const name of variableNames) {
              if (v(name) !== expected[name]) {
                expect({
                  variable: name,
                  position: pos,
                  insertedType: transparentEv.type,
                  actual: v(name),
                  expected: expected[name],
                }).toEqual({
                  variable: name,
                  position: pos,
                  insertedType: transparentEv.type,
                  actual: expected[name],
                  expected: expected[name],
                });
              }
            }
          }
        }
      });

      it('stress test: inserting at every position inside Repeat does not change outcomes', function () {
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

        const allVariants = variants();

        for (let pos = 0; pos <= baseRepeatBody.length; pos++) {
          for (const transparentEv of allVariants) {
            const modifiedBody = [...baseRepeatBody];
            modifiedBody.splice(pos, 0, transparentEv);
            const modifiedEvents = [repeat(3, modifiedBody)];
            const v = runEvents(modifiedEvents);
            for (const name of variableNames) {
              if (v(name) !== expected[name]) {
                expect({
                  variable: name,
                  position: pos,
                  insertedType: transparentEv.type,
                  actual: v(name),
                  expected: expected[name],
                }).toEqual({
                  variable: name,
                  position: pos,
                  insertedType: transparentEv.type,
                  actual: expected[name],
                  expected: expected[name],
                });
              }
            }
          }
        }
      });

      it('stress test: inserting at every position inside While does not change outcomes', function () {
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

        const allVariants = variants();

        for (let pos = 0; pos <= baseWhileBody.length; pos++) {
          for (const transparentEv of allVariants) {
            const modifiedBody = [...baseWhileBody];
            modifiedBody.splice(pos, 0, transparentEv);
            const modifiedEvents = [whileLoop(3, modifiedBody)];
            const v = runEvents(modifiedEvents);
            for (const name of variableNames) {
              if (v(name) !== expected[name]) {
                expect({
                  variable: name,
                  position: pos,
                  insertedType: transparentEv.type,
                  actual: v(name),
                  expected: expected[name],
                }).toEqual({
                  variable: name,
                  position: pos,
                  insertedType: transparentEv.type,
                  actual: expected[name],
                  expected: expected[name],
                });
              }
            }
          }
        }
      });

      it('stress test: multiple transparent events inserted at every position simultaneously', function () {
        const baseEvents = [
          stdFalse('M_if', 1),
          elseIfFalse('M_ei1', 1),
          elseIfTrue('M_ei2', 1),
          elseEv('M_else', 1),
          std('M_after', 1),
        ];

        const variableNames = [
          'M_if', 'M_ei1', 'M_ei2', 'M_else', 'M_after',
        ];

        const vBase = runEvents(baseEvents);
        const expected = {};
        for (const name of variableNames) {
          expected[name] = vBase(name);
        }

        expect(expected['M_ei2']).toBe(1);
        expect(expected['M_else']).toBe(0);
        expect(expected['M_after']).toBe(1);

        const clusterEvents = cluster();

        for (let pos = 0; pos <= baseEvents.length; pos++) {
          const modified = [...baseEvents];
          modified.splice(pos, 0, ...clusterEvents);
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
  });
});
