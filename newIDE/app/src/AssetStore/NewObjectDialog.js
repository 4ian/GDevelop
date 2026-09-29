// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import HelpButton from '../UI/HelpButton';
import { Tabs } from '../UI/Tabs';
import { AssetStore, type AssetStoreInterface } from '.';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { sendAssetAddedToProject } from '../Utils/Analytics/EventSender';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import RaisedButton from '../UI/RaisedButton';
import { AssetStoreContext } from './AssetStoreContext';
import AssetPackInstallDialog from './AssetPackInstallDialog';
import {
  installPublicAsset,
  installEffectAsset,
  checkRequiredExtensionsUpdateForAssets,
  type InstallAssetOutput,
  complyVariantsToEventsBasedObjectOf,
} from './InstallAsset';
import { checkRequiredExtensionsUpdate } from './ExtensionStore/InstallExtension';
import {
  type Asset,
  type AssetShortHeader,
  getPublicAsset,
  isPrivateAsset,
  isEffectAsset,
  getEffectAssetMetadata,
  doesEffectWorkOnLayer,
} from '../Utils/GDevelopServices/Asset';
import newNameGenerator from '../Utils/NewNameGenerator';
import enumerateLayers from '../LayersList/EnumerateLayers';
import RaisedButtonWithMenu from '../UI/RaisedButtonWithMenu';
import Window from '../Utils/Window';
import PrivateAssetsAuthorizationContext from './PrivateAssets/PrivateAssetsAuthorizationContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { enumerateAssetStoreIds } from './EnumerateAssetStoreIds';
import PromisePool from '@supercharge/promise-pool';
import NewObjectFromScratch, {
  CustomObjectPackResults,
} from './NewObjectFromScratch';
import { getAssetShortHeadersToDisplay } from './AssetsList';
import ErrorBoundary from '../UI/ErrorBoundary';
import type { ObjectFolderOrObjectWithContext } from '../ObjectsList/EnumerateObjectFolderOrObject';
import LoaderModal from '../UI/LoaderModal';
import { AssetStoreNavigatorContext } from './AssetStoreNavigator';
import uniq from 'lodash/uniq';
import { useInstallExtension } from './ExtensionStore/InstallExtension';
import { ExtensionStoreContext } from './ExtensionStore/ExtensionStoreContext';
import { type ObjectShortHeader } from '../Utils/GDevelopServices/Extension';

const gd: libGDevelop = global.gd;

const isDev = Window.isDev();

export const useProjectNeedToBeSavedAlertDialog = (
  canInstallPrivateAsset: () => boolean
): ((assetShortHeader: AssetShortHeader) => Promise<boolean>) => {
  const { showAlert } = useAlertDialog();
  return async (assetShortHeader: AssetShortHeader): Promise<boolean> => {
    const isPrivate = isPrivateAsset(assetShortHeader);
    if (isPrivate) {
      const canUserInstallPrivateAsset = await canInstallPrivateAsset();
      if (!canUserInstallPrivateAsset) {
        await showAlert({
          title: t`Save your project`,
          message: t`You need to save this project as a cloud project to install this asset. Please save your project and try again.`,
        });
        return true;
      }
    }
    return false;
  };
};

export const useFetchAssets = (): ((
  assetShortHeaders: Array<AssetShortHeader>
) => Promise<Array<Asset>>) => {
  const { environment } = React.useContext(AssetStoreContext);

  const { fetchPrivateAsset } = React.useContext(
    PrivateAssetsAuthorizationContext
  );

  return async (
    assetShortHeaders: Array<AssetShortHeader>
  ): Promise<Array<Asset>> => {
    const fetchedAssets = await PromisePool.withConcurrency(6)
      .for(assetShortHeaders)
      .process<Asset>(async assetShortHeader => {
        const asset = isPrivateAsset(assetShortHeader)
          ? await fetchPrivateAsset(assetShortHeader, {
              environment,
            })
          : await getPublicAsset(assetShortHeader, { environment });
        if (!asset) {
          throw new Error(
            'Unable to install the asset because it could not be fetched.'
          );
        }
        return asset;
      });
    if (fetchedAssets.errors.length) {
      throw new Error(
        'Error(s) while installing assets. The first error is: ' +
          fetchedAssets.errors[0].message
      );
    }
    const assets = fetchedAssets.results;
    return assets;
  };
};

export const useInstallAsset = ({
  project,
  targetObjectFolderOrObjectWithContext,
  resourceManagementProps,
  onWillInstallExtension,
  onExtensionInstalled,
}: {|
  project: ?gdProject,
  targetObjectFolderOrObjectWithContext?: ?ObjectFolderOrObjectWithContext,
  resourceManagementProps: ResourceManagementProps,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
|}): (({
  assetShortHeader: AssetShortHeader,
  objectsContainer: gdObjectsContainer,
  requestedObjectName?: string,
  setIsAssetBeingInstalled: boolean => void,
}) => Promise<InstallAssetOutput | null>) => {
  const shopNavigationState = React.useContext(AssetStoreNavigatorContext);
  const { openedAssetPack } = shopNavigationState.getCurrentPage();
  const { installPrivateAsset } = React.useContext(
    PrivateAssetsAuthorizationContext
  );
  const { showAlert } = useAlertDialog();
  const fetchAssets = useFetchAssets();
  const showProjectNeedToBeSaved = useProjectNeedToBeSavedAlertDialog(
    resourceManagementProps.canInstallPrivateAsset
  );
  const {
    translatedExtensionShortHeadersByName: extensionShortHeadersByName,
  } = React.useContext(ExtensionStoreContext);
  const installExtension = useInstallExtension();

  return async ({
    assetShortHeader,
    objectsContainer,
    requestedObjectName,
    setIsAssetBeingInstalled,
  }: {|
    assetShortHeader: AssetShortHeader,
    objectsContainer: gdObjectsContainer,
    requestedObjectName?: string,
    setIsAssetBeingInstalled: boolean => void,
  |}): Promise<InstallAssetOutput | null> => {
    if (!project) {
      return null;
    }
    try {
      setIsAssetBeingInstalled(false);
      if (await showProjectNeedToBeSaved(assetShortHeader)) {
        return null;
      }
      setIsAssetBeingInstalled(true);
      const assets = await fetchAssets([assetShortHeader]);
      const asset = assets[0];

      const requiredExtensionInstallation = await checkRequiredExtensionsUpdateForAssets(
        {
          assets,
          project,
          extensionShortHeadersByName,
        }
      );
      // Disable the loader because it is above the dialogs opened by `installExtension`.
      setIsAssetBeingInstalled(false);
      const wasExtensionsInstalled = await installExtension({
        project,
        requiredExtensionInstallation,
        importedSerializedExtensions: [],
        onWillInstallExtension,
        onExtensionInstalled,
        updateMode: 'all',
        reason: 'asset',
      });
      setIsAssetBeingInstalled(true);
      if (!wasExtensionsInstalled) {
        return null;
      }

      const isTheFirstOfItsTypeInProject = uniq(
        asset.objectAssets.map(objectAsset => objectAsset.object.type)
      ).some(
        objectType => !gd.UsedObjectTypeFinder.scanProject(project, objectType)
      );

      const isPrivate = isPrivateAsset(assetShortHeader);
      const addAssetOutput = isPrivate
        ? await installPrivateAsset({
            asset,
            project,
            objectsContainer,
            requestedObjectName,
            targetObjectFolderOrObject:
              targetObjectFolderOrObjectWithContext &&
              !targetObjectFolderOrObjectWithContext.global
                ? targetObjectFolderOrObjectWithContext.objectFolderOrObject
                : null,
          })
        : await installPublicAsset({
            asset,
            project,
            objectsContainer,
            requestedObjectName,
            targetObjectFolderOrObject:
              targetObjectFolderOrObjectWithContext &&
              !targetObjectFolderOrObjectWithContext.global
                ? targetObjectFolderOrObjectWithContext.objectFolderOrObject
                : null,
          });
      if (!addAssetOutput) {
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
      complyVariantsToEventsBasedObjectOf(
        project,
        addAssetOutput.createdObjects.map(object => object.getType())
      );

      await resourceManagementProps.onFetchNewlyAddedResources();
      resourceManagementProps.onNewResourcesAdded();

      return {
        createdObjects: addAssetOutput.createdObjects,
        isTheFirstOfItsTypeInProject,
      };
    } catch (error) {
      console.error('Error while installing the asset:', error);
      showAlert({
        title: t`Could not install the asset`,
        message: t`There was an error while installing the asset "${
          assetShortHeader.name
        }". Verify your internet connection or try again later.`,
      });
      return null;
    }
  };
};

/**
 * Install an asset that is an effect on a layer.
 */
export const useInstallEffectAsset = ({
  project,
  resourceManagementProps,
}: {|
  project: ?gdProject,
  resourceManagementProps: ResourceManagementProps,
|}): (({
  assetShortHeader: AssetShortHeader,
  effectsContainer: gdEffectsContainer,
  effectName: string,
}) => Promise<gdEffect | null>) => {
  const shopNavigationState = React.useContext(AssetStoreNavigatorContext);
  const { openedAssetPack } = shopNavigationState.getCurrentPage();
  const { showAlert } = useAlertDialog();
  const fetchAssets = useFetchAssets();

  return async ({
    assetShortHeader,
    effectsContainer,
    effectName,
  }: {|
    assetShortHeader: AssetShortHeader,
    effectsContainer: gdEffectsContainer,
    effectName: string,
  |}): Promise<gdEffect | null> => {
    if (!project) {
      return null;
    }
    try {
      const assets = await fetchAssets([assetShortHeader]);
      const effect = installEffectAsset({
        asset: assets[0],
        project,
        effectsContainer,
        effectName,
      });
      sendAssetAddedToProject({
        id: assetShortHeader.id,
        name: assetShortHeader.name,
        assetPackName: openedAssetPack ? openedAssetPack.name : null,
        assetPackTag: openedAssetPack ? openedAssetPack.tag : null,
        assetPackId:
          openedAssetPack && openedAssetPack.id ? openedAssetPack.id : null,
        assetPackKind: 'public',
      });

      await resourceManagementProps.onFetchNewlyAddedResources();
      resourceManagementProps.onNewResourcesAdded();

      return effect;
    } catch (error) {
      console.error('Error while installing the asset:', error);
      showAlert({
        title: t`Could not install the asset`,
        message: t`There was an error while installing the asset "${
          assetShortHeader.name
        }". Verify your internet connection or try again later.`,
      });
      return null;
    }
  };
};

// Effects of the same group compete for the same thing of a layer (its
// background, its fog): only one of them is displayed at a time.
const effectTypeGroupsUniquePerLayer: Array<Array<string>> = [
  ['Scene3D::Skybox'],
  ['Scene3D::LinearFog', 'Scene3D::ExponentialFog'],
];

const findEffectCompetingWith = (
  effectsContainer: gdEffectsContainer,
  effectType: string
): gdEffect | null => {
  const competingEffectTypes = effectTypeGroupsUniquePerLayer.find(
    effectTypes => effectTypes.includes(effectType)
  );
  if (!competingEffectTypes) return null;
  for (let index = 0; index < effectsContainer.getEffectsCount(); index++) {
    const effect = effectsContainer.getEffectAt(index);
    if (competingEffectTypes.includes(effect.getEffectType())) return effect;
  }
  return null;
};

/**
 * Choose the name of the effect to install an effect asset on: a new effect,
 * or, if the user chooses to replace it, the existing one it would compete
 * with (a second skybox or fog). Null if the user cancels.
 */
export const useChooseEffectNameForEffectAsset = (): (({|
  assetShortHeader: AssetShortHeader,
  effectsContainer: gdEffectsContainer,
|}) => Promise<string | null>) => {
  const { showYesNoCancel } = useAlertDialog();

  return React.useCallback(
    async ({
      assetShortHeader,
      effectsContainer,
    }: {|
      assetShortHeader: AssetShortHeader,
      effectsContainer: gdEffectsContainer,
    |}): Promise<string | null> => {
      const effectMetadata = getEffectAssetMetadata(assetShortHeader);
      const newEffectName = newNameGenerator(
        effectMetadata ? effectMetadata.getFullName() : 'Effect',
        name => effectsContainer.hasEffectNamed(name)
      );
      const competingEffect = findEffectCompetingWith(
        effectsContainer,
        assetShortHeader.objectType
      );
      if (!competingEffect) return newEffectName;

      const competingEffectName = competingEffect.getName();
      const answer = await showYesNoCancel({
        title: t`Replace "${competingEffectName}"?`,
        message: t`The layer already has the effect "${competingEffectName}" and only one of them can be displayed at a time. You can replace it, or add this one and keep the existing one (to switch between them by enabling and disabling them from the events).`,
        yesButtonLabel: t`Replace`,
        noButtonLabel: t`Add and keep the existing`,
        cancelButtonLabel: t`Cancel`,
      });
      // showYesNoCancel resolves with 0 (yes), 1 (no) or 2 (cancel).
      // $FlowFixMe[invalid-compare] - resolves to a number, not a boolean.
      if (answer === 2) return null;
      // Replacing keeps the name of the effect, so the events using it still work.
      // $FlowFixMe[invalid-compare] - resolves to a number, not a boolean.
      return answer === 0 ? competingEffectName : newEffectName;
    },
    [showYesNoCancel]
  );
};

/**
 * The layers of a scene or custom object an effect of the asset store can be
 * put on, given what the effect can render on.
 */
const enumerateLayersForEffectAsset = (
  layersContainer: gdLayersContainer | null,
  assetShortHeader: ?AssetShortHeader
): Array<{| value: string, label: string, labelIsUserDefined: boolean |}> => {
  const effectMetadata = assetShortHeader
    ? getEffectAssetMetadata(assetShortHeader)
    : null;
  if (!layersContainer || !effectMetadata) return [];
  return enumerateLayers(layersContainer).filter(layer =>
    doesEffectWorkOnLayer(
      effectMetadata,
      layersContainer.getLayer(layer.value).getRenderingType()
    )
  );
};

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
  objectsContainer: gdObjectsContainer,
  resourceManagementProps: ResourceManagementProps,
  onClose: () => void,
  onCreateNewObject: (type: string) => void,
  onObjectsAddedFromAssets: InstallAssetOutput => void,
  onLayerEffectAddedFromAssets?: () => void,
  targetObjectFolderOrObjectWithContext?: ?ObjectFolderOrObjectWithContext,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
|};

function NewObjectDialog({
  project,
  layout,
  eventsFunctionsExtension,
  eventsBasedObject,
  objectsContainer,
  resourceManagementProps,
  onClose,
  onCreateNewObject,
  onObjectsAddedFromAssets,
  onLayerEffectAddedFromAssets,
  targetObjectFolderOrObjectWithContext,
  onWillInstallExtension,
  onExtensionInstalled,
}: Props) {
  const { isMobile } = useResponsiveWindowSize();
  const {
    setNewObjectDialogDefaultTab,
    getNewObjectDialogDefaultTab,
  } = React.useContext(PreferencesContext);
  const [currentTab, setCurrentTab] = React.useState(
    getNewObjectDialogDefaultTab()
  );

  React.useEffect(() => setNewObjectDialogDefaultTab(currentTab), [
    setNewObjectDialogDefaultTab,
    currentTab,
  ]);

  const {
    assetShortHeadersSearchResults,
    environment,
    setEnvironment,
  } = React.useContext(AssetStoreContext);
  const shopNavigationState = React.useContext(AssetStoreNavigatorContext);
  const {
    openedAssetPack,
    openedAssetShortHeader,
    selectedFolders,
  } = shopNavigationState.getCurrentPage();
  const [
    assetShortHeadersToInstall,
    setAssetShortHeadersToInstall,
  ] = React.useState<?Array<AssetShortHeader>>(null);
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
  const [
    selectedCustomObjectEnumeratedMetadata,
    setSelectedCustomObjectEnumeratedMetadata,
  ] = React.useState<?ObjectShortHeader>(null);
  const isAssetAddedToScene =
    openedAssetShortHeader &&
    existingAssetStoreIds.has(openedAssetShortHeader.id);
  const { showAlert } = useAlertDialog();

  const installAsset = useInstallAsset({
    project,
    resourceManagementProps,
    targetObjectFolderOrObjectWithContext,
    onWillInstallExtension,
    onExtensionInstalled,
  });
  const installEffectAssetOnLayer = useInstallEffectAsset({
    project,
    resourceManagementProps,
  });
  const chooseEffectNameForEffectAsset = useChooseEffectNameForEffectAsset();
  const {
    translatedExtensionShortHeadersByName: extensionShortHeadersByName,
  } = React.useContext(ExtensionStoreContext);
  const installExtension = useInstallExtension();

  // An effect of the asset store is not an object: it goes on a layer.
  const layersContainer: gdLayersContainer | null = layout
    ? layout.getLayers()
    : eventsBasedObject
    ? eventsBasedObject.getLayers()
    : null;
  const effectLayers = enumerateLayersForEffectAsset(
    layersContainer,
    openedAssetShortHeader
  );
  const isOpenedAssetEffect =
    !!openedAssetShortHeader && isEffectAsset(openedAssetShortHeader);

  const onInstallAsset = React.useCallback(
    async (
      assetShortHeader: AssetShortHeader,
      effectLayerName?: string
    ): Promise<boolean> => {
      if (!assetShortHeader) return false;

      const effectMetadata = getEffectAssetMetadata(assetShortHeader);
      if (effectMetadata) {
        if (
          !layersContainer ||
          effectLayerName === undefined ||
          !layersContainer.hasLayerNamed(effectLayerName)
        )
          return false;
        const effectsContainer = layersContainer
          .getLayer(effectLayerName)
          .getEffects();
        const effectName = await chooseEffectNameForEffectAsset({
          assetShortHeader,
          effectsContainer,
        });
        if (effectName === null) return false;
        setIsAssetBeingInstalled(true);
        const effect = await installEffectAssetOnLayer({
          assetShortHeader,
          effectsContainer,
          effectName,
        });
        setIsAssetBeingInstalled(false);
        if (effect && onLayerEffectAddedFromAssets)
          onLayerEffectAddedFromAssets();
        return !!effect;
      }

      setIsAssetBeingInstalled(true);
      const installAssetOutput = await installAsset({
        assetShortHeader,
        objectsContainer,
        setIsAssetBeingInstalled,
      });
      setIsAssetBeingInstalled(false);
      if (installAssetOutput) onObjectsAddedFromAssets(installAssetOutput);
      return !!installAssetOutput;
    },
    [
      installAsset,
      installEffectAssetOnLayer,
      chooseEffectNameForEffectAsset,
      onObjectsAddedFromAssets,
      onLayerEffectAddedFromAssets,
      objectsContainer,
      layersContainer,
    ]
  );

  const onInstallEmptyCustomObject = React.useCallback(
    async (enumeratedObjectMetadata: ObjectShortHeader) => {
      const { requiredExtensions } = enumeratedObjectMetadata;
      if (!requiredExtensions) return;
      try {
        setIsAssetBeingInstalled(true);
        const requiredExtensionInstallation = await checkRequiredExtensionsUpdate(
          {
            requiredExtensions,
            project,
            extensionShortHeadersByName,
          }
        );
        const wasExtensionsInstalled = await installExtension({
          project,
          requiredExtensionInstallation,
          importedSerializedExtensions: [],
          onWillInstallExtension,
          onExtensionInstalled,
          // Users must be able to create an object from scratch without being
          // forced to update extensions that may break their projects.
          updateMode: 'safeOnly',
          reason: 'asset',
        });
        if (!wasExtensionsInstalled) {
          return;
        }
        onCreateNewObject(enumeratedObjectMetadata.type);
      } catch (error) {
        console.error('Error while creating the object:', error);
        showAlert({
          title: t`Could not create the object`,
          message: t`There was an error while creating the object "${
            enumeratedObjectMetadata.fullName
          }". Verify your internet connection or try again later.`,
        });
      } finally {
        setIsAssetBeingInstalled(false);
      }
    },
    [
      project,
      extensionShortHeadersByName,
      installExtension,
      onWillInstallExtension,
      onExtensionInstalled,
      onCreateNewObject,
      showAlert,
    ]
  );

  // The effects of the store are each added to a layer of their own: a pack
  // (or a search) is added as a whole for its objects only.
  const displayedAssetShortHeaders = React.useMemo(
    () => {
      return assetShortHeadersSearchResults
        ? getAssetShortHeadersToDisplay(
            assetShortHeadersSearchResults,
            selectedFolders
          ).filter(assetShortHeader => !isEffectAsset(assetShortHeader))
        : [];
    },
    [assetShortHeadersSearchResults, selectedFolders]
  );

  const openAssetPackInstallDialog = React.useCallback(
    () => {
      const currentPage = shopNavigationState.getCurrentPage();
      setAssetShortHeadersToInstall(
        assetShortHeadersSearchResults
          ? getAssetShortHeadersToDisplay(
              assetShortHeadersSearchResults,
              currentPage.selectedFolders,
              currentPage.pageBreakIndex || 0
            ).filter(assetShortHeader => !isEffectAsset(assetShortHeader))
          : []
      );
    },
    [shopNavigationState, assetShortHeadersSearchResults]
  );

  const mainAction =
    currentTab === 'asset-store' ? (
      openedAssetPack ? (
        displayedAssetShortHeaders.length ? (
          <RaisedButton
            key="add-all-assets"
            primary
            label={
              displayedAssetShortHeaders.length === 1 ? (
                <Trans>Add this asset to my scene</Trans>
              ) : (
                <Trans>Add these assets to my scene</Trans>
              )
            }
            onClick={openAssetPackInstallDialog}
          />
        ) : null
      ) : openedAssetShortHeader && isOpenedAssetEffect ? (
        effectLayers.length ? (
          <RaisedButtonWithMenu
            key="add-effect"
            primary
            label={
              isAssetBeingInstalled ? (
                <Trans>Adding...</Trans>
              ) : (
                <Trans>Add to a layer</Trans>
              )
            }
            disabled={isAssetBeingInstalled}
            buildMenuTemplate={(i18n: I18nType) =>
              effectLayers.map(layer => ({
                label: layer.labelIsUserDefined
                  ? layer.label
                  : i18n._(t`Base layer`),
                click: () => {
                  onInstallAsset(openedAssetShortHeader, layer.value);
                },
              }))
            }
            id="add-asset-button"
          />
        ) : null
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
      ) : null
    ) : !!selectedCustomObjectEnumeratedMetadata &&
      currentTab === 'new-object' ? (
      <RaisedButton
        key="skip-and-create"
        label={
          isAssetBeingInstalled ? (
            <Trans>Adding...</Trans>
          ) : (
            <Trans>Skip and create from scratch</Trans>
          )
        }
        primary
        onClick={() =>
          selectedCustomObjectEnumeratedMetadata &&
          onInstallEmptyCustomObject(selectedCustomObjectEnumeratedMetadata)
        }
        id="skip-and-create-button"
        disabled={isAssetBeingInstalled}
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

  const onObjectTypeSelected = React.useCallback(
    (enumeratedObjectMetadata: ObjectShortHeader) => {
      if (enumeratedObjectMetadata.assetStoreTag) {
        // When the object is from an asset store, display the objects from the pack
        // so that the user can either pick a similar object or skip to create a new one.
        setSelectedCustomObjectEnumeratedMetadata(enumeratedObjectMetadata);
      } else if (enumeratedObjectMetadata.requiredExtensions) {
        onInstallEmptyCustomObject(enumeratedObjectMetadata);
      } else {
        onCreateNewObject(enumeratedObjectMetadata.name);
      }
    },
    [onCreateNewObject, onInstallEmptyCustomObject]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Dialog
            title={<Trans>New object</Trans>}
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
                ? openAssetPackInstallDialog
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
                // Enforce scroll on mobile, because the tabs have long names.
                variant={isMobile ? 'scrollable' : undefined}
              />
            }
          >
            {currentTab === 'asset-store' && (
              <AssetStore ref={assetStore} onlyShowAssets />
            )}
            {currentTab === 'new-object' &&
              (selectedCustomObjectEnumeratedMetadata &&
              selectedCustomObjectEnumeratedMetadata.assetStoreTag ? (
                <CustomObjectPackResults
                  packTag={selectedCustomObjectEnumeratedMetadata.assetStoreTag}
                  onAssetSelect={async assetShortHeader => {
                    const result = await onInstallAsset(assetShortHeader);
                    if (result) {
                      handleClose();
                    }
                  }}
                  isAssetBeingInstalled={isAssetBeingInstalled}
                  onBack={() => setSelectedCustomObjectEnumeratedMetadata(null)}
                />
              ) : (
                <NewObjectFromScratch
                  project={project}
                  eventsFunctionsExtension={eventsFunctionsExtension}
                  eventsBasedObject={eventsBasedObject}
                  onObjectTypeSelected={onObjectTypeSelected}
                  i18n={i18n}
                />
              ))}
          </Dialog>
          {isAssetBeingInstalled && <LoaderModal showImmediately />}
          {assetShortHeadersToInstall &&
            !!assetShortHeadersToInstall.length &&
            openedAssetPack && (
              <AssetPackInstallDialog
                assetPack={openedAssetPack}
                assetShortHeaders={assetShortHeadersToInstall}
                addedAssetIds={existingAssetStoreIds}
                onClose={() => setAssetShortHeadersToInstall(null)}
                onAssetsAdded={installAssetOutput => {
                  setAssetShortHeadersToInstall(null);
                  onObjectsAddedFromAssets(installAssetOutput);
                }}
                project={project}
                objectsContainer={objectsContainer}
                resourceManagementProps={resourceManagementProps}
                targetObjectFolderOrObjectWithContext={
                  targetObjectFolderOrObjectWithContext
                }
                onWillInstallExtension={onWillInstallExtension}
                onExtensionInstalled={onExtensionInstalled}
              />
            )}
        </>
      )}
    </I18n>
  );
}

const NewObjectDialogWithErrorBoundary = (props: Props): React.Node => (
  <ErrorBoundary
    componentTitle={<Trans>New Object dialog</Trans>}
    scope="new-object-dialog"
    onClose={props.onClose}
  >
    <NewObjectDialog {...props} />
  </ErrorBoundary>
);

export default NewObjectDialogWithErrorBoundary;
