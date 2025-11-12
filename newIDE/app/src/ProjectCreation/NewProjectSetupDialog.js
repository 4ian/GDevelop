// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import {
  type StorageProvider,
  type SaveAsLocation,
  type FileMetadata,
} from '../ProjectsStorage';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
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
import optionalRequire from '../Utils/OptionalRequire';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import Checkbox from '../UI/Checkbox';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import Refresh from '../UI/CustomSvgIcons/Refresh';
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
import EmptyAndStartingPointProjects, {
  isLinkedToStartingPointExampleShortHeader,
  isStartingPointExampleShortHeader,
} from './EmptyAndStartingPointProjects';
import TextButton from '../UI/TextButton';
import ChevronArrowLeft from '../UI/CustomSvgIcons/ChevronArrowLeft';
import ExampleInformationPage from '../AssetStore/ExampleStore/ExampleInformationPage';
import PrivateGameTemplateInformationPage from '../AssetStore/PrivateGameTemplates/PrivateGameTemplateInformationPage';
import ExampleStore from '../AssetStore/ExampleStore';
import Text from '../UI/Text';
import { type WindowSizeType } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { PrivateGameTemplateStoreContext } from '../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import { getUserProductPurchaseUsageType } from '../AssetStore/ProductPageHelper';
import { useOnlineStatus } from '../Utils/OnlineStatus';
import PrivateGameTemplateOwnedInformationPage from '../AssetStore/PrivateGameTemplates/PrivateGameTemplateOwnedInformationPage';
import { ExampleStoreContext } from '../AssetStore/ExampleStore/ExampleStoreContext';
import EmptyMessage from '../UI/EmptyMessage';
import { BundleStoreContext } from '../AssetStore/Bundles/BundleStoreContext';
import { type CreateProjectResult } from '../Utils/UseCreateProject';
import { isNativeMobileApp } from '../Utils/Platform';
import { AskAiStandAloneForm } from '../AiGeneration/AskAiStandAloneForm';
import { AiRequestContext } from '../AiGeneration/AiRequestContext';

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

export type NewProjectCreationSource =
  | 'default'
  | 'quick-customization'
  | 'ai-agent-request'
  | 'course-chapter'
  | 'in-app-tutorial';

export type NewProjectSetup = {|
  storageProvider: StorageProvider,
  saveAsLocation: ?SaveAsLocation,
  projectName?: string,
  height?: number,
  width?: number,
  orientation?: 'landscape' | 'portrait' | 'default',
  optimizeForPixelArt?: boolean,
  openQuickCustomizationDialog?: boolean,
  dontOpenAnySceneOrProjectManager?: boolean,
  dontRepositionAskAiEditor?: boolean,
  dontCloseNewProjectSetupDialog?: boolean,
  creationSource: NewProjectCreationSource,
|};

export type ExampleProjectSetup = {|
  exampleShortHeader: ExampleShortHeader,
  newProjectSetup: NewProjectSetup,
  i18n: I18nType,
|};

type Props = {|
  project: ?gdProject,
  fileMetadata: ?FileMetadata,
  resourceManagementProps: ResourceManagementProps,
  isProjectOpening?: boolean,
  onClose: () => void,
  onCreateEmptyProject: (
    newProjectSetup: NewProjectSetup
  ) => Promise<CreateProjectResult>,
  onCreateFromExample: (
    exampleProjectSetup: ExampleProjectSetup
  ) => Promise<CreateProjectResult>,
  onCreateProjectFromPrivateGameTemplate: (
    privateGameTemplateListingData: PrivateGameTemplateListingData,
    newProjectSetup: NewProjectSetup,
    i18n: I18nType
  ) => Promise<CreateProjectResult>,
  onOpenAskAi: () => void,
  onCloseAskAi: () => void,
  selectedExampleShortHeader: ?ExampleShortHeader,
  onSelectExampleShortHeader: (exampleShortHeader: ?ExampleShortHeader) => void,
  selectedPrivateGameTemplateListingData: ?PrivateGameTemplateListingData,
  onSelectPrivateGameTemplateListingData: (
    privateGameTemplateListingData: ?PrivateGameTemplateListingData
  ) => void,
  storageProviders: Array<StorageProvider>,
  storageProvider: ?StorageProvider,
  privateGameTemplateListingDatasFromSameCreator: ?Array<PrivateGameTemplateListingData>,
  preventBackHome?: boolean,
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
|};

const NewProjectSetupDialog = ({
  project,
  fileMetadata,
  resourceManagementProps,
  isProjectOpening,
  onClose,
  onCreateEmptyProject,
  onCreateFromExample,
  onCreateProjectFromPrivateGameTemplate,
  onOpenAskAi,
  onCloseAskAi,
  selectedExampleShortHeader,
  onSelectExampleShortHeader,
  selectedPrivateGameTemplateListingData,
  onSelectPrivateGameTemplateListingData,
  storageProviders,
  storageProvider,
  privateGameTemplateListingDatasFromSameCreator,
  preventBackHome,
  onOpenLayout,
  onWillInstallExtension,
  onExtensionInstalled,
}: Props): React.Node => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    authenticated,
    onOpenLoginDialog,
    onOpenCreateAccountDialog,
    receivedGameTemplates,
    receivedBundles,
    gameTemplatePurchases,
    bundlePurchases,
  } = authenticatedUser;
  const [
    emptyProjectSelected,
    setEmptyProjectSelected,
  ] = React.useState<boolean>(false);
  const [startersSelected, setStartersSelected] = React.useState<boolean>(
    false
  );
  const { exampleShortHeaders } = React.useContext(ExampleStoreContext);
  const isOnHomePage =
    !selectedExampleShortHeader &&
    !selectedPrivateGameTemplateListingData &&
    !emptyProjectSelected &&
    !startersSelected;
  const isOnStartersPage =
    !selectedExampleShortHeader &&
    !selectedPrivateGameTemplateListingData &&
    !emptyProjectSelected &&
    startersSelected;

  const { privateGameTemplateListingDatas } = React.useContext(
    PrivateGameTemplateStoreContext
  );
  const { bundleListingDatas } = React.useContext(BundleStoreContext);
  const isOnline = useOnlineStatus();
  const { values, setNewProjectsDefaultStorageProviderName } = React.useContext(
    PreferencesContext
  );
  const { currentlyRunningInAppTutorial } = React.useContext(
    InAppTutorialContext
  );
  const [projectNameError, setProjectNameError] = React.useState<?React.Node>(
    null
  );
  const [projectName, setProjectName] = React.useState<string>(
    generateProjectName()
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
  const [
    storageProviderForCreation,
    setStorageProviderForCreation,
  ] = React.useState<StorageProvider>(
    (): StorageProvider => {
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
    storageProviderForCreation.getProjectLocation
      ? storageProviderForCreation.getProjectLocation({
          projectName,
          saveAsLocation: null,
          newProjectsDefaultFolder,
        })
      : null
  );

  const needUserAuthenticationForStorage =
    storageProviderForCreation.needUserAuthentication && !authenticated;
  const hasTooManyCloudProjects =
    storageProviderForCreation.internalName === 'Cloud' &&
    checkIfHasTooManyCloudProjects(authenticatedUser);
  const hasSelectedAStorageProvider =
    storageProviderForCreation.internalName !== 'Empty';

  const selectedWidth =
    resolutionOptions[resolutionOption].width ||
    customWidth ||
    defaultCustomWidth;
  const selectedHeight =
    resolutionOptions[resolutionOption].height ||
    customHeight ||
    defaultCustomHeight;
  const selectedOrientation = resolutionOptions[resolutionOption].orientation;

  const { aiRequestStorage } = React.useContext(AiRequestContext);
  const { isSendingAiRequest } = aiRequestStorage;
  const isLoading = isProjectOpening || isSendingAiRequest('');

  const linkedExampleShortHeaders: {
    exampleShortHeader: ExampleShortHeader,
    relation: string,
  }[] = React.useMemo(
    () => {
      if (
        !exampleShortHeaders ||
        !selectedExampleShortHeader ||
        !selectedExampleShortHeader.linkedExampleShortHeaders
      )
        return [];

      return selectedExampleShortHeader.linkedExampleShortHeaders
        .map(({ slug, relation }) => {
          const linkedExampleShortHeader = exampleShortHeaders.find(
            exampleShortHeader => exampleShortHeader.slug === slug
          );
          if (linkedExampleShortHeader) {
            return {
              exampleShortHeader: linkedExampleShortHeader,
              relation,
            };
          }

          return null;
        })
        .filter(Boolean);
    },
    [exampleShortHeaders, selectedExampleShortHeader]
  );
  const linkedPixelArtExampleShortHeader = React.useMemo(
    () => {
      const pixelArtLinkedItem = linkedExampleShortHeaders.find(
        ({ relation }) => relation === 'pixel-art-version'
      );
      return pixelArtLinkedItem ? pixelArtLinkedItem.exampleShortHeader : null;
    },
    [linkedExampleShortHeaders]
  );
  const linkedNonPixelArtExampleShortHeader = React.useMemo(
    () => {
      const nonPixelArtLinkedItem = linkedExampleShortHeaders.find(
        ({ relation }) => relation === 'non-pixel-art-version'
      );
      return nonPixelArtLinkedItem
        ? nonPixelArtLinkedItem.exampleShortHeader
        : null;
    },
    [linkedExampleShortHeaders]
  );

  const onCheckOptimizeForPixelArt = React.useCallback(
    (e, checked) => {
      if (!!linkedNonPixelArtExampleShortHeader && !checked) {
        // If trying to uncheck the optimization for pixel art, on a template
        // which has a non-pixel art version, then update the selected template.
        onSelectExampleShortHeader(linkedNonPixelArtExampleShortHeader);
        return;
      }
      if (!!linkedPixelArtExampleShortHeader && checked) {
        // If trying to check the optimization for pixel art, on a template
        // which has a pixel art version, then update the selected template.
        onSelectExampleShortHeader(linkedPixelArtExampleShortHeader);
        return;
      }

      // Otherwise, just update the optimization for pixel art.
      setOptimizeForPixelArt(checked);
    },
    [
      setOptimizeForPixelArt,
      onSelectExampleShortHeader,
      linkedPixelArtExampleShortHeader,
      linkedNonPixelArtExampleShortHeader,
    ]
  );

  const selectedGameTemplatePurchaseUsageType = React.useMemo(
    () =>
      getUserProductPurchaseUsageType({
        productId: selectedPrivateGameTemplateListingData
          ? selectedPrivateGameTemplateListingData.id
          : null,
        receivedProducts: [
          ...(receivedGameTemplates || []),
          ...(receivedBundles || []),
        ],
        productPurchases: [
          ...(gameTemplatePurchases || []),
          ...(bundlePurchases || []),
        ],
        allProductListingDatas: [
          ...(privateGameTemplateListingDatas || []),
          ...(bundleListingDatas || []),
        ],
      }),
    [
      gameTemplatePurchases,
      bundlePurchases,
      selectedPrivateGameTemplateListingData,
      privateGameTemplateListingDatas,
      bundleListingDatas,
      receivedGameTemplates,
      receivedBundles,
    ]
  );
  const shouldShowCreateActions =
    emptyProjectSelected ||
    selectedExampleShortHeader ||
    !!selectedGameTemplatePurchaseUsageType;

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
      const projectLocation = storageProviderForCreation.getProjectLocation
        ? storageProviderForCreation.getProjectLocation({
            projectName,
            saveAsLocation,
            newProjectsDefaultFolder,
          })
        : saveAsLocation;

      const projectSetup: NewProjectSetup = {
        projectName,
        storageProvider: storageProviderForCreation,
        saveAsLocation: projectLocation,
        height: selectedHeight,
        width: selectedWidth,
        orientation: selectedOrientation,
        optimizeForPixelArt,
        creationSource: 'default',
      };

      if (selectedExampleShortHeader) {
        await onCreateFromExample({
          exampleShortHeader: selectedExampleShortHeader,
          newProjectSetup: {
            projectName,
            storageProvider: storageProviderForCreation,
            saveAsLocation: projectLocation,
            creationSource: 'default',
          },
          i18n,
        });
      } else if (selectedPrivateGameTemplateListingData) {
        await onCreateProjectFromPrivateGameTemplate(
          selectedPrivateGameTemplateListingData,
          {
            // We only pass down the project name as this is the only cusomizable field for a template.
            projectName,
            storageProvider: storageProviderForCreation,
            saveAsLocation,
            creationSource: 'default',
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
      storageProviderForCreation,
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

  React.useEffect(
    () => {
      if (
        !emptyProjectSelected &&
        !selectedExampleShortHeader &&
        !selectedPrivateGameTemplateListingData &&
        !startersSelected
      ) {
        // Reset project name when everything is unselected.
        setProjectName(generateProjectName());
      }

      if (
        selectedExampleShortHeader &&
        !isStartingPointExampleShortHeader(selectedExampleShortHeader) &&
        (!exampleShortHeaders ||
          !isLinkedToStartingPointExampleShortHeader(
            exampleShortHeaders,
            selectedExampleShortHeader
          ))
      ) {
        // If it's a template, generate a name based on the template name.
        // (We don't do it for starting points)
        setProjectName(generateProjectName(selectedExampleShortHeader.name));
        return;
      }

      if (selectedPrivateGameTemplateListingData) {
        // If it's a private game template, generate a name based on the template name.
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
      startersSelected,
      exampleShortHeaders,
    ]
  );

  const onBack = React.useCallback(
    () => {
      if (!isOnHomePage && !preventBackHome) {
        if (emptyProjectSelected) {
          setEmptyProjectSelected(false);
          return;
        }
        if (selectedExampleShortHeader) {
          onSelectExampleShortHeader(null);
          return;
        }
        if (selectedPrivateGameTemplateListingData) {
          onSelectPrivateGameTemplateListingData(null);
          return;
        }
        if (startersSelected) {
          setStartersSelected(false);
          return;
        }
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
      startersSelected,
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
            shouldShowCreateActions ? (
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
          fullHeight={
            // Make full height if on home page or starters page,
            isOnHomePage ||
            (startersSelected &&
              !selectedExampleShortHeader &&
              !emptyProjectSelected) ||
            // Or if a template is selected but not owned (to show the full information page).
            (!!selectedPrivateGameTemplateListingData &&
              !selectedGameTemplatePurchaseUsageType)
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
                    disabled={isLoading}
                  />
                </Line>
                <Spacer />
              </>
            )}
            {isOnHomePage && (
              <ColumnStackLayout noMargin>
                <AskAiStandAloneForm
                  i18n={i18n}
                  project={project}
                  resourceManagementProps={resourceManagementProps}
                  fileMetadata={fileMetadata}
                  storageProvider={storageProvider}
                  onCreateProjectFromExample={onCreateFromExample}
                  onCreateEmptyProject={onCreateEmptyProject}
                  onOpenLayout={onOpenLayout}
                  onWillInstallExtension={onWillInstallExtension}
                  onExtensionInstalled={onExtensionInstalled}
                  onOpenAskAi={onOpenAskAi}
                  onCloseAskAi={onCloseAskAi}
                />
                <EmptyAndStartingPointProjects
                  onSelectExampleShortHeader={exampleShortHeader => {
                    onSelectExampleShortHeader(exampleShortHeader);
                  }}
                  onSelectEmptyProject={() => {
                    setEmptyProjectSelected(true);
                  }}
                  disabled={isLoading}
                  onSeeAll={() => {
                    setStartersSelected(true);
                  }}
                />
                {isOnline ? (
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
                      getColumnsFromWindowSize={getItemsColumns}
                      hideStartingPoints
                      limitRowsTo={6}
                      showLoadMore
                      disabled={isLoading}
                    />
                  </>
                ) : (
                  <EmptyMessage>
                    <Text>
                      <Trans>
                        Get back online to browse the huge library of free and
                        premium examples.
                      </Trans>
                    </Text>
                  </EmptyMessage>
                )}
              </ColumnStackLayout>
            )}
            {!isOnHomePage &&
              selectedPrivateGameTemplateListingData &&
              !selectedGameTemplatePurchaseUsageType && (
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
            {isOnStartersPage && (
              <EmptyAndStartingPointProjects
                onSelectExampleShortHeader={exampleShortHeader => {
                  onSelectExampleShortHeader(exampleShortHeader);
                }}
                onSelectEmptyProject={() => {
                  setEmptyProjectSelected(true);
                }}
                disabled={isLoading}
              />
            )}
            {shouldShowCreateActions && (
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
                  value={storageProviderForCreation.internalName}
                  onChange={(e, i, newValue: string) => {
                    setNewProjectsDefaultStorageProviderName(newValue);
                    const newStorageProvider =
                      storageProviders.find(
                        ({ internalName }) => internalName === newValue
                      ) || emptyStorageProvider;
                    setStorageProviderForCreation(newStorageProvider);

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
                      availableStorageProvider =>
                        !!availableStorageProvider.renderNewProjectSaveAsLocationChooser
                    )
                    .map(availableStorageProvider => (
                      <SelectOption
                        key={availableStorageProvider.internalName}
                        value={availableStorageProvider.internalName}
                        label={availableStorageProvider.name}
                        disabled={availableStorageProvider.disabled}
                      />
                    ))}
                  {!electron && !isNativeMobileApp() && (
                    <SelectOption
                      value={'FakeLocalFile'}
                      label={t`Save on your computer: download GDevelop desktop app`}
                      disabled
                    />
                  )}
                  {shouldAllowCreatingProjectWithoutSaving && (
                    <SelectOption
                      value={emptyStorageProvider.internalName}
                      label={t`Don't save this project now`}
                    />
                  )}
                </SelectField>
                {!needUserAuthenticationForStorage &&
                  storageProviderForCreation.renderNewProjectSaveAsLocationChooser &&
                  storageProviderForCreation.renderNewProjectSaveAsLocationChooser(
                    {
                      projectName,
                      saveAsLocation,
                      setSaveAsLocation,
                      newProjectsDefaultFolder,
                    }
                  )}
                {(emptyProjectSelected ||
                  !!linkedPixelArtExampleShortHeader ||
                  !!linkedNonPixelArtExampleShortHeader) && (
                  <Checkbox
                    checked={
                      optimizeForPixelArt ||
                      !!linkedNonPixelArtExampleShortHeader
                    }
                    label={<Trans>Optimize for Pixel Art</Trans>}
                    onCheck={onCheckOptimizeForPixelArt}
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
                {hasTooManyCloudProjects ? (
                  <MaxProjectCountAlertMessage />
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
