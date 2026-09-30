// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import { AssetStore, type AssetStoreInterface } from '.';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import ErrorBoundary from '../UI/ErrorBoundary';
import LoaderModal from '../UI/LoaderModal';
import {
  useInstallEffectAsset,
  useChooseEffectNameForEffectAsset,
} from './NewObjectDialog';
import { AssetStoreNavigatorContext } from './AssetStoreNavigator';
import { enumerateEffectsMetadata } from '../EffectsList/EnumerateEffects';

type Props = {|
  project: gdProject,
  effectsContainer: gdEffectsContainer,
  layerRenderingType: string,
  resourceManagementProps: ResourceManagementProps,
  onClose: ({ effect: gdEffect | null }) => void,
|};

/**
 * The asset store restricted to the effects the given layer can take, adding
 * the chosen one to its effects.
 */
function EffectStoreDialog({
  project,
  effectsContainer,
  layerRenderingType,
  resourceManagementProps,
  onClose,
}: Props) {
  const effectTypes = React.useMemo(
    () =>
      enumerateEffectsMetadata(project)
        .filter(effectMetadata =>
          effectMetadata.isMarkedAsOnlyWorkingFor3D
            ? layerRenderingType !== '2d'
            : effectMetadata.isMarkedAsOnlyWorkingFor2D
            ? layerRenderingType !== '3d'
            : true
        )
        .map(effectMetadata => effectMetadata.type),
    [project, layerRenderingType]
  );
  const shopNavigationState = React.useContext(AssetStoreNavigatorContext);
  const { openedAssetShortHeader } = shopNavigationState.getCurrentPage();
  const [
    isAssetBeingInstalled,
    setIsAssetBeingInstalled,
  ] = React.useState<boolean>(false);
  const installEffectAsset = useInstallEffectAsset({
    project,
    resourceManagementProps,
  });
  const chooseEffectNameForEffectAsset = useChooseEffectNameForEffectAsset();

  const installOpenedAsset = React.useCallback(
    async (): Promise<void> => {
      if (!openedAssetShortHeader) return;

      const effectName = await chooseEffectNameForEffectAsset({
        assetShortHeader: openedAssetShortHeader,
        effectsContainer,
      });
      if (effectName === null) return;

      setIsAssetBeingInstalled(true);
      const effect = await installEffectAsset({
        assetShortHeader: openedAssetShortHeader,
        effectsContainer,
        effectName,
      });
      setIsAssetBeingInstalled(false);
      shopNavigationState.backToPreviousPage();
      if (effect) onClose({ effect });
    },
    [
      installEffectAsset,
      chooseEffectNameForEffectAsset,
      effectsContainer,
      openedAssetShortHeader,
      onClose,
      shopNavigationState,
    ]
  );

  const assetStore = React.useRef<?AssetStoreInterface>(null);
  const handleClose = React.useCallback(
    () => {
      assetStore.current && assetStore.current.onClose();
      onClose({ effect: null });
    },
    [onClose]
  );

  return (
    <>
      <Dialog
        title={<Trans>Choose an effect from the store</Trans>}
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Close</Trans>}
            onClick={handleClose}
            id="close-button"
          />,
          openedAssetShortHeader ? (
            <RaisedButton
              key="add-effect"
              primary
              label={
                isAssetBeingInstalled ? (
                  <Trans>Adding...</Trans>
                ) : (
                  <Trans>Add to the layer</Trans>
                )
              }
              onClick={installOpenedAsset}
              disabled={isAssetBeingInstalled}
              id="add-effect-button"
            />
          ) : null,
        ]}
        onApply={openedAssetShortHeader ? installOpenedAsset : undefined}
        onRequestClose={handleClose}
        open
        flexBody
        fullHeight
        id="effect-store-dialog"
      >
        <AssetStore
          ref={assetStore}
          onlyShowAssets
          fixedObjectTypes={effectTypes}
        />
      </Dialog>
      {isAssetBeingInstalled && <LoaderModal showImmediately />}
    </>
  );
}

const EffectStoreDialogWithErrorBoundary = (props: Props): React.Node => (
  <ErrorBoundary
    componentTitle={<Trans>Effect store dialog</Trans>}
    scope="new-object-dialog"
    onClose={() => props.onClose({ effect: null })}
  >
    <EffectStoreDialog {...props} />
  </ErrorBoundary>
);

export default EffectStoreDialogWithErrorBoundary;
