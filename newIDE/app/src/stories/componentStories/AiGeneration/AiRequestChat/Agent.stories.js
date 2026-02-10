// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import paperDecorator from '../../../PaperDecorator';
import { AiRequestChat } from '../../../../AiGeneration/AiRequestChat';
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

export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/Agent',
  component: AiRequestChat,
  decorators: [paperDecorator],
};

export const commonProps = {
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
    // $FlowFixMe[signature-verification-failure]
    onOpenLayout: action('onOpenLayout'),
    // $FlowFixMe[signature-verification-failure]
    onCreateProject: async () => ({ exampleSlug: null, createdProject: null }),
  },
  project: null,
  quota: {
    limitReached: false,
    current: 100,
    max: 200,
    period: '7days',
    // $FlowFixMe[signature-verification-failure]
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
  },
  // $FlowFixMe[signature-verification-failure]
  onStartNewAiRequest: action('onStartNewAiRequest'),
  // $FlowFixMe[signature-verification-failure]
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
  // $FlowFixMe[signature-verification-failure]
  editorFunctionCallResults: [],
  increaseQuotaOffering: 'subscribe',
  onProcessFunctionCalls: async () => {},
  setAutoProcessFunctionCalls: () => {},
  isAutoProcessingFunctionCalls: false,
  onStartOrOpenChat: () => {},
  aiRequestMode: 'agent',
  saveProject: async () => {},
  onRestore: async () => {},
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

const fakeFunctionCallId = 'fake_function_call_1';

// Function call example outputs
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

// $FlowFixMe[signature-verification-failure]
export const ReadyAiRequestWithFunctionCallWithoutAutoProcess = () => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'agent',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: fakeOutputWithFunctionCall,
      error: null,
    }}
  />
);

// $FlowFixMe[signature-verification-failure]
export const ReadyAiRequestWithWorkingFunctionCall = () => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'agent',
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
    isAutoProcessingFunctionCalls={true}
  />
);
// $FlowFixMe[signature-verification-failure]
export const ReadyAiRequestWithFinishedFunctionCallAndLaunchingRequest = () => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'agent',
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
    isAutoProcessingFunctionCalls={true}
  />
);

// $FlowFixMe[signature-verification-failure]
export const WorkingAiRequestWithFinishedFunctionCall = () => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'agent',
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
    isAutoProcessingFunctionCalls={true}
  />
);

// $FlowFixMe[signature-verification-failure]
export const ReadyAiRequestWithIgnoredFunctionCall = () => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'agent',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: fakeOutputWithFunctionCall,
      error: null,
    }}
    editorFunctionCallResults={[
      {
        status: 'ignored',
        call_id: fakeFunctionCallId,
      },
    ]}
    isAutoProcessingFunctionCalls={true}
  />
);

// $FlowFixMe[signature-verification-failure]
export const ReadyAiRequestWithFailedFunctionCall = () => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'agent',
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
    isAutoProcessingFunctionCalls={true}
  />
);

// $FlowFixMe[signature-verification-failure]
export const ReadyAiRequestWithFunctionCallAndOutput = () => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'agent',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: fakeOutputWithFunctionCallAndOutput,
      error: null,
    }}
    isAutoProcessingFunctionCalls={true}
  />
);

// $FlowFixMe[signature-verification-failure]
export const ReadyAiRequestWithFunctionCallWithSameCallId = () => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'agent',
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
    isAutoProcessingFunctionCalls={true}
  />
);

// $FlowFixMe[signature-verification-failure]
export const ReadyAiRequestWithFailedAndIgnoredFunctionCallOutputs = () => (
  <WrappedChatComponent
    aiRequest={agentAiRequestWithFailedAndIgnoredFunctionCallOutputs}
  />
);

// $FlowFixMe[signature-verification-failure]
export const LongReadyAiRequest = () => (
  <WrappedChatComponent
    aiRequest={agentAiRequest}
    isAutoProcessingFunctionCalls={true}
  />
);

// $FlowFixMe[signature-verification-failure]
export const LongReadyAiRequestForAnotherProject = () => (
  <WrappedChatComponent
    aiRequest={{ ...agentAiRequest, gameId: 'another-project-uuid' }}
    isAutoProcessingFunctionCalls={true}
  />
);

// $FlowFixMe[signature-verification-failure]
export const LongReadyAiRequestWithFunctionCallToDo = () => (
  <WrappedChatComponent aiRequest={agentAiRequestWithFunctionCallToDo} />
);

// $FlowFixMe[signature-verification-failure]
export const LaunchingFollowupAiRequest = () => (
  <WrappedChatComponent aiRequest={agentAiRequest} isSending={true} />
);

// $FlowFixMe[signature-verification-failure]
export const ErrorLaunchingFollowupAiRequest = () => (
  <WrappedChatComponent
    aiRequest={agentAiRequest}
    lastSendError={new Error('fake error while sending request')}
  />
);

// $FlowFixMe[signature-verification-failure]
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
      aiRequest={agentAiRequest}
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

// $FlowFixMe[signature-verification-failure]
export const QuotaLimitsReachedAndAutomaticallyUsingCreditsButNoneLeftNoSubscription = () => {
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

// $FlowFixMe[signature-verification-failure]
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
      aiRequest={agentAiRequest}
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

// $FlowFixMe[signature-verification-failure]
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
      aiRequest={agentAiRequest}
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

// $FlowFixMe[signature-verification-failure]
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
      aiRequest={agentAiRequest}
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

// $FlowFixMe[signature-verification-failure]
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
      aiRequest={agentAiRequest}
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

// $FlowFixMe[signature-verification-failure]
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
      aiRequest={agentAiRequest}
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

// $FlowFixMe[signature-verification-failure]
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
      aiRequest={agentAiRequest}
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
