// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { type StorageProvider, type SaveAsLocation } from '../ProjectsStorage';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import TextField from '../UI/TextField';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../Profile/AuthenticatedUserContext';
import generateName from '../Utils/ProjectNameGenerator';
import IconButton from '../UI/IconButton';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import { emptyStorageProvider } from '../ProjectsStorage/ProjectStorageProviders';
import { findEmptyPathInWorkspaceFolder } from '../ProjectsStorage/LocalFileStorageProvider/LocalPathFinder';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import CreateProfile from '../Profile/CreateProfile';
import Paper from '../UI/Paper';
import { Column, Line } from '../UI/Grid';
import LeftLoader from '../UI/LeftLoader';
import {
  checkIfHasTooManyCloudProjects,
  MaxProjectCountAlertMessage,
} from '../MainFrame/EditorContainers/HomePage/BuildSection/MaxProjectCountAlertMessage';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';
import optionalRequire from '../Utils/OptionalRequire';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import Checkbox from '../UI/Checkbox';
import { MarkdownText } from '../UI/MarkdownText';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import { useOnlineStatus } from '../Utils/OnlineStatus';
import Refresh from '../UI/CustomSvgIcons/Refresh';
import {
  createGeneratedProject,
  type GeneratedProject,
} from '../Utils/GDevelopServices/Generation';
import ResolutionOptions, {
  type ResolutionOption,
  resolutionOptions,
  defaultCustomWidth,
  defaultCustomHeight,
} from './ResolutionOptions';
import Text from '../UI/Text';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import generatePrompt from '../Utils/ProjectPromptGenerator';
import ProjectGeneratingDialog from './ProjectGeneratingDialog';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import RobotIcon from './RobotIcon';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { type I18n as I18nType } from '@lingui/core';
import { I18n } from '@lingui/react';
import GetSubscriptionCard from '../Profile/Subscription/GetSubscriptionCard';
import { type PrivateGameTemplateListingData } from '../Utils/GDevelopServices/Shop';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';

const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;

export type NewProjectSetup = {|
  storageProvider: StorageProvider,
  saveAsLocation: ?SaveAsLocation,
  projectName?: string,
  height?: number,
  width?: number,
  orientation?: 'landscape' | 'portrait' | 'default',
  optimizeForPixelArt?: boolean,
  allowPlayersToLogIn?: boolean,
  templateSlug?: string,
|};

type Props = {|
  isOpeningProject?: boolean,
  onClose: () => void,
  onCreateEmptyProject: (newProjectSetup: NewProjectSetup) => Promise<void>,
  onCreateFromExample: (
    exampleShortHeader: ExampleShortHeader,
    newProjectSetup: NewProjectSetup,
    i18n: I18nType
  ) => Promise<void>,
  onCreateProjectFromPrivateGameTemplate: (
    privateGameTemplateListingData: PrivateGameTemplateListingData,
    newProjectSetup: NewProjectSetup,
    i18n: I18nType
  ) => Promise<void>,
  onCreateWithLogin: (newProjectSetup: NewProjectSetup) => Promise<void>,
  onCreateFromAIGeneration: (
    generatedProject: GeneratedProject,
    newProjectSetup: NewProjectSetup
  ) => Promise<void>,
  selectedExampleShortHeader: ?ExampleShortHeader,
  selectedPrivateGameTemplateListingData: ?PrivateGameTemplateListingData,
  storageProviders: Array<StorageProvider>,
  authenticatedUser: AuthenticatedUser,
|};

const NewProjectSetupDialog = ({
  isOpeningProject,
  onClose,
  onCreateEmptyProject,
  onCreateFromExample,
  onCreateProjectFromPrivateGameTemplate,
  onCreateWithLogin,
  onCreateFromAIGeneration,
  selectedExampleShortHeader,
  selectedPrivateGameTemplateListingData,
  storageProviders,
  authenticatedUser,
}: Props): React.Node => {
  const generateProjectName = () =>
    selectedExampleShortHeader
      ? `${generateName()} (${selectedExampleShortHeader.name})`
      : selectedPrivateGameTemplateListingData
      ? `${generateName()} (${selectedPrivateGameTemplateListingData.name})`
      : generateName();

  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const { showAlert } = useAlertDialog();
  const isOnline = useOnlineStatus();
  const { values, setNewProjectsDefaultStorageProviderName } = React.useContext(
    PreferencesContext
  );
  const { currentlyRunningInAppTutorial } = React.useContext(
    InAppTutorialContext
  );
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const [projectNameError, setProjectNameError] = React.useState<?React.Node>(
    null
  );
  const [projectName, setProjectName] = React.useState<string>(
    generateProjectName()
  );
  const [generationPrompt, setGenerationPrompt] = React.useState<string>('');
  const [isGeneratingProject, setIsGeneratingProject] = React.useState<boolean>(
    false
  );
  const [generatingProjectId, setGeneratingProjectId] = React.useState<?string>(
    null
  );
  const [
    resolutionOption,
    setResolutionOption,
  ] = React.useState<ResolutionOption>('desktopMobileLandscape');
  const [customWidth, setCustomWidth] = React.useState<?number>(
    defaultCustomWidth
  );
  const [customHeight, setCustomHeight] = React.useState<?number>(
    defaultCustomHeight
  );
  const [optimizeForPixelArt, setOptimizeForPixelArt] = React.useState<boolean>(
    false
  );
  const [allowPlayersToLogIn, setAllowPlayersToLogIn] = React.useState<boolean>(
    // Enable player login by default for new games, unless a tutorial is running or offline.
    !!currentlyRunningInAppTutorial || !isOnline ? false : true
  );
  const newProjectsDefaultFolder = app
    ? findEmptyPathInWorkspaceFolder(app, values.newProjectsDefaultFolder || '')
    : '';
  const [storageProvider, setStorageProvider] = React.useState<StorageProvider>(
    () => {
      const localFileStorageProvider = storageProviders.find(
        ({ internalName }) => internalName === 'LocalFile'
      );
      const cloudStorageProvider = storageProviders.find(
        ({ internalName }) => internalName === 'Cloud'
      );
      const preferredStorageProvider = storageProviders.find(
        ({ internalName }) =>
          internalName === values.newProjectsDefaultStorageProviderName
      );

      // If in a tutorial, choose either the local file storage provider or none.
      // This is to avoid a new user to be messing with account creation.
      if (!!currentlyRunningInAppTutorial) {
        if (localFileStorageProvider) return localFileStorageProvider;
        return emptyStorageProvider;
      }

      // If a private game template is selected, suggest the preferred storage if available,
      // or default to local or cloud.
      if (!!selectedPrivateGameTemplateListingData) {
        if (preferredStorageProvider) return preferredStorageProvider;
        if (localFileStorageProvider) return localFileStorageProvider;
        if (cloudStorageProvider) return cloudStorageProvider;
        return emptyStorageProvider;
      }

      // Try to use the storage provider stored in user preferences.
      if (values.newProjectsDefaultStorageProviderName === 'Empty')
        return emptyStorageProvider;
      if (preferredStorageProvider) return preferredStorageProvider;

      // If preferred storage provider not found, push Cloud storage provider if user authenticated.
      if (authenticatedUser.authenticated) {
        if (cloudStorageProvider) return cloudStorageProvider;
      }

      if (localFileStorageProvider) return localFileStorageProvider;

      return emptyStorageProvider;
    }
  );
  const [saveAsLocation, setSaveAsLocation] = React.useState<?SaveAsLocation>(
    storageProvider.getProjectLocation
      ? storageProvider.getProjectLocation({
          projectName,
          saveAsLocation: null,
          newProjectsDefaultFolder,
        })
      : null
  );

  const generationCurrentUsage = authenticatedUser.limits
    ? authenticatedUser.limits.quotas['ai-project-generation']
    : null;
  const canGenerateProjectFromPrompt =
    generationCurrentUsage && !generationCurrentUsage.limitReached;

  const needUserAuthenticationForStorage =
    storageProvider.needUserAuthentication && !authenticatedUser.authenticated;
  const { limits } = authenticatedUser;
  const hasTooManyCloudProjects =
    storageProvider.internalName === 'Cloud' &&
    checkIfHasTooManyCloudProjects(authenticatedUser);
  const hasNotSelectedAStorageProvider =
    storageProvider.internalName === 'Empty';

  const selectedWidth =
    resolutionOptions[resolutionOption].width ||
    customWidth ||
    defaultCustomWidth;
  const selectedHeight =
    resolutionOptions[resolutionOption].height ||
    customHeight ||
    defaultCustomHeight;
  const selectedOrientation = resolutionOptions[resolutionOption].orientation;

  const isLoading = isGeneratingProject || isOpeningProject;

  const isStartingProjectFromScratch =
    !selectedExampleShortHeader && !selectedPrivateGameTemplateListingData;

  // On the local app, prefer to always have something saved so that the user is not blocked.
  // On the web-app, allow to create a project without saving it, unless a private game template is selected
  // (as it requires to save the project to the cloud to be able to use it).
  const shouldAllowCreatingProjectWithoutSaving =
    !electron && !selectedPrivateGameTemplateListingData;

  const shouldNotAllowCreatingProject =
    isLoading ||
    needUserAuthenticationForStorage ||
    hasTooManyCloudProjects ||
    (hasNotSelectedAStorageProvider &&
      !shouldAllowCreatingProjectWithoutSaving);

  const generateProject = React.useCallback(
    async () => {
      if (shouldNotAllowCreatingProject) return;
      if (!profile) return;

      setIsGeneratingProject(true);
      try {
        const generatedProject = await createGeneratedProject(
          getAuthorizationHeader,
          {
            userId: profile.id,
            prompt: generationPrompt,
            width: selectedWidth,
            height: selectedHeight,
            projectName,
          }
        );
        setGeneratingProjectId(generatedProject.id);
      } catch (error) {
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (
          extractedStatusAndCode &&
          extractedStatusAndCode.code === 'project-generation/quota-exceeded'
        ) {
          setGenerationPrompt('');
          // Fetch the limits again to show the warning about quota.
          await authenticatedUser.onRefreshLimits();
        } else {
          showAlert({
            title: t`Unable to generate project`,
            message: t`Looks like the AI service is not available. Please try again later or create a project without a prompt.`,
          });
        }
        setIsGeneratingProject(false);
      }
    },
    [
      shouldNotAllowCreatingProject,
      getAuthorizationHeader,
      generationPrompt,
      profile,
      projectName,
      showAlert,
      authenticatedUser,
      selectedHeight,
      selectedWidth,
    ]
  );

  const onValidate = React.useCallback(
    async (i18n: I18nType) => {
      if (generationPrompt) {
        generateProject();
        return;
      }

      if (shouldNotAllowCreatingProject) return;

      setProjectNameError(null);
      if (!projectName) {
        setProjectNameError(
          <Trans>Please enter a name for your project.</Trans>
        );
        return;
      }

      // Make sure that the path is up to date with the project name.
      const projectLocation = storageProvider.getProjectLocation
        ? storageProvider.getProjectLocation({
            projectName,
            saveAsLocation,
            newProjectsDefaultFolder,
          })
        : saveAsLocation;

      const projectSetup = {
        projectName,
        storageProvider,
        saveAsLocation: projectLocation,
        height: selectedHeight,
        width: selectedWidth,
        orientation: selectedOrientation,
        optimizeForPixelArt,
        allowPlayersToLogIn,
      };

      if (selectedExampleShortHeader) {
        await onCreateFromExample(
          selectedExampleShortHeader,
          {
            // We only pass down the project name as this is the only customizable field for an example.
            projectName,
            storageProvider,
            saveAsLocation: projectLocation,
          },
          i18n
        );
      } else if (selectedPrivateGameTemplateListingData) {
        await onCreateProjectFromPrivateGameTemplate(
          selectedPrivateGameTemplateListingData,
          {
            // We only pass down the project name as this is the only cusomizable field for a template.
            projectName,
            storageProvider,
            saveAsLocation,
          },
          i18n
        );
      } else if (allowPlayersToLogIn) {
        await onCreateWithLogin(projectSetup);
        return;
      } else {
        await onCreateEmptyProject(projectSetup);
      }
    },
    [
      generationPrompt,
      shouldNotAllowCreatingProject,
      projectName,
      storageProvider,
      saveAsLocation,
      newProjectsDefaultFolder,
      selectedHeight,
      selectedWidth,
      selectedOrientation,
      optimizeForPixelArt,
      allowPlayersToLogIn,
      selectedExampleShortHeader,
      generateProject,
      selectedPrivateGameTemplateListingData,
      onCreateFromExample,
      onCreateProjectFromPrivateGameTemplate,
      onCreateWithLogin,
      onCreateEmptyProject,
    ]
  );

  const _onChangeProjectName = React.useCallback(
    (event, text) => {
      if (projectNameError) setProjectNameError(null);
      setProjectName(text);
    },
    [setProjectName, projectNameError]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          open
          title={<Trans>New Project</Trans>}
          id="project-pre-creation-dialog"
          maxWidth="sm"
          actions={[
            <FlatButton
              disabled={isLoading}
              key="cancel"
              label={<Trans>Cancel</Trans>}
              onClick={onClose}
            />,
            <LeftLoader isLoading={isLoading} key="create">
              <DialogPrimaryButton
                primary
                disabled={shouldNotAllowCreatingProject}
                label={<Trans>Create project</Trans>}
                onClick={() => onValidate(i18n)}
                id="create-project-button"
              />
            </LeftLoader>,
          ]}
          cannotBeDismissed={isLoading}
          onRequestClose={onClose}
          onApply={() => onValidate(i18n)}
        >
          <ColumnStackLayout noMargin>
            {isStartingProjectFromScratch && (
              <ResolutionOptions
                onClick={key => setResolutionOption(key)}
                selectedOption={resolutionOption}
                disabled={isLoading}
                customHeight={customHeight}
                customWidth={customWidth}
                onCustomHeightChange={setCustomHeight}
                onCustomWidthChange={setCustomWidth}
              />
            )}
            <TextField
              type="text"
              errorText={projectNameError}
              disabled={isLoading}
              value={projectName}
              onChange={_onChangeProjectName}
              floatingLabelText={<Trans>Project name</Trans>}
              endAdornment={
                <IconButton
                  size="small"
                  onClick={() => setProjectName(generateProjectName())}
                  tooltip={t`Generate random name`}
                  disabled={isLoading}
                >
                  <Refresh />
                </IconButton>
              }
              autoFocus="desktop"
              maxLength={100}
            />
            <SelectField
              fullWidth
              disabled={isLoading}
              floatingLabelText={<Trans>Where to store this project</Trans>}
              value={storageProvider.internalName}
              onChange={(e, i, newValue: string) => {
                setNewProjectsDefaultStorageProviderName(newValue);
                const newStorageProvider =
                  storageProviders.find(
                    ({ internalName }) => internalName === newValue
                  ) || emptyStorageProvider;
                setStorageProvider(newStorageProvider);

                // Reset the save as location, to avoid mixing it between storage providers
                // and give a chance to the storage provider to set it to a default value.
                setSaveAsLocation(null);
              }}
            >
              {storageProviders
                // Filter out storage providers who are supposed to be used for storage initially
                // (for example: the "URL" storage provider, which is read only,
                // or the "DownloadFile" storage provider, which is not a persistent storage).
                .filter(
                  storageProvider =>
                    !!storageProvider.renderNewProjectSaveAsLocationChooser
                )
                .map(storageProvider => (
                  <SelectOption
                    key={storageProvider.internalName}
                    value={storageProvider.internalName}
                    label={storageProvider.name}
                    disabled={storageProvider.disabled}
                  />
                ))}
              {shouldAllowCreatingProjectWithoutSaving && (
                <SelectOption
                  value={emptyStorageProvider.internalName}
                  label={t`Don't save this project now`}
                />
              )}
            </SelectField>
            {needUserAuthenticationForStorage && (
              <Paper background="dark" variant="outlined">
                <Line justifyContent="center">
                  <CreateProfile
                    onOpenLoginDialog={authenticatedUser.onOpenLoginDialog}
                    onOpenCreateAccountDialog={
                      authenticatedUser.onOpenCreateAccountDialog
                    }
                    message={
                      <Trans>
                        Create an account to store your project online.
                      </Trans>
                    }
                  />
                </Line>
              </Paper>
            )}
            {!needUserAuthenticationForStorage &&
              storageProvider.renderNewProjectSaveAsLocationChooser &&
              storageProvider.renderNewProjectSaveAsLocationChooser({
                projectName,
                saveAsLocation,
                setSaveAsLocation,
                newProjectsDefaultFolder,
              })}
            {isStartingProjectFromScratch && (
              <ColumnStackLayout noMargin expand>
                <DismissableAlertMessage
                  kind="info"
                  identifier="new-generate-project-from-prompt"
                >
                  <Trans>NEW! Generate a pre-made AI scene with assets.</Trans>
                </DismissableAlertMessage>
                <LineStackLayout
                  expand
                  noMargin
                  alignItems="center"
                  justifyContent="center"
                >
                  <RobotIcon />
                  <TextField
                    type="text"
                    multiline
                    maxLength={200}
                    fullWidth
                    disabled={
                      isLoading ||
                      !authenticatedUser.authenticated ||
                      !isOnline ||
                      !canGenerateProjectFromPrompt
                    }
                    value={generationPrompt}
                    onChange={(e, text) => setGenerationPrompt(text)}
                    floatingLabelText={<Trans>AI prompt</Trans>}
                    floatingLabelFixed
                    translatableHintText={
                      !authenticatedUser.authenticated || !isOnline
                        ? t`Log in to generate a project from a prompt`
                        : t`Type a prompt yourself or generate a random one`
                    }
                    endAdornment={
                      <IconButton
                        size="small"
                        onClick={() => setGenerationPrompt(generatePrompt())}
                        tooltip={t`Generate random prompt`}
                        disabled={
                          isLoading ||
                          !authenticatedUser.authenticated ||
                          !isOnline ||
                          !canGenerateProjectFromPrompt
                        }
                      >
                        <Refresh />
                      </IconButton>
                    }
                  />
                </LineStackLayout>
                {authenticatedUser.authenticated &&
                  !canGenerateProjectFromPrompt && (
                    <GetSubscriptionCard subscriptionDialogOpeningReason="Generate project from prompt">
                      <Line>
                        <Column noMargin>
                          <Text noMargin>
                            <Trans>
                              You've used all your daily pre-made AI scenes!
                              Generate as many as you want with a subscription.
                            </Trans>
                          </Text>
                        </Column>
                      </Line>
                    </GetSubscriptionCard>
                  )}
                <Text size="sub-title">
                  <Trans>Advanced File options</Trans>
                </Text>
                <Checkbox
                  checked={optimizeForPixelArt}
                  label={<Trans>Optimize for Pixel Art</Trans>}
                  onCheck={(e, checked) => {
                    setOptimizeForPixelArt(checked);
                  }}
                  disabled={isLoading}
                />
                <Checkbox
                  checked={allowPlayersToLogIn}
                  label={<Trans>Allow players to authenticate in-game</Trans>}
                  onCheck={(e, checked) => {
                    setAllowPlayersToLogIn(checked);
                  }}
                  disabled={isLoading || !isOnline}
                  tooltipOrHelperText={
                    <MarkdownText
                      translatableSource={t`Learn more about [player authentication](https://wiki.gdevelop.io/gdevelop5/all-features/player-authentication).`}
                    />
                  }
                />
              </ColumnStackLayout>
            )}
            {limits && hasTooManyCloudProjects ? (
              <MaxProjectCountAlertMessage
                limits={limits}
                onUpgrade={() =>
                  openSubscriptionDialog({
                    analyticsMetadata: {
                      reason: 'Cloud Project limit reached',
                    },
                  })
                }
              />
            ) : null}
          </ColumnStackLayout>
          {isGeneratingProject && generatingProjectId && (
            <ProjectGeneratingDialog
              generatingProjectId={generatingProjectId}
              storageProvider={storageProvider}
              saveAsLocation={saveAsLocation}
              onCreate={onCreateFromAIGeneration}
              onClose={() => {
                setGeneratingProjectId(null);
                setIsGeneratingProject(false);
              }}
            />
          )}
        </Dialog>
      )}
    </I18n>
  );
};

export default NewProjectSetupDialog;
