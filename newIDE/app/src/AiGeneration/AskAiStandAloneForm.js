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
  getFunctionCallNameByCallId,
  getFunctionCallOutputsFromEditorFunctionCallResults,
  getFunctionCallsToProcess,
} from './AiRequestUtils';
import { type EditorFunctionCallResult } from '../EditorFunctions/EditorFunctionCallRunner';
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
import { SubscriptionContext } from '../Profile/Subscription/SubscriptionContext';
import {
  useAiRequestState,
  useProcessFunctionCalls,
  type NewAiRequestOptions,
  AI_AGENT_TOOLS_VERSION,
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
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
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
  onCloseAskAi,
  dismissableIdentifier,
  onWillInstallExtension,
  onExtensionInstalled,
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
        // As the request is coming from the Standalone Ask AI form,
        // ensure the Ask AI editor is opened once the project is created.
        forceOpenAskAiEditor: true,
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

      const { createdProject } = await onCreateEmptyProject(newProjectSetup);

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
  const { setAiState } = useAiRequestState({ project });
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
    values: { automaticallyUseCreditsForAiRequests },
  } = React.useContext(PreferencesContext);

  const {
    profile,
    getAuthorizationHeader,
    onOpenCreateAccountDialog,
    limits,
    onRefreshLimits,
    subscription,
  } = React.useContext(AuthenticatedUserContext);
  const { openSubscriptionDialog } = React.useContext(SubscriptionContext);

  const hideAskAi =
    !!limits &&
    !!limits.capabilities.classrooms &&
    limits.capabilities.classrooms.hideAskAi;

  const availableCredits = limits ? limits.credits.userBalance.amount : 0;
  const quota =
    (limits && limits.quotas && limits.quotas['consumed-ai-credits']) || null;
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
          const doesNotHaveEnoughCreditsToContinue =
            availableCredits < aiRequestPriceInCredits;
          const cannotContinue =
            !automaticallyUseCreditsForAiRequests ||
            doesNotHaveEnoughCreditsToContinue;

          if (cannotContinue) {
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
            eventsJson: null,
          });

          const aiRequest = await createAiRequest(getAuthorizationHeader, {
            userRequest: userRequest,
            userId: profile.id,
            gameProjectJsonUserRelativeKey:
              preparedAiUserContent.gameProjectJsonUserRelativeKey,
            gameProjectJson: preparedAiUserContent.gameProjectJson,
            projectSpecificExtensionsSummaryJsonUserRelativeKey:
              preparedAiUserContent.projectSpecificExtensionsSummaryJsonUserRelativeKey,
            projectSpecificExtensionsSummaryJson:
              preparedAiUserContent.projectSpecificExtensionsSummaryJson,
            payWithCredits,
            gameId: null, // No game associated when starting from the standalone form.
            fileMetadata: null, // No file metadata when starting from the standalone form.
            storageProviderName,
            mode: aiRequestModeForForm,
            toolsVersion: AI_AGENT_TOOLS_VERSION,
            aiConfiguration: {
              presetId: aiConfigurationPresetId,
            },
          });

          console.info('Successfully created a new AI request:', aiRequest);
          setSendingAiRequest(null, false);
          updateAiRequest(aiRequest.id, () => aiRequest);

          // Select the new AI request just created - unless the user switched to another one
          // in the meantime.
          if (!upToDateSelectedAiRequestId.current) {
            setAiRequestIdForForm(aiRequest.id);
            // Also set the global selected AI request state,
            // so that the editor is in sync, when we'll open it.
            setAiState({
              aiRequestId: aiRequest.id,
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
      automaticallyUseCreditsForAiRequests,
    ]
  );

  const isLoading = isSendingAiRequest(aiRequestIdForForm);

  // Send the results of the function call outputs only.
  // In a standalone form, the only user message is sent when starting the request.
  const onSendMessage = React.useCallback(
    async ({
      userMessage,
      createdSceneNames,
      createdProject,
      editorFunctionCallResults,
    }: {|
      userMessage: string,
      createdSceneNames?: Array<string>,
      createdProject?: ?gdProject,
      editorFunctionCallResults: Array<EditorFunctionCallResult>,
    |}) => {
      if (!profile || !aiRequestIdForForm || !aiRequestForForm || isLoading)
        return;

      // Read the results from the editor that applied the function calls.
      // and transform them into the output that will be stored on the AI request.
      const {
        hasUnfinishedResult,
        functionCallOutputs,
      } = getFunctionCallOutputsFromEditorFunctionCallResults(
        editorFunctionCallResults
      );

      const hasFunctionsCallsToProcess =
        getFunctionCallsToProcess({
          aiRequest: aiRequestForForm,
          editorFunctionCallResults,
        }).length > 0;

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

        const upToDateProject = createdProject || project;

        const simplifiedProjectBuilder = makeSimplifiedProjectBuilder(gd);
        const simplifiedProjectJson = upToDateProject
          ? JSON.stringify(
              simplifiedProjectBuilder.getSimplifiedProject(upToDateProject, {})
            )
          : null;
        const projectSpecificExtensionsSummaryJson = upToDateProject
          ? JSON.stringify(
              simplifiedProjectBuilder.getProjectSpecificExtensionsSummary(
                upToDateProject
              )
            )
          : null;

        const preparedAiUserContent = await prepareAiUserContent({
          getAuthorizationHeader,
          userId: profile.id,
          simplifiedProjectJson,
          projectSpecificExtensionsSummaryJson,
          eventsJson: null,
        });

        // If we're updating the request, following a function call to initialize the project,
        // pause the request, so that suggestions can be given by the agent.
        const paused =
          functionCallOutputs.length > 0 &&
          functionCallOutputs.some(
            output =>
              getFunctionCallNameByCallId({
                aiRequest: aiRequestForForm,
                callId: output.call_id,
              }) === 'initialize_project'
          );

        const aiRequest: AiRequest = await retryIfFailed({ times: 2 }, () =>
          addMessageToAiRequest(getAuthorizationHeader, {
            userId: profile.id,
            aiRequestId: aiRequestIdForForm,
            functionCallOutputs,
            gameProjectJsonUserRelativeKey:
              preparedAiUserContent.gameProjectJsonUserRelativeKey,
            gameProjectJson: preparedAiUserContent.gameProjectJson,
            projectSpecificExtensionsSummaryJsonUserRelativeKey:
              preparedAiUserContent.projectSpecificExtensionsSummaryJsonUserRelativeKey,
            projectSpecificExtensionsSummaryJson:
              preparedAiUserContent.projectSpecificExtensionsSummaryJson,
            gameId: upToDateProject
              ? upToDateProject.getProjectUuid()
              : undefined,
            payWithCredits: false,
            userMessage: '', // No user message when sending only function call outputs.
            paused,
            mode: aiRequestModeForForm,
            toolsVersion: AI_AGENT_TOOLS_VERSION,
          })
        );
        updateAiRequest(aiRequest.id, () => aiRequest);
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
      }

      // Refresh the user limits, to ensure quota and credits information
      // is up-to-date after an AI request.
      await delay(500);
      try {
        await retryIfFailed({ times: 2 }, onRefreshLimits);
      } catch (error) {
        // Ignore limits refresh error.
      }
    },
    [
      profile,
      aiRequestIdForForm,
      isLoading,
      setSendingAiRequest,
      updateAiRequest,
      clearEditorFunctionCallResults,
      getAuthorizationHeader,
      setLastSendError,
      project,
      aiRequestForForm,
      onRefreshLimits,
    ]
  );
  const onSendEditorFunctionCallResults = React.useCallback(
    async (
      editorFunctionCallResults: Array<EditorFunctionCallResult>,
      options: {|
        createdSceneNames?: Array<string>,
        createdProject?: ?gdProject,
      |}
    ) => {
      await onSendMessage({
        userMessage: '',
        createdSceneNames: options.createdSceneNames,
        createdProject: options.createdProject,
        editorFunctionCallResults,
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
    onWillInstallExtension,
    onExtensionInstalled,
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

  if (hideAskAi) {
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
        fileMetadata={fileMetadata}
        ref={aiRequestChatRef}
        aiRequest={aiRequestForForm}
        onStartNewAiRequest={startNewAiRequest}
        onSendUserMessage={({
          userMessage,
          mode,
        }: {|
          userMessage: string,
          mode: 'chat' | 'agent',
        |}) =>
          onSendMessage({
            userMessage,
            // mode, Mode is forced to agent in standalone form, no need to pass it here.
            editorFunctionCallResults: aiRequestForForm
              ? getEditorFunctionCallResults(aiRequestForForm.id) || []
              : [],
          })
        }
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
        // Restoring project version not relevant to standalone form.
        isFetchingSuggestions={false}
        savingProjectForMessageId={null}
        forkingState={null}
        onRestore={async () => {}}
      />
    </Column>
  );
};
