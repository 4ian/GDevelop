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
