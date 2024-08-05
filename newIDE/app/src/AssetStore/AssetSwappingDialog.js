// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import HelpButton from '../UI/HelpButton';
import { AssetStore, type AssetStoreInterface } from '.';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { sendAssetAddedToProject } from '../Utils/Analytics/EventSender';
import RaisedButton from '../UI/RaisedButton';
import { AssetStoreContext } from './AssetStoreContext';
import AssetPackInstallDialog from './AssetPackInstallDialog';
import {
  installRequiredExtensions,
  installPublicAsset,
  checkRequiredExtensionsUpdateForAssets,
} from './InstallAsset';
import { isPrivateAsset } from '../Utils/GDevelopServices/Asset';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import Window from '../Utils/Window';
import PrivateAssetsAuthorizationContext from './PrivateAssets/PrivateAssetsAuthorizationContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { enumerateAssetStoreIds } from './EnumerateAssetStoreIds';
import { getAssetShortHeadersToDisplay } from './AssetsList';
import ErrorBoundary from '../UI/ErrorBoundary';
import LoaderModal from '../UI/LoaderModal';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  useFetchAssets,
  useExtensionUpdateAlertDialog,
} from './NewObjectDialog';

const isDev = Window.isDev();

const mergeAnimations = (
  objectsAnimations: Array<{ name: string }>,
  assetAnimations: Array<{ name: string }>
) => {
  const animations = [];
  // Ensure the object don't loose any animation.
  for (const objectAnimation of objectsAnimations) {
    const assetAnimation = assetAnimations.find(
      assetAnimation => assetAnimation.name === objectAnimation.name
    ) || {
      ...assetAnimations[0],
      name: objectAnimation.name,
    };
    animations.push(assetAnimation);
  }
  // Add extra animations from the asset.
  for (const assetAnimation of assetAnimations) {
    if (
      !objectsAnimations.some(
        objectAnimation => objectAnimation.name === assetAnimation.name
      )
    ) {
      animations.push(assetAnimation);
    }
  }
  return animations;
};

const swapAsset = (
  project: gdProject,
  object: gdObject,
  assetObject: gdObject
) => {
  const serializedAssetObject = serializeToJSObject(assetObject);
  const serializedObject = serializeToJSObject(object);
  if (object.getType() === 'Sprite') {
    serializedObject.animations = mergeAnimations(
      serializedObject.animations,
      serializedAssetObject.animations
    );
  } else if (object.getType() === 'Scene3D::Model3DObject') {
    const objectVolume =
      serializedObject.content.width *
      serializedObject.content.height *
      serializedObject.content.depth;
    const assetVolume =
      serializedAssetObject.content.width *
      serializedAssetObject.content.height *
      serializedAssetObject.content.depth;
    const sizeRatio = Math.pow(objectVolume / assetVolume, 1 / 3);

    serializedObject.content = {
      ...serializedAssetObject.content,
      animation: mergeAnimations(
        serializedObject.content.animations,
        serializedAssetObject.content.animations
      ),
      width: serializedAssetObject.content.width * sizeRatio,
      height: serializedAssetObject.content.height * sizeRatio,
      depth: serializedAssetObject.content.depth * sizeRatio,
      // Keep the origin and center as they may be important for the game to work.
      originLocation: serializedObject.content.originLocation,
      centerLocation: serializedObject.content.centerLocation,
    };
  }
  unserializeFromJSObject(object, serializedObject, 'unserializeFrom', project);
};

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  eventsBasedObject: gdEventsBasedObject | null,
  objectsContainer: gdObjectsContainer,
  object: gdObject,
  resourceManagementProps: ResourceManagementProps,
  onClose: () => void,
  onObjectsConfigurationSwapped: () => void,
  canInstallPrivateAsset: () => boolean,
|};

function AssetSwappingDialog({
  project,
  layout,
  eventsBasedObject,
  objectsContainer,
  object,
  resourceManagementProps,
  onClose,
  onObjectsConfigurationSwapped,
  canInstallPrivateAsset,
}: Props) {
  const {
    assetShortHeadersSearchResults,
    shopNavigationState,
    environment,
    setEnvironment,
  } = React.useContext(AssetStoreContext);
  const {
    openedAssetPack,
    openedAssetShortHeader,
    selectedFolders,
  } = shopNavigationState.getCurrentPage();
  const [
    isAssetPackDialogInstallOpen,
    setIsAssetPackDialogInstallOpen,
  ] = React.useState(false);
  // Avoid memoizing the result of enumerateAssetStoreIds, as it does not get updated
  // when adding assets.
  const existingAssetStoreIds = enumerateAssetStoreIds(
    project,
    objectsContainer
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
  const { installPrivateAsset } = React.useContext(
    PrivateAssetsAuthorizationContext
  );
  const { showAlert } = useAlertDialog();

  const fetchAssets = useFetchAssets();
  const showExtensionUpdateConfirmation = useExtensionUpdateAlertDialog();

  const onInstallAsset = React.useCallback(
    async (assetShortHeader): Promise<boolean> => {
      if (!assetShortHeader) return false;
      setIsAssetBeingInstalled(true);
      try {
        const isPrivate = isPrivateAsset(assetShortHeader);
        if (isPrivate) {
          const canUserInstallPrivateAsset = await canInstallPrivateAsset();
          if (!canUserInstallPrivateAsset) {
            await showAlert({
              title: t`Save your project`,
              message: t`You need to save this project as a cloud project to install this asset. Please save your project and try again.`,
            });
            setIsAssetBeingInstalled(false);
            return false;
          }
        }
        const assets = await fetchAssets([assetShortHeader]);
        const asset = assets[0];
        const requiredExtensionInstallation = await checkRequiredExtensionsUpdateForAssets(
          {
            assets,
            project,
          }
        );
        const shouldUpdateExtension =
          requiredExtensionInstallation.outOfDateExtensionShortHeaders.length >
            0 &&
          (await showExtensionUpdateConfirmation(
            requiredExtensionInstallation.outOfDateExtensionShortHeaders
          ));
        await installRequiredExtensions({
          requiredExtensionInstallation,
          shouldUpdateExtension,
          eventsFunctionsExtensionsState,
          project,
        });
        const installOutput = isPrivate
          ? await installPrivateAsset({
              asset,
              project,
              objectsContainer,
              targetObjectFolderOrObject: null,
            })
          : await installPublicAsset({
              asset,
              project,
              objectsContainer,
              targetObjectFolderOrObject: null,
            });
        if (!installOutput) {
          throw new Error('Unable to install private Asset.');
        }
        sendAssetAddedToProject({
          id: assetShortHeader.id,
          name: assetShortHeader.name,
          assetPackName: openedAssetPack ? openedAssetPack.name : null,
          assetPackTag: openedAssetPack ? openedAssetPack.tag : null,
          assetPackId:
            openedAssetPack && openedAssetPack.id ? openedAssetPack.id : null,
          assetPackKind: isPrivate ? 'private' : 'public',
        });

        if (installOutput.createdObjects.length > 0) {
          swapAsset(project, object, installOutput.createdObjects[0]);
        }
        for (const createdObject of installOutput.createdObjects) {
          objectsContainer.removeObject(createdObject.getName());
        }

        onObjectsConfigurationSwapped();

        await resourceManagementProps.onFetchNewlyAddedResources();
        setIsAssetBeingInstalled(false);
        return true;
      } catch (error) {
        console.error('Error while installing the asset:', error);
        showAlert({
          title: t`Could not install the asset`,
          message: t`There was an error while installing the asset "${
            assetShortHeader.name
          }". Verify your internet connection or try again later.`,
        });
        setIsAssetBeingInstalled(false);
        return false;
      }
    },
    [
      fetchAssets,
      project,
      showExtensionUpdateConfirmation,
      eventsFunctionsExtensionsState,
      installPrivateAsset,
      objectsContainer,
      openedAssetPack,
      onObjectsConfigurationSwapped,
      resourceManagementProps,
      canInstallPrivateAsset,
      showAlert,
      object,
    ]
  );

  const displayedAssetShortHeaders = React.useMemo(
    () => {
      return assetShortHeadersSearchResults
        ? getAssetShortHeadersToDisplay(
            assetShortHeadersSearchResults,
            selectedFolders
          )
        : [];
    },
    [assetShortHeadersSearchResults, selectedFolders]
  );

  const mainAction = openedAssetShortHeader ? (
    <RaisedButton
      key="add-asset"
      primary={!isAssetAddedToScene}
      label={
        isAssetBeingInstalled ? <Trans>Adding...</Trans> : <Trans>Swap</Trans>
      }
      onClick={async () => {
        onInstallAsset(openedAssetShortHeader);
      }}
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
  ) : null;

  const assetStore = React.useRef<?AssetStoreInterface>(null);
  const handleClose = React.useCallback(
    () => {
      assetStore.current && assetStore.current.onClose();
      onClose();
    },
    [onClose]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Dialog
            title={<Trans>Asset swapping of {object.getName()}</Trans>}
            secondaryActions={[
              <HelpButton helpPagePath="/objects" key="help" />,
            ]}
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
                ? async () => {
                    await onInstallAsset(openedAssetShortHeader);
                  }
                : undefined
            }
            open
            flexBody
            fullHeight
            id="new-object-dialog"
          >
            <AssetStore
              ref={assetStore}
              hideGameTemplates
              assetSwappedObject={object}
            />
          </Dialog>
          {isAssetBeingInstalled && <LoaderModal show={true} />}
          {isAssetPackDialogInstallOpen &&
            displayedAssetShortHeaders &&
            openedAssetPack && (
              <AssetPackInstallDialog
                assetPack={openedAssetPack}
                assetShortHeaders={displayedAssetShortHeaders}
                addedAssetIds={existingAssetStoreIds}
                onClose={() => setIsAssetPackDialogInstallOpen(false)}
                onAssetsAdded={() => {
                  setIsAssetPackDialogInstallOpen(false);
                }}
                project={project}
                objectsContainer={objectsContainer}
                onObjectsAddedFromAssets={onObjectsConfigurationSwapped}
                canInstallPrivateAsset={canInstallPrivateAsset}
                resourceManagementProps={resourceManagementProps}
              />
            )}
        </>
      )}
    </I18n>
  );
}

const AssetSwappingDialogWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Asset store dialog</Trans>}
    scope="new-object-dialog"
    onClose={props.onClose}
  >
    <AssetSwappingDialog {...props} />
  </ErrorBoundary>
);

export default AssetSwappingDialogWithErrorBoundary;
