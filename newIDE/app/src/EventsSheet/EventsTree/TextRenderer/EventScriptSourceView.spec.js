// @flow
import { makeTestProject } from '../../../fixtures/TestProject';
import {
  buildEventScriptSourceView,
  renderEventSourceById,
} from './EventScriptSourceView';
import {
  makeEventsList,
  sceneStartSerializedEvents,
} from './EventScriptTestHelpers';

const gd: libGDevelop = global.gd;

describe('EventScriptSourceView', () => {
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

      const view = buildEventScriptSourceView({
        eventsList,
        maxChars: 10000,
      });

      expect(view.renderingErrors).toEqual([]);
      expect(view.selectedEventIds).toEqual(['event-0', 'event-1', 'event-2']);
      expect(view.truncated).toBe(false);
      // A whole-sheet read includes one level of sub-events by default
      // (`subEventsDepth` unset): the direct sub-event event-0.0 is shown.
      expect(view.text).toContain('# event-0.0');
      expect(view.text).toContain('# event-2');
    } finally {
      project.delete();
    }
  });

  it('shows one more level on a whole-sheet read with `wholeSheetSubEventsDepth: 2` (explorer agent)', () => {
    const { project } = makeTestProject(gd);
    try {
      const deeplyNestedSerializedEvents = [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [{ type: { value: 'DepartScene' }, parameters: [''] }],
          actions: [],
          events: [
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [
                {
                  type: { value: 'ChangeAnimation' },
                  parameters: ['MySpriteObject', '=', '1'],
                },
              ],
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
                  events: [
                    {
                      type: 'BuiltinCommonInstructions::Standard',
                      conditions: [],
                      actions: [
                        {
                          type: { value: 'ChangeAnimation' },
                          parameters: ['MySpriteObject', '=', '2'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const eventsList = makeEventsList(project, deeplyNestedSerializedEvents);

      const defaultView = buildEventScriptSourceView({
        eventsList,
        maxChars: 10000,
      });
      // Default whole-sheet read: only one level of sub-events.
      expect(defaultView.text).toContain('# event-0.0');
      expect(defaultView.text).not.toContain('Delete(MySpriteObject)');

      const explorerView = buildEventScriptSourceView({
        eventsList,
        wholeSheetSubEventsDepth: 2,
        maxChars: 10000,
      });
      // Depth 2: the second level (event-0.0.0) is shown...
      expect(explorerView.text).toContain('# event-0.0.0');
      expect(explorerView.text).toContain('Delete(MySpriteObject)');
      // ...but not the third one.
      expect(explorerView.text).not.toContain(
        'ChangeAnimation(MySpriteObject, =, 2)'
      );

      // An explicit `subEventsDepth` still wins over the whole-sheet default.
      const explicitDepthView = buildEventScriptSourceView({
        eventsList,
        subEventsDepth: 1,
        wholeSheetSubEventsDepth: 2,
        maxChars: 10000,
      });
      expect(explicitDepthView.text).not.toContain('Delete(MySpriteObject)');
    } finally {
      project.delete();
    }
  });

  it('returns a single event subtree with ancestors as headers', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, manyEventsSerialized);

      const view = buildEventScriptSourceView({
        eventsList,
        eventIds: ['event-0.0'],
        maxChars: 10000,
      });

      expect(view.renderingErrors).toEqual([]);
      expect(view.selectedEventIds).toEqual(['event-0.0']);
      expect(view.text).toBe(
        [
          // The ancestor is shown as a header line for context, with a
          // marker making explicit that its own actions are not displayed.
          'if DepartScene():  # event-0',
          '  # ... 2 line(s) of this parent event (shown only as context) not displayed: read event_ids: ["event-0"] to see them.',
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

      const view = buildEventScriptSourceView({
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

      const view = buildEventScriptSourceView({
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

  it('filters by object names with unicode identifiers (whole-name matches only)', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [{ type: { value: 'Delete' }, parameters: ['Héros', ''] }],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            { type: { value: 'Delete' }, parameters: ['SuperHéros', ''] },
          ],
        },
      ]);

      const view = buildEventScriptSourceView({
        eventsList,
        objectNames: ['Héros'],
        maxChars: 10000,
      });

      // "SuperHéros" must NOT match the object name "Héros": identifier
      // boundaries are unicode-aware, not ASCII `\b` ones.
      expect(view.selectedEventIds).toEqual(['event-0']);
      expect(view.text).toContain('Delete(Héros)');
    } finally {
      project.delete();
    }
  });

  it('renders the source of one event by id (own lines, or the full subtree)', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, manyEventsSerialized);

      expect(
        renderEventSourceById({
          eventsList,
          eventIdOrGroupName: 'event-0',
          includeSubEvents: false,
        })
      ).toBe(
        [
          'if DepartScene():  # event-0',
          '  CentreCamera(MySpriteObject)',
          '  ChangeAnimation(MySpriteObject, =, 1)',
        ].join('\n')
      );
      expect(
        renderEventSourceById({
          eventsList,
          eventIdOrGroupName: 'event-0',
          includeSubEvents: true,
        })
      ).toBe(
        [
          'if DepartScene():  # event-0',
          '  CentreCamera(MySpriteObject)',
          '  ChangeAnimation(MySpriteObject, =, 1)',
          '  if PlatformBehavior::IsFalling(GroupOfSpriteObjectsWithBehaviors, PlatformerObject):  # event-0.0',
          '    Delete(MySpriteObject)',
        ].join('\n')
      );
      expect(
        renderEventSourceById({
          eventsList,
          eventIdOrGroupName: 'event-99',
          includeSubEvents: false,
        })
      ).toBe(null);
    } finally {
      project.delete();
    }
  });

  it('renders `pass` in the own source of an action-less event with sub-events', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [{ type: { value: 'DepartScene' }, parameters: [''] }],
          actions: [],
          events: [
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [{ type: { value: 'Wait' }, parameters: ['1'] }],
            },
          ],
        },
      ]);

      // The own source has an empty body: it gets the explicit `pass`,
      // exactly like a read of the same event without its sub-events.
      expect(
        renderEventSourceById({
          eventsList,
          eventIdOrGroupName: 'event-0',
          includeSubEvents: false,
        })
      ).toBe(['if DepartScene():  # event-0', '  pass'].join('\n'));
    } finally {
      project.delete();
    }
  });

  it('reports unknown event ids without pretending the sheet is empty', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, manyEventsSerialized);

      const view = buildEventScriptSourceView({
        eventsList,
        eventIds: ['event-99'],
        maxChars: 10000,
      });

      expect(view.selectedEventIds).toEqual([]);
      expect(view.text).toBe('');
      expect(view.notes.join(' ')).toContain('event-99');
      expect(view.notes.join(' ')).toContain('NOT empty');
      expect(view.notes.join(' ')).not.toContain('sheet is empty.');
    } finally {
      project.delete();
    }
  });

  it('distinguishes an empty sheet from filters matching nothing', () => {
    const { project } = makeTestProject(gd);
    try {
      const emptyEventsList = makeEventsList(project, []);
      const emptyView = buildEventScriptSourceView({
        eventsList: emptyEventsList,
        maxChars: 10000,
      });
      expect(emptyView.notes).toEqual(['The events sheet is empty.']);

      const eventsList = makeEventsList(project, manyEventsSerialized);
      const noMatchView = buildEventScriptSourceView({
        eventsList,
        searchText: 'nothing matches this',
        maxChars: 10000,
      });
      expect(noMatchView.text).toBe('');
      expect(noMatchView.notes.join(' ')).toContain(
        'No event matches the given filters'
      );
      expect(noMatchView.notes.join(' ')).toContain('NOT empty');
    } finally {
      project.delete();
    }
  });

  it('reports only the shown events in selectedEventIds when trailing events are dropped', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, manyEventsSerialized);

      const view = buildEventScriptSourceView({
        eventsList,
        // Small enough to force dropping trailing events, big enough to
        // keep at least the first one.
        maxChars: 130,
      });

      expect(view.truncated).toBe(true);
      expect(view.selectedEventIds.length).toBeLessThan(3);
      expect(view.selectedEventIds[0]).toBe('event-0');
      // The dropped events are listed in the notes instead.
      expect(view.notes.join(' ')).toContain('not shown');
    } finally {
      project.delete();
    }
  });

  it('notes that a selected `else` event binds to the `if` above it', () => {
    const { project } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [{ type: { value: 'DepartScene' }, parameters: [''] }],
          actions: [{ type: { value: 'Wait' }, parameters: ['1'] }],
        },
        {
          type: 'BuiltinCommonInstructions::Else',
          conditions: [],
          actions: [{ type: { value: 'Wait' }, parameters: ['2'] }],
        },
      ]);

      const view = buildEventScriptSourceView({
        eventsList,
        eventIds: ['event-1'],
        maxChars: 10000,
      });

      expect(view.selectedEventIds).toEqual(['event-1']);
      expect(view.notes.join(' ')).toContain('`else` event');
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

      const view = buildEventScriptSourceView({
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

      const smallView = buildEventScriptSourceView({
        eventsList,
        maxChars: 260,
      });
      // The sub-event of event-0 is collapsed to fit.
      expect(smallView.text).toContain('not shown: read event_ids:');
      expect(smallView.text.length).toBeLessThanOrEqual(260);

      const tinyView = buildEventScriptSourceView({
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
