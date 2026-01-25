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

export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/StandAloneForm',
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
    resetsAt: Date.now() + 1000 * 60 * 60 * 24 * 2,
    period: '7days',
  },
  onStartNewAiRequest: action('onStartNewAiRequest'),
  onSendUserMessage: action('onSendUserMessage'),
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
                      standAloneForm
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

export const LoggedOut = () => (
  <WrappedChatComponent aiRequest={null} quota={null} />
);
export const Default = () => (
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

export const AlmostReachedQuota = () => {
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

export const QuotaLimitReachedAndAutomaticallyUsingCreditsButNoneLeftNoSubscription = () => {
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

export const QuotaLimitReachedAndAutomaticallyUsingCreditsButNoneLeftWithSilverSubscription = () => {
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

export const QuotaLimitReachedAndAutomaticallyUsingCreditsButNoneLeftWithStartupSubscription = () => {
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

export const QuotaLimitReachedAndNotAutomaticallyUsingCredits = () => {
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

export const Launching = () => (
  <WrappedChatComponent aiRequest={null} isSending={true} />
);

export const ErrorLaunching = () => (
  <WrappedChatComponent
    aiRequest={null}
    lastSendError={new Error('Fake error while sending request')}
  />
);
