// @flow
import { unserializeFromJSObject } from '../../../Utils/Serializer';

const gd: libGDevelop = global.gd;

/**
 * Build a gd.EventsList from serialized events, for tests (the caller is
 * responsible for deleting the project it belongs to).
 */
export const makeEventsList = (
  project: gdProject,
  serializedEvents: Array<any>
): gdEventsList => {
  const eventsList = new gd.EventsList();
  unserializeFromJSObject(
    eventsList,
    serializedEvents,
    'unserializeFrom',
    project
  );
  return eventsList;
};

// Conformance fixtures shared with the backend serializer
// (events-script-serializer.js in the GDevelop-services repository): the same
// serialized events must render to the same EventScript on both sides. The
// file is byte-identical in both repositories.
const serializerFixtures = require('./EventScriptRenderer.fixtures.json');

export type SerializerFixture = {|
  name: string,
  parsesBack: boolean,
  serializedEvents: Array<any>,
  expectedEventScript: Array<string>,
|};

export const getSerializerFixtures = (): Array<SerializerFixture> =>
  serializerFixtures.fixtures;

/**
 * One shared conformance fixture, by name (so a spec can assert against the
 * exact EventScript both sides must produce). Throws when the name is not
 * found, rather than silently testing nothing.
 */
export const getSerializerFixtureNamed = (name: string): SerializerFixture => {
  const foundFixture = getSerializerFixtures().find(
    fixture => fixture.name === name
  );
  if (!foundFixture) {
    throw new Error(`No shared serializer fixture named "${name}".`);
  }
  return foundFixture;
};

/**
 * Strip the `# event-N` id annotations of a rendering: the shared fixtures
 * are id-agnostic (the backend serializer does not annotate).
 */
export const withoutEventIdAnnotations = (text: string): string =>
  text
    .split('\n')
    .map(line => line.replace(/\s*# event-[\d.]+$/, ''))
    .join('\n');

// A scene start event with several unrelated actions and a sub-event: the
// shape whose faithful rendering matters most when an AI agent reads an
// event before editing it.
export const sceneStartSerializedEvents = [
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
