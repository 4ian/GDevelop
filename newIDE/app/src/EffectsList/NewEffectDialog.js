// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import ButtonBase from '@material-ui/core/ButtonBase';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import HelpButton from '../UI/HelpButton';
import { Tabs } from '../UI/Tabs';
import { Column } from '../UI/Grid';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import SearchBar from '../UI/SearchBar';
import SearchBarSelectField from '../UI/SearchBarSelectField';
import SelectOption from '../UI/SelectOption';
import ScrollView from '../UI/ScrollView';
import Text from '../UI/Text';
import Chip from '../UI/Chip';
import EmptyMessage from '../UI/EmptyMessage';
import ErrorBoundary from '../UI/ErrorBoundary';
import LoaderModal from '../UI/LoaderModal';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { AssetStore, type AssetStoreInterface } from '../AssetStore';
import {
  useInstallEffectAsset,
  useChooseEffectNameForEffectAsset,
} from '../AssetStore/NewObjectDialog';
import { AssetStoreNavigatorContext } from '../AssetStore/AssetStoreNavigator';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { mapFor } from '../Utils/MapFor';
import {
  enumerateEffectsMetadata,
  type EnumeratedEffectMetadata,
} from './EnumerateEffects';

const styles = {
  button: { width: '100%' },
  item: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    overflow: 'hidden',
    width: '100%',
    padding: '8px 12px',
  },
};

type EffectCategory = '' | '2d' | '3d';
type Tab = 'from-scratch' | 'asset-store';

const isEffectWorkingFor = (
  effectMetadata: EnumeratedEffectMetadata,
  {
    target,
    layerRenderingType,
  }: {| target: 'object' | 'layer', layerRenderingType: string |}
): boolean => {
  if (target === 'object') {
    // Objects are rendered in 2D.
    return (
      !effectMetadata.isMarkedAsNotWorkingForObjects &&
      !effectMetadata.isMarkedAsOnlyWorkingFor3D
    );
  }
  if (layerRenderingType === '2d')
    return !effectMetadata.isMarkedAsOnlyWorkingFor3D;
  if (layerRenderingType === '3d')
    return !effectMetadata.isMarkedAsOnlyWorkingFor2D;
  return true;
};

const isEffectInCategory = (
  effectMetadata: EnumeratedEffectMetadata,
  category: EffectCategory
): boolean =>
  category === '2d'
    ? !effectMetadata.isMarkedAsOnlyWorkingFor3D
    : category === '3d'
    ? !effectMetadata.isMarkedAsOnlyWorkingFor2D
    : true;

const doesEffectMatchSearch = (
  effectMetadata: EnumeratedEffectMetadata,
  lowerCaseSearchText: string
): boolean =>
  !lowerCaseSearchText ||
  effectMetadata.fullName.toLowerCase().includes(lowerCaseSearchText) ||
  effectMetadata.description.toLowerCase().includes(lowerCaseSearchText) ||
  effectMetadata.type.toLowerCase().includes(lowerCaseSearchText);

type EffectListItemProps = {|
  effectMetadata: EnumeratedEffectMetadata,
  isAlreadyAdded: boolean,
  showDimensionChip: boolean,
  onChoose: () => void,
|};

const EffectListItem = ({
  effectMetadata,
  isAlreadyAdded,
  showDimensionChip,
  onChoose,
}: EffectListItemProps) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [hover, setHover] = React.useState(false);

  return (
    <ButtonBase
      id={'effect-item-' + effectMetadata.type.replace(/:/g, '-')}
      onClick={onChoose}
      focusRipple
      style={styles.button}
    >
      <div
        style={
          hover ? { ...styles.item, ...gdevelopTheme.list.hover } : styles.item
        }
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <LineStackLayout noMargin alignItems="center">
          <Text noMargin allowBrowserAutoTranslate={false}>
            {effectMetadata.fullName}
          </Text>
          {showDimensionChip && effectMetadata.isMarkedAsOnlyWorkingFor2D && (
            <Chip size="small" label={<Trans>2D</Trans>} variant="outlined" />
          )}
          {showDimensionChip && effectMetadata.isMarkedAsOnlyWorkingFor3D && (
            <Chip size="small" label={<Trans>3D</Trans>} variant="outlined" />
          )}
          {isAlreadyAdded && (
            <Chip
              size="small"
              label={<Trans>Already added</Trans>}
              color="secondary"
              variant="outlined"
            />
          )}
        </LineStackLayout>
        <Text
          noMargin
          size="body2"
          color="secondary"
          allowBrowserAutoTranslate={false}
        >
          {effectMetadata.description}
        </Text>
      </div>
    </ButtonBase>
  );
};

type NewEffectFromScratchProps = {|
  project: gdProject,
  effectsContainer: gdEffectsContainer,
  target: 'object' | 'layer',
  layerRenderingType: string,
  onChoose: (effectType: string) => void,
|};

const NewEffectFromScratch = ({
  project,
  effectsContainer,
  target,
  layerRenderingType,
  onChoose,
}: NewEffectFromScratchProps) => {
  const [searchText, setSearchText] = React.useState<string>('');
  const [category, setCategory] = React.useState<EffectCategory>('');

  const availableEffectMetadata = React.useMemo(
    () =>
      enumerateEffectsMetadata(project).filter(effectMetadata =>
        isEffectWorkingFor(effectMetadata, { target, layerRenderingType })
      ),
    [project, target, layerRenderingType]
  );

  // Only offer to filter by 2D/3D when both kinds can be added.
  const canChooseCategory =
    availableEffectMetadata.some(
      effectMetadata => effectMetadata.isMarkedAsOnlyWorkingFor2D
    ) &&
    availableEffectMetadata.some(
      effectMetadata => effectMetadata.isMarkedAsOnlyWorkingFor3D
    );

  const lowerCaseSearchText = searchText.trim().toLowerCase();
  const displayedEffectMetadata = availableEffectMetadata.filter(
    effectMetadata =>
      isEffectInCategory(effectMetadata, category) &&
      doesEffectMatchSearch(effectMetadata, lowerCaseSearchText)
  );

  const existingEffectTypes = new Set(
    mapFor(0, effectsContainer.getEffectsCount(), i =>
      effectsContainer.getEffectAt(i).getEffectType()
    )
  );

  return (
    <ColumnStackLayout expand noMargin useFullHeight>
      <ResponsiveLineStackLayout noMargin>
        {canChooseCategory && (
          <SearchBarSelectField
            value={category}
            onChange={(e, i, value: string) => {
              if (value === '2d' || value === '3d') setCategory(value);
              else setCategory('');
            }}
          >
            <SelectOption value="" label={t`All categories`} />
            <SelectOption value="2d" label={t`2D`} />
            <SelectOption value="3d" label={t`3D`} />
          </SearchBarSelectField>
        )}
        <Column expand noMargin>
          <SearchBar
            id="effect-type-search-bar"
            value={searchText}
            onChange={setSearchText}
            onRequestSearch={() => {
              if (displayedEffectMetadata.length === 1) {
                onChoose(displayedEffectMetadata[0].type);
              }
            }}
            placeholder={t`Search effects`}
            autoFocus="desktop"
          />
        </Column>
      </ResponsiveLineStackLayout>
      <ScrollView>
        {displayedEffectMetadata.length === 0 ? (
          <EmptyMessage>
            <Trans>No effect found for your search.</Trans>
          </EmptyMessage>
        ) : (
          displayedEffectMetadata.map(effectMetadata => (
            <EffectListItem
              key={effectMetadata.type}
              effectMetadata={effectMetadata}
              isAlreadyAdded={existingEffectTypes.has(effectMetadata.type)}
              showDimensionChip={canChooseCategory}
              onChoose={() => onChoose(effectMetadata.type)}
            />
          ))
        )}
      </ScrollView>
    </ColumnStackLayout>
  );
};

type Props = {|
  project: gdProject,
  effectsContainer: gdEffectsContainer,
  target: 'object' | 'layer',
  layerRenderingType: string,
  resourceManagementProps: ResourceManagementProps,
  onClose: () => void,
  onChooseEffectType: (effectType: string) => void,
  onEffectAddedFromStore: (effect: gdEffect) => void,
|};

/**
 * Let the user choose the effect to add, among the built-in effects (from
 * scratch) or, for layers, the effects of the asset store.
 */
function NewEffectDialog({
  project,
  effectsContainer,
  target,
  layerRenderingType,
  resourceManagementProps,
  onClose,
  onChooseEffectType,
  onEffectAddedFromStore,
}: Props) {
  const { isMobile } = useResponsiveWindowSize();
  // The effects of the store go on layers.
  const canAddEffectFromStore = target === 'layer';
  const {
    getNewEffectDialogDefaultTab,
    setNewEffectDialogDefaultTab,
  } = React.useContext(PreferencesContext);
  // Open the tab used last time (the store by default, so that its effects are seen).
  const [currentTab, setCurrentTab] = React.useState<Tab>(() =>
    canAddEffectFromStore ? getNewEffectDialogDefaultTab() : 'from-scratch'
  );
  const changeTab = React.useCallback(
    (newTab: Tab) => {
      setCurrentTab(newTab);
      setNewEffectDialogDefaultTab(newTab);
    },
    [setNewEffectDialogDefaultTab]
  );

  const storeEffectTypes = React.useMemo(
    () =>
      enumerateEffectsMetadata(project)
        .filter(effectMetadata =>
          isEffectWorkingFor(effectMetadata, { target, layerRenderingType })
        )
        .map(effectMetadata => effectMetadata.type),
    [project, target, layerRenderingType]
  );
  const shopNavigationState = React.useContext(AssetStoreNavigatorContext);
  const { openedAssetShortHeader } = shopNavigationState.getCurrentPage();
  const isStoreAssetOpened =
    currentTab === 'asset-store' && !!openedAssetShortHeader;
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
      if (effect) onEffectAddedFromStore(effect);
    },
    [
      installEffectAsset,
      chooseEffectNameForEffectAsset,
      effectsContainer,
      openedAssetShortHeader,
      onEffectAddedFromStore,
      shopNavigationState,
    ]
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
        title={<Trans>Add an effect</Trans>}
        secondaryActions={[
          <HelpButton
            key="help"
            helpPagePath={
              target === 'object'
                ? '/objects/effects'
                : '/interface/scene-editor/layer-effects'
            }
          />,
        ]}
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Close</Trans>}
            primary={false}
            onClick={handleClose}
            id="close-button"
          />,
          isStoreAssetOpened ? (
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
              id="add-effect-from-store-button"
            />
          ) : null,
        ]}
        onApply={isStoreAssetOpened ? installOpenedAsset : undefined}
        onRequestClose={handleClose}
        open
        flexBody
        fullHeight
        id="new-effect-dialog"
        fixedContent={
          canAddEffectFromStore ? (
            <Tabs
              value={currentTab}
              onChange={changeTab}
              options={[
                {
                  label: <Trans>Effect store</Trans>,
                  value: 'asset-store',
                  id: 'effect-store-tab',
                },
                {
                  label: <Trans>New effect from scratch</Trans>,
                  value: 'from-scratch',
                  id: 'new-effect-from-scratch-tab',
                },
              ]}
              // Enforce scroll on mobile, because the tabs have long names.
              variant={isMobile ? 'scrollable' : undefined}
            />
          ) : null
        }
      >
        {currentTab === 'from-scratch' && (
          <NewEffectFromScratch
            project={project}
            effectsContainer={effectsContainer}
            target={target}
            layerRenderingType={layerRenderingType}
            onChoose={onChooseEffectType}
          />
        )}
        {currentTab === 'asset-store' && (
          <AssetStore
            ref={assetStore}
            onlyShowAssets
            fixedObjectTypes={storeEffectTypes}
          />
        )}
      </Dialog>
      {isAssetBeingInstalled && <LoaderModal showImmediately />}
    </>
  );
}

const NewEffectDialogWithErrorBoundary = (props: Props): React.Node => (
  <ErrorBoundary
    componentTitle={<Trans>New effect dialog</Trans>}
    scope="new-effect-dialog"
    onClose={props.onClose}
  >
    <NewEffectDialog {...props} />
  </ErrorBoundary>
);

export default NewEffectDialogWithErrorBoundary;
