// @flow

import * as React from 'react';
import type { EditorProps } from './EditorProps.flow';
import ScrollView from '../../UI/ScrollView';
import { ColumnStackLayout } from '../../UI/Layout';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import { Trans } from '@lingui/macro';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { PropertyResourceSelector } from './PropertyFields';
import TileMapPainter, {
  getGridCoordinatesFromTileId,
  getTileIdFromGridCoordinates,
} from '../../InstancesEditor/TileMapPainter';
import type { TileMapTileSelection } from '../../InstancesEditor/TileMapPainter';

const SimpleTileMapEditor = ({
  objectConfiguration,
  project,
  layout,
  object,
  onSizeUpdated,
  onObjectUpdated,
  resourceManagementProps,
  renderObjectNameField,
}: EditorProps) => {
  const forceUpdate = useForceUpdate();
  const objectProperties = objectConfiguration.getProperties();
  const tileSize = parseFloat(objectProperties.get('tileSize').getValue());
  const rowCount = parseFloat(objectProperties.get('rowCount').getValue());
  const atlasImage = objectProperties.get('atlasImage').getValue();
  const tilesWithHitBox = objectProperties
    .get('tilesWithHitBox')
    .getValue()
    .split(',')
    .filter(value => !!value)
    .map(idAsString =>
      getGridCoordinatesFromTileId({ id: parseInt(idAsString, 10), rowCount })
    );

  const tileMapTileSelection = {
    kind: 'multiple',
    coordinates: tilesWithHitBox,
  };

  const setTileSize = React.useCallback(
    (value: number) => {
      if (!value) {
        return;
      }
      // TODO: Load atlas image and use dimensions to compute row and column counts.
      objectConfiguration.updateProperty('tileSize', value.toString());
      forceUpdate();
    },
    [forceUpdate, objectConfiguration]
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
            getTileIdFromGridCoordinates({ ...coordinates, rowCount })
          )
          .join(',')
      );
      forceUpdate();
    },
    [rowCount, objectConfiguration, forceUpdate]
  );

  const onChangeAtlasImage = React.useCallback(
    () => {
      // TODO: Load image and use dimensions to compute row and column counts.
      forceUpdate();
    },
    [forceUpdate]
  );

  return (
    <ScrollView>
      <ColumnStackLayout noMargin>
        {!!renderObjectNameField && renderObjectNameField()}
        <SemiControlledTextField
          floatingLabelFixed
          floatingLabelText={<Trans>Scaling factor</Trans>}
          onChange={value => setTileSize(parseInt(value, 10) || 0)}
          value={tileSize.toString()}
        />
        <PropertyResourceSelector
          objectConfiguration={objectConfiguration}
          propertyName="atlasImage"
          project={project}
          resourceManagementProps={resourceManagementProps}
          onChange={onChangeAtlasImage}
        />
        {atlasImage && (
          <div style={{ maxWidth: 400 }}>
            <TileMapPainter
              project={project}
              objectConfiguration={objectConfiguration}
              tileMapTileSelection={tileMapTileSelection}
              onSelectTileMapTile={onChangeTilesWithHitBox}
              showPaintingToolbar={false}
              allowMultipleSelection
            />
          </div>
        )}
      </ColumnStackLayout>
    </ScrollView>
  );
};

export default SimpleTileMapEditor;
