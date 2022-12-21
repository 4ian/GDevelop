// @flow
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import ListIcon from '../UI/ListIcon';
import Subheader from '../UI/Subheader';
import { List, ListItem } from '../UI/List';
import {
  enumerateObjectTypes,
  type EnumeratedObjectMetadata,
} from '../ObjectsList/EnumerateObjects';
import HelpButton from '../UI/HelpButton';
import { Column, Line } from '../UI/Grid';
import { Tabs } from '../UI/Tabs';
import { AssetStore, type AssetStoreInterface } from '.';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import {
  sendAssetAddedToProject,
  sendNewObjectCreated,
} from '../Utils/Analytics/EventSender';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import ScrollView from '../UI/ScrollView';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';
import RaisedButton from '../UI/RaisedButton';
import { AssetStoreContext } from './AssetStoreContext';
import AssetPackInstallDialog from './AssetPackInstallDialog';
import {
  installPublicAsset,
  checkRequiredExtensionUpdate,
} from './InstallAsset';
import {
  getPublicAsset,
  isPrivateAsset,
} from '../Utils/GDevelopServices/Asset';
import { type ExtensionShortHeader } from '../Utils/GDevelopServices/Extension';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { showErrorBox } from '../UI/Messages/MessageBox';
import Window from '../Utils/Window';
import PrivateAssetsAuthorizationContext from './PrivateAssets/PrivateAssetsAuthorizationContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { translateExtensionCategory } from '../Utils/Extension/ExtensionCategories';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import { enumerateAssetStoreIds } from './EnumerateAssetStoreIds';
const isDev = Window.isDev();

const ObjectListItem = ({
  objectMetadata,
  onClick,
  id,
}: {|
  objectMetadata: EnumeratedObjectMetadata,
  onClick: () => void,
  id?: string,
|}) => {
  if (objectMetadata.name === '') {
    // Base object is an "abstract" object
    return null;
  }

  return (
    <ListItem
      id={id}
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

export const useExtensionUpdateAlertDialog = () => {
  const { showConfirmation } = useAlertDialog();
  return async (
    outOfDateExtensions: Array<ExtensionShortHeader>
  ): Promise<boolean> => {
    return await showConfirmation({
      title: t`Extension update`,
      message: t`Before installing this asset, it's strongly recommended to update these extensions${'\n\n - ' +
        outOfDateExtensions
          .map(extension => extension.fullName)
          .join('\n\n - ') +
        '\n\n'}Do you want to update it now ?`,
      confirmButtonLabel: t`Update the extension`,
      dismissButtonLabel: t`Skip the update`,
    });
  };
};

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  objectsContainer: gdObjectsContainer,
  resourceManagementProps: ResourceManagementProps,
  onClose: () => void,
  onCreateNewObject: (type: string) => void,
  onObjectAddedFromAsset: gdObject => void,
  canInstallPrivateAsset: () => boolean,
  i18n: I18nType,
|};

export default function NewObjectDialog({
  project,
  layout,
  objectsContainer,
  resourceManagementProps,
  onClose,
  onCreateNewObject,
  onObjectAddedFromAsset,
  canInstallPrivateAsset,
  i18n,
}: Props) {
  const windowWidth = useResponsiveWindowWidth();
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
        const category = translateExtensionCategory(
          objectMetadata.categoryFullName,
          i18n
        );
        objectsByCategory[category] = [
          ...(objectsByCategory[category] || []),
          objectMetadata,
        ];
      });
      return objectsByCategory;
    },
    [allObjectMetadata, i18n]
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
  const existingAssetStoreIds = React.useMemo(
    () => enumerateAssetStoreIds(project, objectsContainer),
    [project, objectsContainer]
  );
  const [
    isAssetBeingInstalled,
    setIsAssetBeingInstalled,
  ] = React.useState<boolean>(false);
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const isAssetAddedToScene =
    openedAssetShortHeader &&
    existingAssetStoreIds.has(openedAssetShortHeader.id);
  const { installPrivateAsset, fetchPrivateAsset } = React.useContext(
    PrivateAssetsAuthorizationContext
  );
  const { showAlert } = useAlertDialog();

  const showExtensionUpdateConfirmation = useExtensionUpdateAlertDialog();

  const onInstallAsset = React.useCallback(
    () => {
      setIsAssetBeingInstalled(true);
      (async () => {
        if (!openedAssetShortHeader) return;
        try {
          const isPrivate = isPrivateAsset(openedAssetShortHeader);
          if (isPrivate) {
            const canUserInstallPrivateAsset = await canInstallPrivateAsset();
            if (!canUserInstallPrivateAsset) {
              await showAlert({
                title: t`Save your project`,
                message: t`You need to save this project as a cloud project to install this asset. Please save your project and try again.`,
              });
              setIsAssetBeingInstalled(false);
              return;
            }
          }
          const asset = isPrivate
            ? await fetchPrivateAsset(openedAssetShortHeader, {
                environment,
              })
            : await getPublicAsset(openedAssetShortHeader, { environment });
          if (!asset) {
            throw new Error(
              'Unable to install the asset because it could not be fetched.'
            );
          }

          const requiredExtensionInstallation = await checkRequiredExtensionUpdate(
            {
              assets: [asset],
              project,
            }
          );
          const shouldUpdateExtension =
            requiredExtensionInstallation.outOfDateExtensions.length > 0 &&
            (await showExtensionUpdateConfirmation(
              requiredExtensionInstallation.outOfDateExtensions
            ));
          const installOutput = isPrivate
            ? await installPrivateAsset({
                assetShortHeader: openedAssetShortHeader,
                eventsFunctionsExtensionsState,
                project,
                objectsContainer,
                environment,
                requiredExtensionInstallation,
                shouldUpdateExtension,
              })
            : await installPublicAsset({
                assetShortHeader: openedAssetShortHeader,
                eventsFunctionsExtensionsState,
                project,
                objectsContainer,
                environment,
                requiredExtensionInstallation,
                shouldUpdateExtension,
              });
          if (!installOutput) {
            throw new Error('Unable to install private Asset.');
          }
          sendAssetAddedToProject({
            id: openedAssetShortHeader.id,
            name: openedAssetShortHeader.name,
            assetPackName: openedAssetPack ? openedAssetPack.name : null,
            assetPackTag: openedAssetPack ? openedAssetPack.tag : null,
            assetPackId:
              openedAssetPack && openedAssetPack.id ? openedAssetPack.id : null,
            assetPackKind: isPrivate ? 'private' : 'public',
          });

          installOutput.createdObjects.forEach(object => {
            onObjectAddedFromAsset(object);
          });

          await resourceManagementProps.onFetchNewlyAddedResources();
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
      openedAssetShortHeader,
      fetchPrivateAsset,
      environment,
      project,
      showExtensionUpdateConfirmation,
      installPrivateAsset,
      eventsFunctionsExtensionsState,
      objectsContainer,
      openedAssetPack,
      resourceManagementProps,
      canInstallPrivateAsset,
      showAlert,
      onObjectAddedFromAsset,
    ]
  );

  const mainAction =
    currentTab !== 'asset-store' ? null : openedAssetPack ? (
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

  const assetStore = React.useRef<?AssetStoreInterface>(null);
  const handleClose = React.useCallback(
    () => {
      assetStore.current && assetStore.current.onClose();
      onClose();
    },
    [onClose]
  );

  return (
    <>
      <Dialog
        title={<Trans>New object</Trans>}
        secondaryActions={[<HelpButton helpPagePath="/objects" key="help" />]}
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Close</Trans>}
            primary={false}
            onClick={handleClose}
            id="close-button"
          />,
          mainAction,
        ]}
        onRequestClose={handleClose}
        onApply={
          openedAssetPack
            ? () => setIsAssetPackDialogInstallOpen(true)
            : openedAssetShortHeader
            ? onInstallAsset
            : undefined
        }
        open
        flexBody
        fullHeight
        id="new-object-dialog"
        fixedContent={
          <Tabs
            value={currentTab}
            onChange={setCurrentTab}
            options={[
              {
                label: <Trans>Asset Store</Trans>,
                value: 'asset-store',
                id: 'asset-store-tab',
              },
              {
                label: <Trans>New object from scratch</Trans>,
                value: 'new-object',
                id: 'new-object-from-scratch-tab',
              },
            ]}
            // Enforce scroll on small screen, because the tabs have long names.
            variant={windowWidth === 'small' ? 'scrollable' : undefined}
          />
        }
      >
        {currentTab === 'asset-store' && <AssetStore ref={assetStore} />}
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
                        id={`object-category-${objectMetadata.name}`.replace(
                          /:/g,
                          '-'
                        )}
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
      </Dialog>
      {isAssetPackDialogInstallOpen && searchResults && openedAssetPack && (
        <AssetPackInstallDialog
          assetPack={openedAssetPack}
          assetShortHeaders={searchResults}
          addedAssetIds={existingAssetStoreIds}
          onClose={() => setIsAssetPackDialogInstallOpen(false)}
          onAssetsAdded={() => {
            setIsAssetPackDialogInstallOpen(false);
          }}
          project={project}
          objectsContainer={objectsContainer}
          onObjectAddedFromAsset={onObjectAddedFromAsset}
          canInstallPrivateAsset={canInstallPrivateAsset}
          resourceManagementProps={resourceManagementProps}
        />
      )}
    </>
  );
}
