// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import paperDecorator from '../../../PaperDecorator';
import { AiRequestChat } from '../../../../AiGeneration/AiRequestChat';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { action } from '@storybook/addon-actions';

export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/StandAloneChat',
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
    current: 100,
    max: 200,
    period: '1day',
  },
  onStartNewAiRequest: () => {},
  onSendMessage: async () => {},
  isSending: false,
  price: {
    priceInCredits: 5,
    variablePrice: {
      agent: {
        default: {
          minimumPriceInCredits: 4,
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
  aiRequestMode: 'agent',
};

const WrappedChatComponent = (props: any) => (
  <FixedHeightFlexContainer height={500}>
    <I18n>
      {({ i18n }) => (
        <AiRequestChat i18n={i18n} standAloneForm {...commonProps} {...props} />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const LoggedOutAgentAiRequest = () => (
  <WrappedChatComponent aiRequest={null} quota={null} aiRequestMode="agent" />
);
export const LoggedOutChatAiRequest = () => (
  <WrappedChatComponent aiRequest={null} quota={null} aiRequestMode="chat" />
);
export const NewDailyAiRequest = () => (
  <WrappedChatComponent aiRequest={null} />
);
export const NewWeeklyAiRequest = () => (
  <WrappedChatComponent
    aiRequest={null}
    quota={{
      limitReached: false,
      current: 10,
      max: 50,
      period: '7days',
    }}
  />
);
export const NewMonthlyAiRequest = () => (
  <WrappedChatComponent
    aiRequest={null}
    quota={{
      limitReached: false,
      current: 30,
      max: 200,
      period: '30days',
    }}
  />
);

export const NewDailyAiRequestAlmostReachedQuota = () => (
  <WrappedChatComponent
    aiRequest={null}
    quota={{
      limitReached: false,
      current: 10,
      max: 20,
      period: '1day',
    }}
    increaseQuotaOffering="upgrade"
  />
);
export const NewWeeklyAiRequestAlmostReachedQuota = () => (
  <WrappedChatComponent
    aiRequest={null}
    quota={{
      limitReached: false,
      current: 40,
      max: 50,
      period: '7days',
    }}
    increaseQuotaOffering="upgrade"
  />
);
export const NewMonthlyAiRequestAlmostReachedQuota = () => (
  <WrappedChatComponent
    aiRequest={null}
    quota={{
      limitReached: false,
      current: 180,
      max: 200,
      period: '30days',
    }}
    increaseQuotaOffering="upgrade"
  />
);

export const NewDailyAiRequestQuotaLimitReachedAndNoCredits = () => (
  <WrappedChatComponent
    aiRequest={null}
    quota={{
      limitReached: true,
      current: 20,
      max: 20,
      period: '1day',
    }}
    availableCredits={0}
  />
);
export const NewWeeklyAiRequestQuotaLimitReachedAndNoCredits = () => (
  <WrappedChatComponent
    aiRequest={null}
    quota={{
      limitReached: true,
      current: 50,
      max: 50,
      period: '7days',
    }}
    availableCredits={0}
  />
);
export const NewMonthlyAiRequestQuotaLimitReachedAndNoCredits = () => (
  <WrappedChatComponent
    aiRequest={null}
    quota={{
      limitReached: true,
      current: 200,
      max: 200,
      period: '30days',
    }}
    availableCredits={0}
  />
);

export const NewDailyAiRequestQuotaLimitReachedAndSomeCredits = () => (
  <WrappedChatComponent
    aiRequest={null}
    quota={{
      limitReached: true,
      current: 20,
      max: 20,
      period: '1day',
    }}
    availableCredits={400}
  />
);
export const NewWeeklyAiRequestQuotaLimitReachedAndSomeCredits = () => (
  <WrappedChatComponent
    aiRequest={null}
    quota={{
      limitReached: true,
      current: 50,
      max: 50,
      period: '7days',
    }}
    availableCredits={400}
  />
);
export const NewMonthlyAiRequestQuotaLimitReachedAndSomeCredits = () => (
  <WrappedChatComponent
    aiRequest={null}
    quota={{
      limitReached: true,
      current: 200,
      max: 200,
      period: '30days',
    }}
    availableCredits={400}
  />
);

export const LaunchingNewAiRequest = () => (
  <WrappedChatComponent aiRequest={null} isSending={true} />
);

export const ErrorLaunchingNewAiRequest = () => (
  <WrappedChatComponent
    aiRequest={null}
    lastSendError={new Error('Fake error while sending request')}
  />
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
  <WrappedChatComponent
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
  />
);

export const WorkingNewAiRequest = () => (
  <WrappedChatComponent
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
  />
);
