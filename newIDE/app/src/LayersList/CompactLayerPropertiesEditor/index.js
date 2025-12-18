// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import { type ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import ErrorBoundary from '../../UI/ErrorBoundary';
import ScrollView from '../../UI/ScrollView';
import { Column, Line, marginsSize } from '../../UI/Grid';
import CompactPropertiesEditor, {
  Separator,
} from '../../CompactPropertiesEditor';
import Text from '../../UI/Text';
import { Trans, t } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import useForceUpdate from '../../Utils/UseForceUpdate';
import ChevronArrowDownWithRoundedBorder from '../../UI/CustomSvgIcons/ChevronArrowDownWithRoundedBorder';
import ChevronArrowRightWithRoundedBorder from '../../UI/CustomSvgIcons/ChevronArrowRightWithRoundedBorder';
import Add from '../../UI/CustomSvgIcons/Add';
import LayersIcon from '../../UI/CustomSvgIcons/Layers';
import Help from '../../UI/CustomSvgIcons/Help';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import CompactTextField from '../../UI/CompactTextField';
import { textEllipsisStyle } from '../../UI/TextEllipsis';
import { makeSchema } from './CompactLayerPropertiesSchema';
import { type Schema } from '../../PropertiesEditor/PropertiesEditorSchema';
import { CompactEffectsListEditor } from './CompactEffectsListEditor';
import { useForceRecompute } from '../../Utils/UseForceUpdate';

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

const TopLevelCollapsibleSection = ({
  title,
  isFolded,
  toggleFolded,
  renderContent,
  renderContentAsHiddenWhenFolded,
  noContentMargin,
  onOpenFullEditor,
  onAdd,
}: {|
  title: React.Node,
  isFolded: boolean,
  toggleFolded: () => void,
  renderContent: () => React.Node,
  renderContentAsHiddenWhenFolded?: boolean,
  noContentMargin?: boolean,
  onOpenFullEditor: () => void,
  onAdd?: (() => void) | null,
|}) => (
  <>
    <Separator />
    <Column noOverflowParent>
      <LineStackLayout alignItems="center" justifyContent="space-between">
        <LineStackLayout noMargin alignItems="center">
          <IconButton size="small" onClick={toggleFolded}>
            {isFolded ? (
              <ChevronArrowRightWithRoundedBorder style={styles.icon} />
            ) : (
              <ChevronArrowDownWithRoundedBorder style={styles.icon} />
            )}
          </IconButton>
          <Text size="sub-title" noMargin style={textEllipsisStyle}>
            {title}
          </Text>
        </LineStackLayout>
        <Line alignItems="center" noMargin>
          <IconButton size="small" onClick={onOpenFullEditor}>
            <ShareExternal style={styles.icon} />
          </IconButton>
          {onAdd && (
            <IconButton size="small" onClick={onAdd}>
              <Add style={styles.icon} />
            </IconButton>
          )}
        </Line>
      </LineStackLayout>
    </Column>
    <Column noMargin={noContentMargin}>
      {isFolded ? (
        renderContentAsHiddenWhenFolded ? (
          <div style={styles.hiddenContent}>{renderContent()}</div>
        ) : null
      ) : (
        renderContent()
      )}
    </Column>
  </>
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
}: Props) => {
  const forceUpdate = useForceUpdate();
  const [isPropertiesFoldedOrDefault, setIsPropertiesFolded] = React.useState<
    boolean | null
  >(null);
  const isPropertiesFolded =
    isPropertiesFoldedOrDefault === null
      ? !layer.isLightingLayer()
      : !!isPropertiesFoldedOrDefault;

  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

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
      <ScrollView autoHideScrollbar style={styles.scrollView} key={layer.ptr}>
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
