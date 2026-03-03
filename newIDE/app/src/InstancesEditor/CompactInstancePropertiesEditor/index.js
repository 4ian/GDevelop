// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import CompactPropertiesEditor, {
  Separator,
} from '../../CompactPropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import { type Schema } from '../../PropertiesEditor/PropertiesEditorSchema';
import getObjectByName from '../../Utils/GetObjectByName';
import IconButton from '../../UI/IconButton';
import { Line, Column, Spacer, marginsSize } from '../../UI/Grid';
import Text from '../../UI/Text';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import EventsRootVariablesFinder from '../../Utils/EventsRootVariablesFinder';
import VariablesList, {
  type HistoryHandler,
} from '../../VariablesList/VariablesList';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';
import useForceUpdate from '../../Utils/UseForceUpdate';
import ErrorBoundary from '../../UI/ErrorBoundary';
import {
  makeSchema,
  reorderInstanceSchemaForCustomProperties,
} from './CompactInstancePropertiesSchema';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import TileSetVisualizer, {
  type TileMapTileSelection,
} from '../TileSetVisualizer';
import {
  TopLevelCollapsibleSection,
  CollapsibleSubPanel,
  type TitleBarButton,
} from '../../ObjectEditor/CompactObjectPropertiesEditor';
import { ColumnStackLayout } from '../../UI/Layout';
import Link from '../../UI/Link';
import { IconContainer } from '../../UI/IconContainer';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { usePersistedScrollPosition } from '../../Utils/UsePersistedScrollPosition';
import EmptyMessage from '../../UI/EmptyMessage';
import CompactBehaviorsEditorService from '../../ObjectEditor/CompactObjectPropertiesEditor/CompactBehaviorsEditorService';

const gd: libGDevelop = global.gd;

const notOverridableBehaviorTypes = [
  'Physics2::Physics2Behavior',
  'Physics3D::Physics3DBehavior',
  'PhysicsBehavior::PhysicsBehavior',
];

export const styles = {
  icon: {
    fontSize: 18,
  },
  scrollView: { paddingTop: marginsSize },
};

const behaviorsHelpLink = getHelpLink('/behaviors');

const noRefreshOfAllFields = () => {
  console.warn(
    "An instance tried to refresh all fields, but the editor doesn't support it."
  );
};

export const StatefulCollapsibleSubPanel = ({
  renderContent,
  isInitiallyFolded,
  onToggleFolded,
  title,
  titleIcon,
  titleBarButtons,
}: {|
  renderContent: () => React.Node,
  isInitiallyFolded: boolean,
  onToggleFolded?: () => void,
  titleIcon?: ?React.Node,
  title: string,
  titleBarButtons?: Array<TitleBarButton>,
|}): React.Node => {
  const [isFolded, setIsFolded] = React.useState(isInitiallyFolded);

  const toggleFolded = React.useCallback(
    () => {
      setIsFolded(isFolded => !isFolded);
      if (onToggleFolded) {
        onToggleFolded();
      }
    },
    [onToggleFolded]
  );

  return (
    <CollapsibleSubPanel
      renderContent={renderContent}
      isFolded={isFolded}
      toggleFolded={toggleFolded}
      title={title}
      titleIcon={titleIcon}
      titleBarButtons={titleBarButtons}
    />
  );
};

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  layout?: ?gdLayout,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  layersContainer: gdLayersContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  instances: Array<gdInitialInstance>,
  editObjectInPropertiesPanel: string => void,
  onInstancesModified?: (Array<gdInitialInstance>) => void,
  onGetInstanceSize: gdInitialInstance => [number, number, number],
  editInstanceVariables: gdInitialInstance => void,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,
  historyHandler?: HistoryHandler,
  tileMapTileSelection: ?TileMapTileSelection,
  onSelectTileMapTile: (?TileMapTileSelection) => void,
  canOverrideBehaviorProperties: boolean,
|};

export const CompactInstancePropertiesEditor = ({
  instances,
  i18n,
  project,
  resourceManagementProps,
  layout,
  objectsContainer,
  globalObjectsContainer,
  layersContainer,
  unsavedChanges,
  historyHandler,
  editObjectInPropertiesPanel,
  onGetInstanceSize,
  editInstanceVariables,
  onInstancesModified,
  projectScopedContainersAccessor,
  tileMapTileSelection,
  onSelectTileMapTile,
  canOverrideBehaviorProperties,
}: Props): null | React.Node => {
  const forceUpdate = useForceUpdate();
  const instance = instances[0];

  const scrollViewRef = React.useRef<?ScrollViewInterface>(null);
  /**
   * TODO: multiple instances support for variables list. Expected behavior should be:
   * - if instances of different objects, do not show
   * - if instances of same object, show only variables in common (inherited variables
   * obviously plus instance-wise variables with same name).
   */
  const shouldDisplayVariablesList = instances.length === 1;

  // $FlowFixMe[missing-local-annot]
  const onScrollY = React.useCallback(deltaY => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollBy(deltaY);
    }
  }, []);

  const scrollKey = instances
    .map((instance: gdInitialInstance) => '' + instance.ptr)
    .join(';');

  const persistedScrollId = React.useMemo(
    () => {
      if (!instances.length || !scrollKey) return null;

      const selectedObjectForScroll = getObjectByName(
        globalObjectsContainer,
        objectsContainer,
        instances[0].getObjectName()
      );

      return selectedObjectForScroll
        ? selectedObjectForScroll.getPersistentUuid()
        : null;
    },
    [globalObjectsContainer, instances, scrollKey, objectsContainer]
  );

  const onScroll = usePersistedScrollPosition({
    project,
    scrollViewRef,
    scrollKey,
    persistedScrollId,
    persistedScrollType: 'instances-of-object',
  });

  const { object, instanceSchema, allVisibleBehaviors } = React.useMemo<{|
    object?: gdObject,
    instanceSchema?: Schema,
    allVisibleBehaviors: Array<string>,
  |}>(
    () => {
      if (!instance)
        return {
          object: undefined,
          instanceSchema: undefined,
          allVisibleBehaviors: [],
        };

      const associatedObjectName = instance.getObjectName();
      const object = getObjectByName(
        globalObjectsContainer,
        objectsContainer,
        associatedObjectName
      );
      const properties = instance.getCustomProperties(
        globalObjectsContainer || objectsContainer,
        objectsContainer
      );
      if (!object)
        return {
          object: undefined,
          instanceSchema: undefined,
          allVisibleBehaviors: [],
        };

      const allVisibleBehaviors = object
        .getAllBehaviorNames()
        .toJSArray()
        .map(behaviorName => object.getBehavior(behaviorName))
        .filter(behavior => !behavior.isDefaultBehavior())
        // We don't keep the behaviors directly because they may be destroyed
        // if the object is rebuilt from a serialization.
        .map(behavior => behavior.getName());

      const objectMetadata = gd.MetadataProvider.getObjectMetadata(
        project.getCurrentPlatform(),
        object.getType()
      );
      const is3DInstance = objectMetadata.isRenderedIn3D();
      const hasOpacity = objectMetadata.hasDefaultBehavior(
        'OpacityCapability::OpacityBehavior'
      );
      const canBeFlippedXY = objectMetadata.hasDefaultBehavior(
        'FlippableCapability::FlippableBehavior'
      );
      const canBeFlippedZ = objectMetadata.hasDefaultBehavior(
        'Scene3D::Base3DBehavior'
      );
      const instanceSchemaForCustomProperties = propertiesMapToSchema({
        properties,
        // We can't access default values for instance custom properties.
        defaultValueProperties: null,
        getPropertyValue: (instance: gdInitialInstance, name: string) =>
          instance
            .getCustomProperties(
              globalObjectsContainer || objectsContainer,
              objectsContainer
            )
            .get(name)
            .getValue(),
        onUpdateProperty: (instance: gdInitialInstance, name, value) =>
          instance.updateCustomProperty(
            name,
            value,
            globalObjectsContainer || objectsContainer,
            objectsContainer
          ),
      });

      const reorderedInstanceSchemaForCustomProperties = reorderInstanceSchemaForCustomProperties(
        instanceSchemaForCustomProperties,
        i18n
      );
      const instanceSchema = makeSchema({
        i18n,
        is3DInstance,
        hasOpacity,
        canBeFlippedXY,
        canBeFlippedZ,
        onGetInstanceSize,
        onEditObject: editObjectInPropertiesPanel,
        layersContainer,
        forceUpdate,
      }).concat(reorderedInstanceSchemaForCustomProperties);
      return {
        object,
        instanceSchema,
        allVisibleBehaviors,
      };
    },
    [
      instance,
      globalObjectsContainer,
      objectsContainer,
      project,
      i18n,
      forceUpdate,
      layersContainer,
      onGetInstanceSize,
      editObjectInPropertiesPanel,
    ]
  );

  const [isBehaviorsFolded, setIsBehaviorsFolded] = React.useState(
    object ? !instance.hasAnyOverriddenProperty(object) : true
  );

  const shouldDisplayTileSetVisualizer =
    !!object && object.getType() === 'TileMap::SimpleTileMap';

  React.useEffect(
    () => {
      if (!shouldDisplayTileSetVisualizer) {
        // Reset tile map tile selection if tile set visualizer should
        // not be displayed (an instance that is not a tile map is selected).
        onSelectTileMapTile(null);
      }
      // Reset tile map tile selection if the component is unmounted
      // (Useful when component is unmounted on an Undo user command).
      return () => onSelectTileMapTile(null);
    },
    [shouldDisplayTileSetVisualizer, onSelectTileMapTile]
  );

  React.useEffect(
    () => {
      onSelectTileMapTile(null);
    },
    // Reset tile map tile selection if instance changes.
    [instance.ptr, onSelectTileMapTile]
  );

  if (!object || !instance || !instanceSchema) return null;

  return (
    <ErrorBoundary
      componentTitle={<Trans>Instance properties</Trans>}
      scope="scene-editor-instance-properties"
    >
      <ScrollView
        ref={scrollViewRef}
        autoHideScrollbar
        style={styles.scrollView}
        key={scrollKey}
        onScroll={onScroll}
      >
        <Column expand noMargin id="instance-properties-editor">
          <Column>
            <CompactPropertiesEditor
              unsavedChanges={unsavedChanges}
              schema={instanceSchema}
              instances={instances}
              onInstancesModified={onInstancesModified}
              onRefreshAllFields={noRefreshOfAllFields}
            />
            <Spacer />
          </Column>
          {shouldDisplayTileSetVisualizer && (
            <>
              <Separator />
              <Column>
                <Line alignItems="center" justifyContent="space-between">
                  <Text size="sub-title" noMargin>
                    <Trans>Tilemap painter</Trans>
                  </Text>
                </Line>
                <TileSetVisualizer
                  project={project}
                  objectConfiguration={object.getConfiguration()}
                  tileMapTileSelection={tileMapTileSelection}
                  onSelectTileMapTile={onSelectTileMapTile}
                  showPaintingToolbar
                  allowMultipleSelection={false}
                  onScrollY={onScrollY}
                  allowRectangleSelection
                  interactive
                />
              </Column>
            </>
          )}
          {object && canOverrideBehaviorProperties ? (
            <TopLevelCollapsibleSection
              title={<Trans>Behaviors</Trans>}
              isFolded={isBehaviorsFolded}
              toggleFolded={() => setIsBehaviorsFolded(!isBehaviorsFolded)}
              renderContent={() => (
                <ColumnStackLayout noMargin>
                  {!allVisibleBehaviors.length && (
                    <Text size="body2" align="center" color="secondary">
                      <Trans>
                        There are no{' '}
                        <Link
                          href={behaviorsHelpLink}
                          onClick={() =>
                            Window.openExternalURL(behaviorsHelpLink)
                          }
                        >
                          behaviors
                        </Link>{' '}
                        on this object instance.
                      </Trans>
                    </Text>
                  )}
                  {allVisibleBehaviors.map(behaviorName => {
                    const behavior = object.getBehavior(behaviorName);
                    const behaviorTypeName = behavior.getTypeName();
                    const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
                      gd.JsPlatform.get(),
                      behaviorTypeName
                    );
                    const behaviorOverriding = instance.hasBehaviorOverridingNamed(
                      behaviorName
                    )
                      ? instance.getBehaviorOverriding(behaviorName)
                      : null;
                    const iconUrl = behaviorMetadata.getIconFilename();
                    const CompactBehaviorComponent = CompactBehaviorsEditorService.getEditor(
                      behaviorTypeName
                    );
                    return (
                      <StatefulCollapsibleSubPanel
                        key={behavior.ptr}
                        renderContent={
                          notOverridableBehaviorTypes.includes(
                            behavior.getTypeName()
                          )
                            ? () => (
                                <Column expand>
                                  <EmptyMessage>
                                    <Trans>
                                      This behavior can't be setup per instance.
                                    </Trans>
                                  </EmptyMessage>
                                </Column>
                              )
                            : () => (
                                <CompactBehaviorComponent
                                  project={project}
                                  behaviorMetadata={behaviorMetadata}
                                  behavior={behavior}
                                  behaviorOverriding={behaviorOverriding}
                                  object={object}
                                  initialInstance={instance}
                                  onBehaviorUpdated={() => {
                                    if (
                                      instance.hasBehaviorOverridingNamed(
                                        behaviorName
                                      ) &&
                                      !instance.hasAnyOverriddenPropertyForBehavior(
                                        behavior
                                      )
                                    ) {
                                      instance.removeBehaviorOverriding(
                                        behaviorName
                                      );
                                      // Update the view to stop using
                                      // the removed behavior overriding.
                                      forceUpdate();
                                    }
                                  }}
                                  resourceManagementProps={
                                    resourceManagementProps
                                  }
                                />
                              )
                        }
                        isInitiallyFolded={
                          !instance.hasAnyOverriddenPropertyForBehavior(
                            behavior
                          )
                        }
                        titleIcon={
                          iconUrl ? (
                            <IconContainer
                              src={iconUrl}
                              alt={behaviorMetadata.getFullName()}
                              size={16}
                            />
                          ) : null
                        }
                        title={behavior.getName()}
                      />
                    );
                  })}
                </ColumnStackLayout>
              )}
            />
          ) : null}
          {object && shouldDisplayVariablesList ? (
            <>
              <Separator />
              <Column>
                <Line alignItems="center" justifyContent="space-between">
                  <Text size="sub-title" noMargin>
                    <Trans>Instance Variables</Trans>
                  </Text>
                  <Line alignItems="center" noMargin>
                    <IconButton
                      size="small"
                      onClick={() => {
                        editInstanceVariables(instance);
                      }}
                    >
                      <ShareExternal style={styles.icon} />
                    </IconButton>
                  </Line>
                </Line>
              </Column>
              <VariablesList
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
                directlyStoreValueChangesWhileEditing
                inheritedVariablesContainer={object.getVariables()}
                variablesContainer={instance.getVariables()}
                areObjectVariables
                size="compact"
                onComputeAllVariableNames={() =>
                  object && layout
                    ? EventsRootVariablesFinder.findAllObjectVariables(
                        project.getCurrentPlatform(),
                        project,
                        layout,
                        object.getName()
                      )
                    : []
                }
                historyHandler={historyHandler}
                toolbarIconStyle={styles.icon}
                compactEmptyPlaceholderText={
                  <Trans>There are no variables on this instance.</Trans>
                }
                isListLocked={true}
              />
            </>
          ) : null}
        </Column>
      </ScrollView>
    </ErrorBoundary>
  );
};
