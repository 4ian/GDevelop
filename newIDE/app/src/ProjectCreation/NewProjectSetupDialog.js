// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { type StorageProvider, type SaveAsLocation } from '../ProjectsStorage';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import TextField from '../UI/TextField';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import generateName from '../Utils/ProjectNameGenerator';
import IconButton from '../UI/IconButton';
import { ColumnStackLayout } from '../UI/Layout';
import { emptyStorageProvider } from '../ProjectsStorage/ProjectStorageProviders';
import { findEmptyPathInWorkspaceFolder } from '../ProjectsStorage/LocalFileStorageProvider/LocalPathFinder';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import CreateProfile from '../Profile/CreateProfile';
import Paper from '../UI/Paper';
import { Column, Line, Spacer } from '../UI/Grid';
import {
  checkIfHasTooManyCloudProjects,
  MaxProjectCountAlertMessage,
} from '../MainFrame/EditorContainers/HomePage/BuildSection/MaxProjectCountAlertMessage';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';
import optionalRequire from '../Utils/OptionalRequire';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import Checkbox from '../UI/Checkbox';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
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
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { type I18n as I18nType } from '@lingui/core';
import { I18n } from '@lingui/react';
import { type PrivateGameTemplateListingData } from '../Utils/GDevelopServices/Shop';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import { CLOUD_PROJECT_NAME_MAX_LENGTH } from '../Utils/GDevelopServices/Project';
import AIPromptField from './AIPromptField';
import EmptyAndBaseProjects from './EmptyAndBaseProjects';
import TextButton from '../UI/TextButton';
import ChevronArrowLeft from '../UI/CustomSvgIcons/ChevronArrowLeft';
import ExampleInformationPage from '../AssetStore/ExampleStore/ExampleInformationPage';
import PrivateGameTemplateInformationPage from '../AssetStore/PrivateGameTemplates/PrivateGameTemplateInformationPage';
import ExampleStore from '../AssetStore/ExampleStore';
import Text from '../UI/Text';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../UI/Responsive/ResponsiveWindowMeasurer';
import { PrivateGameTemplateStoreContext } from '../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import { getUserProductPurchaseUsageType } from '../AssetStore/ProductPageHelper';

const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;

export const getItemsColumns = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  return windowSize === 'small' && !isLandscape ? 2 : 4;
};

const generateProjectName = (nameToAppend: ?string) =>
  (nameToAppend ? `${generateName()} (${nameToAppend})` : generateName()).slice(
    0,
    CLOUD_PROJECT_NAME_MAX_LENGTH
  );

export type NewProjectSetup = {|
  storageProvider: StorageProvider,
  saveAsLocation: ?SaveAsLocation,
  projectName?: string,
  height?: number,
  width?: number,
  orientation?: 'landscape' | 'portrait' | 'default',
  optimizeForPixelArt?: boolean,
  openQuickCustomizationDialog?: boolean,
|};

type Props = {|
  isProjectOpening?: boolean,
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
  onCreateFromAIGeneration: (
    generatedProject: GeneratedProject,
    newProjectSetup: NewProjectSetup
  ) => Promise<void>,
  selectedExampleShortHeader: ?ExampleShortHeader,
  onSelectExampleShortHeader: (exampleShortHeader: ?ExampleShortHeader) => void,
  selectedPrivateGameTemplateListingData: ?PrivateGameTemplateListingData,
  onSelectPrivateGameTemplateListingData: (
    privateGameTemplateListingData: ?PrivateGameTemplateListingData
  ) => void,
  storageProviders: Array<StorageProvider>,
  privateGameTemplateListingDatasFromSameCreator: ?Array<PrivateGameTemplateListingData>,
  preventBackHome?: boolean,
  preventBackDetails?: boolean,
|};

const NewProjectSetupDialog = ({
  isProjectOpening,
  onClose,
  onCreateEmptyProject,
  onCreateFromExample,
  onCreateProjectFromPrivateGameTemplate,
  onCreateFromAIGeneration,
  selectedExampleShortHeader,
  onSelectExampleShortHeader,
  selectedPrivateGameTemplateListingData,
  onSelectPrivateGameTemplateListingData,
  storageProviders,
  privateGameTemplateListingDatasFromSameCreator,
  preventBackHome,
  preventBackDetails,
}: Props): React.Node => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { windowSize, isLandscape } = useResponsiveWindowSize();
  const {
    profile,
    getAuthorizationHeader,
    limits,
    authenticated,
    onOpenLoginDialog,
    onOpenCreateAccountDialog,
    receivedGameTemplates,
    gameTemplatePurchases,
  } = authenticatedUser;
  const [
    emptyProjectSelected,
    setEmptyProjectSelected,
  ] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<'home' | 'details' | 'create'>(
    selectedExampleShortHeader || selectedPrivateGameTemplateListingData
      ? 'details'
      : 'home'
  );
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );
  const { showAlert } = useAlertDialog();
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
      if (authenticated) {
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

  const needUserAuthenticationForStorage =
    storageProvider.needUserAuthentication && !authenticated;
  const hasTooManyCloudProjects =
    storageProvider.internalName === 'Cloud' &&
    checkIfHasTooManyCloudProjects(authenticatedUser);
  const hasSelectedAStorageProvider = storageProvider.internalName !== 'Empty';

  const selectedWidth =
    resolutionOptions[resolutionOption].width ||
    customWidth ||
    defaultCustomWidth;
  const selectedHeight =
    resolutionOptions[resolutionOption].height ||
    customHeight ||
    defaultCustomHeight;
  const selectedOrientation = resolutionOptions[resolutionOption].orientation;

  const isLoading = isGeneratingProject || isProjectOpening;

  const isSelectedGameTemplateOwned = React.useMemo(
    () =>
      !selectedPrivateGameTemplateListingData ||
      !!getUserProductPurchaseUsageType({
        productId: selectedPrivateGameTemplateListingData
          ? selectedPrivateGameTemplateListingData.id
          : null,
        receivedProducts: receivedGameTemplates,
        productPurchases: gameTemplatePurchases,
        allProductListingDatas: privateGameTemplateListingDatas,
      }),
    [
      gameTemplatePurchases,
      selectedPrivateGameTemplateListingData,
      privateGameTemplateListingDatas,
      receivedGameTemplates,
    ]
  );

  // On the local app, prefer to always have something saved so that the user is not blocked.
  // On the web-app, allow to create a project without saving it, unless a private game template is selected
  // (as it requires to save the project to the cloud to be able to use it).
  const shouldAllowCreatingProjectWithoutSaving =
    !electron && !selectedPrivateGameTemplateListingData;

  const shouldAllowCreatingProject =
    !isLoading &&
    ((page === 'home' && generationPrompt) ||
      (page === 'details' && isSelectedGameTemplateOwned) ||
      (page === 'create' &&
        !needUserAuthenticationForStorage &&
        !hasTooManyCloudProjects &&
        (hasSelectedAStorageProvider ||
          shouldAllowCreatingProjectWithoutSaving)));

  const generateProject = React.useCallback(
    async () => {
      if (!shouldAllowCreatingProject) return;
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
      shouldAllowCreatingProject,
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

  const onCreateGameClick = React.useCallback(
    async (i18n: I18nType) => {
      if (!shouldAllowCreatingProject) return;

      if (page === 'details') {
        setPage('create');
        return;
      }

      if (page === 'home' && generationPrompt) {
        generateProject();
        return;
      }

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
      } else {
        await onCreateEmptyProject(projectSetup);
      }
    },
    [
      generationPrompt,
      shouldAllowCreatingProject,
      projectName,
      storageProvider,
      saveAsLocation,
      newProjectsDefaultFolder,
      selectedHeight,
      selectedWidth,
      selectedOrientation,
      optimizeForPixelArt,
      selectedExampleShortHeader,
      generateProject,
      selectedPrivateGameTemplateListingData,
      onCreateFromExample,
      onCreateProjectFromPrivateGameTemplate,
      onCreateEmptyProject,
      page,
    ]
  );

  const _onChangeProjectName = React.useCallback(
    (event, text) => {
      if (projectNameError) setProjectNameError(null);
      setProjectName(text);
    },
    [setProjectName, projectNameError]
  );

  // Update project name when the example or private game template changes.
  React.useEffect(
    () => {
      if (selectedExampleShortHeader) {
        setProjectName(generateProjectName(selectedExampleShortHeader.name));
      }
      if (selectedPrivateGameTemplateListingData) {
        setProjectName(
          generateProjectName(selectedPrivateGameTemplateListingData.name)
        );
      }
      if (emptyProjectSelected) {
        setProjectName(generateProjectName());
      }
    },
    [
      selectedExampleShortHeader,
      selectedPrivateGameTemplateListingData,
      emptyProjectSelected,
    ]
  );

  const onBack = React.useCallback(
    () => {
      if (page === 'create') {
        if (emptyProjectSelected) {
          if (!preventBackHome) {
            setEmptyProjectSelected(false);
            setPage('home');
          }
        } else {
          if (!preventBackDetails) {
            setPage('details');
          }
        }
      }
      if (page === 'details' && !preventBackHome) {
        if (selectedExampleShortHeader) onSelectExampleShortHeader(null);
        if (selectedPrivateGameTemplateListingData)
          onSelectPrivateGameTemplateListingData(null);
        setPage('home');
      }
    },
    [
      emptyProjectSelected,
      setEmptyProjectSelected,
      selectedExampleShortHeader,
      onSelectExampleShortHeader,
      selectedPrivateGameTemplateListingData,
      onSelectPrivateGameTemplateListingData,
      page,
      preventBackHome,
      preventBackDetails,
    ]
  );

  const shouldShowBackButton = React.useMemo(
    () => {
      if (page === 'home') return false;
      if (page === 'details') return !preventBackHome;
      if (
        page === 'create' &&
        !preventBackDetails &&
        !(preventBackHome && emptyProjectSelected)
      )
        return true;
    },
    [page, preventBackHome, preventBackDetails, emptyProjectSelected]
  );

  const shouldUseSmallWidth =
    (page === 'details' && !!selectedExampleShortHeader) || page === 'create';
  const shouldUseFullHeight =
    page === 'home' ||
    (page === 'details' && !!selectedPrivateGameTemplateListingData);

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          open
          title={<Trans>Create a new game</Trans>}
          id="project-pre-creation-dialog"
          maxWidth={shouldUseSmallWidth ? 'sm' : 'md'}
          actions={[
            <DialogPrimaryButton
              key="create"
              primary
              disabled={!shouldAllowCreatingProject}
              label={<Trans>Create new game</Trans>}
              onClick={() => onCreateGameClick(i18n)}
              id="create-project-button"
            />,
          ]}
          secondaryActions={[
            <FlatButton
              disabled={isLoading}
              key="cancel"
              label={<Trans>Cancel</Trans>}
              onClick={onClose}
            />,
          ]}
          cannotBeDismissed={isLoading}
          onRequestClose={onClose}
          onApply={() => onCreateGameClick(i18n)}
          fullHeight={shouldUseFullHeight}
          flexColumnBody
          forceScrollVisible
        >
          <Column noMargin expand>
            {shouldShowBackButton && (
              <>
                <Line noMargin>
                  <TextButton
                    icon={<ChevronArrowLeft />}
                    label={<Trans>Back</Trans>}
                    onClick={onBack}
                    disabled={isProjectOpening || isGeneratingProject}
                  />
                </Line>
                <Spacer />
              </>
            )}
            {page === 'home' && (
              <ColumnStackLayout noMargin>
                <EmptyAndBaseProjects
                  onSelectExampleShortHeader={exampleShortHeader => {
                    onSelectExampleShortHeader(exampleShortHeader);
                    setPage('details');
                  }}
                  storageProvider={storageProvider}
                  saveAsLocation={saveAsLocation}
                  onSelectEmptyProject={() => {
                    setEmptyProjectSelected(true);
                    setPage('create');
                  }}
                  disabled={isProjectOpening || isGeneratingProject}
                />
                <Text size="block-title" noMargin>
                  <Trans>Remix an existing game</Trans>
                </Text>
                <ExampleStore
                  onSelectExampleShortHeader={exampleShortHeader => {
                    onSelectExampleShortHeader(exampleShortHeader);
                    setPage('details');
                  }}
                  onSelectPrivateGameTemplateListingData={privateGameTemplateListingData => {
                    onSelectPrivateGameTemplateListingData(
                      privateGameTemplateListingData
                    );
                    setPage('details');
                  }}
                  i18n={i18n}
                  columnsCount={getItemsColumns(windowSize, isLandscape)}
                  onlyShowGames
                  rowToInsert={{
                    row: 2,
                    element: (
                      <AIPromptField
                        onCreateFromAIGeneration={onCreateFromAIGeneration}
                        isProjectOpening={!!isProjectOpening}
                        isGeneratingProject={isGeneratingProject}
                        storageProvider={storageProvider}
                        saveAsLocation={saveAsLocation}
                        generatingProjectId={generatingProjectId}
                        onGenerationClosed={() => {
                          setGeneratingProjectId(null);
                          setIsGeneratingProject(false);
                        }}
                        generationPrompt={generationPrompt}
                        onGenerationPromptChange={setGenerationPrompt}
                      />
                    ),
                  }}
                />
              </ColumnStackLayout>
            )}
            {page === 'details' &&
              (selectedExampleShortHeader ? (
                <ExampleInformationPage
                  exampleShortHeader={selectedExampleShortHeader}
                />
              ) : selectedPrivateGameTemplateListingData ? (
                <PrivateGameTemplateInformationPage
                  privateGameTemplateListingData={
                    selectedPrivateGameTemplateListingData
                  }
                  privateGameTemplateListingDatasFromSameCreator={
                    privateGameTemplateListingDatasFromSameCreator
                  }
                  onGameTemplateOpen={onSelectPrivateGameTemplateListingData}
                  hideOpenAction
                />
              ) : null)}
            {page === 'create' && (
              <ColumnStackLayout noMargin>
                {emptyProjectSelected && (
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
                  maxLength={CLOUD_PROJECT_NAME_MAX_LENGTH}
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
                        onOpenLoginDialog={onOpenLoginDialog}
                        onOpenCreateAccountDialog={onOpenCreateAccountDialog}
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
                {emptyProjectSelected && (
                  <Checkbox
                    checked={optimizeForPixelArt}
                    label={<Trans>Optimize for Pixel Art</Trans>}
                    onCheck={(e, checked) => {
                      setOptimizeForPixelArt(checked);
                    }}
                    disabled={isLoading}
                  />
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
            )}
          </Column>
        </Dialog>
      )}
    </I18n>
  );
};

export default NewProjectSetupDialog;
