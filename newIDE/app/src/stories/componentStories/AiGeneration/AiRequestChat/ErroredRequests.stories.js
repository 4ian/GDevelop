// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import paperDecorator from '../../../PaperDecorator';
import { AiRequestChat } from '../../../../AiGeneration/AiRequestChat';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import FixedWidthFlexContainer from '../../../FixedWidthFlexContainer';
import { fakeSilverAuthenticatedUser } from '../../../../fixtures/GDevelopServicesTestData';
import {
  erroredAgentAiRequest,
  erroredWithContextTooLargeAgentAiRequest,
  erroredWithRepeatedToolCallLoopAgentAiRequest,
  erroredWithoutDetailsAgentAiRequest,
} from '../../../../fixtures/GDevelopServicesTestData/FakeAiRequests';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { SubscriptionProvider } from '../../../../Profile/Subscription/SubscriptionContext';
import PreferencesContext, {
  initialPreferences,
} from '../../../../MainFrame/Preferences/PreferencesContext';
import { CreditsPackageStoreStateProvider } from '../../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import { commonProps } from './Orchestrator.stories';

// A failed AI request is shown in the chat with an explanation adapted to the
// error reported by the API, and the way forward (most of the time: retry,
// which makes the AI continue from the work it had already done).
export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/ErroredRequests',
  component: AiRequestChat,
  decorators: [paperDecorator],
};

const WrappedChatComponent = (allProps: any) => {
  const { authenticatedUser, ...chatProps } = allProps;
  const authenticatedUserToUse =
    authenticatedUser || fakeSilverAuthenticatedUser;
  return (
    <FixedHeightFlexContainer height={800}>
      <FixedWidthFlexContainer width={600}>
        <PreferencesContext.Provider
          // $FlowFixMe[incompatible-type]
          value={initialPreferences}
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

export const InternalError = (): React.Node => (
  <WrappedChatComponent aiRequest={erroredAgentAiRequest} />
);

export const InternalErrorBeingRetried = (): React.Node => (
  <WrappedChatComponent
    aiRequest={erroredAgentAiRequest}
    isSendingUserMessage
  />
);

// The project of the request is not opened: nothing can be sent, so the
// actions are disabled (the chat also displays its own explanation).
export const InternalErrorForAnotherProject = (): React.Node => (
  <WrappedChatComponent
    aiRequest={{
      ...erroredAgentAiRequest,
      gameId: 'another-project-game-id',
    }}
  />
);

export const ContextTooLarge = (): React.Node => (
  <WrappedChatComponent aiRequest={erroredWithContextTooLargeAgentAiRequest} />
);

export const RepeatedToolCallLoop = (): React.Node => (
  <WrappedChatComponent
    aiRequest={erroredWithRepeatedToolCallLoopAgentAiRequest}
  />
);

// Requests stored before the API reported error codes, and requests killed by
// an infrastructure failure, have no error details.
export const ErrorWithoutDetails = (): React.Node => (
  <WrappedChatComponent aiRequest={erroredWithoutDetailsAgentAiRequest} />
);
