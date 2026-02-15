// @flow
import { makeTestProject } from '../../../fixtures/TestProject';
import { unserializeFromJSObject } from '../../../Utils/Serializer';
import { renderNonTranslatedEventsAsText } from '.';

const gd: libGDevelop = global.gd;

describe('EventsTree/TextRenderer', () => {
  it('renders events as text', () => {
    const { project } = makeTestProject(gd);
    try {
      const longCommentText = 'A'.repeat(450);
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
              type: { value: 'Show' },
              parameters: ['GroupOfObjects', ''],
            },
          ],
          events: [
            {
              type: 'BuiltinCommonInstructions::Else',
              conditions: [],
              actions: [
                {
                  type: { value: 'Show' },
                  parameters: ['GroupOfObjects', ''],
                },
              ],
            },
            {
              type: 'BuiltinCommonInstructions::Repeat',
              repeatExpression: '1',
              conditions: [],
              actions: [],
            },
            {
              type: 'BuiltinCommonInstructions::Else',
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
              ],
            },
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
                  type: { value: 'Show' },
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
                  type: { value: 'Show' },
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
                      type: { value: 'Show' },
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
              ],
            },
            {
              type: 'BuiltinCommonInstructions::Else',
              conditions: [],
              actions: [
                {
                  type: { value: 'Show' },
                  parameters: ['GroupOfObjects', ''],
                },
              ],
            },
            {
              type: 'BuiltinCommonInstructions::Else',
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
              ],
            },
            {
              type: 'BuiltinCommonInstructions::Else',
              variables: [
                {
                  name: 'MyElseVar',
                  type: 'number',
                  value: '42',
                },
              ],
              conditions: [],
              actions: [
                {
                  type: { value: 'Cache' },
                  parameters: ['GroupOfObjects', ''],
                },
              ],
            },
          ],
        },
        // Disabled event with conditions/actions - should get disabled="true"
        {
          type: 'BuiltinCommonInstructions::Standard',
          disabled: true,
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
              type: { value: 'Show' },
              parameters: ['GroupOfObjects', ''],
            },
          ],
          events: [
            // Sub-event of disabled parent - should get disabled-because-of-ancestor="true"
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [
                {
                  type: { value: 'Show' },
                  parameters: ['GroupOfObjects', ''],
                },
              ],
            },
          ],
        },
        // Short comment
        {
          type: 'BuiltinCommonInstructions::Comment',
          comment: 'This is a short comment',
          color: { r: 255, g: 230, b: 109, textR: 0, textG: 0, textB: 0 },
        },
        // Long comment (>400 chars) - should be truncated
        {
          type: 'BuiltinCommonInstructions::Comment',
          comment: longCommentText,
          color: { r: 255, g: 230, b: 109, textR: 0, textG: 0, textB: 0 },
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
           ~~Else~~ (Else is ignored because not following a standard event)

           Conditions:
           (no conditions)
           Actions:
           - Show GroupOfObjects
          </event-0.0>
          <event-0.1 type=\\"repeat\\">
           Repeat \`1\` times these:
           Conditions:
            (no conditions)
           Actions:
            (no actions)
          </event-0.1>
          <event-0.2>
           ~~Else if~~ (Else is ignored because not following a standard event)

           Conditions:
           - GroupOfSpriteObjectsWithBehaviors is falling
           Actions:
           - Change the number of the animation of MySpriteObject: = 1
          </event-0.2>
          <event-0.3>
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
          </event-0.3>
          <event-0.4 type=\\"while\\">
           While these conditions are true:
            - GroupOfSpriteObjectsWithBehaviors is falling
           Then do:
           Conditions:
            - GroupOfSpriteObjectsWithBehaviors is falling
           Actions:
            - Change the number of the animation of MySpriteObject: = 1
            - Show GroupOfObjects
          </event-0.4>
          <event-0.5 type=\\"repeat\\">
           Repeat \`3 + 4\` times these:
           Conditions:
            - GroupOfSpriteObjectsWithBehaviors is falling
           Actions:
            - Change the number of the animation of MySpriteObject: = 1
            - Show GroupOfObjects
          </event-0.5>
          <event-0.6 type=\\"group\\">
           Group called \\"My super group\\":
           Sub-events:
            <event-0.6.0>
             Conditions:
             - GroupOfSpriteObjectsWithBehaviors is falling
             Actions:
             - Change the number of the animation of MySpriteObject: = 1
             - Show GroupOfObjects
            </event-0.6.0>
            <event-0.6.1>
             Conditions:
             (no conditions)
             Actions:
             (no actions)
            </event-0.6.1>
          </event-0.6>
          <event-0.7>
           Conditions:
           - GroupOfSpriteObjectsWithBehaviors is falling
           Actions:
           - Change the number of the animation of MySpriteObject: = 1
          </event-0.7>
          <event-0.8 else-of=\\"event-0.7\\">
           Else

           Conditions:
           (no conditions)
           Actions:
           - Show GroupOfObjects
          </event-0.8>
          <event-0.9 else-of=\\"event-0.8\\">
           Else if

           Conditions:
           - GroupOfSpriteObjectsWithBehaviors is falling
           Actions:
           - Change the number of the animation of MySpriteObject: = 1
          </event-0.9>
          <event-0.10 else-of=\\"event-0.9\\">
           Else
           - Declare local variable \\"MyElseVar\\" of type \\"number\\" with value \`42\`

           Conditions:
           (no conditions)
           Actions:
           - Hide GroupOfObjects
          </event-0.10>
        </event-0>
        <event-1 disabled=\\"true\\">
         Conditions:
         - GroupOfSpriteObjectsWithBehaviors is falling
         Actions:
         - Show GroupOfObjects
         Sub-events:
          <event-1.0 disabled-because-of-ancestor=\\"true\\">
           Conditions:
           (no conditions)
           Actions:
           - Show GroupOfObjects
          </event-1.0>
        </event-1>
        <event-2 type=\\"comment\\">
         This is a short comment
        </event-2>
        <event-3 type=\\"comment\\">
         AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA[cut - 50 more characters]
        </event-3>"
      `);
    } finally {
      project.delete();
    }
  });
});
