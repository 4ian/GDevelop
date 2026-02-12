// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import paperDecorator from '../../../PaperDecorator';
import { AiRequestChat } from '../../../../AiGeneration/AiRequestChat';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import FixedWidthFlexContainer from '../../../FixedWidthFlexContainer';
import { fakeSilverAuthenticatedUser } from '../../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { SubscriptionProvider } from '../../../../Profile/Subscription/SubscriptionContext';
import PreferencesContext, {
  initialPreferences,
} from '../../../../MainFrame/Preferences/PreferencesContext';
import { CreditsPackageStoreStateProvider } from '../../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import { commonProps } from './Agent.stories';

export default {
  title: 'EventsFunctionsExtensionEditor/AiRequestChat/SpecificFunctionCalls',
  component: AiRequestChat,
  decorators: [paperDecorator],
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

const userRequestMessage = {
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
};
const addSceneEventsFunctionCallMessage = {
  type: 'message',
  status: 'completed',
  role: 'assistant',
  content: [
    {
      name: 'add_scene_events',
      arguments:
        '{"objects_list":"Mario, Coin","events_description":"When Mario collides with Coin, delete Coin and add 100 to the scene variable Score","extension_names_list":"Sprite, Variables","scene_name":"Level1"}',
      type: 'function_call',
      status: 'completed',
      call_id: 'tool_0_add_scene_events',
    },
  ],
};

export const addSceneEventsWithNewlyAddedResources = () => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'agent',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: [
        userRequestMessage,
        addSceneEventsFunctionCallMessage,
        {
          type: 'function_call_output',
          call_id: 'tool_0_add_scene_events',
          output:
            '{"success":true,"newlyAddedResources":[{"resourceName":"jump.wav","resourceKind":"audio"}]}',
        },
      ],
      error: null,
    }}
  />
);

export const addSceneEventsWithNewlyAddedResourcesWithEditorFunctionCallResult = () => (
  <WrappedChatComponent
    aiRequest={{
      createdAt: '',
      updatedAt: '',
      id: 'fake-working-new-ai-request',
      mode: 'agent',
      status: 'ready',
      userId: 'fake-user-id',
      gameProjectJson: 'FAKE DATA',
      output: [userRequestMessage, addSceneEventsFunctionCallMessage],
      error: null,
    }}
    editorFunctionCallResults={[
      {
        status: 'finished',
        call_id: 'tool_0_add_scene_events',
        success: true,
        output: {
          newlyAddedResources: [
            {
              resourceName: 'jump.wav',
              resourceKind: 'audio',
            },
            {
              resourceName: 'another-resource',
              resourceKind: 'font',
            },
          ],
        },
      },
    ]}
  />
);
