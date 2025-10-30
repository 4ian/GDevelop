// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { AiRequestChat, type AiRequestChatInterface } from './AiRequestChat';
import {
  addMessageToAiRequest,
  createAiRequest,
  type AiRequest,
} from '../Utils/GDevelopServices/Generation';
import { delay } from '../Utils/Delay';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { makeSimplifiedProjectBuilder } from '../EditorFunctions/SimplifiedProject/SimplifiedProject';
import {
  canUpgradeSubscription,
  hasValidSubscriptionPlan,
} from '../Utils/GDevelopServices/Usage';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import { CreditsPackageStoreContext } from '../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import { type EditorCallbacks } from '../EditorFunctions';
import {
  getFunctionCallOutputsFromEditorFunctionCallResults,
  getFunctionCallsToProcess,
} from './AiRequestUtils';
import { useStableUpToDateRef } from '../Utils/UseStableUpToDateCallback';
import {
  type NewProjectSetup,
  type ExampleProjectSetup,
} from '../ProjectCreation/NewProjectSetupDialog';
import { type FileMetadata, type StorageProvider } from '../ProjectsStorage';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { sendAiRequestStarted } from '../Utils/Analytics/EventSender';
import { listAllExamples } from '../Utils/GDevelopServices/Example';
import UrlStorageProvider from '../ProjectsStorage/UrlStorageProvider';
import { prepareAiUserContent } from './PrepareAiUserContent';
import { AiRequestContext } from './AiRequestContext';
import { getAiConfigurationPresetsWithAvailability } from './AiConfiguration';
import { type CreateProjectResult } from '../Utils/UseCreateProject';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';
import {
  useAiRequestState,
  useProcessFunctionCalls,
  type NewAiRequestOptions,
  type OpenAskAiOptions,
} from './Utils';
import { LineStackLayout } from '../UI/Layout';
import RobotIcon from '../ProjectCreation/RobotIcon';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';
import { Column } from '../UI/Grid';
import IconButton from '../UI/IconButton';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import Cross from '../UI/CustomSvgIcons/Cross';

const gd: libGDevelop = global.gd;

const AI_TOOLS_VERSION = 'v5';

type Props = {|
  project: ?gdProject,
  resourceManagementProps: ResourceManagementProps,
  fileMetadata: ?FileMetadata,
  storageProvider: ?StorageProvider,
  i18n: I18nType,
  onCreateProjectFromExample: (
    exampleProjectSetup: ExampleProjectSetup
  ) => Promise<CreateProjectResult>,
  onCreateEmptyProject: (
    newProjectSetup: NewProjectSetup
  ) => Promise<CreateProjectResult>,
  onOpenLayout: (
    sceneName: string,
    options: {|
      openEventsEditor: boolean,
      openSceneEditor: boolean,
      focusWhenOpened:
        | 'scene-or-events-otherwise'
        | 'scene'
        | 'events'
        | 'none',
    |}
  ) => void,
  onOpenAskAi: (?OpenAskAiOptions) => void,
  onCloseAskAi: () => void,
  dismissableIdentifier?: string,
|};

export const AskAiStandAloneForm = ({
  project,
  resourceManagementProps,
  fileMetadata,
  storageProvider,
  i18n,
  onCreateProjectFromExample,
  onCreateEmptyProject,
  onOpenLayout,
  onOpenAskAi,
  onCloseAskAi,
  dismissableIdentifier,
}: Props) => {
  const onCreateProject = React.useCallback(
    async ({
      name,
      exampleSlug,
    }: {|
      name: string,
      exampleSlug: string | null,
    |}) => {
      const newProjectSetup: NewProjectSetup = {
        projectName: name,
        storageProvider: UrlStorageProvider,
        saveAsLocation: null,
        // Don't open scenes, as it will be done manually by the AI,
        // detecting which scenes were created,
        // allowing to send those messages to the AI, triggering the next steps.
        dontOpenAnySceneOrProjectManager: true,
        // Don't reposition the Ask AI editor,
        // as it will be done manually after the project is created too.
        dontRepositionAskAiEditor: true,
        // Don't close the New project setup dialog,
        // as it will be done manually after the project is created too.
        dontCloseNewProjectSetupDialog: true,
        creationSource: 'ai-agent-request',
      };

      if (exampleSlug) {
        const { exampleShortHeaders } = await listAllExamples();
        const exampleShortHeader = exampleShortHeaders.find(
          header => header.slug === exampleSlug
        );
        if (exampleShortHeader) {
          const { createdProject } = await onCreateProjectFromExample({
            exampleShortHeader,
            newProjectSetup,
            i18n,
          });
          return { exampleSlug, createdProject };
        }

        // The example was not found - still create an empty project.
      }

      const { createdProject } = await onCreateEmptyProject({
        projectName: name,
        storageProvider: UrlStorageProvider,
        saveAsLocation: null,
        dontOpenAnySceneOrProjectManager: true,
        creationSource: 'ai-agent-request',
      });

      return { exampleSlug: null, createdProject };
    },
    [onCreateProjectFromExample, onCreateEmptyProject, i18n]
  );

  const editorCallbacks: EditorCallbacks = React.useMemo(
    () => ({
      onOpenLayout,
      onCreateProject,
    }),
    [onOpenLayout, onCreateProject]
  );

  const [
    newAiRequestOptions,
    startNewAiRequest,
  ] = React.useState<NewAiRequestOptions | null>(null);

  const {
    aiRequestStorage,
    editorFunctionCallResultsStorage,
    getAiSettings,
  } = React.useContext(AiRequestContext);
  const {
    getEditorFunctionCallResults,
    addEditorFunctionCallResults,
    clearEditorFunctionCallResults,
  } = editorFunctionCallResultsStorage;
  const {
    aiRequests,
    updateAiRequest,
    isSendingAiRequest,
    getLastSendError,
    setSendingAiRequest,
    setLastSendError,
  } = aiRequestStorage;
  const { setAiState } = useAiRequestState();
  const [aiRequestIdForForm, setAiRequestIdForForm] = React.useState<
    string | null
  >(null);
  const aiRequestModeForForm = 'agent'; // Standalone form is only for AI agent requests for the moment.
  const aiRequestForForm =
    (aiRequestIdForForm && aiRequests[aiRequestIdForForm]) || null;
  const upToDateSelectedAiRequestId = useStableUpToDateRef(aiRequestIdForForm);

  const aiRequestChatRef = React.useRef<AiRequestChatInterface | null>(null);

  const { openCreditsPackageDialog } = React.useContext(
    CreditsPackageStoreContext
  );

  const {
    profile,
    getAuthorizationHeader,
    onOpenCreateAccountDialog,
    limits,
    onRefreshLimits,
    subscription,
  } = React.useContext(AuthenticatedUserContext);
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );

  const availableCredits = limits ? limits.credits.userBalance.amount : 0;
  const quota =
    (limits && limits.quotas && limits.quotas['ai-request']) || null;
  const aiRequestPrice =
    (limits && limits.credits && limits.credits.prices['ai-request']) || null;
  const aiRequestPriceInCredits = aiRequestPrice
    ? aiRequestPrice.priceInCredits
    : null;

  // Refresh limits when showing the form, as we want to be sure
  // we display the proper quota and credits information for the user.
  React.useEffect(
    () => {
      onRefreshLimits();
    },
    // Only on mount, we'll refresh again when sending an AI request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Trigger the start of the new AI request if the user has requested it
  // (or if triggered automatically by setting `newAiRequestOptions`, for example
  // after waiting for the project to be created for an AI agent request).
  React.useEffect(
    () => {
      (async () => {
        if (!newAiRequestOptions) return;
        console.info('Starting a new AI request...');

        if (!profile) {
          onOpenCreateAccountDialog();
          startNewAiRequest(null);
          return;
        }

        // Ensure the Ask AI pane is closed, to avoid multiple requests being sent
        // at the same time from the editor and the standalone form.
        onCloseAskAi();

        // Read the options and reset them (to avoid launching the same request twice).
        const { userRequest, aiConfigurationPresetId } = newAiRequestOptions;
        startNewAiRequest(null);

        // Ensure the user has enough credits to pay for the request, or ask them
        // to buy some more.
        let payWithCredits = false;
        if (quota && quota.limitReached && aiRequestPriceInCredits) {
          payWithCredits = true;
          if (availableCredits < aiRequestPriceInCredits) {
            // Not enough credits.
            if (!hasValidSubscriptionPlan(subscription)) {
              // User is not subscribed, suggest them to subscribe.
              openSubscriptionDialog({
                analyticsMetadata: {
                  reason: 'AI requests (subscribe)',
                  recommendedPlanId: 'gdevelop_gold',
                  placementId: 'ai-requests',
                },
              });
              return;
            }
            openCreditsPackageDialog({
              missingCredits: aiRequestPriceInCredits - availableCredits,
            });
            return;
          }
        }

        // Request is now ready to be started.
        try {
          const storageProviderName = storageProvider
            ? storageProvider.internalName
            : null;

          setSendingAiRequest(null, true);

          const preparedAiUserContent = await prepareAiUserContent({
            getAuthorizationHeader,
            userId: profile.id,
            simplifiedProjectJson: null,
            projectSpecificExtensionsSummaryJson: null,
          });

          const aiRequest = await createAiRequest(getAuthorizationHeader, {
            userRequest: userRequest,
            userId: profile.id,
            ...preparedAiUserContent,
            payWithCredits,
            gameId: null, // No game associated when starting from the standalone form.
            fileMetadata: null, // No file metadata when starting from the standalone form.
            storageProviderName,
            mode: aiRequestModeForForm,
            toolsVersion: AI_TOOLS_VERSION,
            aiConfiguration: {
              presetId: aiConfigurationPresetId,
            },
          });

          console.info('Successfully created a new AI request:', aiRequest);
          setSendingAiRequest(null, false);
          updateAiRequest(aiRequest.id, aiRequest);

          // Select the new AI request just created - unless the user switched to another one
          // in the meantime.
          if (!upToDateSelectedAiRequestId.current) {
            setAiRequestIdForForm(aiRequest.id);
            // Also set the global selected AI request state,
            // so that the editor is in sync, when we'll open it.
            setAiState({
              aiRequestId: aiRequest.id,
              mode: aiRequestModeForForm,
            });
          }

          sendAiRequestStarted({
            simplifiedProjectJsonLength: 0,
            projectSpecificExtensionsSummaryJsonLength: 0,
            payWithCredits,
            storageProviderName,
            mode: aiRequestModeForForm,
            aiRequestId: aiRequest.id,
          });
        } catch (error) {
          console.error('Error starting a new AI request:', error);
          setLastSendError(null, error);
        }

        // Refresh the user limits, to ensure quota and credits information
        // is up-to-date after an AI request.
        await delay(500);
        try {
          await retryIfFailed({ times: 2 }, onRefreshLimits);
        } catch (error) {
          // Ignore limits refresh error.
        }
      })();
    },
    [
      aiRequestPriceInCredits,
      availableCredits,
      getAuthorizationHeader,
      onOpenCreateAccountDialog,
      onRefreshLimits,
      openCreditsPackageDialog,
      profile,
      project,
      fileMetadata,
      storageProvider,
      quota,
      aiRequestIdForForm,
      setLastSendError,
      aiRequestModeForForm,
      setAiState,
      setSendingAiRequest,
      upToDateSelectedAiRequestId,
      updateAiRequest,
      newAiRequestOptions,
      subscription,
      openSubscriptionDialog,
      onCloseAskAi,
    ]
  );

  const hasFunctionsCallsToProcess = React.useMemo(
    () =>
      aiRequestForForm
        ? getFunctionCallsToProcess({
            aiRequest: aiRequestForForm,
            editorFunctionCallResults: getEditorFunctionCallResults(
              aiRequestForForm.id
            ),
          }).length > 0
        : false,
    [aiRequestForForm, getEditorFunctionCallResults]
  );

  const isLoading = isSendingAiRequest(aiRequestIdForForm);

  // Send the results of the function call outputs only.
  // In a standalone form, the only user message is sent when starting the request.
  const onSendMessage = React.useCallback(
    async ({
      createdSceneNames,
      userMessage,
    }: {|
      createdSceneNames?: Array<string>,
      userMessage: string,
    |}) => {
      if (!profile || !aiRequestIdForForm || isLoading) return;

      // Read the results from the editor that applied the function calls.
      // and transform them into the output that will be stored on the AI request.
      const {
        hasUnfinishedResult,
        functionCallOutputs,
      } = getFunctionCallOutputsFromEditorFunctionCallResults(
        getEditorFunctionCallResults(aiRequestIdForForm)
      );

      // If anything is not finished yet, stop there (we only send all
      // results at once, AI do not support partial results).
      if (hasUnfinishedResult) return;
      if (hasFunctionsCallsToProcess) return;

      // If nothing to send, stop there.
      // When in a standalone form, this can happen if the agent did not
      // decide to create a project, in this case, abort and clear the form.
      if (functionCallOutputs.length === 0) return;

      try {
        setSendingAiRequest(aiRequestIdForForm, true);

        const simplifiedProjectBuilder = makeSimplifiedProjectBuilder(gd);
        const simplifiedProjectJson = project
          ? JSON.stringify(
              simplifiedProjectBuilder.getSimplifiedProject(project, {})
            )
          : null;
        const projectSpecificExtensionsSummaryJson = project
          ? JSON.stringify(
              simplifiedProjectBuilder.getProjectSpecificExtensionsSummary(
                project
              )
            )
          : null;

        const preparedAiUserContent = await prepareAiUserContent({
          getAuthorizationHeader,
          userId: profile.id,
          simplifiedProjectJson,
          projectSpecificExtensionsSummaryJson,
        });

        const aiRequest: AiRequest = await retryIfFailed({ times: 2 }, () =>
          addMessageToAiRequest(getAuthorizationHeader, {
            userId: profile.id,
            aiRequestId: aiRequestIdForForm,
            functionCallOutputs,
            ...preparedAiUserContent,
            gameId: project ? project.getProjectUuid() : undefined,
            payWithCredits: false,
            userMessage: '', // No user message when sending only function call outputs.
          })
        );
        updateAiRequest(aiRequest.id, aiRequest);
        setSendingAiRequest(aiRequest.id, false);
        clearEditorFunctionCallResults(aiRequest.id);
      } catch (error) {
        // TODO: update the label of the button to send again.
        setLastSendError(aiRequestIdForForm, error);
      }

      if (aiRequestForForm) {
        // Clear the selected AI request, to be able to start a new one if needed.
        const aiRequestChatRefCurrent = aiRequestChatRef.current;
        if (aiRequestChatRefCurrent) {
          aiRequestChatRefCurrent.resetUserInput('');
          aiRequestChatRefCurrent.resetUserInput(aiRequestIdForForm);
        }
        setAiRequestIdForForm('');
        // We handle moving the pane here
        // and not in the Mainframe afterCreatingProject function,
        // as it gives time to the AI to send the created scenes messages,
        // triggering the status change from 'ready' to 'working'.
        onOpenAskAi();
        if (createdSceneNames && createdSceneNames.length > 0) {
          createdSceneNames.forEach(sceneName => {
            onOpenLayout(sceneName, {
              openEventsEditor: true,
              openSceneEditor: true,
              focusWhenOpened: 'scene',
            });
          });
        }
      }
    },
    [
      profile,
      aiRequestIdForForm,
      isLoading,
      getEditorFunctionCallResults,
      setSendingAiRequest,
      updateAiRequest,
      clearEditorFunctionCallResults,
      getAuthorizationHeader,
      setLastSendError,
      project,
      hasFunctionsCallsToProcess,
      onOpenAskAi,
      onOpenLayout,
      aiRequestForForm,
    ]
  );
  const onSendEditorFunctionCallResults = React.useCallback(
    async (options: null | {| createdSceneNames: Array<string> |}) => {
      await onSendMessage({
        createdSceneNames: options ? options.createdSceneNames : [],
        userMessage: '',
      });
    },
    [onSendMessage]
  );
  const {
    isAutoProcessingFunctionCalls,
    setAutoProcessFunctionCalls,
    onProcessFunctionCalls,
  } = useProcessFunctionCalls({
    project,
    resourceManagementProps,
    selectedAiRequest: aiRequestForForm,
    editorCallbacks,
    onSendEditorFunctionCallResults,
    getEditorFunctionCallResults,
    addEditorFunctionCallResults,
    i18n,
    onSceneEventsModifiedOutsideEditor: () => {},
    onInstancesModifiedOutsideEditor: () => {},
    onObjectsModifiedOutsideEditor: () => {},
    onObjectGroupsModifiedOutsideEditor: () => {},
    onExtensionInstalled: () => {},
    isReadyToProcessFunctionCalls: true,
  });

  const { values, showAskAiStandAloneForm } = React.useContext(
    PreferencesContext
  );

  if (
    dismissableIdentifier &&
    values.hiddenAskAiStandAloneForms[dismissableIdentifier]
  ) {
    return null;
  }

  return (
    <Column noMargin>
      <LineStackLayout
        noMargin
        alignItems="center"
        justifyContent="space-between"
      >
        <LineStackLayout noMargin>
          <RobotIcon size={20} rotating={isLoading} />
          <Text size="sub-title" noMargin>
            <Trans>What would you like to create?</Trans>
          </Text>
        </LineStackLayout>
        {dismissableIdentifier && (
          <IconButton
            onClick={() => {
              showAskAiStandAloneForm(dismissableIdentifier, false);
            }}
            size="small"
            disabled={isLoading}
          >
            <Cross />
          </IconButton>
        )}
      </LineStackLayout>
      <AiRequestChat
        aiConfigurationPresetsWithAvailability={getAiConfigurationPresetsWithAvailability(
          { limits, getAiSettings }
        )}
        project={project}
        ref={aiRequestChatRef}
        aiRequest={aiRequestForForm}
        aiRequestMode={aiRequestModeForForm}
        onStartNewAiRequest={startNewAiRequest}
        onSendMessage={onSendMessage}
        isSending={isLoading}
        lastSendError={getLastSendError(aiRequestIdForForm)}
        quota={quota}
        increaseQuotaOffering={
          !hasValidSubscriptionPlan(subscription)
            ? 'subscribe'
            : canUpgradeSubscription(subscription)
            ? 'upgrade'
            : 'none'
        }
        onProcessFunctionCalls={onProcessFunctionCalls}
        editorFunctionCallResults={
          (aiRequestForForm &&
            getEditorFunctionCallResults(aiRequestForForm.id)) ||
          null
        }
        price={aiRequestPrice}
        availableCredits={availableCredits}
        onSendFeedback={async () => {}}
        hasOpenedProject={!!project}
        isAutoProcessingFunctionCalls={
          aiRequestForForm
            ? isAutoProcessingFunctionCalls(aiRequestForForm.id)
            : false
        }
        setAutoProcessFunctionCalls={shouldAutoProcess => {
          if (!aiRequestForForm) return;
          setAutoProcessFunctionCalls(aiRequestForForm.id, shouldAutoProcess);
        }}
        i18n={i18n}
        editorCallbacks={editorCallbacks}
        onStartOrOpenChat={() => {}}
        standAloneForm
      />
    </Column>
  );
};
