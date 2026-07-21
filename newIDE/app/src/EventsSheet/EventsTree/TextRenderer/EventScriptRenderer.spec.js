// @flow
import { makeTestProject } from '../../../fixtures/TestProject';
import { renderEventsAsEventScript } from './EventScriptRenderer';
import {
  makeEventsList,
  sceneStartSerializedEvents,
} from './EventScriptTestHelpers';

const gd: libGDevelop = global.gd;

// Conformance fixtures shared with the backend serializer
// (events-script-serializer.js in the GDevelop-services repository): both
// sides must render the same events to the same EventScript. Keep the
// fixtures file byte-identical in both repositories.
const serializerFixtures = require('./EventScriptRenderer.fixtures.json');

describe('EventScriptRenderer conformance fixtures', () => {
  serializerFixtures.fixtures.forEach(fixture => {
    it(`renders like the backend serializer: ${fixture.name}`, () => {
      const { project } = makeTestProject(gd);
      try {
        const eventsList = makeEventsList(project, fixture.serializedEvents);
        const { text } = renderEventsAsEventScript({ eventsList });
        // The fixtures are id-agnostic (the backend serializer does not
        // annotate): strip the `# event-N` annotations before comparing.
        const withoutIdAnnotations = text
          .split('\n')
          .map(line => line.replace(/\s*# event-[\d.]+$/, ''))
          .join('\n');
        expect(withoutIdAnnotations).toBe(
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
});
