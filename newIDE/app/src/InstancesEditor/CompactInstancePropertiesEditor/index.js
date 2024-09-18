// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import Paper from '../../UI/Paper';
import EmptyMessage from '../../UI/EmptyMessage';
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
import ScrollView from '../../UI/ScrollView';
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
} from './CompactPropertiesSchema';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import TileSetVisualizer, {
  type TileMapTileSelection,
} from '../TileSetVisualizer';

export const styles = {
  paper: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
  },
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

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  layout?: ?gdLayout,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  layersContainer: gdLayersContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  instances: Array<gdInitialInstance>,
  onEditObjectByName: string => void,
  onInstancesModified?: (Array<gdInitialInstance>) => void,
  onGetInstanceSize: gdInitialInstance => [number, number, number],
  editInstanceVariables: gdInitialInstance => void,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,
  historyHandler?: HistoryHandler,
  tileMapTileSelection: ?TileMapTileSelection,
  onSelectTileMapTile: (?TileMapTileSelection) => void,
|};

export type CompactInstancePropertiesEditorInterface = {|
  forceUpdate: () => void,
|};

const CompactInstancePropertiesEditor = ({
  instances,
  i18n,
  project,
  layout,
  objectsContainer,
  globalObjectsContainer,
  layersContainer,
  unsavedChanges,
  historyHandler,
  onEditObjectByName,
  onGetInstanceSize,
  editInstanceVariables,
  onInstancesModified,
  projectScopedContainersAccessor,
  tileMapTileSelection,
  onSelectTileMapTile,
}: Props) => {
  const forceUpdate = useForceUpdate();

  const instance = instances[0];
  /**
   * TODO: multiple instances support for variables list. Expected behavior should be:
   * - if instances of different objects, do not show
   * - if instances of same object, show only variables in common (inherited variables
   * obviously plus instance-wise variables with same name).
   */
  const shouldDisplayVariablesList = instances.length === 1;

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
      const instanceSchemaForCustomProperties = propertiesMapToSchema(
        properties,
        (instance: gdInitialInstance) =>
          instance.getCustomProperties(
            globalObjectsContainer || objectsContainer,
            objectsContainer
          ),
        (instance: gdInitialInstance, name, value) =>
          instance.updateCustomProperty(
            name,
            value,
            globalObjectsContainer || objectsContainer,
            objectsContainer
          )
      );

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
        onEditObjectByName,
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
      onEditObjectByName,
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
              <Column>
                <Separator />
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
                  allowRectangleSelection
                  interactive
                />
              </Column>
            </>
          )}
          {object && shouldDisplayVariablesList ? (
            <>
              <Column>
                <Separator />
                <Line alignItems="center" justifyContent="space-between">
                  <Text size="sub-title" noMargin>
                    <Trans>Instance Variables</Trans>
                  </Text>
                  <IconButton
                    size="small"
                    onClick={() => {
                      editInstanceVariables(instance);
                    }}
                  >
                    <ShareExternal style={styles.icon} />
                  </IconButton>
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
                size="small"
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
              />
            </>
          ) : null}
        </Column>
      </ScrollView>
    </ErrorBoundary>
  );
};

const CompactInstancePropertiesEditorContainer = React.forwardRef<
  Props,
  CompactInstancePropertiesEditorInterface
>((props, ref) => {
  const forceUpdate = useForceUpdate();
  React.useImperativeHandle(ref, () => ({
    forceUpdate,
  }));

  return (
    <Paper background="dark" square style={styles.paper}>
      {!props.instances || !props.instances.length ? (
        <EmptyMessage>
          <Trans>
            Click on an instance in the scene to display its properties
          </Trans>
        </EmptyMessage>
      ) : (
        <CompactInstancePropertiesEditor {...props} />
      )}
    </Paper>
  );
});

export default CompactInstancePropertiesEditorContainer;
