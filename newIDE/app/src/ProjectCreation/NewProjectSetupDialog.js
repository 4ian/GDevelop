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
} from '../MainFrame/EditorContainers/HomePage/CreateSection/MaxProjectCountAlertMessage';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';
import optionalRequire from '../Utils/OptionalRequire';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import Checkbox from '../UI/Checkbox';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import Refresh from '../UI/CustomSvgIcons/Refresh';
import { type GeneratedProject } from '../Utils/GDevelopServices/Generation';
import ResolutionOptions, {
  type ResolutionOption,
  resolutionOptions,
  defaultCustomWidth,
  defaultCustomHeight,
} from './ResolutionOptions';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { type I18n as I18nType } from '@lingui/core';
import { I18n } from '@lingui/react';
import { type PrivateGameTemplateListingData } from '../Utils/GDevelopServices/Shop';
import { CLOUD_PROJECT_NAME_MAX_LENGTH } from '../Utils/GDevelopServices/Project';
import AIPromptField from './AIPromptField';
import EmptyAndStartingPointProjects, {
  isStartingPointExampleShortHeader,
} from './EmptyAndStartingPointProjects';
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
import { useOnlineStatus } from '../Utils/OnlineStatus';
import PrivateGameTemplateOwnedInformationPage from '../AssetStore/PrivateGameTemplates/PrivateGameTemplateOwnedInformationPage';

const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;

export const getItemsColumns = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  return windowSize === 'small' && !isLandscape ? 2 : 4;
};

export const generateProjectName = (nameToAppend: ?string) =>
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
}: Props): React.Node => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { windowSize, isLandscape } = useResponsiveWindowSize();
  const {
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
  const isOnHomePage =
    !selectedExampleShortHeader &&
    !selectedPrivateGameTemplateListingData &&
    !emptyProjectSelected;
  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );
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
  const [isGeneratingProject, setIsGeneratingProject] = React.useState<boolean>(
    false
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

  const selectedGameTemplatePurchaseUsageType = React.useMemo(
    () =>
      getUserProductPurchaseUsageType({
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
  const noGameTemplateSelectedOrSelectedAndOwned =
    !selectedPrivateGameTemplateListingData ||
    !!selectedGameTemplatePurchaseUsageType;

  const shouldShowCreateButton =
    !isOnHomePage && noGameTemplateSelectedOrSelectedAndOwned;

  // On the local app, prefer to always have something saved so that the user is not blocked.
  // On the web-app, allow to create a project without saving it, unless a private game template is selected
  // (as it requires to save the project to the cloud to be able to use it).
  const shouldAllowCreatingProjectWithoutSaving =
    !electron && !selectedPrivateGameTemplateListingData;

  const shouldAllowCreatingProject =
    !isLoading &&
    !needUserAuthenticationForStorage &&
    !hasTooManyCloudProjects &&
    (hasSelectedAStorageProvider || shouldAllowCreatingProjectWithoutSaving);

  const onCreateGameClick = React.useCallback(
    async (i18n: I18nType) => {
      if (!shouldAllowCreatingProject) return;

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
      selectedPrivateGameTemplateListingData,
      onCreateFromExample,
      onCreateProjectFromPrivateGameTemplate,
      onCreateEmptyProject,
    ]
  );

  const onChangeProjectName = React.useCallback(
    (event, text) => {
      if (projectNameError) setProjectNameError(null);
      setProjectName(text);
    },
    [setProjectName, projectNameError]
  );

  // Update project name when the example or private game template changes.
  React.useEffect(
    () => {
      if (
        emptyProjectSelected ||
        (selectedExampleShortHeader &&
          isStartingPointExampleShortHeader(selectedExampleShortHeader))
      ) {
        setProjectName(generateProjectName());
        return;
      }
      if (selectedExampleShortHeader) {
        setProjectName(generateProjectName(selectedExampleShortHeader.name));
        return;
      }
      if (selectedPrivateGameTemplateListingData) {
        setProjectName(
          generateProjectName(selectedPrivateGameTemplateListingData.name)
        );
        return;
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
      if (!isOnHomePage && !preventBackHome) {
        if (emptyProjectSelected) setEmptyProjectSelected(false);
        if (selectedExampleShortHeader) onSelectExampleShortHeader(null);
        if (selectedPrivateGameTemplateListingData)
          onSelectPrivateGameTemplateListingData(null);
      }
    },
    [
      isOnHomePage,
      emptyProjectSelected,
      setEmptyProjectSelected,
      selectedExampleShortHeader,
      onSelectExampleShortHeader,
      selectedPrivateGameTemplateListingData,
      onSelectPrivateGameTemplateListingData,
      preventBackHome,
    ]
  );

  const shouldShowBackButton = React.useMemo(
    () => !isOnHomePage && !preventBackHome,
    [isOnHomePage, preventBackHome]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          open
          title={<Trans>Create a new game</Trans>}
          id="project-pre-creation-dialog"
          maxWidth="md"
          actions={[
            <FlatButton
              disabled={isLoading}
              key="cancel"
              label={<Trans>Cancel</Trans>}
              onClick={onClose}
            />,
            shouldShowCreateButton ? (
              <DialogPrimaryButton
                key="create"
                primary
                disabled={!shouldAllowCreatingProject}
                label={<Trans>Create new game</Trans>}
                onClick={() => onCreateGameClick(i18n)}
                id="create-project-button"
              />
            ) : null,
          ].filter(Boolean)}
          cannotBeDismissed={isLoading}
          onRequestClose={onClose}
          onApply={() => onCreateGameClick(i18n)}
          fullHeight={
            isOnHomePage ||
            (!!selectedPrivateGameTemplateListingData &&
              !noGameTemplateSelectedOrSelectedAndOwned)
          }
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
            {isOnHomePage && (
              <ColumnStackLayout noMargin>
                <EmptyAndStartingPointProjects
                  onSelectExampleShortHeader={exampleShortHeader => {
                    onSelectExampleShortHeader(exampleShortHeader);
                  }}
                  storageProvider={storageProvider}
                  saveAsLocation={saveAsLocation}
                  onSelectEmptyProject={() => {
                    setEmptyProjectSelected(true);
                  }}
                  disabled={isProjectOpening || isGeneratingProject}
                />
                {isOnline && (
                  <>
                    <Text size="block-title" noMargin>
                      <Trans>Remix an existing game</Trans>
                    </Text>
                    <ExampleStore
                      onSelectExampleShortHeader={exampleShortHeader => {
                        onSelectExampleShortHeader(exampleShortHeader);
                      }}
                      onSelectPrivateGameTemplateListingData={privateGameTemplateListingData => {
                        onSelectPrivateGameTemplateListingData(
                          privateGameTemplateListingData
                        );
                      }}
                      i18n={i18n}
                      columnsCount={getItemsColumns(windowSize, isLandscape)}
                      rowToInsert={{
                        row: 2,
                        element: (
                          <AIPromptField
                            onCreateFromAIGeneration={onCreateFromAIGeneration}
                            isProjectOpening={!!isProjectOpening}
                            isGeneratingProject={isGeneratingProject}
                            storageProvider={storageProvider}
                            saveAsLocation={saveAsLocation}
                            onGenerationStarted={() =>
                              setIsGeneratingProject(true)
                            }
                            onGenerationEnded={() =>
                              setIsGeneratingProject(false)
                            }
                          />
                        ),
                      }}
                      hideStartingPoints
                    />
                  </>
                )}
              </ColumnStackLayout>
            )}
            {!isOnHomePage &&
              selectedPrivateGameTemplateListingData &&
              !noGameTemplateSelectedOrSelectedAndOwned && (
                <PrivateGameTemplateInformationPage
                  privateGameTemplateListingData={
                    selectedPrivateGameTemplateListingData
                  }
                  privateGameTemplateListingDatasFromSameCreator={
                    privateGameTemplateListingDatasFromSameCreator
                  }
                  onGameTemplateOpen={onSelectPrivateGameTemplateListingData}
                />
              )}
            {!isOnHomePage && noGameTemplateSelectedOrSelectedAndOwned && (
              <ColumnStackLayout noMargin>
                {selectedExampleShortHeader ? (
                  <ExampleInformationPage
                    exampleShortHeader={selectedExampleShortHeader}
                  />
                ) : selectedPrivateGameTemplateListingData &&
                  selectedGameTemplatePurchaseUsageType ? (
                  <PrivateGameTemplateOwnedInformationPage
                    privateGameTemplateListingData={
                      selectedPrivateGameTemplateListingData
                    }
                    purchaseUsageType={selectedGameTemplatePurchaseUsageType}
                    onStoreProductOpened={onClose}
                  />
                ) : null}
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
                <Spacer />
                <TextField
                  type="text"
                  errorText={projectNameError}
                  disabled={isLoading}
                  value={projectName}
                  onChange={onChangeProjectName}
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
                  fullWidth
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
                {needUserAuthenticationForStorage && (
                  <Line justifyContent="center">
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
                  </Line>
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
