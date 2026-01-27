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
  type VariablesListInterface,
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
import Add from '../../UI/CustomSvgIcons/Add';
import {
  TopLevelCollapsibleSection,
  CollapsibleSubPanel,
  type TitleBarButton,
} from '../../ObjectEditor/CompactObjectPropertiesEditor';
import { ColumnStackLayout } from '../../UI/Layout';
import Link from '../../UI/Link';
import { CompactBehaviorPropertiesEditor } from '../../ObjectEditor/CompactObjectPropertiesEditor/CompactBehaviorPropertiesEditor';
import { IconContainer } from '../../UI/IconContainer';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { type ObjectEditorTab } from '../../ObjectEditor/ObjectEditorDialog';

const gd: libGDevelop = global.gd;

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
  toggleFolded,
  title,
  titleIcon,
  titleBarButtons,
}: {|
  renderContent: () => React.Node,
  isInitiallyFolded: boolean,
  toggleFolded: () => void,
  titleIcon?: ?React.Node,
  title: string,
  titleBarButtons?: Array<TitleBarButton>,
|}) => {
  const [isFolded, setIsFolded] = React.useState(isInitiallyFolded);

  const onToggleFolded = React.useCallback(
    () => {
      setIsFolded(isFolded => !isFolded);
      toggleFolded();
    },
    [toggleFolded]
  );

  return (
    <CollapsibleSubPanel
      renderContent={renderContent}
      isFolded={isFolded}
      toggleFolded={onToggleFolded}
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
  onEditObject: (object: gdObject, initialTab: ?ObjectEditorTab) => void,
  onInstancesModified?: (Array<gdInitialInstance>) => void,
  onGetInstanceSize: gdInitialInstance => [number, number, number],
  editInstanceVariables: gdInitialInstance => void,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,
  historyHandler?: HistoryHandler,
  tileMapTileSelection: ?TileMapTileSelection,
  onSelectTileMapTile: (?TileMapTileSelection) => void,
  isVariableListLocked: boolean,
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
  onEditObject,
  onGetInstanceSize,
  editInstanceVariables,
  onInstancesModified,
  projectScopedContainersAccessor,
  tileMapTileSelection,
  onSelectTileMapTile,
  isVariableListLocked,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const instance = instances[0];
  const variablesListRef = React.useRef<?VariablesListInterface>(null);

  const scrollViewRef = React.useRef<?ScrollViewInterface>(null);
  /**
   * TODO: multiple instances support for variables list. Expected behavior should be:
   * - if instances of different objects, do not show
   * - if instances of same object, show only variables in common (inherited variables
   * obviously plus instance-wise variables with same name).
   */
  const shouldDisplayVariablesList = instances.length === 1;

  const onScrollY = React.useCallback(deltaY => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollBy(deltaY);
    }
  }, []);

  const { object, instanceSchema, allVisibleBehaviors } = React.useMemo<{|
    object?: gdObject,
    instanceSchema?: Schema,
    allVisibleBehaviors: Array<gdBehavior>,
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
        .filter(behavior => !behavior.isDefaultBehavior());

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
        key={instances
          .map((instance: gdInitialInstance) => '' + instance.ptr)
          .join(';')}
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
          {object ? (
            <TopLevelCollapsibleSection
              title={<Trans>Behaviors</Trans>}
              isFolded={isBehaviorsFolded}
              toggleFolded={() => setIsBehaviorsFolded(!isBehaviorsFolded)}
              onOpenFullEditor={() => onEditObject(object, 'behaviors')}
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
                  {allVisibleBehaviors.map(behavior => {
                    const behaviorTypeName = behavior.getTypeName();
                    const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
                      gd.JsPlatform.get(),
                      behaviorTypeName
                    );
                    const behaviorName = behavior.getName();
                    const behaviorOverriding = instance.hasBehaviorOverridingNamed(
                      behaviorName
                    )
                      ? instance.getBehaviorOverriding(behaviorName)
                      : null;

                    const iconUrl = behaviorMetadata.getIconFilename();

                    return (
                      <StatefulCollapsibleSubPanel
                        key={behavior.ptr}
                        renderContent={() => (
                          <CompactBehaviorPropertiesEditor
                            project={project}
                            behaviorMetadata={behaviorMetadata}
                            behavior={behavior}
                            behaviorOverriding={behaviorOverriding}
                            object={object}
                            initialInstance={instance}
                            onBehaviorUpdated={() => {}}
                            resourceManagementProps={resourceManagementProps}
                            onOpenFullEditor={() =>
                              onEditObject(object, 'behaviors')
                            }
                          />
                        )}
                        isInitiallyFolded={
                          !instance.hasAnyOverriddenPropertyForBehavior(
                            behavior
                          )
                        }
                        toggleFolded={() => {
                          behavior.setFolded(!behavior.isFolded());
                          forceUpdate();
                        }}
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
                    {isVariableListLocked ? null : (
                      <IconButton
                        size="small"
                        onClick={
                          variablesListRef.current
                            ? variablesListRef.current.addVariable
                            : undefined
                        }
                      >
                        <Add style={styles.icon} />
                      </IconButton>
                    )}
                  </Line>
                </Line>
              </Column>
              <VariablesList
                ref={variablesListRef}
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
                isListLocked={isVariableListLocked}
              />
            </>
          ) : null}
        </Column>
      </ScrollView>
    </ErrorBoundary>
  );
};
