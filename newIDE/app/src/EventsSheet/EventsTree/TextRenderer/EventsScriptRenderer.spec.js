// @flow
import { makeTestProject } from '../../../fixtures/TestProject';
import { unserializeFromJSObject } from '../../../Utils/Serializer';
import { renderEventsAsEventsScript } from './EventsScriptRenderer';
import {
  buildEventsScriptSourceView,
  renderEventOwnSourceById,
} from './EventsScriptSourceView';

const gd: libGDevelop = global.gd;

// Conformance fixtures shared with the backend serializer
// (events-script-serializer.js in the GDevelop-services repository): both
// sides must render the same events to the same EventScript. Keep the
// fixtures file byte-identical in both repositories.
const serializerFixtures = require('./EventsScriptRenderer.fixtures.json');

const makeEventsList = (project: gdProject, serializedEvents: Array<any>) => {
  const eventsList = new gd.EventsList();
  unserializeFromJSObject(
    eventsList,
    serializedEvents,
    'unserializeFrom',
    project
  );
  return eventsList;
};

// A scene start event mirroring the shape that caused a "near miss" in
// production: several unrelated actions and a sub-event, of which an AI
// agent only knows a part.
const sceneStartSerializedEvents = [
  {
    type: 'BuiltinCommonInstructions::Standard',
    conditions: [{ type: { value: 'DepartScene' }, parameters: [''] }],
    actions: [
      {
        type: { value: 'CentreCamera' },
        parameters: ['', 'MySpriteObject', '', '""'],
      },
      {
        type: { value: 'ChangeAnimation' },
        parameters: ['MySpriteObject', '=', '1'],
      },
    ],
    events: [
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'PlatformBehavior::IsFalling' },
            parameters: [
              'GroupOfSpriteObjectsWithBehaviors',
              'PlatformerObject',
            ],
          },
        ],
        actions: [
          { type: { value: 'Delete' }, parameters: ['MySpriteObject', ''] },
        ],
      },
    ],
  },
];

describe('EventsScriptRenderer conformance fixtures', () => {
  serializerFixtures.fixtures.forEach(fixture => {
    it(`renders like the backend serializer: ${fixture.name}`, () => {
      const { project } = makeTestProject(gd);
      try {
        const eventsList = makeEventsList(project, fixture.serializedEvents);
        const { text } = renderEventsAsEventsScript({ eventsList });
        // The fixtures are id-agnostic (the backend serializer does not
        // annotate): strip the `# event-N` annotations before comparing.
        const withoutIdAnnotations = text
          .split('\n')
          .map(line => line.replace(/\s*# event-[\d.]+$/, ''))
          .join('\n');
        expect(withoutIdAnnotations).toBe(
          fixture.expectedEventsScript.join('\n')
        );
      } finally {
        project.delete();
      }
    });
  });
});

describe('EventsScriptRenderer', () => {
  it('renders events as EventScript with event id annotations', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, sceneStartSerializedEvents);

      const { text, renderingErrors } = renderEventsAsEventsScript({
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

      const { text, renderingErrors } = renderEventsAsEventsScript({
        eventsList,
      });

      expect(renderingErrors).toEqual([]);
      expect(text).toBe(
        'if not PlatformBehavior::IsFalling(GroupOfSpriteObjectsWithBehaviors, PlatformerObject) and Or(DepartScene(), PlatformBehavior::IsFalling(GroupOfSpriteObjectsWithBehaviors, PlatformerObject)) and once:  # event-0'
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

      const { text, renderingErrors } = renderEventsAsEventsScript({
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
          'for each MySpriteObject:  # event-3',
          '  Delete(MySpriteObject)',
          'repeat 4 + 3 times:  # event-4',
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

      const { text, renderingErrors } = renderEventsAsEventsScript({
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

describe('EventsScriptSourceView', () => {
  const manyEventsSerialized = [
    ...sceneStartSerializedEvents,
    {
      type: 'BuiltinCommonInstructions::Standard',
      conditions: [
        {
          type: { value: 'PlatformBehavior::IsFalling' },
          parameters: ['GroupOfSpriteObjectsWithBehaviors', 'PlatformerObject'],
        },
      ],
      actions: [
        {
          type: { value: 'ChangeAnimation' },
          parameters: ['MySpriteObject', '=', '2'],
        },
      ],
    },
    {
      type: 'BuiltinCommonInstructions::Standard',
      conditions: [],
      actions: [
        { type: { value: 'Delete' }, parameters: ['MySpriteObject', ''] },
      ],
    },
  ];

  it('returns the whole sheet when no filter is given', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, manyEventsSerialized);

      const view = buildEventsScriptSourceView({
        eventsList,
        maxChars: 10000,
      });

      expect(view.renderingErrors).toEqual([]);
      expect(view.selectedEventIds).toEqual(['event-0', 'event-1', 'event-2']);
      expect(view.truncated).toBe(false);
      // Default whole-sheet depth is 1: event-0.0 is included.
      expect(view.text).toContain('# event-0.0');
      expect(view.text).toContain('# event-2');
    } finally {
      project.delete();
    }
  });

  it('returns a single event subtree with ancestors as headers', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, manyEventsSerialized);

      const view = buildEventsScriptSourceView({
        eventsList,
        eventIds: ['event-0.0'],
        maxChars: 10000,
      });

      expect(view.renderingErrors).toEqual([]);
      expect(view.selectedEventIds).toEqual(['event-0.0']);
      expect(view.text).toBe(
        [
          // The ancestor is shown as a header line for context.
          'if DepartScene():  # event-0',
          '  if PlatformBehavior::IsFalling(GroupOfSpriteObjectsWithBehaviors, PlatformerObject):  # event-0.0',
          '    Delete(MySpriteObject)',
          '# ... 2 other event(s) here (event-1, event-2)',
        ].join('\n')
      );
    } finally {
      project.delete();
    }
  });

  it('filters events with a text search', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, manyEventsSerialized);

      const view = buildEventsScriptSourceView({
        eventsList,
        searchText: 'changeanimation',
        maxChars: 10000,
      });

      expect(view.renderingErrors).toEqual([]);
      expect(view.selectedEventIds).toEqual(['event-0', 'event-1']);
      expect(view.text).toContain('ChangeAnimation(MySpriteObject, =, 1)');
      expect(view.text).toContain('ChangeAnimation(MySpriteObject, =, 2)');
      expect(view.text).toContain('# ... 1 other event(s) here (event-2)');
    } finally {
      project.delete();
    }
  });

  it('filters events referencing given objects, restricted to event_ids subtrees', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, manyEventsSerialized);

      const view = buildEventsScriptSourceView({
        eventsList,
        eventIds: ['event-0'],
        objectNames: ['GroupOfSpriteObjectsWithBehaviors'],
        maxChars: 10000,
      });

      expect(view.renderingErrors).toEqual([]);
      // event-1 also references the object but is outside the scope.
      expect(view.selectedEventIds).toEqual(['event-0.0']);
    } finally {
      project.delete();
    }
  });

  it('renders the own source of one event (without sub-events) by id', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, manyEventsSerialized);

      expect(
        renderEventOwnSourceById({
          eventsList,
          eventIdOrGroupName: 'event-0',
        })
      ).toBe(
        [
          'if DepartScene():  # event-0',
          '  CentreCamera(MySpriteObject)',
          '  ChangeAnimation(MySpriteObject, =, 1)',
        ].join('\n')
      );
      expect(
        renderEventOwnSourceById({
          eventsList,
          eventIdOrGroupName: 'event-99',
        })
      ).toBe(null);
    } finally {
      project.delete();
    }
  });

  it('reports unknown event ids', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, manyEventsSerialized);

      const view = buildEventsScriptSourceView({
        eventsList,
        eventIds: ['event-99'],
        maxChars: 10000,
      });

      expect(view.selectedEventIds).toEqual([]);
      expect(view.notes.join(' ')).toContain('event-99');
    } finally {
      project.delete();
    }
  });

  it('marks events without an EventScript form and warns about replacing them', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            { type: { value: 'Delete' }, parameters: ['MySpriteObject', ''] },
          ],
          events: [
            {
              type: 'BuiltinCommonInstructions::JsCode',
              inlineCode: 'runtimeScene.setBackgroundColor(255, 0, 0);',
            },
          ],
        },
      ]);

      const view = buildEventsScriptSourceView({
        eventsList,
        eventIds: ['event-0'],
        maxChars: 10000,
      });

      expect(view.text).toContain(
        '# (event of type "BuiltinCommonInstructions::JsCode" cannot be shown as EventScript)  # event-0.0'
      );
      expect(view.notes.join(' ')).toContain(
        'cannot be expressed as EventScript'
      );
    } finally {
      project.delete();
    }
  });

  it('degrades to a smaller depth, then drops events, to fit the budget', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, manyEventsSerialized);

      const smallView = buildEventsScriptSourceView({
        eventsList,
        maxChars: 260,
      });
      // The sub-event of event-0 is collapsed to fit.
      expect(smallView.text).toContain('not shown: read event_ids:');
      expect(smallView.text.length).toBeLessThanOrEqual(260);

      const tinyView = buildEventsScriptSourceView({
        eventsList,
        maxChars: 150,
      });
      expect(tinyView.truncated).toBe(true);
      expect(tinyView.notes.join(' ')).toContain('not shown');
      expect(tinyView.text.length).toBeLessThanOrEqual(200);
    } finally {
      project.delete();
    }
  });
});
