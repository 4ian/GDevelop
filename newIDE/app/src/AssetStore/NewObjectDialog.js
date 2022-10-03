// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import ListIcon from '../UI/ListIcon';
import Subheader from '../UI/Subheader';
import { List, ListItem } from '../UI/List';
import {
  enumerateObjects,
  enumerateObjectTypes,
  type EnumeratedObjectMetadata,
} from '../ObjectsList/EnumerateObjects';
import HelpButton from '../UI/HelpButton';
import { Column, Line } from '../UI/Grid';
import { Tabs, Tab } from '../UI/Tabs';
import { AssetStore } from '.';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type OnFetchNewlyAddedResourcesFunction } from '../ProjectsStorage/ResourceFetcher';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import {
  sendAssetAddedToProject,
  sendNewObjectCreated,
} from '../Utils/Analytics/EventSender';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import ScrollView from '../UI/ScrollView';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';
import RaisedButton from '../UI/RaisedButton';
import { AssetStoreContext } from './AssetStoreContext';
import { AssetPackDialog } from './AssetPackDialog';
import { installAsset } from './InstallAsset';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { showErrorBox } from '../UI/Messages/MessageBox';
import Window from '../Utils/Window';
const isDev = Window.isDev();

const ObjectListItem = ({
  objectMetadata,
  onClick,
}: {|
  objectMetadata: EnumeratedObjectMetadata,
  onClick: () => void,
|}) => {
  if (objectMetadata.name === '') {
    // Base object is an "abstract" object
    return null;
  }

  return (
    <ListItem
      leftIcon={
        <ListIcon
          src={objectMetadata.iconFilename}
          iconSize={40}
          isGDevelopIcon
        />
      }
      key={objectMetadata.name}
      primaryText={objectMetadata.fullName}
      secondaryText={objectMetadata.description}
      secondaryTextLines={2}
      onClick={onClick}
    />
  );
};

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  objectsContainer: gdObjectsContainer,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  onFetchNewlyAddedResources: OnFetchNewlyAddedResourcesFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  onClose: () => void,
  onCreateNewObject: (type: string) => void,
  onObjectAddedFromAsset: gdObject => void,
|};

export default function NewObjectDialog({
  project,
  layout,
  objectsContainer,
  resourceSources,
  onChooseResource,
  onFetchNewlyAddedResources,
  resourceExternalEditors,
  onClose,
  onCreateNewObject,
  onObjectAddedFromAsset,
}: Props) {
  const {
    setNewObjectDialogDefaultTab,
    getNewObjectDialogDefaultTab,
  } = React.useContext(PreferencesContext);
  const [currentTab, setCurrentTab] = React.useState(
    getNewObjectDialogDefaultTab()
  );
  const allObjectMetadata = React.useMemo(() => enumerateObjectTypes(project), [
    project,
  ]);
  const objectsByCategory: {
    [string]: Array<EnumeratedObjectMetadata>,
  } = React.useMemo(
    () => {
      const objectsByCategory = {};
      allObjectMetadata.forEach(objectMetadata => {
        const category = objectMetadata.categoryFullName;
        objectsByCategory[category] = [
          ...(objectsByCategory[category] || []),
          objectMetadata,
        ];
      });
      return objectsByCategory;
    },
    [allObjectMetadata]
  );

  React.useEffect(() => setNewObjectDialogDefaultTab(currentTab), [
    setNewObjectDialogDefaultTab,
    currentTab,
  ]);

  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-object-types'
  );

  const {
    searchResults,
    navigationState,
    fetchAssetsAndFilters,
    environment,
    setEnvironment,
  } = React.useContext(AssetStoreContext);
  const {
    openedAssetPack,
    openedAssetShortHeader,
  } = navigationState.getCurrentPage();
  const [
    isAssetPackDialogInstallOpen,
    setIsAssetPackDialogInstallOpen,
  ] = React.useState(false);
  const { containerObjectsList } = enumerateObjects(project, objectsContainer);
  const addedAssetIds = containerObjectsList
    .map(({ object }) => object.getAssetStoreId())
    .filter(Boolean);
  const [
    isAssetBeingInstalled,
    setIsAssetBeingInstalled,
  ] = React.useState<boolean>(false);
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const isAssetAddedToScene =
    openedAssetShortHeader && addedAssetIds.includes(openedAssetShortHeader.id);

  const onInstallAsset = React.useCallback(
    () => {
      setIsAssetBeingInstalled(true);
      (async () => {
        if (!openedAssetShortHeader) return;
        try {
          const installOutput = await installAsset({
            assetShortHeader: openedAssetShortHeader,
            eventsFunctionsExtensionsState,
            project,
            objectsContainer,
            environment,
          });
          sendAssetAddedToProject({
            id: openedAssetShortHeader.id,
            name: openedAssetShortHeader.name,
          });

          installOutput.createdObjects.forEach(object => {
            onObjectAddedFromAsset(object);
          });

          await onFetchNewlyAddedResources();
        } catch (error) {
          console.error('Error while installing the asset:', error);
          showErrorBox({
            message: `There was an error while installing the asset "${
              openedAssetShortHeader.name
            }". Verify your internet connection or try again later.`,
            rawError: error,
            errorId: 'install-asset-error',
          });
        }

        setIsAssetBeingInstalled(false);
      })();
    },
    [
      eventsFunctionsExtensionsState,
      project,
      objectsContainer,
      onObjectAddedFromAsset,
      openedAssetShortHeader,
      environment,
      onFetchNewlyAddedResources,
    ]
  );

  // Load assets and filters when the dialog is opened or when the environment changes.
  React.useEffect(
    () => {
      // The variable environment is always defined, this check is a hack
      // to ensure we call fetchAssetsAndFilters every time the value changes.
      if (environment) {
        fetchAssetsAndFilters();
      }
    },
    [fetchAssetsAndFilters, environment]
  );

  const mainAction = openedAssetPack ? (
    <RaisedButton
      key="add-all-assets"
      primary
      label={<Trans>Add all assets to my scene</Trans>}
      onClick={() => setIsAssetPackDialogInstallOpen(true)}
      disabled={!searchResults || searchResults.length === 0}
    />
  ) : openedAssetShortHeader ? (
    <RaisedButton
      key="add-asset"
      primary={!isAssetAddedToScene}
      label={
        isAssetBeingInstalled ? (
          <Trans>Adding...</Trans>
        ) : isAssetAddedToScene ? (
          <Trans>Add again</Trans>
        ) : (
          <Trans>Add to the scene</Trans>
        )
      }
      onClick={onInstallAsset}
      disabled={isAssetBeingInstalled}
      id="add-asset-button"
    />
  ) : isDev ? (
    <RaisedButton
      key="show-dev-assets"
      label={
        environment === 'staging' ? (
          <Trans>Show live assets</Trans>
        ) : (
          <Trans>Show staging assets</Trans>
        )
      }
      onClick={() => {
        setEnvironment(environment === 'staging' ? 'live' : 'staging');
      }}
    />
  ) : (
    undefined
  );

  return (
    <>
      <Dialog
        title={<Trans>Add a new object</Trans>}
        secondaryActions={[<HelpButton helpPagePath="/objects" key="help" />]}
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Close</Trans>}
            primary={false}
            onClick={onClose}
            id="close-button"
          />,
          mainAction,
        ]}
        onRequestClose={onClose}
        onApply={
          openedAssetPack
            ? () => setIsAssetPackDialogInstallOpen(true)
            : openedAssetShortHeader
            ? onInstallAsset
            : undefined
        }
        open
        flexBody
        noMargin
        fullHeight
        id="new-object-dialog"
      >
        <Column noMargin expand>
          <Tabs value={currentTab} onChange={setCurrentTab}>
            <Tab label={<Trans>Asset Store</Trans>} value="asset-store" />
            <Tab
              label={<Trans>New object from scratch</Trans>}
              value="new-object"
            />
          </Tabs>
          {currentTab === 'asset-store' && <AssetStore project={project} />}
          {currentTab === 'new-object' && (
            <ScrollView>
              {DismissableTutorialMessage && (
                <Line>
                  <Column expand>{DismissableTutorialMessage}</Column>
                </Line>
              )}
              <List>
                {Object.keys(objectsByCategory).map(category => {
                  const categoryObjectMetadata = objectsByCategory[category];
                  return (
                    <React.Fragment key={category}>
                      <Subheader>{category}</Subheader>
                      {categoryObjectMetadata.map(objectMetadata => (
                        <ObjectListItem
                          key={objectMetadata.name}
                          objectMetadata={objectMetadata}
                          onClick={() => {
                            sendNewObjectCreated(objectMetadata.name);
                            onCreateNewObject(objectMetadata.name);
                          }}
                        />
                      ))}
                    </React.Fragment>
                  );
                })}
              </List>
            </ScrollView>
          )}
        </Column>
      </Dialog>
      {isAssetPackDialogInstallOpen && searchResults && openedAssetPack && (
        <AssetPackDialog
          assetPack={openedAssetPack}
          assetShortHeaders={searchResults}
          addedAssetIds={addedAssetIds}
          onClose={() => setIsAssetPackDialogInstallOpen(false)}
          onAssetsAdded={() => {
            setIsAssetPackDialogInstallOpen(false);
          }}
          project={project}
          objectsContainer={objectsContainer}
          onObjectAddedFromAsset={onObjectAddedFromAsset}
          onFetchNewlyAddedResources={onFetchNewlyAddedResources}
        />
      )}
    </>
  );
}
