// @flow

import * as React from 'react';
import type { EditorProps } from './EditorProps.flow';
import ScrollView from '../../UI/ScrollView';
import { ColumnStackLayout } from '../../UI/Layout';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import { Trans } from '@lingui/macro';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { PropertyResourceSelector } from './PropertyFields';
import TileSetVisualizer, {
  getGridCoordinatesFromTileId,
  getTileIdFromGridCoordinates,
} from '../../InstancesEditor/TileSetVisualizer';
import type { TileMapTileSelection } from '../../InstancesEditor/TileSetVisualizer';
import { Column, Line } from '../../UI/Grid';
import AlertMessage from '../../UI/AlertMessage';
import Text from '../../UI/Text';

const SimpleTileMapEditor = ({
  objectConfiguration,
  project,
  layout,
  object,
  onObjectUpdated,
  onSizeUpdated,
  resourceManagementProps,
  renderObjectNameField,
}: EditorProps) => {
  const forceUpdate = useForceUpdate();
  const objectProperties = objectConfiguration.getProperties();
  const tileSize = parseFloat(objectProperties.get('tileSize').getValue());
  const rowCount = parseFloat(objectProperties.get('rowCount').getValue());
  const columnCount = parseFloat(
    objectProperties.get('columnCount').getValue()
  );
  const [error, setError] = React.useState<React.Node>(null);
  const atlasImage = objectProperties.get('atlasImage').getValue();
  const previousAtlasImageResourceName = React.useRef<string>(atlasImage);
  const tilesWithHitBox = objectProperties
    .get('tilesWithHitBox')
    .getValue()
    .split(',')
    .filter(value => !!value)
    .map(idAsString => parseInt(idAsString, 10));
  const tilesWithHitBoxCoordinates = tilesWithHitBox.map(id =>
    getGridCoordinatesFromTileId({ id, columnCount })
  );
  const [
    loadedAtlasImageDimensions,
    setLoadedAtlasImageDimensions,
  ] = React.useState<?{|
    width: number,
    height: number,
  |}>(null);

  const tileMapTileSelection = {
    kind: 'multiple',
    coordinates: tilesWithHitBoxCoordinates,
  };

  const recomputeTileSet = React.useCallback(
    (
      dimensions: {|
        width: number,
        height: number,
      |},
      tileSize: number
    ) => {
      const newRowCount = dimensions.height / tileSize;
      const newColumnCount = dimensions.width / tileSize;

      if (rowCount === newRowCount && columnCount === newColumnCount) {
        return;
      }
      objectConfiguration.updateProperty('rowCount', newRowCount.toString());
      objectConfiguration.updateProperty(
        'columnCount',
        newColumnCount.toString()
      );
      const newMaxId = newColumnCount * newRowCount - 1;
      objectConfiguration.updateProperty(
        'tilesWithHitBox',
        tilesWithHitBox.filter(tileId => tileId <= newMaxId).join(',')
      );
    },
    [columnCount, rowCount, objectConfiguration, tilesWithHitBox]
  );

  const setTileSize = React.useCallback(
    (value: number) => {
      if (!value) {
        return;
      }
      setError(null);
      objectConfiguration.updateProperty('tileSize', value.toString());
      if (loadedAtlasImageDimensions) {
        recomputeTileSet(loadedAtlasImageDimensions, value);
      }
      if (onObjectUpdated) onObjectUpdated();
      forceUpdate();
    },
    [
      forceUpdate,
      objectConfiguration,
      recomputeTileSet,
      loadedAtlasImageDimensions,
      onObjectUpdated,
    ]
  );

  const onChangeTilesWithHitBox = React.useCallback(
    (tileMapTileSelection: ?TileMapTileSelection) => {
      if (!tileMapTileSelection || tileMapTileSelection.kind !== 'multiple') {
        return;
      }
      objectConfiguration.updateProperty(
        'tilesWithHitBox',
        tileMapTileSelection.coordinates
          .map(coordinates =>
            getTileIdFromGridCoordinates({ ...coordinates, columnCount })
          )
          .join(',')
      );
      if (onObjectUpdated) onObjectUpdated();
      forceUpdate();
    },
    [columnCount, objectConfiguration, forceUpdate, onObjectUpdated]
  );

  const onChangeAtlasImage = React.useCallback(
    () => {
      if (onObjectUpdated) onObjectUpdated();
      onSizeUpdated();
      forceUpdate();
    },
    [forceUpdate, onObjectUpdated, onSizeUpdated]
  );

  React.useEffect(
    () => {
      if (!loadedAtlasImageDimensions) return;
      const _rowCount = loadedAtlasImageDimensions.height / tileSize;
      const _columnCount = loadedAtlasImageDimensions.width / tileSize;
      if (!Number.isInteger(_rowCount) || !Number.isInteger(_columnCount)) {
        setError(
          <Trans>
            The new atlas image size is not compatible with the tile size.
          </Trans>
        );
      }
    },
    [tileSize, loadedAtlasImageDimensions]
  );

  const onAtlasImageLoaded = React.useCallback(
    (e: SyntheticEvent<HTMLImageElement>, atlasResourceName: string) => {
      setError(null);
      const newDimensions = {
        width: e.currentTarget.naturalWidth,
        height: e.currentTarget.naturalHeight,
      };
      setLoadedAtlasImageDimensions(newDimensions);
      if (previousAtlasImageResourceName.current === atlasResourceName) {
        // The resource did not change, do nothing.
        return;
      }
      previousAtlasImageResourceName.current = atlasResourceName;

      recomputeTileSet(newDimensions, tileSize);
    },
    [tileSize, recomputeTileSet]
  );

  return (
    <ScrollView>
      <ColumnStackLayout noMargin>
        {!!renderObjectNameField && renderObjectNameField()}
        {/* TODO: Should this be a Select field with all possible values given the atlas image size? */}
        <SemiControlledTextField
          floatingLabelFixed
          floatingLabelText={<Trans>Tile size</Trans>}
          onChange={value => setTileSize(Math.max(parseInt(value, 10) || 0, 0))}
          value={tileSize.toString()}
        />
        <PropertyResourceSelector
          objectConfiguration={objectConfiguration}
          propertyName="atlasImage"
          project={project}
          resourceManagementProps={resourceManagementProps}
          onChange={onChangeAtlasImage}
        />
        {error && <AlertMessage kind="error">{error}</AlertMessage>}
        {atlasImage && (
          <>
            <Line>
              <Column noMargin>
                <Text noMargin size="sub-title">
                  <Trans>Configure tile’s hit boxes</Trans>
                </Text>
                <Text noMargin>
                  <Trans>
                    Click on the tilemap grid to activate or deactivate hit
                    boxes.
                  </Trans>
                </Text>
              </Column>
            </Line>
            <TileSetVisualizer
              project={project}
              objectConfiguration={objectConfiguration}
              tileMapTileSelection={tileMapTileSelection}
              onSelectTileMapTile={onChangeTilesWithHitBox}
              showPaintingToolbar={false}
              allowMultipleSelection
              onAtlasImageLoaded={onAtlasImageLoaded}
              interactive={true}
            />
          </>
        )}
      </ColumnStackLayout>
    </ScrollView>
  );
};

export default SimpleTileMapEditor;
