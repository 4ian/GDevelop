// @flow
import * as React from 'react';
import paperDecorator from '../../PaperDecorator';
import { AiRequestChat } from '../../../MainFrame/EditorContainers/AskAi/AiRequestChat';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';

export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat',
  component: AiRequestChat,
  decorators: [paperDecorator],
};

export const NewAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <AiRequestChat
      aiRequest={null}
      onSendUserRequest={async () => {}}
      isLaunchingAiRequest={false}
    />
  </FixedHeightFlexContainer>
);

export const LaunchingNewAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <AiRequestChat
      aiRequest={null}
      onSendUserRequest={async () => {}}
      isLaunchingAiRequest={true}
    />
  </FixedHeightFlexContainer>
);

const fakeOutputWithUserRequestOnly = [
    {
      type: 'message',
      status: 'completed',
      role: 'user',
      content: [
        {
          type: 'user_request',
          status: 'completed',
          text: 'How to add a leaderboard with the player best score?',
        },
      ],
    },
  ];

export const ErroredNewAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <AiRequestChat
      aiRequest={{
        createdAt: '',
        updatedAt: '',
        id: 'fake-working-new-ai-request',
        status: 'error',
        userId: 'fake-user-id',
        gameProjectJson: 'FAKE DATA',
        output: fakeOutputWithUserRequestOnly,
        error: { code: 'internal-error', message: 'Some error happened' },
      }}
      onSendUserRequest={async () => {}}
      isLaunchingAiRequest={false}
    />
  </FixedHeightFlexContainer>
);

export const WorkingNewAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <AiRequestChat
      aiRequest={{
        createdAt: '',
        updatedAt: '',
        id: 'fake-working-new-ai-request',
        status: 'working',
        userId: 'fake-user-id',
        gameProjectJson: 'FAKE DATA',
        output: fakeOutputWithUserRequestOnly,
        error: null,
      }}
      onSendUserRequest={async () => {}}
      isLaunchingAiRequest={false}
    />
  </FixedHeightFlexContainer>
);

const fakeReasoning = `
Ok, the goal is to create checkpoints, so the first thing to take into account is to use the Checkpoints extension.
Then, I need to explain the user how to create the checkpoint, and load it.

Here is the step-by-step solution:
1.  Add the \`Checkpoints\` extension to the project if not already present.
2.  Create a \"Checkpoint\" object (can be a Sprite or any other object you prefer).
3.  In the scene where you want to add your checkpoints, add a \"Checkpoint\" object at the places where you want the player to respawn
4.  Add a new event with the following conditions: \"Player\" is in collision with \"Checkpoint\".
5.  Add an action to this event: \"Save checkpoint\" for the object \"Player\".
6.  Add another event to handle the player death/scene reload.
7.  In this event, add an action that will \"Load checkpoint\" for the \"Player\".

That would create a basic checkpoint system that save the checkpoints when the player touch it, and re-spawn to the last checkpoint when the player dies.
`;

const fakeAnswer = `
To add a checkpoint system to your game, follow these steps:

1.  **Add the Checkpoints extension:** In the Project Manager, right-click on \"Extensions\", and choose \"Search new extensions\". Search for \"Checkpoints\" and install it.
2.  **Create a Checkpoint object:** In the Scene Editor, add a new object (e.g., a Sprite) named \"Checkpoint\". This object will represent the visual checkpoint in your game.
3.  **Place Checkpoints in your scene:** Drag instances of the \"Checkpoint\" object into your scene at the locations where you want the player to respawn.
4.  **Create events for saving checkpoints:** In the Events Editor, add a new event to save the checkpoint when the player collides with a Checkpoint object.
5.  **Add collision condition:** Add a condition \"Collision\" to check if the Player is in collision with the Checkpoint object.
6.  **Add save checkpoint action:** Add an action \"Save checkpoint\" (from the \"Checkpoints\" extension) to the event. Select the \"Player\" object. This action will store the player's current position as the new checkpoint.
7.  **Create events for loading checkpoints (i.e, respawning):** Add a new event (or events) to handle the player's death or when a respawn is triggered. For example, you can check when player health is <= 0 or when a specific key is pressed, or if your player touches a \"DeadlyArea\" object.
8. **Add load checkpoint action:** In this new event, add the \"Load checkpoint\" action (from the Checkpoints extension). Select the \"Player\" object. This action will set the player's position to the last saved checkpoint.
9. Test your game, and enjoy your new checkpoint system!

Here are the instructions for your assistant:

<events_generation_instructions>
Create a GDevelop game with two scenes: \"Main menu\" and \"Game level\".
The \"Game level\" scene will contains the \"Player\", \"Enemy\", \"Platform\", and \"MovingPlatform\" objects, as well as a \"Checkpoint\" object.
The project has a \"Health\" behavior for both \"Player\" and \"Enemy\", and a \"PlatformBehavior\" applied to \"Platform\" and \"MovingPlatform\" objects.

1. Create a new event that will save the checkpoint when \"Player\" is in collision with \"Checkpoint\". Use \"Save checkpoint\" action on \"Player\" object.
2. create a new event that will load the checkpoint when \"Player\"'s health is less or equal to 0. Use \"Load checkpoint\" action on \"Player\" object.
</events_generation_instructions>

Here are the required extensions:
<required_extensions>Checkpoints, Health, PlatformBehavior</required_extensions>
`;

const fakeOutputWithAiResponses = [
    ...fakeOutputWithUserRequestOnly,
    {
        type: 'message',
        status: 'completed',
        role: 'assistant',
        content: [
          {
            type: 'reasoning',
            status: 'completed',
            summary: {
              text: fakeReasoning,
              type: 'summary_text',
            },
          },
        ],
      },
      {
        type: 'message',
        status: 'completed',
        role: 'assistant',
        content: [
          {
            type: 'output_text',
            status: 'completed',
            text: fakeAnswer,
            annotations: [],
          },
        ],
      }
]

export const ReadyAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <AiRequestChat
      aiRequest={{
        createdAt: '',
        updatedAt: '',
        id: 'fake-working-new-ai-request',
        status: 'ready',
        userId: 'fake-user-id',
        gameProjectJson: 'FAKE DATA',
        output: fakeOutputWithAiResponses,
        error: null,
      }}
      onSendUserRequest={async () => {}}
      isLaunchingAiRequest={false}
    />
  </FixedHeightFlexContainer>
);

export const LaunchingFollowupAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <AiRequestChat
      aiRequest={{
        createdAt: '',
        updatedAt: '',
        id: 'fake-working-new-ai-request',
        status: 'ready',
        userId: 'fake-user-id',
        gameProjectJson: 'FAKE DATA',
        output: fakeOutputWithAiResponses,
        error: null,
      }}
      onSendUserRequest={async () => {}}
      isLaunchingAiRequest={true}
    />
  </FixedHeightFlexContainer>
);
