// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import paperDecorator from '../../../PaperDecorator';
import { AiRequestChat } from '../../../../AiGeneration/AiRequestChat';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';

export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/Chat',
  component: AiRequestChat,
  decorators: [paperDecorator],
};

const commonProps = {
  editorCallbacks: {
    onOpenLayout: () => {},
    onOpenEvents: () => {},
  },
  project: null,
  quota: {
    limitReached: false,
    current: 0,
    max: 2,
  },
  onStartNewAiRequest: () => {},
  onSendMessage: async () => {},
  isSending: false,
  price: {
    priceInCredits: 5,
    variablePrice: {
      agent: {
        maximumPriceInCredits: 20,
      },
    },
  },
  lastSendError: null,
  availableCredits: 400,
  onSendFeedback: async () => {},
  hasOpenedProject: false,
  editorFunctionCallResults: [],
  increaseQuotaOffering: 'subscribe',
  onProcessFunctionCalls: async () => {},
  setAutoProcessFunctionCalls: () => {},
  isAutoProcessingFunctionCalls: false,
};

export const NewAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat i18n={i18n} aiRequest={null} {...commonProps} />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const NewAiRequestAlreadyUsedOneInThePast = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={null}
          {...commonProps}
          quota={{
            limitReached: false,
            current: 1,
            max: 2,
          }}
          increaseQuotaOffering="upgrade"
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const ErrorLaunchingNewAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={null}
          {...commonProps}
          lastSendError={new Error('Fake error while sending request')}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const NewAiRequestQuotaLimitReachedAndNoCredits = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={null}
          {...commonProps}
          quota={{
            limitReached: true,
            current: 2,
            max: 2,
          }}
          availableCredits={0}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const NewAiRequestQuotaLimitReachedAndSomeCredits = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={null}
          {...commonProps}
          quota={{
            limitReached: true,
            current: 2,
            max: 2,
          }}
          availableCredits={400}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const NewAiRequestQuotaLimitReachedAndUpgrade = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={null}
          {...commonProps}
          quota={{
            limitReached: true,
            current: 2,
            max: 2,
          }}
          increaseQuotaOffering="upgrade"
          availableCredits={400}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const LaunchingNewAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={null}
          isSending={true}
          {...commonProps}
        />
      )}
    </I18n>
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
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
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
          {...commonProps}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const WorkingNewAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
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
          {...commonProps}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

const fakeOutputWithAiResponses = [
  ...fakeOutputWithUserRequestOnly,
  {
    type: 'message',
    status: 'completed',
    role: 'assistant',
    content: [
      {
        type: 'output_text',
        status: 'completed',
        text:
          'Creating a GTA-style game is a complex undertaking, but here\'s a breakdown of the key elements and how you can approach them in GDevelop:\n\n**1. Core Mechanics:**\n\n*   **Open World Environment:**\n    *   Create a large scene using [TiledSpriteObject::TiledSprite](object_type:TiledSpriteObject::TiledSprite) for the ground and buildings.\n    *   Consider using multiple scenes and the action [Scene](action:Scene) to load the scenes instead of the current one.\n    *   Optimize performance by using techniques like object picking and only keeping picked objects that meet a condition.\n*   **Character Control:**\n    *   Use a [Sprite](object_type:Sprite) for the player character.\n    *   Add a [PlatformBehavior::PlatformerObjectBehavior](behavior_type:PlatformBehavior::PlatformerObjectBehavior) or [Physics2::Physics2Behavior](behavior_type:Physics2::Physics2Behavior) to the player object for movement.\n    *   For more complex movement, consider using the "Advanced platformer movements" or "Top-down movement" extensions.\n*   **Driving:**\n    *   Create a new [Sprite](object_type:Sprite) for vehicles.\n    *   Use the `Physics2` behavior to simulate realistic car physics.\n    *   Use the "Physics car" extension to easily simulate car motion.\n*   **Weapons and Combat:**\n    *   Implement a system for equipping and switching weapons.\n    *   Use the "Fire bullets" extension to create projectiles.\n    *   Implement collision detection between bullets and enemies using [CollisionNP](condition:CollisionNP).\n    *   Use the [Health::Health](behavior_type:Health::Health) behavior to manage health and damage.\n*   **NPCs and AI:**\n    *   Create NPC objects using [Sprite](object_type:Sprite).\n    *   Use variables and events to control their behavior, such as patrolling, chasing the player, or reacting to events.\n    *   Consider using the "Pathfinding behavior" to allow NPCs to navigate the world.\n*   **Missions and Story:**\n    *   Use scene variables to track the progress of the story and missions.\n    *   Use events to trigger different actions and dialogues based on the player\'s progress.\n    *   Use the "Dialogue Tree" extension to create branching conversations with NPCs.\n\n**2. Essential Features:**\n\n*   **Camera System:**\n    *   Use the action [CentreCamera](action:CentreCamera) to center the camera on the specified object.\n    *   Consider using the "Smooth Camera" extension for a more polished camera experience.\n*   **User Interface (UI):**\n    *   Create a UI using [TextObject::Text](object_type:TextObject::Text) objects and [PanelSpriteButton::PanelSpriteButton](object_type:PanelSpriteButton::PanelSpriteButton) for menus, health bars, and other information displays.\n    *   Use layers to separate the UI from the game world.\n*   **Sound Effects and Music:**\n    *   Add sound effects for weapons, explosions, and other actions using the action [PlaySound](action:PlaySound).\n    *   Play background music to set the mood of the game using the action [PlayMusic](action:PlayMusic).\n*   **Saving and Loading:**\n    *   Use the "Storage" extension to save and load the game\'s state, including player position, health, and inventory.\n\n**3. GDevelop Features and Extensions to Consider:**\n\n*   **Variables:** Use global, scene, and object variables to store and manage game data.\n*   **Events:** Use events to create the game logic, handle user input, and control object behavior.\n*   **Behaviors:** Use behaviors to add pre-built functionality to objects, such as movement, physics, and AI.\n*   **Extensions:**\n    *   "Pathfinding behavior": For NPC navigation.\n    *   "Health": For managing health and damage.\n    *   "Fire bullets": For creating projectiles.\n    *   "Tweening": For creating smooth animations and transitions.\n    *   "Advanced HTTP": For interacting with web services and APIs.\n    *   "Lights": For creating dynamic lighting effects.\n    *   "3D" and "3D physics engine": For creating a 3D environment (more advanced).\n\n**4. Example Implementation (Simplified):**\n\n*   **Player Movement:**\n    *   Condition: [KeyFromTextPressed](condition:KeyFromTextPressed) Key "Right" is pressed\n    *   Action: [AddForceAL](action:AddForceAL) Add a force to `Player` with angle 0 and length 100\n    *   Condition: [KeyFromTextPressed](condition:KeyFromTextPressed) Key "Left" is pressed\n    *   Action: [AddForceAL](action:AddForceAL) Add a force to `Player` with angle 180 and length 100\n*   **Shooting:**\n    *   Condition: [MouseButtonFromTextPressed](condition:MouseButtonFromTextPressed) Mouse button "Left" is pressed\n    *   Action: [Create](action:Create) Create a new object `Bullet` at `Player.X()`; `Player.Y()`\n    *   Action: [AddForceAL](action:AddForceAL) Add a force to `Bullet` with angle `Object.Angle()` and length 500\n*   **Collision:**\n    *   Condition: [CollisionNP](condition:CollisionNP) `Player` is in collision with `Enemy`\n    *   Action: [ModVarObjet](action:ModVarObjet) Do `MyHealth.Variable(Health)` - 10\n    *   Action: [ModVarObjet](action:ModVarObjet) Do `Health.Variable(Health)` - 20\n\nRemember to break down the development into smaller, manageable tasks. Start with the core mechanics and gradually add more features as you progress.\n\n By the way, this is a test for a link inside a code block:\n```\n[Create](action:Create) and a [Text object](object_type:TextObject::Text)\n```\n',
        annotations: [],
      },
    ],
  },
];

const fakeOutputWithMoreAiResponses = [
  ...fakeOutputWithUserRequestOnly,
  ...new Array(7)
    .fill([
      {
        type: 'message',
        status: 'completed',
        role: 'user',
        content: [
          {
            type: 'user_request',
            status: 'completed',
            text: 'Some follow up question. Lorem ipsum user.',
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
            text: 'Some **answer** from the AI. Lorem ipsum AI.',
            annotations: [],
          },
        ],
      },
    ])
    .flat(),
];

const fakeOutputWithEvenMoreAiResponses = [
  ...fakeOutputWithUserRequestOnly,
  ...new Array(15)
    .fill([
      {
        type: 'message',
        status: 'completed',
        role: 'user',
        content: [
          {
            type: 'user_request',
            status: 'completed',
            text: 'Some follow up question. Lorem ipsum user.',
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
            text: 'Some **answer** from the AI. Lorem ipsum AI.',
            annotations: [],
          },
        ],
      },
    ])
    .flat(),
];

export const ReadyAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
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
          {...commonProps}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestWithMoreMessages = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={{
            createdAt: '',
            updatedAt: '',
            id: 'fake-working-new-ai-request',
            status: 'ready',
            userId: 'fake-user-id',
            gameProjectJson: 'FAKE DATA',
            output: fakeOutputWithMoreAiResponses,
            error: null,
          }}
          {...commonProps}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestWithEvenMoreMessages = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
          aiRequest={{
            createdAt: '',
            updatedAt: '',
            id: 'fake-working-new-ai-request',
            status: 'ready',
            userId: 'fake-user-id',
            gameProjectJson: 'FAKE DATA',
            output: fakeOutputWithEvenMoreAiResponses,
            error: null,
          }}
          {...commonProps}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const ReadyAiRequestAndAlreadyUsedOneInThePast = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
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
          {...commonProps}
          increaseQuotaOffering="upgrade"
          quota={{
            limitReached: false,
            current: 1,
            max: 30,
          }}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const ErrorLaunchingFollowupAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
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
          {...commonProps}
          lastSendError={new Error('fake error while sending request')}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const LaunchingFollowupAiRequest = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
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
          {...commonProps}
          isSending={true}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const QuotaLimitReached = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
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
          {...commonProps}
          quota={{
            limitReached: true,
            current: 2,
            max: 2,
          }}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const QuotaLimitReachedAndUpgrade = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
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
          {...commonProps}
          quota={{
            limitReached: true,
            current: 2,
            max: 2,
          }}
          increaseQuotaOffering="upgrade"
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const QuotaLimitReachedAndNoUpgrade = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
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
          {...commonProps}
          quota={{
            limitReached: true,
            current: 2,
            max: 2,
          }}
          increaseQuotaOffering="none"
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);
export const QuotaLimitReachedAndNoCredits = () => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat
          i18n={i18n}
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
          quota={{
            limitReached: true,
            current: 2,
            max: 2,
          }}
          {...commonProps}
          increaseQuotaOffering="none"
          availableCredits={0}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);
