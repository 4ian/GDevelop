// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import paperDecorator from '../../../PaperDecorator';
import { AiRequestChat } from '../../../../AiGeneration/AiRequestChat';
import { type AiRequest } from '../../../../Utils/GDevelopServices/Generation';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { action } from '@storybook/addon-actions';
import {
  defaultAuthenticatedUserWithNoSubscription,
  fakeSilverAuthenticatedUser,
  fakeStartupAuthenticatedUser,
  limitsForNoSubscriptionUser,
  limitsForSilverUser,
  limitsForStartupUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import FixedWidthFlexContainer from '../../../FixedWidthFlexContainer';
import PreferencesContext, {
  initialPreferences,
} from '../../../../MainFrame/Preferences/PreferencesContext';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { SubscriptionProvider } from '../../../../Profile/Subscription/SubscriptionContext';
import { CreditsPackageStoreStateProvider } from '../../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';

export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/Chat',
  component: AiRequestChat,
  decorators: [paperDecorator],
};

const commonProps = {
  aiConfigurationPresetsWithAvailability: [
    {
      id: 'default',
      nameByLocale: { en: 'Default' },
      mode: 'chat',
      disabled: false,
      enableWith: null,
    },
    {
      id: 'expert-mode',
      nameByLocale: { en: 'Expert Mode' },
      mode: 'chat',
      disabled: false,
      enableWith: null,
    },
    {
      id: 'default',
      nameByLocale: { en: 'Default' },
      mode: 'agent',
      disabled: false,
      enableWith: null,
    },
    {
      id: 'extended-thinking',
      nameByLocale: { en: 'Extended Thinking' },
      mode: 'agent',
      disabled: false,
      enableWith: null,
    },
    {
      id: 'max-mode',
      nameByLocale: { en: 'MAX mode' },
      mode: 'agent',
      disabled: true,
      enableWith: 'higher-tier-plan',
    },
  ],
  editorCallbacks: {
    onOpenLayout: action('onOpenLayout'),
    onCreateProject: async () => ({ exampleSlug: null, createdProject: null }),
  },
  project: null,
  quota: {
    limitReached: false,
    current: 0,
    max: 20,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  },
  onStartNewAiRequest: action('onStartNewAiRequest'),
  onSendUserMessage: action('onSendUserMessage'),
  isSending: false,
  price: {
    priceInCredits: 3,
    variablePrice: {
      agent: {
        default: {
          minimumPriceInCredits: 3,
          maximumPriceInCredits: 20,
        },
      },
      chat: {
        default: {
          minimumPriceInCredits: 3,
          maximumPriceInCredits: 20,
        },
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
  onStartOrOpenChat: () => {},
  aiRequestMode: 'chat',
  saveProject: async () => {},
  onRestore: async () => {},
};

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

const fakeAiRequest: AiRequest = {
  createdAt: '',
  updatedAt: '',
  id: 'fake-working-new-ai-request',
  status: 'ready',
  userId: 'fake-user-id',
  gameProjectJson: 'FAKE DATA',
  output: fakeOutputWithUserRequestOnly,
  error: null,
};

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
const aiRequestWithAiResponses: AiRequest = {
  ...fakeAiRequest,
  output: fakeOutputWithAiResponses,
};

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
const aiRequestWithMoreAiResponses: AiRequest = {
  ...fakeAiRequest,
  output: fakeOutputWithMoreAiResponses,
};

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
const aiRequestWithEvenMoreAiResponses: AiRequest = {
  ...fakeAiRequest,
  output: fakeOutputWithEvenMoreAiResponses,
};

const WrappedChatComponent = (allProps: any) => {
  const {
    authenticatedUser,
    automaticallyUseCreditsForAiRequests,
    ...chatProps
  } = allProps;
  const authenticatedUserToUse =
    authenticatedUser || fakeSilverAuthenticatedUser;
  const [automaticallyUseCredits, setAutomaticallyUseCredits] = React.useState(
    automaticallyUseCreditsForAiRequests || false
  );
  return (
    <FixedHeightFlexContainer height={800}>
      <FixedWidthFlexContainer width={600}>
        <PreferencesContext.Provider
          value={{
            ...initialPreferences,
            values: {
              ...initialPreferences.values,
              automaticallyUseCreditsForAiRequests: automaticallyUseCredits,
            },
            setAutomaticallyUseCreditsForAiRequests: (value: boolean) => {
              setAutomaticallyUseCredits(value);
            },
          }}
        >
          <AuthenticatedUserContext.Provider value={authenticatedUserToUse}>
            <SubscriptionProvider>
              <CreditsPackageStoreStateProvider>
                <I18n>
                  {({ i18n }) => (
                    <AiRequestChat
                      i18n={i18n}
                      {...commonProps}
                      {...chatProps}
                    />
                  )}
                </I18n>
              </CreditsPackageStoreStateProvider>
            </SubscriptionProvider>
          </AuthenticatedUserContext.Provider>
        </PreferencesContext.Provider>
      </FixedWidthFlexContainer>
    </FixedHeightFlexContainer>
  );
};

export const ReadyAiRequest = () => (
  <WrappedChatComponent
    aiRequest={fakeAiRequest}
    quota={{
      limitReached: false,
      current: 10,
      max: 50,
      resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
      period: '7days',
    }}
  />
);

export const ReadyAiRequestWithAiResponses = () => (
  <WrappedChatComponent
    aiRequest={aiRequestWithAiResponses}
    quota={{
      limitReached: false,
      current: 10,
      max: 50,
      resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
      period: '7days',
    }}
  />
);

export const ReadyAiRequestWithMoreAiResponses = () => (
  <WrappedChatComponent
    aiRequest={aiRequestWithMoreAiResponses}
    quota={{
      limitReached: false,
      current: 10,
      max: 50,
      resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
      period: '7days',
    }}
  />
);

export const ReadyAiRequestWithEvenMoreAiResponses = () => (
  <WrappedChatComponent
    aiRequest={aiRequestWithEvenMoreAiResponses}
    quota={{
      limitReached: false,
      current: 10,
      max: 50,
      resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
      period: '7days',
    }}
  />
);

export const LaunchingFollowupAiRequest = () => (
  <WrappedChatComponent aiRequest={aiRequestWithAiResponses} isSending={true} />
);

export const ErrorLaunchingFollowupAiRequest = () => (
  <WrappedChatComponent
    aiRequest={aiRequestWithAiResponses}
    lastSendError={new Error('fake error while sending request')}
  />
);

export const QuotaLimitsReachedAndAutomaticallyUsingCredits = () => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={aiRequestWithAiResponses}
      quota={quota}
      isAutoProcessingFunctionCalls={true}
      authenticatedUser={{
        ...defaultAuthenticatedUserWithNoSubscription,
        limits: {
          ...limitsForNoSubscriptionUser,
          credits: {
            userBalance: {
              amount: 400,
            },
          },
          quotas: {
            'consumed-ai-credits': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={true}
      availableCredits={400}
    />
  );
};

export const QuotaLimitsReachedAndAutomaticallyUsingCreditsButNoneLeft = () => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={aiRequestWithAiResponses}
      quota={quota}
      isAutoProcessingFunctionCalls={true}
      authenticatedUser={{
        ...defaultAuthenticatedUserWithNoSubscription,
        limits: {
          ...limitsForNoSubscriptionUser,
          credits: {
            userBalance: {
              amount: 0,
            },
          },
          quotas: {
            'consumed-ai-credits': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={true}
      availableCredits={0}
    />
  );
};

export const QuotaLimitsReachedAndAutomaticallyUsingCreditsButNoneLeftWithSilverSubscription = () => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={aiRequestWithAiResponses}
      quota={quota}
      isAutoProcessingFunctionCalls={true}
      authenticatedUser={{
        ...fakeSilverAuthenticatedUser,
        limits: {
          ...limitsForSilverUser,
          credits: {
            userBalance: {
              amount: 0,
            },
          },
          quotas: {
            'consumed-ai-credits': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={true}
      availableCredits={0}
    />
  );
};

export const QuotaLimitsReachedAndAutomaticallyUsingCreditsButNoneLeftWithStartupSubscription = () => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={aiRequestWithAiResponses}
      quota={quota}
      isAutoProcessingFunctionCalls={true}
      authenticatedUser={{
        ...fakeStartupAuthenticatedUser,
        limits: {
          ...limitsForStartupUser,
          credits: {
            userBalance: {
              amount: 0,
            },
          },
          quotas: {
            'consumed-ai-credits': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={true}
      availableCredits={0}
    />
  );
};

export const QuotaLimitsReachedAndNotAutomaticallyUsingCredits = () => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={aiRequestWithAiResponses}
      quota={quota}
      isAutoProcessingFunctionCalls={true}
      authenticatedUser={{
        ...defaultAuthenticatedUserWithNoSubscription,
        limits: {
          ...limitsForNoSubscriptionUser,
          credits: {
            userBalance: {
              amount: 400,
            },
          },
          quotas: {
            'consumed-ai-credits': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={false}
      availableCredits={400}
    />
  );
};

export const QuotaLimitsReachedAndNotAutomaticallyUsingCreditsButNoneLeft = () => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={aiRequestWithAiResponses}
      quota={quota}
      isAutoProcessingFunctionCalls={true}
      authenticatedUser={{
        ...defaultAuthenticatedUserWithNoSubscription,
        limits: {
          ...limitsForNoSubscriptionUser,
          credits: {
            userBalance: {
              amount: 0,
            },
          },
          quotas: {
            'consumed-ai-credits': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={false}
      availableCredits={0}
    />
  );
};

export const QuotaLimitsReachedAndNotAutomaticallyUsingCreditsButNoneLeftNoSubscription = () => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={aiRequestWithAiResponses}
      quota={quota}
      isAutoProcessingFunctionCalls={true}
      authenticatedUser={{
        ...defaultAuthenticatedUserWithNoSubscription,
        limits: {
          ...limitsForNoSubscriptionUser,
          credits: {
            userBalance: {
              amount: 0,
            },
          },
          quotas: {
            'consumed-ai-credits': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={false}
      availableCredits={0}
    />
  );
};

export const QuotaLimitsReachedAndNotAutomaticallyUsingCreditsButNoneLeftWithSilverSubscription = () => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={aiRequestWithAiResponses}
      quota={quota}
      isAutoProcessingFunctionCalls={true}
      authenticatedUser={{
        ...fakeSilverAuthenticatedUser,
        limits: {
          ...limitsForSilverUser,
          credits: {
            userBalance: {
              amount: 0,
            },
          },
          quotas: {
            'consumed-ai-credits': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={false}
      availableCredits={0}
    />
  );
};

export const QuotaLimitsReachedAndNotAutomaticallyUsingCreditsButNoneLeftWithStartupSubscription = () => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={aiRequestWithAiResponses}
      quota={quota}
      isAutoProcessingFunctionCalls={true}
      authenticatedUser={{
        ...fakeStartupAuthenticatedUser,
        limits: {
          ...limitsForStartupUser,
          credits: {
            userBalance: {
              amount: 0,
            },
          },
          quotas: {
            'consumed-ai-credits': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={false}
      availableCredits={0}
    />
  );
};
