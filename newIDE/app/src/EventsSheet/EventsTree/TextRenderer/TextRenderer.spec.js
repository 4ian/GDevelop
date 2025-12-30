// @flow
import { makeTestProject } from '../../../fixtures/TestProject';
import { unserializeFromJSObject } from '../../../Utils/Serializer';
import { renderNonTranslatedEventsAsText } from '.';

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
              variables: [
                {
                  name: 'MyVariable',
                  type: 'number',
                  value: '1',
                },
                {
                  name: 'MyArray',
                  type: 'array',
                  children: [
                    {
                      type: 'number',
                      value: '-0.1',
                    },
                    {
                      type: 'number',
                      value: '2.3',
                    },
                    {
                      type: 'string',
                      value: 'three',
                    },
                  ],
                },
                {
                  name: 'MyStructure',
                  type: 'structure',
                  children: [
                    {
                      name: 'MyChild',
                      type: 'number',
                      value: '1',
                    },
                    {
                      name: 'MyChild2',
                      type: 'array',
                      children: [
                        {
                          type: 'number',
                          value: '1',
                        },
                        {
                          type: 'number',
                          value: '2',
                        },
                        {
                          type: 'string',
                          value: 'three',
                        },
                        {
                          type: 'boolean',
                          value: 'true',
                        },
                      ],
                    },
                  ],
                },
              ],
              conditions: [
                {
                  type: {
                    value: 'BuiltinCommonInstructions::And',
                  },
                  parameters: [],
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
                {
                  type: {
                    value: 'BuiltinCommonInstructions::And',
                  },
                  parameters: [],
                  subInstructions: [],
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
                {
                  type: 'BuiltinCommonInstructions::Standard',
                  conditions: [],
                  actions: [],
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

      expect(
        renderNonTranslatedEventsAsText({
          eventsList,
        })
      ).toMatchInlineSnapshot(`
        "<event-0>
         Conditions:
         - GroupOfSpriteObjectsWithBehaviors is falling
         Actions:
         - Change the number of the animation of MySpriteObject: = 1
         - Show GroupOfObjects
         Sub-events:
          <event-0.0>
           - Declare local variable \\"MyVariable\\" of type \\"number\\" with value \`1\`
           - Declare local variable \\"MyArray\\" of type \\"array\\" with value \`[-0.1,2.3,\\"three\\"]\`
           - Declare local variable \\"MyStructure\\" of type \\"structure\\" with value \`{\\"MyChild\\":1,\\"MyChild2\\":[1,2,\\"three\\",true]}\`

           Conditions:
           - If all of these conditions are true:
             - (inverted) GroupOfSpriteObjectsWithBehaviors is falling
             - (inverted) GroupOfSpriteObjectsWithBehaviors is falling
           - If all of these conditions are true:
             (no conditions)
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
            <event-0.3.1>
             Conditions:
             (no conditions)
             Actions:
             (no actions)
            </event-0.3.1>
          </event-0.3>
        </event-0>"
      `);
    } finally {
      project.delete();
    }
  });
});
