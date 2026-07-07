// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import { type ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import ErrorBoundary from '../../UI/ErrorBoundary';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import { Column, marginsSize } from '../../UI/Grid';
import CompactPropertiesEditor from '../../CompactPropertiesEditor';
import Text from '../../UI/Text';
import { Trans, t } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import useForceUpdate from '../../Utils/UseForceUpdate';
import LayersIcon from '../../UI/CustomSvgIcons/Layers';
import Help from '../../UI/CustomSvgIcons/Help';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import CompactTextField from '../../UI/CompactTextField';
import { makeSchema } from './CompactLayerPropertiesSchema';
import { type Schema } from '../../PropertiesEditor/PropertiesEditorSchema';
import { CompactEffectsListEditor } from './CompactEffectsListEditor';
import { useForceRecompute } from '../../Utils/UseForceUpdate';
import { usePersistedScrollPosition } from '../../Utils/UsePersistedScrollPosition';
import { TopLevelCollapsibleSection } from '../../ObjectEditor/CompactObjectPropertiesEditor';

export const styles = {
  icon: {
    fontSize: 18,
  },
  scrollView: {
    paddingTop: marginsSize,
    // In theory, should not be needed (the children should be responsible for not
    // overflowing the parent). In practice, even when no horizontal scroll is shown
    // on Chrome, it might happen on Safari. Prevent any scroll to be 100% sure no
    // scrollbar will be shown.
    overflowX: 'hidden',
  },
  hiddenContent: { display: 'none' },
  subPanelContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingLeft: marginsSize * 3,
    paddingRight: marginsSize,
  },
};

const effectsHelpLink = getHelpLink(
  '/interface/scene-editor/layers-and-cameras'
);

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  layersContainer: gdLayersContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,

  layer: gdLayer,
  onEditLayer: (layer: gdLayer) => void,
  onEditLayerEffects: (layer: gdLayer) => void,
  onLayersModified: (layers: Array<gdLayer>) => void,
  onEffectAdded: () => void,
|};

export const CompactLayerPropertiesEditor = ({
  project,
  resourceManagementProps,
  layersContainer,
  projectScopedContainersAccessor,
  unsavedChanges,
  i18n,
  layer,
  onEditLayer,
  onEditLayerEffects,
  onLayersModified,
  onEffectAdded,
}: Props): React.Node => {
  const forceUpdate = useForceUpdate();
  const [isPropertiesFoldedOrDefault, setIsPropertiesFolded] = React.useState<
    boolean | null
  >(null);
  const isPropertiesFolded =
    isPropertiesFoldedOrDefault === null
      ? !layer.isLightingLayer()
      : !!isPropertiesFoldedOrDefault;

  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

  const scrollViewRef = React.useRef<?ScrollViewInterface>(null);
  const scrollKey = 'layer-' + layer.ptr;

  // Layers have no persistent UUID, so the name is used (like for scenes).
  // The base layer has an empty name, so a placeholder is used instead.
  const persistedScrollId = layer.getName() || 'base-layer';

  const onScroll = usePersistedScrollPosition({
    project,
    scrollViewRef,
    scrollKey,
    persistedScrollId,
    persistedScrollType: 'layer',
  });

  const layerPropertiesSchema = React.useMemo<Schema>(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }
      return makeSchema({
        i18n,
        onEditLayer,
        layersContainer,
        forceUpdate,
      });
    },
    [schemaRecomputeTrigger, i18n, onEditLayer, layersContainer, forceUpdate]
  );

  const openFullEditor = React.useCallback(() => onEditLayer(layer), [
    layer,
    onEditLayer,
  ]);

  return (
    <ErrorBoundary
      componentTitle={<Trans>Layer properties</Trans>}
      scope="scene-editor-layer-properties"
    >
      <ScrollView
        ref={scrollViewRef}
        autoHideScrollbar
        style={styles.scrollView}
        key={scrollKey}
        onScroll={onScroll}
      >
        <Column expand noMargin id="layer-properties-editor" noOverflowParent>
          <ColumnStackLayout expand noOverflowParent>
            <LineStackLayout
              noMargin
              alignItems="center"
              justifyContent="space-between"
            >
              <LineStackLayout noMargin alignItems="center">
                <LayersIcon style={styles.icon} />
                <Text size="body" noMargin>
                  <Trans>Layer</Trans>
                </Text>
                <IconButton
                  size="small"
                  onClick={() => {
                    Window.openExternalURL(effectsHelpLink);
                  }}
                >
                  <Help style={styles.icon} />
                </IconButton>
              </LineStackLayout>
            </LineStackLayout>
            <CompactTextField
              value={layer.getName() || i18n._(t`Base layer`)}
              onChange={() => {}}
              disabled
            />
          </ColumnStackLayout>
          {layerPropertiesSchema && (
            <TopLevelCollapsibleSection
              title={<Trans>Properties</Trans>}
              isFolded={isPropertiesFolded}
              toggleFolded={() => setIsPropertiesFolded(!isPropertiesFolded)}
              onOpenFullEditor={openFullEditor}
              renderContent={() => (
                <ColumnStackLayout noMargin noOverflowParent>
                  <CompactPropertiesEditor
                    unsavedChanges={unsavedChanges}
                    schema={layerPropertiesSchema}
                    instances={[layer]}
                    onInstancesModified={onLayersModified}
                    onRefreshAllFields={forceRecomputeSchema}
                  />
                </ColumnStackLayout>
              )}
            />
          )}
          {layer.getRenderingType() !== '3d' && (
            <CompactEffectsListEditor
              layerRenderingType={'2d'}
              target={'layer'}
              project={project}
              resourceManagementProps={resourceManagementProps}
              projectScopedContainersAccessor={projectScopedContainersAccessor}
              unsavedChanges={unsavedChanges}
              i18n={i18n}
              effectsContainer={layer.getEffects()}
              onEffectsUpdated={() => onLayersModified([layer])}
              onOpenFullEditor={() => onEditLayerEffects(layer)}
              onEffectAdded={onEffectAdded}
            />
          )}
          {layer.getRenderingType() !== '2d' && !layer.isLightingLayer() && (
            <CompactEffectsListEditor
              layerRenderingType={'3d'}
              target={'layer'}
              project={project}
              resourceManagementProps={resourceManagementProps}
              projectScopedContainersAccessor={projectScopedContainersAccessor}
              unsavedChanges={unsavedChanges}
              i18n={i18n}
              effectsContainer={layer.getEffects()}
              onEffectsUpdated={() => onLayersModified([layer])}
              onOpenFullEditor={() => onEditLayerEffects(layer)}
              onEffectAdded={onEffectAdded}
            />
          )}
        </Column>
      </ScrollView>
    </ErrorBoundary>
  );
};
