// @flow
import { makeTestProject } from '../../../fixtures/TestProject';
import { renderEventsAsEventScript } from './EventScriptRenderer';
import {
  getSerializerFixtures,
  makeEventsList,
  sceneStartSerializedEvents,
  withoutEventIdAnnotations,
} from './EventScriptTestHelpers';

const gd: libGDevelop = global.gd;

// Conformance fixtures shared with the backend serializer
// (events-script-serializer.js in the GDevelop-services repository): both
// sides must render the same events to the same EventScript. Keep the
// fixtures file byte-identical in both repositories.
describe('EventScriptRenderer conformance fixtures', () => {
  getSerializerFixtures().forEach(fixture => {
    it(`renders like the backend serializer: ${fixture.name}`, () => {
      const { project } = makeTestProject(gd);
      try {
        const eventsList = makeEventsList(project, fixture.serializedEvents);
        const { text } = renderEventsAsEventScript({ eventsList });
        // The fixtures are id-agnostic (the backend serializer does not
        // annotate): strip the `# event-N` annotations before comparing.
        expect(withoutEventIdAnnotations(text)).toBe(
          fixture.expectedEventScript.join('\n')
        );
      } finally {
        project.delete();
      }
    });
  });
});

describe('EventScriptRenderer', () => {
  it('renders events as EventScript with event id annotations', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, sceneStartSerializedEvents);

      const { text, renderingErrors } = renderEventsAsEventScript({
        eventsList,
      });

      expect(renderingErrors).toEqual([]);
      expect(text).toBe(
        [
          'if DepartScene():  # event-0',
          // The code-only "currentScene" parameter of CentreCamera is
          // dropped; the trailing empty parameters are trimmed.
          '  CentreCamera(MySpriteObject)',
          '  ChangeAnimation(MySpriteObject, =, 1)',
          '  if PlatformBehavior::IsFalling(GroupOfSpriteObjectsWithBehaviors, PlatformerObject):  # event-0.0',
          '    Delete(MySpriteObject)',
        ].join('\n')
      );
    } finally {
      project.delete();
    }
  });

  it('renders conditions combinations: inverted, trigger once, or', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            {
              type: { value: 'PlatformBehavior::IsFalling', inverted: true },
              parameters: [
                'GroupOfSpriteObjectsWithBehaviors',
                'PlatformerObject',
              ],
            },
            {
              type: { value: 'BuiltinCommonInstructions::Or' },
              parameters: [],
              subInstructions: [
                {
                  type: { value: 'DepartScene' },
                  parameters: [''],
                },
                {
                  type: { value: 'PlatformBehavior::IsFalling' },
                  parameters: [
                    'GroupOfSpriteObjectsWithBehaviors',
                    'PlatformerObject',
                  ],
                },
              ],
            },
            {
              type: { value: 'BuiltinCommonInstructions::Once' },
              parameters: [],
            },
          ],
          actions: [],
        },
      ]);

      const { text, renderingErrors } = renderEventsAsEventScript({
        eventsList,
      });

      expect(renderingErrors).toEqual([]);
      expect(text).toBe(
        [
          'if not PlatformBehavior::IsFalling(GroupOfSpriteObjectsWithBehaviors, PlatformerObject) and Or(DepartScene(), PlatformBehavior::IsFalling(GroupOfSpriteObjectsWithBehaviors, PlatformerObject)) and once:  # event-0',
          '  pass',
        ].join('\n')
      );
    } finally {
      project.delete();
    }
  });

  it('renders loop events, else events, local variables, comments and groups', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::Comment',
          comment: 'Setup\nwith a second line',
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          variables: [
            { name: 'Count', type: 'number', value: '3' },
            { name: 'Title', type: 'string', value: 'Hello "world"' },
          ],
          conditions: [],
          actions: [],
        },
        {
          type: 'BuiltinCommonInstructions::Else',
          conditions: [{ type: { value: 'DepartScene' }, parameters: [''] }],
          actions: [],
        },
        {
          type: 'BuiltinCommonInstructions::ForEach',
          object: 'MySpriteObject',
          conditions: [],
          actions: [
            { type: { value: 'Delete' }, parameters: ['MySpriteObject', ''] },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Repeat',
          repeatExpression: '4 + 3',
          conditions: [],
          actions: [],
        },
        {
          type: 'BuiltinCommonInstructions::Group',
          name: 'My group',
          events: [
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [
                {
                  type: { value: 'Delete' },
                  parameters: ['MySpriteObject', ''],
                },
              ],
            },
          ],
        },
      ]);

      const { text, renderingErrors } = renderEventsAsEventScript({
        eventsList,
      });

      expect(renderingErrors).toEqual([]);
      expect(text).toBe(
        [
          'comment "Setup\\nwith a second line"  # event-0',
          'always:  # event-1',
          '  local number Count = 3',
          '  local string Title = "Hello \\"world\\""',
          'else if DepartScene():  # event-2',
          '  pass',
          'for each MySpriteObject:  # event-3',
          '  Delete(MySpriteObject)',
          'repeat 4 + 3 times:  # event-4',
          '  pass',
          'group "My group":  # event-5',
          '  always:  # event-5.0',
          '    Delete(MySpriteObject)',
        ].join('\n')
      );
    } finally {
      project.delete();
    }
  });

  it('renders a `js` event as a fenced code block, annotated on its header', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::JsCode',
          inlineCode: 'runtimeScene.getGame().pause(true);',
          parameterObjects: '',
          useStrict: true,
          eventsSheetExpanded: false,
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [{ type: { value: 'DepartScene' }, parameters: [''] }],
          actions: [],
          events: [
            {
              type: 'BuiltinCommonInstructions::JsCode',
              // Blank lines and indentation of the code are kept as written,
              // only shifted by the indentation of the event.
              inlineCode: [
                'for (const enemy of objects) {',
                '',
                '  enemy.setX(enemy.getX() + 10);',
                '}',
              ].join('\n'),
              parameterObjects: 'GroupOfSpriteObjectsWithBehaviors',
              useStrict: true,
              eventsSheetExpanded: false,
            },
          ],
        },
      ]);

      const { text, renderingErrors } = renderEventsAsEventScript({
        eventsList,
      });

      expect(renderingErrors).toEqual([]);
      expect(text).toBe(
        [
          'js """  # event-0',
          'runtimeScene.getGame().pause(true);',
          '"""',
          'if DepartScene():  # event-1',
          '  js(GroupOfSpriteObjectsWithBehaviors) """  # event-1.0',
          '  for (const enemy of objects) {',
          // An empty code line stays empty (no trailing spaces).
          '',
          '    enemy.setX(enemy.getX() + 10);',
          '  }',
          '  """',
        ].join('\n')
      );
    } finally {
      project.delete();
    }
  });

  it('renders a disabled `js` event and an empty one', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::JsCode',
          disabled: true,
          inlineCode: 'console.log("off");',
          parameterObjects: 'MySpriteObject',
          useStrict: true,
          eventsSheetExpanded: false,
        },
        {
          type: 'BuiltinCommonInstructions::JsCode',
          inlineCode: '',
          parameterObjects: '',
          useStrict: true,
          eventsSheetExpanded: false,
        },
      ]);

      const { text, renderingErrors } = renderEventsAsEventScript({
        eventsList,
      });

      expect(renderingErrors).toEqual([]);
      expect(text).toBe(
        [
          'disabled js(MySpriteObject) """  # event-0',
          'console.log("off");',
          '"""',
          // An empty code has no body line at all: the fence opens and
          // closes right away.
          'js """  # event-1',
          '"""',
        ].join('\n')
      );
    } finally {
      project.delete();
    }
  });

  it('normalizes CRLF line endings of a `js` event code', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::JsCode',
          inlineCode: 'const a = 1;\r\nconst b = 2;',
          parameterObjects: '',
          useStrict: true,
          eventsSheetExpanded: false,
        },
      ]);

      const { text, renderingErrors } = renderEventsAsEventScript({
        eventsList,
      });

      expect(renderingErrors).toEqual([]);
      expect(text).toBe(
        ['js """  # event-0', 'const a = 1;', 'const b = 2;', '"""'].join('\n')
      );
    } finally {
      project.delete();
    }
  });

  it('reports a rendering error for a code line closing the fence early', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::JsCode',
          // A line of the code is the fence delimiter itself.
          inlineCode: ['const help = `', '"""', '`;'].join('\n'),
          parameterObjects: '',
          useStrict: true,
          eventsSheetExpanded: false,
        },
        {
          type: 'BuiltinCommonInstructions::JsCode',
          inlineCode: 'const ok = `a """ b`;',
          parameterObjects: '',
          useStrict: true,
          eventsSheetExpanded: false,
        },
      ]);

      const { text, renderingErrors } = renderEventsAsEventScript({
        eventsList,
      });

      // Documented limitation: nothing escapes the fence, so the reader is
      // told which event cannot be written as EventScript. A `"""` in the
      // middle of a line is harmless.
      expect(renderingErrors).toHaveLength(1);
      expect(renderingErrors[0].path).toBe('event-0');
      expect(renderingErrors[0].message).toContain('event-0');
      expect(renderingErrors[0].message).toContain('close');
      // The code is still rendered as written (nothing is silently changed).
      expect(text).toContain('const help = `');
      expect(text).toContain('const ok = `a """ b`;');
    } finally {
      project.delete();
    }
  });

  it('collapses sub-events deeper than the requested depth', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, sceneStartSerializedEvents);

      const { text, renderingErrors } = renderEventsAsEventScript({
        eventsList,
        subEventsDepth: 0,
      });

      expect(renderingErrors).toEqual([]);
      expect(text).toBe(
        [
          'if DepartScene():  # event-0',
          '  CentreCamera(MySpriteObject)',
          '  ChangeAnimation(MySpriteObject, =, 1)',
          '  # ... 1 sub-event(s) (1 action(s)) not shown: read event_ids: ["event-0"] to see them.',
        ].join('\n')
      );
    } finally {
      project.delete();
    }
  });

  it('keeps a collapsed group valid EventScript with an explicit `pass`', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::Group',
          name: 'My group',
          events: sceneStartSerializedEvents,
        },
      ]);

      const { text, renderingErrors } = renderEventsAsEventScript({
        eventsList,
        subEventsDepth: 0,
      });

      expect(renderingErrors).toEqual([]);
      // A group must contain at least one event for the parser: the marker
      // alone (a comment) would not do.
      expect(text).toBe(
        [
          'group "My group":  # event-0',
          '  # ... 2 sub-event(s) (3 action(s)) not shown: read event_ids: ["event-0"] to see them.',
          '  pass',
        ].join('\n')
      );
    } finally {
      project.delete();
    }
  });
});
