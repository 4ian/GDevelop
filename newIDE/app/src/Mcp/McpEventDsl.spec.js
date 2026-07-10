// @flow
import {
  compileEventsDsl,
  getSerializedEventsRevision,
  normalizeEventDslArguments,
} from './McpEventDsl';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

const gd: libGDevelop = global.gd;

describe('McpEventDsl', () => {
  let project: gdProject;

  beforeEach(() => {
    project = gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Level1', 0);
  });

  afterEach(() => {
    project.delete();
  });

  it('compiles grouped events with named parameters and generated ids', () => {
    const result = compileEventsDsl({
      project,
      eventIdPrefix: 'level-init',
      eventsDsl: [
        {
          kind: 'group',
          name: 'Initialization',
          children: [
            {
              kind: 'standard',
              variables: { Damage: 0, Armed: false },
              conditions: [{ type: 'SceneJustBegins' }],
              actions: [
                {
                  type: 'SetNumberVariable',
                  parameters: {
                    variable: 'Damage',
                    modification_sign: '=',
                    value: 25,
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    const group = result.serializedEvents[0];
    expect(group.type).toBe('BuiltinCommonInstructions::Group');
    expect(group.name).toBe('Initialization');
    expect(group.aiGeneratedEventId).toMatch(/^level-init-/);
    expect([group.colorR, group.colorG, group.colorB]).not.toEqual([
      74,
      176,
      228,
    ]);

    const event = group.events[0];
    expect(event.type).toBe('BuiltinCommonInstructions::Standard');
    expect(event.aiGeneratedEventId).toMatch(/^level-init-/);
    expect(event.variables).toEqual([
      { name: 'Damage', type: 'number', value: 0 },
      { name: 'Armed', type: 'boolean', value: false },
    ]);
    expect(event.actions[0]).toEqual({
      type: { value: 'SetNumberVariable' },
      parameters: ['Damage', '=', '25'],
    });
    expect(result.eventIds).toHaveLength(2);
  });

  it('compiles logical condition shorthands into subInstructions', () => {
    const result = compileEventsDsl({
      project,
      eventIdPrefix: 'input',
      eventsDsl: [
        {
          kind: 'standard',
          conditions: [
            {
              any: [
                { type: 'KeyFromTextPressed', parameters: { key: 'Left' } },
                { type: 'KeyFromTextPressed', parameters: { key: 'a' } },
              ],
            },
          ],
          actions: [],
        },
      ],
    });

    const condition = result.serializedEvents[0].conditions[0];
    expect(condition.type.value).toBe('BuiltinCommonInstructions::Or');
    expect(condition.subInstructions).toHaveLength(2);
    expect(condition).not.toHaveProperty('conditions');
  });

  it('uses stable AI-friendly names for comparison parameters', () => {
    const result = compileEventsDsl({
      project,
      eventsDsl: {
        kind: 'standard',
        conditions: [
          {
            type: 'NumberVariable',
            parameters: {
              variable: 'Score',
              comparison_sign: '>=',
              value: 10,
            },
          },
        ],
      },
    });

    expect(result.warnings).toEqual([]);
    expect(result.serializedEvents[0].conditions[0].parameters).toEqual([
      'Score',
      '>=',
      '10',
    ]);
  });

  it('normalizes simple operation aliases and event targets', () => {
    const result = normalizeEventDslArguments({
      project,
      args: {
        scene_name: 'Level1',
        operations: [
          {
            op: 'insert_after',
            target: { event_id: 'initialization' },
            events: [{ kind: 'comment', text: 'Spawn wave one.' }],
          },
        ],
      },
    });

    expect(result.args.event_changes[0].operation_name).toBe(
      'insert_after_event'
    );
    expect(result.args.event_changes[0].operation_target_event).toBe(
      'initialization'
    );
    expect(result.args.event_changes[0].generated_events[0].type).toBe(
      'BuiltinCommonInstructions::Comment'
    );
  });

  it('accepts event_kind for a single event DSL object', () => {
    const result = compileEventsDsl({
      project,
      eventsDsl: {
        event_kind: 'comment',
        text: 'Single compact event.',
      },
    });

    expect(result.serializedEvents).toEqual([
      expect.objectContaining({
        type: 'BuiltinCommonInstructions::Comment',
        comment: 'Single compact event.',
      }),
    ]);
  });

  it('round-trips every compact event kind through libGDevelop', () => {
    const result = compileEventsDsl({
      project,
      eventIdPrefix: 'all-kinds',
      eventsDsl: [
        { kind: 'comment', text: 'All event kinds.' },
        { kind: 'repeat', times: 2 },
        {
          kind: 'while',
          while_conditions: [
            {
              type: 'NumberVariable',
              parameters: {
                variable: 'Remaining',
                comparison_sign: '>',
                value: 0,
              },
            },
          ],
        },
        { kind: 'for_each', object: 'Enemy' },
        {
          kind: 'for_each_child_variable',
          iterable: 'Inventory',
          value_iterator: 'Item',
          key_iterator: 'ItemName',
        },
        { kind: 'else' },
        { kind: 'link', target: 'SharedEvents' },
        { kind: 'javascript', code: 'return;' },
      ],
    });
    const eventsList = project.getLayout('Level1').getEvents();

    unserializeFromJSObject(
      eventsList,
      result.serializedEvents,
      'unserializeFrom',
      project
    );
    const roundTripped = serializeToJSObject(eventsList);

    expect(roundTripped.map(event => event.type)).toEqual([
      'BuiltinCommonInstructions::Comment',
      'BuiltinCommonInstructions::Repeat',
      'BuiltinCommonInstructions::While',
      'BuiltinCommonInstructions::ForEach',
      'BuiltinCommonInstructions::ForEachChildVariable',
      'BuiltinCommonInstructions::Else',
      'BuiltinCommonInstructions::Link',
      'BuiltinCommonInstructions::JsCode',
    ]);
    expect(roundTripped[1].repeatExpression).toBe('2');
    expect(roundTripped[2].whileConditions[0].parameters).toEqual([
      'Remaining',
      '>',
      '0',
    ]);
    expect(roundTripped[4].valueIteratorVariableName).toBe('Item');
    expect(roundTripped[6].target).toBe('SharedEvents');
    expect(roundTripped[7].inlineCode).toBe('return;');
  });

  it('produces stable revisions for equivalent event arrays', () => {
    const events = [
      { type: 'BuiltinCommonInstructions::Comment', comment: 'A' },
    ];
    expect(getSerializedEventsRevision(events)).toBe(
      getSerializedEventsRevision(JSON.parse(JSON.stringify(events)))
    );
    expect(getSerializedEventsRevision(events)).not.toBe(
      getSerializedEventsRevision([
        { type: 'BuiltinCommonInstructions::Comment', comment: 'B' },
      ])
    );
  });
});
