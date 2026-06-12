// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import paperDecorator from '../../../PaperDecorator';
import { AiRequestChat } from '../../../../AiGeneration/AiRequestChat';
import { type AiRequest } from '../../../../Utils/GDevelopServices/Generation';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import FixedWidthFlexContainer from '../../../FixedWidthFlexContainer';
import {
  agentAiRequest,
  agentAiRequestWithFailedAndIgnoredFunctionCallOutputs,
  agentAiRequestWithFunctionCallToDo,
} from '../../../../fixtures/GDevelopServicesTestData/FakeAiRequests';
import { action } from '@storybook/addon-actions';
import {
  defaultAuthenticatedUserWithNoSubscription,
  fakeSilverAuthenticatedUser,
  fakeStartupAuthenticatedUser,
  limitsForNoSubscriptionUser,
  limitsForSilverUser,
  limitsForStartupUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { SubscriptionProvider } from '../../../../Profile/Subscription/SubscriptionContext';
import PreferencesContext, {
  initialPreferences,
} from '../../../../MainFrame/Preferences/PreferencesContext';
import { CreditsPackageStoreStateProvider } from '../../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';

// Chat and Agent modes were merged into a single "orchestrator" mode: these
// stories exercise that unique mode (the conversational replies, the function
// calls run by the orchestrator and its edit sub-agents, and the inline
// "Apply this edit?" approval shown when auto edit is off).
export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/Orchestrator',
  component: AiRequestChat,
  decorators: [paperDecorator],
  // `commonProps` is a shared fixture re-used by other stories, not a story
  // itself - keep Storybook from rendering it as one.
  excludeStories: ['commonProps'],
};

export const commonProps = {
  // Chat and Agent modes were merged into a single "orchestrator" mode, with
  // the preset now choosing a reasoning level (see ReasoningLevelSelector).
  aiConfigurationPresetsWithAvailability: [
    {
      mode: 'orchestrator',
      id: 'default',
      nameByLocale: { en: 'Default' },
      reasoningLevelByLocale: { en: 'Medium' },
      reasoningLevel: 1,
      isDefault: true,
      disabled: false,
      enableWith: null,
      enabledWithPlans: ([]: Array<string>),
    },
    {
      mode: 'orchestrator',
      id: 'high-reasoning',
      nameByLocale: { en: 'High reasoning' },
      reasoningLevelByLocale: { en: 'High' },
      reasoningLevel: 2,
      isDefault: false,
      disabled: false,
      enableWith: null,
      enabledWithPlans: ([]: Array<string>),
    },
    {
      mode: 'orchestrator',
      id: 'max-mode',
      nameByLocale: { en: 'MAX mode' },
      reasoningLevelByLocale: { en: 'Maximum' },
      reasoningLevel: 3,
      isDefault: false,
      disabled: true,
      enableWith: 'higher-tier-plan',
      enabledWithPlans: [
        'gdevelop_gold',
        'gdevelop_startup',
        'gdevelop_education',
      ],
    },
  ],
  editorCallbacks: {
    onOpenLayout: (action('onOpenLayout'): any),
    onCreateProject: async (): Promise<{
      createdProject: null,
      exampleSlug: null,
    }> => ({ exampleSlug: null, createdProject: null }),
  },
  project: null,
  quota: {
    limitReached: false,
    current: 100,
    max: 200,
    period: '7days',
    resetsAt: (Date.now(): number) + 1000 * 60 * 60 * 24 * 2,
  },
  onStartNewAiRequest: (action('onStartNewAiRequest'): any),
  onSendUserMessage: (action('onSendUserMessage'): any),
  isSending: false,
  price: {
    priceInCredits: 3,
    variablePrice: {
      orchestrator: {
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
  // These stories all represent a chat within an opened project, so the
  // left-side controls (the "Auto edit" button and reasoning selector) show.
  hasOpenedProject: true,
  editorFunctionCallResults: ([]: Array<empty>),
  increaseQuotaOffering: 'subscribe',
  onProcessFunctionCalls: async () => {},
  onStop: async () => {},
  onStartOrOpenChat: () => {},
  saveProject: async () => {},
  onRestore: async () => {},
};

// Wraps AiRequestChat with all the contexts it needs. Stories can drive the
// "Auto edit" toggle through the `automaticallyApplyAiRequestEdits` preference
// (with a project opened, so it isn't forced on like in the no-project flow).
const WrappedChatComponent = (allProps: any) => {
  const {
    authenticatedUser,
    automaticallyUseCreditsForAiRequests,
    automaticallyApplyAiRequestEdits,
    ...chatProps
  } = allProps;
  const authenticatedUserToUse =
    authenticatedUser || fakeSilverAuthenticatedUser;
  const [automaticallyUseCredits, setAutomaticallyUseCredits] = React.useState(
    automaticallyUseCreditsForAiRequests || false
  );
  const applyEdits =
    typeof automaticallyApplyAiRequestEdits === 'boolean'
      ? automaticallyApplyAiRequestEdits
      : initialPreferences.values.automaticallyApplyAiRequestEdits;
  return (
    <FixedHeightFlexContainer height={800}>
      <FixedWidthFlexContainer width={600}>
        <PreferencesContext.Provider
          // $FlowFixMe[incompatible-type]
          value={{
            ...initialPreferences,
            // $FlowFixMe[incompatible-type]
            values: {
              ...initialPreferences.values,
              automaticallyUseCreditsForAiRequests: automaticallyUseCredits,
              automaticallyApplyAiRequestEdits: applyEdits,
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
  // $FlowFixMe[incompatible-type]
  output: fakeOutputWithUserRequestOnly,
  error: null,
};

// A long, markdown-rich assistant reply (the orchestrator answering a broad
// question), used to check the message rendering of links, lists and code.
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
          'Creating a GTA-style game is a complex undertaking, but here\'s a breakdown of the key elements and how you can approach them in GDevelop:\n\n**1. Core Mechanics:**\n\n*   **Open World Environment:**\n    *   Create a large scene using [TiledSpriteObject::TiledSprite](object_type:TiledSpriteObject::TiledSprite) for the ground and buildings.\n    *   Consider using multiple scenes and the action [Scene](action:Scene) to load the scenes instead of the current one.\n*   **Character Control:**\n    *   Use a [Sprite](object_type:Sprite) for the player character.\n    *   Add a [PlatformBehavior::PlatformerObjectBehavior](behavior_type:PlatformBehavior::PlatformerObjectBehavior) or [Physics2::Physics2Behavior](behavior_type:Physics2::Physics2Behavior) to the player object for movement.\n*   **Weapons and Combat:**\n    *   Use the "Fire bullets" extension to create projectiles.\n    *   Use the [Health::Health](behavior_type:Health::Health) behavior to manage health and damage.\n\nRemember to break down the development into smaller, manageable tasks. Start with the core mechanics and gradually add more features as you progress.\n\n By the way, this is a test for a link inside a code block:\n```\n[Create](action:Create) and a [Text object](object_type:TextObject::Text)\n```\n',
        annotations: [],
      },
    ],
  },
];
const aiRequestWithAiResponses: AiRequest = {
  ...fakeAiRequest,
  // $FlowFixMe[incompatible-type]
  output: fakeOutputWithAiResponses,
};

const fakeOutputWithMoreAiResponses = [
  ...fakeOutputWithUserRequestOnly,
  // $FlowFixMe[underconstrained-implicit-instantiation]
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
  // $FlowFixMe[incompatible-type]
  output: fakeOutputWithMoreAiResponses,
};

const fakeOutputWithEvenMoreAiResponses = [
  ...fakeOutputWithUserRequestOnly,
  // $FlowFixMe[underconstrained-implicit-instantiation]
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
  // $FlowFixMe[incompatible-type]
  output: fakeOutputWithEvenMoreAiResponses,
};

const fakeFunctionCallId = 'fake_function_call_1';

const fakeOutputWithFunctionCall = [
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
          'I can help you add a leaderboard. Let me check the objects in your scene first.',
        annotations: [],
      },
      {
        type: 'function_call',
        status: 'completed',
        call_id: fakeFunctionCallId,
        name: 'describe_instances',
        arguments: '{"scene_name": "Game"}',
      },
    ],
  },
];

const fakeOutputWithFunctionCallAndOutput = [
  ...fakeOutputWithFunctionCall,
  {
    type: 'function_call_output',
    call_id: fakeFunctionCallId,
    output:
      '{"success":true,"instances":[{"objectName":"Player","layer":"","x":400,"y":300}]}',
  },
  {
    type: 'message',
    status: 'completed',
    role: 'assistant',
    content: [
      {
        type: 'output_text',
        status: 'completed',
        text:
          'I see you have a Player object in your scene. Now I can help add a leaderboard system.',
        annotations: [],
      },
    ],
  },
];

const fakeOutputWithFunctionCallWithSameCallId = [
  ...fakeOutputWithFunctionCallAndOutput,
  {
    type: 'message',
    status: 'completed',
    role: 'assistant',
    content: [
      {
        type: 'output_text',
        status: 'completed',
        text:
          'This is another message and now a function call with the same call_id (as done by some LLM APIs):',
        annotations: [],
      },
      {
        type: 'function_call',
        status: 'completed',
        call_id: fakeFunctionCallId,
        name: 'describe_instances',
        arguments: '{"scene_name": "Game"}',
      },
    ],
  },
];

// A request whose modifying function call is waiting to run: used both to show
// the call on its own and (with `pendingEditApproval`) the approval prompt.
const fakeOutputWithModifyingFunctionCall = [
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
          'I will add the score display and the events to update it when coins are collected.',
        annotations: [],
      },
      {
        type: 'function_call',
        status: 'completed',
        call_id: 'fake_modifying_call_1',
        name: 'generate_scene_events',
        arguments: '{"scene_name": "Game"}',
      },
    ],
  },
];

const aiRequestWithModifyingFunctionCall: AiRequest = {
  ...fakeAiRequest,
  // $FlowFixMe[incompatible-type]
  output: fakeOutputWithModifyingFunctionCall,
};

// Without a project
// ------------------

// A chat started before any project is open (the no-project flow): auto edit is
// forced on and its button is hidden, since there is nothing to gate edits on
// until the project is created.
export const ChatStartedWithoutProject = (): React.Node => (
  <WrappedChatComponent
    hasOpenedProject={false}
    aiRequest={aiRequestWithAiResponses}
  />
);

// Conversational replies
// ----------------------

export const ReadyAiRequest = (): React.Node => (
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

export const ReadyAiRequestWithAiResponses = (): React.Node => (
  <WrappedChatComponent aiRequest={aiRequestWithAiResponses} />
);

export const ReadyAiRequestWithMoreAiResponses = (): React.Node => (
  <WrappedChatComponent aiRequest={aiRequestWithMoreAiResponses} />
);

export const ReadyAiRequestWithEvenMoreAiResponses = (): React.Node => (
  <WrappedChatComponent aiRequest={aiRequestWithEvenMoreAiResponses} />
);

// Function calls run by the orchestrator
// ---------------------------------------

export const ReadyAiRequestWithWorkingFunctionCall = (): React.Node => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: fakeOutputWithFunctionCall,
      error: null,
    }}
    editorFunctionCallResults={[
      {
        status: 'working',
        call_id: fakeFunctionCallId,
      },
    ]}
  />
);

export const ReadyAiRequestWithFinishedFunctionCallAndLaunchingRequest = (): React.Node => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: fakeOutputWithFunctionCall,
      error: null,
    }}
    isSending={true}
    editorFunctionCallResults={[
      {
        status: 'finished',
        call_id: fakeFunctionCallId,
        success: true,
        output: {
          instances: [{ objectName: 'Player', layer: '', x: 400, y: 300 }],
        },
      },
    ]}
  />
);

export const WorkingAiRequestWithFinishedFunctionCall = (): React.Node => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'orchestrator',
      status: 'working',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: fakeOutputWithFunctionCall,
      error: null,
    }}
    editorFunctionCallResults={[
      {
        status: 'finished',
        call_id: fakeFunctionCallId,
        success: true,
        output: {
          instances: [{ objectName: 'Player', layer: '', x: 400, y: 300 }],
        },
      },
    ]}
  />
);

export const ReadyAiRequestWithAbortedFunctionCall = (): React.Node => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: fakeOutputWithFunctionCall,
      error: null,
    }}
    editorFunctionCallResults={[
      {
        status: 'aborted',
        call_id: fakeFunctionCallId,
      },
    ]}
  />
);

export const ReadyAiRequestWithFailedFunctionCall = (): React.Node => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: fakeOutputWithFunctionCall,
      error: null,
    }}
    editorFunctionCallResults={[
      {
        status: 'finished',
        call_id: fakeFunctionCallId,
        success: false,
        output: {
          message: 'Something bad happened.',
        },
      },
    ]}
  />
);

export const ReadyAiRequestWithFunctionCallAndOutput = (): React.Node => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: fakeOutputWithFunctionCallAndOutput,
      error: null,
    }}
  />
);

export const ReadyAiRequestWithFunctionCallWithSameCallId = (): React.Node => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'orchestrator',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: fakeOutputWithFunctionCallWithSameCallId,
      error: null,
    }}
    editorFunctionCallResults={[
      {
        status: 'finished',
        call_id: fakeFunctionCallId,
        success: false,
        output: {
          message: 'Something bad happened.',
        },
      },
    ]}
  />
);

export const ReadyAiRequestWithFailedAndIgnoredFunctionCallOutputs = (): React.Node => (
  <WrappedChatComponent
    aiRequest={agentAiRequestWithFailedAndIgnoredFunctionCallOutputs}
  />
);

export const LongReadyAiRequest = (): React.Node => (
  <WrappedChatComponent aiRequest={agentAiRequest} />
);

export const LongReadyAiRequestForAnotherProject = (): React.Node => (
  <WrappedChatComponent
    aiRequest={{ ...agentAiRequest, gameId: 'another-project-uuid' }}
  />
);

export const LongReadyAiRequestWithFunctionCallToDo = (): React.Node => (
  <WrappedChatComponent aiRequest={agentAiRequestWithFunctionCallToDo} />
);

// Auto edit on / off
// ------------------

export const AutoEditEnabledWithWorkingFunctionCall = (): React.Node => (
  <WrappedChatComponent
    automaticallyApplyAiRequestEdits={true}
    aiRequest={aiRequestWithModifyingFunctionCall}
    editorFunctionCallResults={[
      {
        status: 'working',
        call_id: 'fake_modifying_call_1',
      },
    ]}
  />
);

export const AutoEditDisabledWithPendingEditApproval = (): React.Node => (
  <WrappedChatComponent
    automaticallyApplyAiRequestEdits={false}
    aiRequest={aiRequestWithModifyingFunctionCall}
    pendingEditApproval={{
      aiRequestId: 'fake-working-new-ai-request',
      callIds: ['fake_modifying_call_1'],
      // Edit sub-agent case: the label is the agent's name (its short title).
      label: 'Add a score display and update it on coin pickup',
    }}
    onResolveEditApproval={action('onResolveEditApproval')}
  />
);

export const AutoEditDisabledWithPendingEditApprovalForTool = (): React.Node => (
  <WrappedChatComponent
    automaticallyApplyAiRequestEdits={false}
    aiRequest={aiRequestWithModifyingFunctionCall}
    pendingEditApproval={{
      aiRequestId: 'fake-working-new-ai-request',
      callIds: ['fake_modifying_call_1'],
      // Direct modifying call case: the label is the tool's own label.
      label: 'Generate events for the Game scene',
    }}
    onResolveEditApproval={action('onResolveEditApproval')}
  />
);

// Sending / errors
// ----------------

export const LaunchingFollowupAiRequest = (): React.Node => (
  <WrappedChatComponent aiRequest={agentAiRequest} isSending={true} />
);

export const ErrorLaunchingFollowupAiRequest = (): React.Node => (
  <WrappedChatComponent
    aiRequest={agentAiRequest}
    lastSendError={new Error('fake error while sending request')}
  />
);

// Quota limits
// ------------

export const QuotaLimitsReachedAndAutomaticallyUsingCredits = (): React.Node => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={agentAiRequest}
      quota={quota}
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

export const QuotaLimitsReachedAndAutomaticallyUsingCreditsButNoneLeftNoSubscription = (): React.Node => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={agentAiRequest}
      quota={quota}
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

export const QuotaLimitsReachedAndAutomaticallyUsingCreditsButNoneLeftWithSilverSubscription = (): React.Node => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={agentAiRequest}
      quota={quota}
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

export const QuotaLimitsReachedAndAutomaticallyUsingCreditsButNoneLeftWithStartupSubscription = (): React.Node => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={agentAiRequest}
      quota={quota}
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

export const QuotaLimitsReachedAndNotAutomaticallyUsingCredits = (): React.Node => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={agentAiRequest}
      quota={quota}
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

export const QuotaLimitsReachedAndNotAutomaticallyUsingCreditsButNoneLeftNoSubscription = (): React.Node => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={agentAiRequest}
      quota={quota}
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

export const QuotaLimitsReachedAndNotAutomaticallyUsingCreditsButNoneLeftWithSilverSubscription = (): React.Node => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={agentAiRequest}
      quota={quota}
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

export const QuotaLimitsReachedAndNotAutomaticallyUsingCreditsButNoneLeftWithStartupSubscription = (): React.Node => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={agentAiRequest}
      quota={quota}
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
