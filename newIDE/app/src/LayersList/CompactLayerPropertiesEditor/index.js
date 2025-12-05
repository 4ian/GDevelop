// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import { type ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import ErrorBoundary from '../../UI/ErrorBoundary';
import ScrollView from '../../UI/ScrollView';
import { Column, Line, Spacer, marginsSize } from '../../UI/Grid';
import CompactPropertiesEditor, {
  Separator,
} from '../../CompactPropertiesEditor';
import Text from '../../UI/Text';
import { Trans, t } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';
import propertiesMapToSchema from '../../CompactPropertiesEditor/PropertiesMapToCompactSchema';
import { type ObjectEditorTab } from '../../ObjectEditor/ObjectEditorDialog';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import Paper from '../../UI/Paper';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import RemoveIcon from '../../UI/CustomSvgIcons/Remove';
import VisibilityIcon from '../../UI/CustomSvgIcons/Visibility';
import VisibilityOffIcon from '../../UI/CustomSvgIcons/VisibilityOff';
import useForceUpdate, { useForceRecompute } from '../../Utils/UseForceUpdate';
import ChevronArrowTop from '../../UI/CustomSvgIcons/ChevronArrowTop';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowDownWithRoundedBorder from '../../UI/CustomSvgIcons/ChevronArrowDownWithRoundedBorder';
import ChevronArrowRightWithRoundedBorder from '../../UI/CustomSvgIcons/ChevronArrowRightWithRoundedBorder';
import Add from '../../UI/CustomSvgIcons/Add';
import LayersIcon from '../../UI/CustomSvgIcons/Layers';
import { CompactEffectPropertiesEditor } from '../../EffectsList/CompactEffectPropertiesEditor';
import { mapFor } from '../../Utils/MapFor';
import {
  getEnumeratedEffectMetadata,
  useManageEffects,
} from '../../EffectsList';
import CompactSelectField from '../../UI/CompactSelectField';
import SelectOption from '../../UI/SelectOption';
import FlatButton from '../../UI/FlatButton';
import Help from '../../UI/CustomSvgIcons/Help';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import CompactTextField from '../../UI/CompactTextField';
import { textEllipsisStyle } from '../../UI/TextEllipsis';
import Link from '../../UI/Link';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { makeSchema } from './CompactLayerPropertiesSchema';
import { type Schema } from '../../CompactPropertiesEditor';

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

const noRefreshOfAllFields = () => {
  console.warn(
    "An instance tried to refresh all fields, but the editor doesn't support it."
  );
};

const effectsHelpLink = getHelpLink('/interface/scene-editor/layer-effects');

type TitleBarButton = {|
  id: string,
  icon: any,
  label?: MessageDescriptor,
  onClick?: () => void,
|};

const CollapsibleSubPanel = ({
  renderContent,
  isFolded,
  toggleFolded,
  title,
  titleIcon,
  titleBarButtons,
}: {|
  renderContent: () => React.Node,
  isFolded: boolean,
  toggleFolded: () => void,
  titleIcon?: ?React.Node,
  title: string,
  titleBarButtons?: Array<TitleBarButton>,
|}) => (
  <Paper background="medium">
    <Line expand>
      <ColumnStackLayout noMargin expand noOverflowParent>
        <LineStackLayout noMargin justifyContent="space-between">
          <Line noMargin alignItems="center">
            <IconButton onClick={toggleFolded} size="small">
              {isFolded ? (
                <ChevronArrowRight style={styles.icon} />
              ) : (
                <ChevronArrowBottom style={styles.icon} />
              )}
            </IconButton>

            {titleIcon}
            {titleIcon && <Spacer />}
            <Text noMargin size="body" style={textEllipsisStyle}>
              {title}
            </Text>
          </Line>
          <Line noMargin>
            {titleBarButtons &&
              titleBarButtons.map(button => {
                const Icon = button.icon;
                return (
                  <IconButton
                    key={button.id}
                    id={button.id}
                    tooltip={button.label}
                    onClick={button.onClick}
                    size="small"
                  >
                    <Icon style={styles.icon} />
                  </IconButton>
                );
              })}
            <Spacer />
          </Line>
        </LineStackLayout>
        {isFolded ? null : (
          <div style={styles.subPanelContentContainer}>{renderContent()}</div>
        )}
      </ColumnStackLayout>
    </Line>
  </Paper>
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
  layout?: ?gdLayout,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
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
  layout,
  eventsFunctionsExtension,
  objectsContainer,
  globalObjectsContainer,
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
  const [isPropertiesFolded, setIsPropertiesFolded] = React.useState(false);
  const [is2DEffectsFolded, set2DEffectsFolded] = React.useState(false);
  const [is3DEffectsFolded, set3DEffectsFolded] = React.useState(false);

  // Properties:
  const { object, instanceSchema } = React.useMemo<{|
    object?: gdObject,
    instanceSchema?: Schema,
  |}>(
    () => {
      const instanceSchema = makeSchema({
        i18n,
        onEditLayer,
        layersContainer,
        forceUpdate,
      });
      return {
        object,
        instanceSchema,
      };
    },
    [i18n, onEditLayer, layersContainer, forceUpdate]
  );

  // Effects:
  const effectsContainer = layer.getEffects();
  const {
    allEffectMetadata,
    all2DEffectMetadata,
    all3DEffectMetadata,
    addEffect,
    removeEffect,
    chooseEffectType,
  } = useManageEffects({
    effectsContainer,
    project,
    onEffectsUpdated: () => {
      onLayersModified([layer]);
      forceUpdate();
    },
    onEffectAdded,
    onUpdate: forceUpdate,
    target: 'object',
  });

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
          {instanceSchema && (
            <TopLevelCollapsibleSection
              title={<Trans>Properties</Trans>}
              isFolded={isPropertiesFolded}
              toggleFolded={() => setIsPropertiesFolded(!isPropertiesFolded)}
              onOpenFullEditor={openFullEditor}
              renderContent={() => (
                <ColumnStackLayout noMargin noOverflowParent>
                  <CompactPropertiesEditor
                    unsavedChanges={unsavedChanges}
                    schema={instanceSchema}
                    instances={[layer]}
                    onInstancesModified={onLayersModified}
                    onRefreshAllFields={noRefreshOfAllFields}
                  />
                </ColumnStackLayout>
              )}
            />
          )}
          {layer.getRenderingType() !== '3d' && (
            <TopLevelCollapsibleSection
              title={<Trans>2D effects</Trans>}
              isFolded={is2DEffectsFolded}
              toggleFolded={() => set2DEffectsFolded(!is2DEffectsFolded)}
              onOpenFullEditor={() => onEditLayerEffects(layer)}
              onAdd={() => addEffect(false)}
              renderContent={() => (
                <ColumnStackLayout noMargin>
                  {effectsContainer.getEffectsCount() === 0 && (
                    <Text size="body2" align="center" color="secondary">
                      <Trans>
                        There are no{' '}
                        <Link
                          href={effectsHelpLink}
                          onClick={() =>
                            Window.openExternalURL(effectsHelpLink)
                          }
                        >
                          2D effects
                        </Link>{' '}
                        on this layer.
                      </Trans>
                    </Text>
                  )}
                  {mapFor(
                    0,
                    effectsContainer.getEffectsCount(),
                    (index: number) => {
                      const effect: gdEffect = effectsContainer.getEffectAt(
                        index
                      );
                      const effectType = effect.getEffectType();
                      const effectMetadata = getEnumeratedEffectMetadata(
                        allEffectMetadata,
                        effectType
                      );

                      return !effectMetadata ||
                        !effectMetadata.isMarkedAsOnlyWorkingFor3D ? (
                        <CollapsibleSubPanel
                          key={effect.ptr}
                          renderContent={() => (
                            <ColumnStackLayout noMargin expand noOverflowParent>
                              <CompactSelectField
                                value={effectType}
                                onChange={type =>
                                  chooseEffectType(effect, type)
                                }
                              >
                                {all2DEffectMetadata.map(effectMetadata => (
                                  <SelectOption
                                    key={effectMetadata.type}
                                    value={effectMetadata.type}
                                    label={effectMetadata.fullName}
                                    disabled={
                                      effectMetadata.isMarkedAsNotWorkingForObjects
                                    }
                                  />
                                ))}
                              </CompactSelectField>
                              <CompactEffectPropertiesEditor
                                project={project}
                                effect={effect}
                                effectMetadata={effectMetadata}
                                resourceManagementProps={
                                  resourceManagementProps
                                }
                                onPropertyModified={() =>
                                  onLayersModified([layer])
                                }
                              />
                            </ColumnStackLayout>
                          )}
                          isFolded={effect.isFolded()}
                          toggleFolded={() => {
                            effect.setFolded(!effect.isFolded());
                            forceUpdate();
                          }}
                          title={effect.getName()}
                          titleBarButtons={[
                            {
                              id: 'effect-visibility',
                              icon: effect.isEnabled()
                                ? VisibilityIcon
                                : VisibilityOffIcon,
                              label: effect.isEnabled()
                                ? t`Hide effect`
                                : t`Show effect`,
                              onClick: () => {
                                effect.setEnabled(!effect.isEnabled());
                                onLayersModified([layer]);
                                forceUpdate();
                              },
                            },
                            {
                              id: 'remove-effect',
                              icon: RemoveIcon,
                              label: t`Remove effect`,
                              onClick: () => {
                                removeEffect(effect);
                                onLayersModified([layer]);
                              },
                            },
                          ]}
                        />
                      ) : null;
                    }
                  )}
                </ColumnStackLayout>
              )}
            />
          )}
          {layer.getRenderingType() !== '2d' && !layer.isLightingLayer() && (
            <TopLevelCollapsibleSection
              title={<Trans>3D effects</Trans>}
              isFolded={is3DEffectsFolded}
              toggleFolded={() => set3DEffectsFolded(!is3DEffectsFolded)}
              onOpenFullEditor={() => onEditLayerEffects(layer)}
              onAdd={() => addEffect(true)}
              renderContent={() => (
                <ColumnStackLayout noMargin>
                  {effectsContainer.getEffectsCount() === 0 && (
                    <Text size="body2" align="center" color="secondary">
                      <Trans>
                        There are no{' '}
                        <Link
                          href={effectsHelpLink}
                          onClick={() =>
                            Window.openExternalURL(effectsHelpLink)
                          }
                        >
                          3D effects
                        </Link>{' '}
                        on this layer.
                      </Trans>
                    </Text>
                  )}
                  {mapFor(
                    0,
                    effectsContainer.getEffectsCount(),
                    (index: number) => {
                      const effect: gdEffect = effectsContainer.getEffectAt(
                        index
                      );
                      const effectType = effect.getEffectType();
                      const effectMetadata = getEnumeratedEffectMetadata(
                        allEffectMetadata,
                        effectType
                      );

                      return !effectMetadata ||
                        !effectMetadata.isMarkedAsOnlyWorkingFor2D ? (
                        <CollapsibleSubPanel
                          key={effect.ptr}
                          renderContent={() => (
                            <ColumnStackLayout noMargin expand noOverflowParent>
                              <CompactSelectField
                                value={effectType}
                                onChange={type =>
                                  chooseEffectType(effect, type)
                                }
                              >
                                {all3DEffectMetadata.map(effectMetadata => (
                                  <SelectOption
                                    key={effectMetadata.type}
                                    value={effectMetadata.type}
                                    label={effectMetadata.fullName}
                                    disabled={
                                      effectMetadata.isMarkedAsNotWorkingForObjects
                                    }
                                  />
                                ))}
                              </CompactSelectField>
                              <CompactEffectPropertiesEditor
                                project={project}
                                effect={effect}
                                effectMetadata={effectMetadata}
                                resourceManagementProps={
                                  resourceManagementProps
                                }
                                onPropertyModified={() =>
                                  onLayersModified([layer])
                                }
                              />
                            </ColumnStackLayout>
                          )}
                          isFolded={effect.isFolded()}
                          toggleFolded={() => {
                            effect.setFolded(!effect.isFolded());
                            forceUpdate();
                          }}
                          title={effect.getName()}
                          titleBarButtons={[
                            {
                              id: 'effect-visibility',
                              icon: effect.isEnabled()
                                ? VisibilityIcon
                                : VisibilityOffIcon,
                              label: effect.isEnabled()
                                ? t`Hide effect`
                                : t`Show effect`,
                              onClick: () => {
                                effect.setEnabled(!effect.isEnabled());
                                onLayersModified([layer]);
                                forceUpdate();
                              },
                            },
                            {
                              id: 'remove-effect',
                              icon: RemoveIcon,
                              label: t`Remove effect`,
                              onClick: () => {
                                removeEffect(effect);
                                onLayersModified([layer]);
                              },
                            },
                          ]}
                        />
                      ) : null;
                    }
                  )}
                </ColumnStackLayout>
              )}
            />
          )}
        </Column>
      </ScrollView>
    </ErrorBoundary>
  );
};
