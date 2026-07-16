// @flow

// $FlowFixMe[cannot-resolve-module] Jest runs this test in Node.
import fs from 'fs';
// $FlowFixMe[cannot-resolve-module] Jest runs this test in Node.
import path from 'path';
import {
  IFDO_EVENTS_DSL_COVERAGE,
  IfDoError,
  areLegacyEventsEquivalent,
  canonicalizeLegacyEventsJson,
  compileIfDoToLegacyEventsJson,
  convertLegacyEventsJsonToIfDo,
  parseIfDoEvents,
  parseLegacyEventsJson,
} from './index';

declare var __dirname: string;

const instruction = (
  value: string,
  parameters: Array<string> = [],
  options: Object = {}
) => ({
  type: {
    value,
    inverted: !!options.inverted,
    await: !!options.awaited,
  },
  disabled: !!options.disabled,
  parameters,
  subInstructions: options.subInstructions || [],
});

const standard = (overrides: Object = {}) => ({
  type: 'BuiltinCommonInstructions::Standard',
  conditions: [],
  actions: [],
  ...overrides,
});

const collectJsonFiles = (directory: string): Array<string> =>
  fs.readdirSync(directory).flatMap(name => {
    const filePath = path.join(directory, name);
    return fs.statSync(filePath).isDirectory()
      ? collectJsonFiles(filePath)
      : filePath.endsWith('.json')
      ? [filePath]
      : [];
  });

const allEventTypesFixture = [
  standard({
    disabled: true,
    folded: true,
    aiGeneratedEventId: 'generation-1',
    variables: [
      {
        name: 'state',
        type: 'enum',
        value: 'idle',
        values: ['idle', 'run'],
        persistentUuid: 'state-uuid',
        folded: false,
      },
      {
        name: 'data',
        type: 'structure',
        folded: true,
        children: [
          { name: 'health', type: 'number', value: 100 },
          {
            name: 'items',
            type: 'array',
            children: [
              { type: 'string', value: 'Sword' },
              { type: 'boolean', value: true, hasMixedValues: true },
            ],
          },
        ],
      },
    ],
    conditions: [
      instruction('BuiltinCommonInstructions::Or', [], {
        subInstructions: [
          instruction('Compare', ['A', '>', '0'], { inverted: true }),
          instruction('Compare', ['B', '>', '0'], { disabled: true }),
        ],
      }),
    ],
    actions: [
      instruction('Network::Send', ['https://example.com'], {
        awaited: true,
      }),
    ],
    events: [standard({ actions: [instruction('Delete', ['Enemy'])] })],
  }),
  {
    type: 'BuiltinCommonInstructions::Else',
    conditions: [instruction('Compare', ['Score', '<', '10'])],
    actions: [instruction('Reset', [])],
    variables: [{ name: 'fallback', type: 'boolean', value: true }],
    events: [standard()],
  },
  {
    type: 'BuiltinCommonInstructions::While',
    infiniteLoopWarning: true,
    whileConditions: [instruction('QueueNotEmpty', [])],
    conditions: [instruction('Enabled', [])],
    actions: [instruction('Pop', [])],
    events: [standard({ actions: [instruction('Tick', [])] })],
    variables: [{ name: 'count', type: 'number', value: 0 }],
    loopIndexVariable: 'i',
  },
  {
    type: 'BuiltinCommonInstructions::Repeat',
    repeatExpression: 'Variable(Count) + 1',
    conditions: [instruction('Enabled', [])],
    actions: [instruction('Spawn', ['Enemy'])],
    events: [],
    variables: [{ name: 'offset', type: 'number', value: 2 }],
    loopIndexVariable: 'repeatIndex',
  },
  {
    type: 'BuiltinCommonInstructions::ForEach',
    object: 'Enemy',
    conditions: [instruction('Enabled', [])],
    actions: [instruction('Mark', ['Enemy'])],
    events: [],
    variables: [{ name: 'rank', type: 'number', value: 0 }],
    loopIndexVariable: 'objectIndex',
    orderBy: 'Enemy.Variable(Health)',
    order: 'desc',
    limit: '10',
  },
  {
    type: 'BuiltinCommonInstructions::ForEachChildVariable',
    iterableVariableName: 'SceneVariable(Inventory)',
    valueIteratorVariableName: 'item',
    keyIteratorVariableName: 'itemKey',
    conditions: [instruction('Enabled', [])],
    actions: [instruction('Log', ['item'])],
    events: [],
    variables: [{ name: 'seen', type: 'boolean', value: false }],
    loopIndexVariable: 'childIndex',
  },
  {
    type: 'BuiltinCommonInstructions::Group',
    disabled: true,
    folded: true,
    aiGeneratedEventId: 'combat-group',
    name: 'Combat',
    source: 'events.dsl',
    creationTime: 42,
    colorR: 1,
    colorG: 2,
    colorB: 3,
    parameters: ['one', 'two'],
    events: [standard({ actions: [instruction('Hit', [])] })],
  },
  {
    type: 'BuiltinCommonInstructions::Comment',
    disabled: true,
    folded: true,
    aiGeneratedEventId: 'comment-id',
    color: { r: 255, g: 230, b: 109, textR: 1, textG: 2, textB: 3 },
    comment: 'First line\nSecond "line" \\ end',
    comment2: 'deprecated',
  },
  {
    type: 'BuiltinCommonInstructions::Link',
    target: 'Shared Combat',
    include: { includeConfig: 0 },
  },
  {
    type: 'BuiltinCommonInstructions::Link',
    target: 'Shared Combat',
    include: { includeConfig: 1, eventsGroup: 'Damage' },
  },
  {
    type: 'BuiltinCommonInstructions::Link',
    target: 'Shared Combat',
    include: { includeConfig: 2, start: 2, end: 8 },
  },
  {
    type: 'BuiltinCommonInstructions::JsCode',
    inlineCode: 'const value = 1;\nruntimeScene.test = value;',
    parameterObjects: 'Enemy',
    useStrict: true,
    eventsSheetExpanded: true,
  },
];

const persistedEventTypes = new Set(
  allEventTypesFixture.map(event => event.type)
);

const collectSerializedEventLists = (root: any): Array<Array<Object>> => {
  const lists = [];
  const visit = (value: any) => {
    if (Array.isArray(value)) {
      if (
        value.length > 0 &&
        value.every(
          item =>
            item &&
            typeof item === 'object' &&
            typeof item.type === 'string' &&
            persistedEventTypes.has(item.type)
        )
      ) {
        lists.push(value);
      }
      value.forEach(visit);
    } else if (value && typeof value === 'object') {
      Object.keys(value).forEach(key => visit(value[key]));
    }
  };
  visit(root);
  return lists;
};

describe('IfDo events DSL', () => {
  describe('legacy JSON -> DSL -> legacy JSON', () => {
    test('round-trips every persisted event type and field', () => {
      const input = JSON.stringify(allEventTypesFixture);
      const dsl = convertLegacyEventsJsonToIfDo(input);
      const output = compileIfDoToLegacyEventsJson(dsl);

      expect(areLegacyEventsEquivalent(input, output)).toBe(true);
      expect(dsl).toContain('or @exact id="Compare"');
      expect(dsl).not.toContain('@exact id="BuiltinCommonInstructions::Or"');
      expect(dsl).toContain('for each child');
      expect(dsl).toContain('@js');
      expect(dsl).toContain('@end js');
      expect(dsl).toContain('@group "Combat"');
      expect(dsl).toContain('@end group');
      expect(dsl).toContain('@comment "First line\\nSecond');
      expect(dsl).not.toMatch(/^group\s/m);
      expect(dsl).not.toMatch(/^#(?:\s|$)/m);
      expect(dsl).not.toContain('legacy event');
      expect(dsl).not.toContain('@legacy');
    });

    test('is canonical and deterministic', () => {
      const input = JSON.stringify(allEventTypesFixture);
      const first = convertLegacyEventsJsonToIfDo(input);
      const second = convertLegacyEventsJsonToIfDo(
        compileIfDoToLegacyEventsJson(first)
      );
      expect(second).toBe(first);
      expect(first.endsWith('\n')).toBe(true);
    });

    test('does not hardcode aliases for built-in instructions', () => {
      const events = [
        standard({
          conditions: [
            instruction('SceneJustBegins', ['']),
            instruction('CollisionNP', ['Enemy', 'Player', '', '', 'no']),
            instruction('KeyFromTextPressed', ['', '"Left"']),
            instruction('CompareTimer', ['', '"Spawn"', '>', '0.5']),
            instruction('NumberVariable', ['Score', '>=', '100']),
            instruction('NumberObjectVariable', ['Enemy', 'HP', '<=', '0']),
            instruction('PosX', ['Player', '<', '12']),
            instruction('BuiltinCommonInstructions::Or', [], {
              subInstructions: [
                instruction('PosY', ['Player', '<', '88']),
                instruction('PosY', ['Player', '>', '462']),
              ],
            }),
          ],
          actions: [
            instruction('SetNumberVariable', ['Score', '+', '10']),
            instruction('SetNumberObjectVariable', ['Enemy', 'HP', '-', '1']),
            instruction('SetX', ['Player', '=', '12']),
            instruction('SetY', ['Player', '+', '300*TimeDelta()']),
            instruction('SetAngle', ['Enemy', '=', '180']),
            instruction('ResetTimer', ['', '"Spawn"']),
            instruction('Create', ['', 'Enemy', '100', '-62', '""']),
            instruction('Delete', ['Enemy', '']),
            instruction('PlaySound', ['', 'HitSfx', 'no', '55', '0.85']),
            instruction('Scene', ['', '"GameOver"', 'yes']),
            instruction('OpacityCapability::OpacityBehavior::SetValue', [
              'Player',
              'Opacity',
              '=',
              '80',
            ]),
            instruction(
              'TextContainerCapability::TextContainerBehavior::SetValue',
              ['ScoreText', 'Text', '=', '"SCORE " + ToString(Variable(Score))']
            ),
          ],
        }),
      ];
      const input = JSON.stringify(events);
      const dsl = convertLegacyEventsJsonToIfDo(input);
      const output = compileIfDoToLegacyEventsJson(dsl);

      expect(areLegacyEventsEquivalent(input, output)).toBe(true);
      expect(dsl).toContain('@exact id="SceneJustBegins" parameters=[""]');
      expect(dsl).toContain('@exact id="CollisionNP"');
      expect(dsl).toContain('@exact id="SetNumberVariable"');
      expect(dsl).not.toContain('scene begins');
      expect(dsl).not.toContain('collision Enemy Player');
      expect(dsl).not.toContain('scene.Score');
    });

    test('falls back to exact when a friendly candidate is ambiguous', () => {
      const input = JSON.stringify([
        standard({
          actions: [instruction('SetNumberVariable', ['Score', '=', '"5"'])],
        }),
      ]);
      const dsl = convertLegacyEventsJsonToIfDo(input);
      expect(dsl).toContain('@exact id="SetNumberVariable"');
      expect(
        areLegacyEventsEquivalent(input, compileIfDoToLegacyEventsJson(dsl))
      ).toBe(true);
    });

    test.each([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Else',
      'BuiltinCommonInstructions::While',
      'BuiltinCommonInstructions::Repeat',
      'BuiltinCommonInstructions::ForEach',
      'BuiltinCommonInstructions::ForEachChildVariable',
      'BuiltinCommonInstructions::Group',
      'BuiltinCommonInstructions::Comment',
      'BuiltinCommonInstructions::Link',
      'BuiltinCommonInstructions::JsCode',
    ])('contains golden coverage for %s', type => {
      expect(allEventTypesFixture.some(event => event.type === type)).toBe(
        true
      );
    });

    test('round-trips serialized event lists from repository game fixtures', () => {
      const repositoryRoot = path.resolve(__dirname, '../../../../..');
      const fixturePaths = collectJsonFiles(
        path.join(repositoryRoot, 'GDJS/tests/games')
      );
      let checkedLists = 0;
      fixturePaths.forEach(filePath => {
        const relativePath = path.relative(repositoryRoot, filePath);
        const project = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        collectSerializedEventLists(project).forEach(events => {
          const input = JSON.stringify(events);
          const dsl = convertLegacyEventsJsonToIfDo(input);
          let output;
          try {
            output = compileIfDoToLegacyEventsJson(dsl);
          } catch (error) {
            throw new Error(`${relativePath}: ${error.message}\n${dsl}`);
          }
          expect(areLegacyEventsEquivalent(input, output)).toBe(true);
          checkedLists++;
        });
      });
      expect(checkedLists).toBeGreaterThan(100);
    });

    test('preserves zero and multiple sibling while conditions', () => {
      const input = JSON.stringify([
        {
          type: 'BuiltinCommonInstructions::While',
          whileConditions: [],
          conditions: [],
          actions: [],
          events: [],
          variables: [],
          loopIndexVariable: 'emptyLoopIndex',
        },
        {
          type: 'BuiltinCommonInstructions::While',
          whileConditions: [
            instruction('FirstWhileCondition'),
            instruction('SecondWhileCondition'),
          ],
          conditions: [instruction('BodyCondition')],
          actions: [],
          events: [],
          variables: [],
        },
      ]);

      const dsl = convertLegacyEventsJsonToIfDo(input);
      expect(dsl).toContain('while index="emptyLoopIndex"');
      expect(dsl).toContain(
        'and while @exact id="SecondWhileCondition" parameters=[]'
      );
      expect(
        areLegacyEventsEquivalent(input, compileIfDoToLegacyEventsJson(dsl))
      ).toBe(true);
    });

    test('preserves instruction trees in while conditions and nested logical Or', () => {
      const andCondition = instruction('BuiltinCommonInstructions::And', [], {
        subInstructions: [instruction('A'), instruction('B')],
      });
      const nestedOr = instruction('BuiltinCommonInstructions::Or', [], {
        subInstructions: [
          instruction('BuiltinCommonInstructions::Or', [], {
            subInstructions: [instruction('C'), instruction('D')],
          }),
          instruction('E'),
        ],
      });
      const events = [
        {
          type: 'BuiltinCommonInstructions::While',
          infiniteLoopWarning: true,
          whileConditions: [andCondition],
          conditions: [],
          actions: [],
          events: [],
          variables: [],
        },
        standard({ conditions: [nestedOr] }),
      ];
      const input = JSON.stringify(events);
      const dsl = convertLegacyEventsJsonToIfDo(input);

      expect(dsl).toContain(
        'while @exact id="BuiltinCommonInstructions::And" parameters=[]'
      );
      expect(dsl).toContain(
        'if @exact id="BuiltinCommonInstructions::Or" parameters=[]'
      );
      expect(
        areLegacyEventsEquivalent(input, compileIfDoToLegacyEventsJson(dsl))
      ).toBe(true);
    });

    test('preserves JavaScript line endings and delimiter-looking body lines', () => {
      const inlineCode = 'const text = `\r\n@end js\r\n`;\r\nreturn text;';
      const input = JSON.stringify([
        {
          type: 'BuiltinCommonInstructions::JsCode',
          inlineCode,
          parameterObjects: '',
          useStrict: true,
          eventsSheetExpanded: false,
        },
      ]);
      const dsl = convertLegacyEventsJsonToIfDo(input);
      expect(dsl).toContain('delimiter="IFDO_1"');
      expect(dsl).toContain('@end js IFDO_1');
      const output = compileIfDoToLegacyEventsJson(dsl);
      expect(JSON.parse(output)[0].inlineCode).toBe(inlineCode);
      expect(areLegacyEventsEquivalent(input, output)).toBe(true);
    });

    test('preserves three or more consecutive newlines inside JavaScript', () => {
      const inlineCode =
        'const values = [1, 2, 3];\n\n\n/** Keep this visual separator. */\nreturn values;';
      const input = JSON.stringify([
        {
          type: 'BuiltinCommonInstructions::JsCode',
          inlineCode,
          parameterObjects: '',
          useStrict: false,
          eventsSheetExpanded: false,
        },
      ]);

      const dsl = convertLegacyEventsJsonToIfDo(input);
      const output = compileIfDoToLegacyEventsJson(dsl);

      expect(dsl).toContain('\n\n\n/** Keep this visual separator. */');
      expect(JSON.parse(output)[0].inlineCode).toBe(inlineCode);
      expect(areLegacyEventsEquivalent(input, output)).toBe(true);
    });

    test('preserves array-serialized multiline JavaScript without inserting commas', () => {
      const input = JSON.stringify([
        {
          type: 'BuiltinCommonInstructions::JsCode',
          inlineCode: [
            'const game = runtimeScene.getGame();\r',
            'eventsFunctionContext.returnValue = game.isInGameEdition && game.isInGameEdition();',
          ],
          parameterObjects: '',
          useStrict: true,
          eventsSheetExpanded: false,
        },
      ]);

      const dsl = convertLegacyEventsJsonToIfDo(input);
      expect(dsl).toContain(
        'const game = runtimeScene.getGame();\r\neventsFunctionContext.returnValue'
      );
      expect(dsl).not.toContain(
        'const game = runtimeScene.getGame();\r,eventsFunctionContext.returnValue'
      );

      const output = compileIfDoToLegacyEventsJson(dsl);
      expect(JSON.parse(output)[0].inlineCode).toBe(
        'const game = runtimeScene.getGame();\r\neventsFunctionContext.returnValue = game.isInGameEdition && game.isInGameEdition();'
      );
      expect(areLegacyEventsEquivalent(input, output)).toBe(true);
    });

    test('writes JavaScript event metadata directly on @js', () => {
      const input = JSON.stringify([
        {
          type: 'BuiltinCommonInstructions::JsCode',
          disabled: true,
          folded: true,
          aiGeneratedEventId: 'generated-javascript',
          inlineCode: 'runtimeScene.resetTimer("MoveTick");',
          parameterObjects: '',
          useStrict: true,
          eventsSheetExpanded: false,
        },
      ]);

      const dsl = convertLegacyEventsJsonToIfDo(input);

      expect(dsl).toMatch(
        /^@js disabled=true folded=true aiGeneratedEventId="generated-javascript" strict=true expanded=false$/m
      );
      expect(dsl).not.toMatch(/^@event(?:\s|$)/m);
      expect(
        areLegacyEventsEquivalent(input, compileIfDoToLegacyEventsJson(dsl))
      ).toBe(true);
    });

    test('does not add @event before a nested JavaScript event', () => {
      const input = JSON.stringify([
        standard({
          conditions: [instruction('CompareTimer')],
          events: [
            {
              type: 'BuiltinCommonInstructions::JsCode',
              inlineCode: 'runtimeScene.resetTimer("MoveTick");',
              parameterObjects: '',
              useStrict: true,
              eventsSheetExpanded: false,
            },
          ],
        }),
      ]);

      const dsl = convertLegacyEventsJsonToIfDo(input);

      expect(dsl).toContain('> @js strict=true expanded=false');
      expect(dsl).not.toContain('> @event\n> @js');
      expect(
        areLegacyEventsEquivalent(input, compileIfDoToLegacyEventsJson(dsl))
      ).toBe(true);
    });

    test('preserves structural expressions, names, and comment whitespace', () => {
      const input = JSON.stringify([
        {
          type: 'BuiltinCommonInstructions::Repeat',
          repeatExpression: 'Variable(Count) + 1',
          conditions: [],
          actions: [],
        },
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'Enemy',
          orderBy: 'Enemy.Variable(Health) + 1',
          order: 'desc',
          limit: 'Variable(Maximum) + 2',
          conditions: [],
          actions: [],
        },
        {
          type: 'BuiltinCommonInstructions::Comment',
          color: { r: 1, g: 2, b: 3, textR: 4, textG: 5, textB: 6 },
          comment: 'first\rsecond  \t',
        },
      ]);
      expect(
        areLegacyEventsEquivalent(
          input,
          compileIfDoToLegacyEventsJson(convertLegacyEventsJsonToIfDo(input))
        )
      ).toBe(true);
    });

    test('writes group event metadata on @group instead of @event', () => {
      const input = JSON.stringify([
        {
          type: 'BuiltinCommonInstructions::Group',
          disabled: true,
          folded: true,
          aiGeneratedEventId: 'disabled-group',
          name: 'Grouped events',
          source: '',
          creationTime: 0,
          colorR: 54,
          colorG: 52,
          colorB: 232,
          parameters: [],
          events: [standard()],
        },
      ]);
      const dsl = convertLegacyEventsJsonToIfDo(input);

      expect(dsl).toContain(
        '@group "Grouped events" disabled=true folded=true aiGeneratedEventId="disabled-group" source="" creationTime=0 color=[54,52,232] parameters=[]'
      );
      expect(dsl).toContain('@end group');
      expect(dsl.startsWith('@event')).toBe(false);
      expect(
        areLegacyEventsEquivalent(input, compileIfDoToLegacyEventsJson(dsl))
      ).toBe(true);
    });
  });

  describe('DSL -> legacy JSON', () => {
    test('compiles exact standard events and nested instructions', () => {
      const source = `
@event disabled=true folded=true aiGeneratedEventId="id"
@instruction inverted=true
if @exact id="Or" parameters=[]
? @exact id="A" parameters=["one"]
? @instruction disabled=true
? @exact id="B" parameters=[]
@instruction awaited=true
do await @exact id="Async" parameters=["x"]
`;
      const events = parseIfDoEvents(source);
      expect(events).toHaveLength(1);
      expect(events[0].disabled).toBe(true);
      expect(events[0].conditions[0].type.inverted).toBe(true);
      expect(events[0].conditions[0].subInstructions).toHaveLength(2);
      expect(events[0].conditions[0].subInstructions[1].disabled).toBe(true);
      expect(events[0].actions[0].type.await).toBe(true);
    });

    test('uses one @group statement and a typed @end suffix', () => {
      const events = parseIfDoEvents(`@group "Consolidated" disabled=true source="" creationTime=0 color=[1,2,3] parameters=[]
@event
event
@end group
`);
      expect(events[0]).toMatchObject({
        type: 'BuiltinCommonInstructions::Group',
        name: 'Consolidated',
        disabled: true,
        events: [{ type: 'BuiltinCommonInstructions::Standard' }],
      });
      expect(() =>
        parseIfDoEvents(`@group "Missing suffix"
@end
`)
      ).toThrow('@end requires a block-kind suffix');
      expect(() =>
        parseIfDoEvents(`@group "Wrong suffix"
@end js
`)
      ).toThrow('Unexpected block terminator');
      expect(() =>
        parseIfDoEvents(`@event disabled=true
@group "Metadata must be consolidated"
@end group
`)
      ).toThrow('@event cannot attach to @group');
      expect(() => parseIfDoEvents('group "Old syntax"\nend\n')).toThrow(
        'Unknown statement'
      );
      expect(() => parseIfDoEvents('end\n')).toThrow(
        'Block terminators must use @end'
      );
      expect(() =>
        parseIfDoEvents('@group source=""\ngroup "Old split syntax"\nend\n')
      ).toThrow('@group requires a quoted string');
    });

    test('uses one @comment statement with quoted content and colors', () => {
      const events = parseIfDoEvents(
        '@comment "Line one\\nLine two" disabled=true background=[1,2,3] text=[4,5,6]\n'
      );
      expect(events[0]).toMatchObject({
        type: 'BuiltinCommonInstructions::Comment',
        disabled: true,
        comment: 'Line one\nLine two',
        color: { r: 1, g: 2, b: 3, textR: 4, textG: 5, textB: 6 },
      });
      expect(() => parseIfDoEvents('# old comment\n')).toThrow(
        'Unknown statement'
      );
    });

    test('uses @js and @end js directives', () => {
      const events = parseIfDoEvents(`@js disabled=true folded=true aiGeneratedEventId="generated-javascript" objects="Enemy" strict=true expanded=false
const value = 1;
@end js
`);
      expect(events[0]).toMatchObject({
        type: 'BuiltinCommonInstructions::JsCode',
        disabled: true,
        folded: true,
        aiGeneratedEventId: 'generated-javascript',
        inlineCode: 'const value = 1;',
        parameterObjects: 'Enemy',
        useStrict: true,
      });
      const legacyAnnotatedEvents = parseIfDoEvents(`@event disabled=true aiGeneratedEventId="legacy-javascript"
@js strict=true
code();
@end js
`);
      expect(legacyAnnotatedEvents[0]).toMatchObject({
        type: 'BuiltinCommonInstructions::JsCode',
        disabled: true,
        aiGeneratedEventId: 'legacy-javascript',
        inlineCode: 'code();',
        useStrict: true,
      });
      expect(() => parseIfDoEvents('js\ncode();\n@end js\n')).toThrow(
        'Unknown statement'
      );
    });

    test('uses a project catalog resolver for friendly instructions', () => {
      const output = compileIfDoToLegacyEventsJson(
        `if custom.collision Player Enemy\ndo custom.delete Enemy\n`,
        {
          resolveInstruction: ({ kind, source }) =>
            kind === 'condition'
              ? instruction('Collision', source.split(' ').slice(1))
              : instruction('Delete', source.split(' ').slice(1)),
        }
      );
      const events = JSON.parse(output);
      expect(events[0].conditions[0].type.value).toBe('Collision');
      expect(events[0].actions[0].parameters).toEqual(['Enemy']);
    });

    test('applies typed metadata to catalog-resolved friendly instructions', () => {
      const events = parseIfDoEvents(
        `@instruction disabled=true inverted=true
if Friendly.Condition
@instruction awaited=true
do Friendly.Action
`,
        { resolveInstruction: () => instruction('Resolved') }
      );
      expect(events[0].conditions[0]).toMatchObject({
        disabled: true,
        type: { inverted: true },
      });
      expect(events[0].actions[0].type.await).toBe(true);
    });

    test('lowers friendly OR alternatives to the current Or instruction', () => {
      const output = compileIfDoToLegacyEventsJson(`if A\nor B\nor C\ndo X\n`, {
        resolveInstruction: ({ kind, source }) =>
          instruction(`${kind}:${source}`, []),
      });
      const condition = JSON.parse(output)[0].conditions[0];
      expect(condition.type.value).toBe('BuiltinCommonInstructions::Or');
      expect(condition.subInstructions.map(child => child.type.value)).toEqual([
        'condition:A',
        'condition:B',
        'condition:C',
      ]);
    });

    test('compiles empty, local-only, and child-only standard events', () => {
      const source = `
@event
event

@event
local value = var(type="number",value=1,persistentUuid="uuid",folded=true)
event
> @event
> do @exact id="Child" parameters=[]
`;
      const events = JSON.parse(compileIfDoToLegacyEventsJson(source));
      expect(events).toHaveLength(2);
      expect(events[1].variables[0]).toMatchObject({
        name: 'value',
        type: 'number',
        value: 1,
        persistentUuid: 'uuid',
        folded: true,
      });
      expect(events[1].events[0].actions[0].type.value).toBe('Child');
    });

    test('compiles typed local shorthand and else-if branch locals', () => {
      const source = `
@event
local state:enum("idle", "run") = "idle" uuid="state-id" folded=true
if @exact id="A" parameters=[]
do @exact id="X" parameters=[]
@event
else if @exact id="B" parameters=[]
local fallback:boolean = true
do @exact id="Y" parameters=[]
`;
      const events = JSON.parse(compileIfDoToLegacyEventsJson(source));
      expect(events[0].variables[0]).toMatchObject({
        name: 'state',
        type: 'enum',
        values: ['idle', 'run'],
        persistentUuid: 'state-id',
        folded: true,
      });
      expect(events[1].type).toBe('BuiltinCommonInstructions::Else');
      expect(events[1].variables[0]).toMatchObject({
        name: 'fallback',
        type: 'boolean',
        value: true,
      });
    });

    test('accepts CRLF and a UTF-8 BOM', () => {
      const output = compileIfDoToLegacyEventsJson(
        '\uFEFF@event\r\ndo @exact id="Action" parameters=[]\r\n'
      );
      expect(JSON.parse(output)[0].actions[0].type.value).toBe('Action');
    });

    test('delegates source-only while limits to project-aware lowering', () => {
      const source =
        'while @exact id="KeepRunning" parameters=[] limit="100"\n';
      const events = parseIfDoEvents(source, {
        lowerWhileLimit: ({ limit, event }) => ({
          ...event,
          whileConditions: [
            ...event.whileConditions,
            instruction('GeneratedLimitCheck', [limit]),
          ],
          actions: [instruction('GeneratedCounterIncrement')],
        }),
      });
      expect(events[0].whileConditions[1].parameters).toEqual(['100']);
      expect(events[0].actions[0].type.value).toBe('GeneratedCounterIncrement');
    });
  });

  describe('canonical JSON normalization and equivalence', () => {
    test('expands omitted serializer defaults', () => {
      const minimal = JSON.stringify([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [{ type: { value: 'Condition' }, parameters: ['a'] }],
          actions: [],
        },
      ]);
      const parsed = JSON.parse(canonicalizeLegacyEventsJson(minimal));
      expect(parsed[0]).toMatchObject({ disabled: false, folded: false });
      expect(parsed[0].conditions[0]).toMatchObject({
        disabled: false,
        type: { value: 'Condition', inverted: false, await: false },
        subInstructions: [],
      });
    });

    test('treats omitted defaults and explicit defaults as equivalent', () => {
      const left = JSON.stringify([standard()]);
      const right = JSON.stringify([
        standard({ disabled: false, folded: false, events: [], variables: [] }),
      ]);
      expect(areLegacyEventsEquivalent(left, right)).toBe(true);
    });

    test('normalizes variable defaults accepted by the current loader', () => {
      const omitted = JSON.stringify([
        standard({ variables: [{ name: 'oldVariable' }] }),
      ]);
      const canonical = JSON.parse(canonicalizeLegacyEventsJson(omitted));
      expect(canonical[0].variables[0]).toEqual({
        name: 'oldVariable',
        type: 'string',
        folded: false,
        persistentUuid: '',
        hasMixedValues: false,
        value: '0',
      });
    });

    test('publishes the closed serializer coverage manifest', () => {
      expect(IFDO_EVENTS_DSL_COVERAGE.formatVersion).toBe('2.0');
      expect(IFDO_EVENTS_DSL_COVERAGE.persistedEventTypes).toHaveLength(10);
      expect(
        IFDO_EVENTS_DSL_COVERAGE.persistedEventTypes.map(entry => entry.type)
      ).toContain('BuiltinCommonInstructions::JsCode');
      expect(IFDO_EVENTS_DSL_COVERAGE.variableTypes).toContain('mixed');
    });

    test('covers every source-persisted event in the built-in registries', () => {
      const repositoryRoot = path.resolve(__dirname, '../../../../..');
      const registrySources = [
        'Core/GDCore/Extensions/Builtin/CommonInstructionsExtension.cpp',
        'GDJS/GDJS/Extensions/Builtin/CommonInstructionsExtension.cpp',
      ];
      const registeredNames = registrySources.flatMap(relativePath => {
        const source = fs.readFileSync(
          path.join(repositoryRoot, relativePath),
          'utf8'
        );
        return Array.from(source.matchAll(/AddEvent\s*\(\s*"([^"]+)"/g)).map(
          match => match[1]
        );
      });
      const coveredNames = IFDO_EVENTS_DSL_COVERAGE.persistedEventTypes.map(
        entry => entry.type.split('::')[1]
      );
      expect(new Set(coveredNames)).toEqual(new Set(registeredNames));
    });
  });

  describe('strict diagnostics', () => {
    const expectCode = (callback: () => mixed, code: string) => {
      try {
        callback();
        throw new Error('Expected callback to throw.');
      } catch (error) {
        expect(error).toBeInstanceOf(IfDoError);
        expect(error.code).toBe(code);
      }
    };

    test('rejects malformed JSON and non-array roots', () => {
      expectCode(() => parseLegacyEventsJson('{'), 'IFDO_INVALID_JSON');
      expectCode(() => parseLegacyEventsJson('{}'), 'IFDO_INVALID_JSON');
    });

    test('rejects unknown event types and fields', () => {
      expectCode(
        () =>
          convertLegacyEventsJsonToIfDo(
            JSON.stringify([{ type: 'ThirdParty::UnknownEvent' }])
          ),
        'IFDO_UNSUPPORTED_EVENT'
      );
      expectCode(
        () =>
          convertLegacyEventsJsonToIfDo(
            JSON.stringify([standard({ unexpected: true })])
          ),
        'IFDO_UNSUPPORTED_FIELD'
      );
    });

    test('rejects invalid instruction and variable shapes', () => {
      expectCode(
        () =>
          convertLegacyEventsJsonToIfDo(
            JSON.stringify([
              standard({
                actions: [{ type: { value: 'A' }, parameters: [42] }],
              }),
            ])
          ),
        'IFDO_INVALID_JSON'
      );
      expectCode(
        () =>
          compileIfDoToLegacyEventsJson(
            'local x = var(type="unknown",value=1)\nevent\n'
          ),
        'IFDO_SYNTAX'
      );
    });

    test('requires a catalog for named instructions', () => {
      expectCode(
        () => compileIfDoToLegacyEventsJson('if custom.test Player Enemy\n'),
        'IFDO_CATALOG_REQUIRED'
      );
      expectCode(
        () =>
          compileIfDoToLegacyEventsJson(
            'while @exact id="A" parameters=[] limit=100\n'
          ),
        'IFDO_LOWERING_REQUIRED'
      );
    });

    test('rejects raw fallback grammar and invalid depth', () => {
      expectCode(
        () => compileIfDoToLegacyEventsJson('legacy event <<JSON\n{}\nJSON\n'),
        'IFDO_SYNTAX'
      );
      expectCode(
        () => compileIfDoToLegacyEventsJson('>> event\n'),
        'IFDO_DEPTH'
      );
    });

    test('rejects unknown exact arguments and unterminated blocks', () => {
      expectCode(
        () =>
          compileIfDoToLegacyEventsJson(
            'do @exact id="A" parameters=[] unknown=true\n'
          ),
        'IFDO_SYNTAX'
      );
      expectCode(
        () => compileIfDoToLegacyEventsJson('@group "A"\nevent\n'),
        'IFDO_SYNTAX'
      );
      expectCode(
        () => compileIfDoToLegacyEventsJson('@js\ncode();\n'),
        'IFDO_SYNTAX'
      );
    });

    test('rejects unknown, mistyped, conflicting, and dangling metadata', () => {
      expectCode(
        () => compileIfDoToLegacyEventsJson('@event unknown=true\nevent'),
        'IFDO_SYNTAX'
      );
      expectCode(
        () => compileIfDoToLegacyEventsJson('@event disabled="yes"\nevent'),
        'IFDO_SYNTAX'
      );
      expectCode(
        () =>
          compileIfDoToLegacyEventsJson(
            '@instruction awaited=false\ndo await @exact id="A" parameters=[]'
          ),
        'IFDO_SYNTAX'
      );
      expectCode(() => compileIfDoToLegacyEventsJson('@event'), 'IFDO_SYNTAX');
      expectCode(
        () => compileIfDoToLegacyEventsJson('@instruction disabled=true'),
        'IFDO_SYNTAX'
      );
    });
  });
});
