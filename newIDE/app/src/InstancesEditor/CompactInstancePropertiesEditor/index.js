// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import CompactPropertiesEditor, {
  Separator,
} from '../../CompactPropertiesEditor';
import propertiesMapToSchema from '../../CompactPropertiesEditor/PropertiesMapToCompactSchema';
import { type Schema } from '../../CompactPropertiesEditor';
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

const gd: libGDevelop = global.gd;

export const styles = {
  icon: {
    fontSize: 18,
  },
  scrollView: { paddingTop: marginsSize },
};

const noRefreshOfAllFields = () => {
  console.warn(
    "An instance tried to refresh all fields, but the editor doesn't support it."
  );
};

type Props = {|
  project: gdProject,
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
|};

export const CompactInstancePropertiesEditor = ({
  instances,
  i18n,
  project,
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
}: Props) => {
  const forceUpdate = useForceUpdate();
  const variablesListRef = React.useRef<?VariablesListInterface>(null);

  const scrollViewRef = React.useRef<?ScrollViewInterface>(null);
  const instance = instances[0];
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

  const { object, instanceSchema } = React.useMemo<{|
    object?: gdObject,
    instanceSchema?: Schema,
  |}>(
    () => {
      if (!instance) return { object: undefined, instanceSchema: undefined };

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
      if (!object) return { object: undefined, instanceSchema: undefined };

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
        getProperties: (instance: gdInitialInstance) =>
          instance.getCustomProperties(
            globalObjectsContainer || objectsContainer,
            objectsContainer
          ),
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
              />
            </>
          ) : null}
        </Column>
      </ScrollView>
    </ErrorBoundary>
  );
};
