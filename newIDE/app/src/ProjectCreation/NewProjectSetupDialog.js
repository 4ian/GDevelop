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
import { type NewProjectSetup } from './CreateProjectDialog';
import IconButton from '../UI/IconButton';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import { emptyStorageProvider } from '../ProjectsStorage/ProjectStorageProviders';
import { findEmptyPathInWorkspaceFolder } from '../ProjectsStorage/LocalFileStorageProvider/LocalPathFinder';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import CreateProfile from '../Profile/CreateProfile';
import Paper from '../UI/Paper';
import { Line } from '../UI/Grid';
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
import { createGeneratedProject } from '../Utils/GDevelopServices/Generation';
import ResolutionOptions, {
  type ResolutionOption,
  resolutionOptions,
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

const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;

type Props = {|
  isOpeningProject?: boolean,
  onClose: () => void,
  onCreateEmptyProject: (newProjectSetup: NewProjectSetup) => Promise<void>,
  onCreateFromExample: (
    exampleShortHeader: ExampleShortHeader,
    newProjectSetup: NewProjectSetup,
    i18n: I18nType
  ) => Promise<void>,
  onCreateWithLogin: (newProjectSetup: NewProjectSetup) => Promise<void>,
  onCreateFromAIGeneration: (
    projectFileUrl: string,
    newProjectSetup: NewProjectSetup
  ) => Promise<void>,
  selectedExampleShortHeader: ?ExampleShortHeader,
  storageProviders: Array<StorageProvider>,
  authenticatedUser: AuthenticatedUser,
|};

const NewProjectSetupDialog = ({
  isOpeningProject,
  onClose,
  onCreateEmptyProject,
  onCreateFromExample,
  onCreateWithLogin,
  onCreateFromAIGeneration,
  selectedExampleShortHeader,
  storageProviders,
  authenticatedUser,
}: Props): React.Node => {
  const generateProjectName = () =>
    selectedExampleShortHeader
      ? `${generateName()} (${selectedExampleShortHeader.name})`
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
  const [saveAsLocation, setSaveAsLocation] = React.useState<?SaveAsLocation>(
    null
  );
  const [storageProvider, setStorageProvider] = React.useState<StorageProvider>(
    () => {
      const localFileStorageProvider = storageProviders.find(
        ({ internalName }) => internalName === 'LocalFile'
      );
      const cloudStorageProvider = storageProviders.find(
        ({ internalName }) => internalName === 'Cloud'
      );

      // If in a tutorial, choose either the local file storage provider or none.
      // This is to avoid a new user to be messing with account creation.
      if (!!currentlyRunningInAppTutorial) {
        if (localFileStorageProvider) return localFileStorageProvider;
        return emptyStorageProvider;
      }

      // Try to use the storage provider stored in user preferences.
      if (values.newProjectsDefaultStorageProviderName === 'Empty')
        return emptyStorageProvider;
      const preferredStorageProvider = storageProviders.find(
        ({ internalName }) =>
          internalName === values.newProjectsDefaultStorageProviderName
      );
      if (preferredStorageProvider) return preferredStorageProvider;

      // If preferred storage provider not found, push Cloud storage provider if user authenticated.
      if (authenticatedUser.authenticated) {
        if (cloudStorageProvider) return cloudStorageProvider;
      }

      if (localFileStorageProvider) return localFileStorageProvider;

      return emptyStorageProvider;
    }
  );

  const needUserAuthentication =
    storageProvider.needUserAuthentication && !authenticatedUser.authenticated;
  const { limits } = authenticatedUser;
  const hasTooManyCloudProjects =
    storageProvider.internalName === 'Cloud' &&
    checkIfHasTooManyCloudProjects(authenticatedUser);

  const generateProject = React.useCallback(
    async () => {
      if (isOpeningProject) return;
      if (needUserAuthentication || !profile) return;

      setIsGeneratingProject(true);
      try {
        const generatedProject = await createGeneratedProject(
          getAuthorizationHeader,
          {
            userId: profile.id,
            prompt: generationPrompt,
            width: resolutionOptions[resolutionOption].width,
            height: resolutionOptions[resolutionOption].height,
            projectName,
          }
        );
        setGeneratingProjectId(generatedProject.id);
      } catch (err) {
        console.error(err);
        showAlert({
          title: t`Unable to generate project`,
          message: t`Looks like the AI service is not available. Please try again later or create a project without a prompt.`,
        });
        setIsGeneratingProject(false);
      }
    },
    [
      isOpeningProject,
      needUserAuthentication,
      getAuthorizationHeader,
      generationPrompt,
      profile,
      resolutionOption,
      projectName,
      showAlert,
    ]
  );

  const onValidate = React.useCallback(
    async (i18n: I18nType) => {
      if (generationPrompt) {
        generateProject();
        return;
      }

      if (isOpeningProject) return;
      if (needUserAuthentication) return;

      setProjectNameError(null);
      if (!projectName) {
        setProjectNameError(
          <Trans>Please enter a name for your project.</Trans>
        );
        return;
      }
      const { height, width, orientation } = resolutionOptions[
        resolutionOption
      ];
      const projectSetup = {
        projectName,
        storageProvider,
        saveAsLocation,
        height,
        width,
        orientation,
        optimizeForPixelArt,
        allowPlayersToLogIn,
      };

      if (selectedExampleShortHeader) {
        await onCreateFromExample(
          selectedExampleShortHeader,
          projectSetup,
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
      isOpeningProject,
      needUserAuthentication,
      projectName,
      storageProvider,
      saveAsLocation,
      resolutionOption,
      optimizeForPixelArt,
      allowPlayersToLogIn,
      generateProject,
      generationPrompt,
      selectedExampleShortHeader,
      onCreateFromExample,
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

  const isLoading = isGeneratingProject || isOpeningProject;

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
                disabled={
                  isLoading || needUserAuthentication || hasTooManyCloudProjects
                }
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
            {!selectedExampleShortHeader && (
              <ResolutionOptions
                onClick={key => setResolutionOption(key)}
                selectedOption={resolutionOption}
                disabled={isLoading}
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
                    !!storageProvider.onRenderNewProjectSaveAsLocationChooser
                )
                .map(storageProvider => (
                  <SelectOption
                    key={storageProvider.internalName}
                    value={storageProvider.internalName}
                    label={storageProvider.name}
                    disabled={storageProvider.disabled}
                  />
                ))}
              {!electron && (
                // Only show the ability to start a project without saving on the web-app.
                // On the local app, prefer to always have something saved so that the user is not blocked
                // when they want to add their own resources or use external editors.
                <SelectOption
                  value={emptyStorageProvider.internalName}
                  label={t`Don't save this project now`}
                />
              )}
            </SelectField>
            {needUserAuthentication && (
              <Paper background="dark" variant="outlined">
                <Line justifyContent="center">
                  <CreateProfile
                    onLogin={authenticatedUser.onLogin}
                    onCreateAccount={authenticatedUser.onCreateAccount}
                    message={
                      <Trans>
                        Create an account to store your project online.
                      </Trans>
                    }
                  />
                </Line>
              </Paper>
            )}
            {!needUserAuthentication &&
              storageProvider.onRenderNewProjectSaveAsLocationChooser &&
              storageProvider.onRenderNewProjectSaveAsLocationChooser({
                projectName,
                saveAsLocation,
                setSaveAsLocation,
                newProjectsDefaultFolder,
              })}
            {!selectedExampleShortHeader && (
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
                    disabled={isLoading}
                    value={generationPrompt}
                    onChange={(e, text) => setGenerationPrompt(text)}
                    floatingLabelText={<Trans>AI prompt</Trans>}
                    floatingLabelFixed
                    translatableHintText={t`Type a prompt yourself or generate a random one`}
                    endAdornment={
                      <IconButton
                        size="small"
                        onClick={() => setGenerationPrompt(generatePrompt())}
                        tooltip={t`Generate random prompt`}
                        disabled={isLoading}
                      >
                        <Refresh />
                      </IconButton>
                    }
                  />
                </LineStackLayout>
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
                  disabled={isLoading}
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
                    reason: 'Cloud Project limit reached',
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
