// @flow
import { makeTestProject } from '../../../fixtures/TestProject';
import { unserializeFromJSObject } from '../../../Utils/Serializer';
import { renderEventsAsText } from '.';

const gd: libGDevelop = global.gd;

describe('EventsTree/TextRenderer', () => {
  it('renders events as text', () => {
    const { project } = makeTestProject(gd);
    try {
      const serializedEvents = [
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
            {
              type: { value: 'ChangeAnimation' },
              parameters: ['MySpriteObject', '=', '1'],
            },
            {
              type: { value: 'Montre' },
              parameters: ['GroupOfObjects', ''],
            },
          ],
          events: [
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [
                {
                  type: {
                    value: 'BuiltinCommonInstructions::And',
                  },
                  parameters: [
                    'GroupOfSpriteObjectsWithBehaviors',
                    'PlatformerObject',
                  ],
                  subInstructions: [
                    {
                      type: {
                        inverted: true,
                        value: 'PlatformBehavior::IsFalling',
                      },
                      parameters: [
                        'GroupOfSpriteObjectsWithBehaviors',
                        'PlatformerObject',
                      ],
                    },
                    {
                      type: {
                        inverted: true,
                        value: 'PlatformBehavior::IsFalling',
                      },
                      parameters: [
                        'GroupOfSpriteObjectsWithBehaviors',
                        'PlatformerObject',
                      ],
                    },
                  ],
                },
              ],
              actions: [
                {
                  type: { value: 'ChangeAnimation' },
                  parameters: ['MySpriteObject', '=', '1'],
                },
                {
                  type: { value: 'Cache' },
                  parameters: ['GroupOfObjects', ''],
                },
                {
                  type: { value: 'ThisActionDoesNotExist' },
                  parameters: ['GroupOfObjects', ''],
                },
              ],
              events: [],
            },
            {
              type: 'BuiltinCommonInstructions::While',
              whileConditions: [
                {
                  type: { value: 'PlatformBehavior::IsFalling' },
                  parameters: [
                    'GroupOfSpriteObjectsWithBehaviors',
                    'PlatformerObject',
                  ],
                },
              ],
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
                {
                  type: { value: 'ChangeAnimation' },
                  parameters: ['MySpriteObject', '=', '1'],
                },
                {
                  type: { value: 'Montre' },
                  parameters: ['GroupOfObjects', ''],
                },
              ],
            },
            {
              type: 'BuiltinCommonInstructions::Repeat',
              repeatExpression: '3 + 4',
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
                {
                  type: { value: 'ChangeAnimation' },
                  parameters: ['MySpriteObject', '=', '1'],
                },
                {
                  type: { value: 'Montre' },
                  parameters: ['GroupOfObjects', ''],
                },
              ],
            },
            {
              type: 'BuiltinCommonInstructions::Group',
              name: 'My super group',
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
                    {
                      type: { value: 'ChangeAnimation' },
                      parameters: ['MySpriteObject', '=', '1'],
                    },
                    {
                      type: { value: 'Montre' },
                      parameters: ['GroupOfObjects', ''],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const eventsList = new gd.EventsList();
      unserializeFromJSObject(
        eventsList,
        serializedEvents,
        'unserializeFrom',
        project
      );

      expect(renderEventsAsText({ eventsList, parentPath: '', padding: '' }))
        .toMatchInlineSnapshot(`
        "<event-0>
         Conditions:
         - GroupOfSpriteObjectsWithBehaviors is falling
         Actions:
         - Change the number of the animation of MySpriteObject: = 1
         - Show GroupOfObjects
         Sub-events:
          <event-0.0>
           Conditions:
           - If all of these conditions are true:
            - (inverted) GroupOfSpriteObjectsWithBehaviors is falling
            - (inverted) GroupOfSpriteObjectsWithBehaviors is falling
           Actions:
           - Change the number of the animation of MySpriteObject: = 1
           - Hide GroupOfObjects
           - Unknown or unsupported instruction
          </event-0.0>
          <event-0.1>
           While these conditions are true:
            - GroupOfSpriteObjectsWithBehaviors is falling
           Then do:
           Conditions:
            - GroupOfSpriteObjectsWithBehaviors is falling
           Actions:
            - Change the number of the animation of MySpriteObject: = 1
            - Show GroupOfObjects
          </event-0.1>
          <event-0.2>
           Repeat \`3 + 4\` times these:
           Conditions:
            - GroupOfSpriteObjectsWithBehaviors is falling
           Actions:
            - Change the number of the animation of MySpriteObject: = 1
            - Show GroupOfObjects
          </event-0.2>
          <event-0.3>
           Group called \\"My super group\\":
           Sub-events:
            <event-0.3.0>
             Conditions:
             - GroupOfSpriteObjectsWithBehaviors is falling
             Actions:
             - Change the number of the animation of MySpriteObject: = 1
             - Show GroupOfObjects
            </event-0.3.0>
          </event-0.3>
        </event-0>"
      `);
    } finally {
      project.delete();
    }
  });
});
