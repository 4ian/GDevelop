// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import paperDecorator from '../../../PaperDecorator';
import { AiRequestChat } from '../../../../AiGeneration/AiRequestChat';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { action } from '@storybook/addon-actions';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { SubscriptionProvider } from '../../../../Profile/Subscription/SubscriptionContext';
import { CreditsPackageStoreStateProvider } from '../../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import {
  defaultAuthenticatedUserWithNoSubscription,
  fakeSilverAuthenticatedUser,
  fakeStartupAuthenticatedUser,
  limitsForNoSubscriptionUser,
  limitsForSilverUser,
  limitsForStartupUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import PreferencesContext, {
  initialPreferences,
} from '../../../../MainFrame/Preferences/PreferencesContext';
import FixedWidthFlexContainer from '../../../FixedWidthFlexContainer';
import RaisedButton from '../../../../UI/RaisedButton';
import { Column, Line } from '../../../../UI/Grid';

export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/Form',
  component: AiRequestChat,
  decorators: [paperDecorator],
};

const commonProps = {
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
      enabledWithPlans: [],
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
      enabledWithPlans: [],
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
    onOpenLayout: action('onOpenLayout'),
    onCreateProject: async () => ({ exampleSlug: null, createdProject: null }),
  },
  project: null,
  quota: {
    limitReached: false,
    current: 100,
    max: 200,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  },
  onStartNewAiRequest: action('onStartNewAiRequest'),
  onSendUserMessage: action('onSendUserMessage'),
  isSending: false,
  price: {
    priceInCredits: 5,
    variablePrice: {
      orchestrator: {
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
  // The in-editor form appears with a project open, so the orchestrator controls
  // (reasoning selector and "Auto edit" button) are shown.
  hasOpenedProject: true,
  editorFunctionCallResults: [],
  increaseQuotaOffering: 'subscribe',
  onProcessFunctionCalls: async () => {},
  onStop: async () => {},
  onStartOrOpenChat: () => {},
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
          // $FlowFixMe[incompatible-type]
          value={{
            ...initialPreferences,
            // $FlowFixMe[incompatible-type]
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

export const LoggedOut = (): React.Node => (
  <WrappedChatComponent aiRequest={null} quota={null} />
);
export const Default = (): React.Node => (
  <WrappedChatComponent
    aiRequest={null}
    quota={{
      limitReached: false,
      current: 10,
      max: 50,
      resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
      period: '7days',
    }}
  />
);

export const AlmostReachedQuota = (): React.Node => {
  const quota = {
    limitReached: false,
    current: 40,
    max: 50,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={null}
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
            'consumed-ai-requests': quota,
          },
        },
      }}
    />
  );
};

export const QuotaLimitReachedAndAutomaticallyUsingCreditsButNoneLeftNoSubscription = (): React.Node => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={null}
      quota={quota}
      availableCredits={0}
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
            'consumed-ai-requests': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={true}
      increaseQuotaOffering="subscribe"
    />
  );
};

export const QuotaLimitReachedAndAutomaticallyUsingCreditsButNoneLeftWithSilverSubscription = (): React.Node => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={null}
      quota={quota}
      availableCredits={0}
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
            'consumed-ai-requests': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={true}
      increaseQuotaOffering="upgrade"
    />
  );
};

export const QuotaLimitReachedAndAutomaticallyUsingCreditsButNoneLeftWithStartupSubscription = (): React.Node => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={null}
      quota={quota}
      availableCredits={0}
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
            'consumed-ai-requests': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={true}
      increaseQuotaOffering="none"
    />
  );
};

export const QuotaLimitReachedAndNotAutomaticallyUsingCredits = (): React.Node => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };

  return (
    <WrappedChatComponent
      aiRequest={null}
      quota={quota}
      availableCredits={400}
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
            'consumed-ai-requests': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={false}
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
      aiRequest={null}
      quota={quota}
      availableCredits={0}
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
            'consumed-ai-requests': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={false}
      increaseQuotaOffering="subscribe"
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
      aiRequest={null}
      quota={quota}
      availableCredits={0}
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
            'consumed-ai-requests': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={false}
      increaseQuotaOffering="upgrade"
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
      aiRequest={null}
      quota={quota}
      availableCredits={0}
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
            'consumed-ai-requests': quota,
          },
        },
      }}
      automaticallyUseCreditsForAiRequests={false}
      increaseQuotaOffering="none"
    />
  );
};

export const Launching = (): React.Node => (
  <WrappedChatComponent aiRequest={null} isSending={true} />
);

export const ErrorLaunching = (): React.Node => (
  <WrappedChatComponent
    aiRequest={null}
    lastSendError={new Error('Fake error while sending request')}
  />
);

// The exact situation a user got stuck in: their AI usage allowance is
// exhausted, they already accepted to pay with GDevelop credits but have none
// left, so the form is replaced by the prompt and the send button is disabled.
// Buying credits (the button below stands for the purchase dialog refreshing
// the limits) must unblock the form right away, without closing and reopening
// the chat.
export const QuotaLimitReachedThenCreditsBought = (): React.Node => {
  const quota = {
    limitReached: true,
    current: 100,
    max: 100,
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  };
  const [availableCredits, setAvailableCredits] = React.useState<number>(0);

  return (
    <Column noMargin>
      <Line noMargin>
        <RaisedButton
          primary
          label={
            availableCredits === 0
              ? 'Simulate buying 500 credits'
              : 'Simulate spending every credit'
          }
          onClick={() => setAvailableCredits(availableCredits === 0 ? 500 : 0)}
        />
      </Line>
      <WrappedChatComponent
        aiRequest={null}
        quota={quota}
        availableCredits={availableCredits}
        authenticatedUser={{
          ...defaultAuthenticatedUserWithNoSubscription,
          limits: {
            ...limitsForNoSubscriptionUser,
            credits: {
              userBalance: {
                amount: availableCredits,
              },
            },
            quotas: {
              'consumed-ai-requests': quota,
            },
          },
        }}
        automaticallyUseCreditsForAiRequests={true}
        increaseQuotaOffering="subscribe"
      />
    </Column>
  );
};
