// @flow
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import getObjectByName from '../Utils/GetObjectByName';
import { isObjectOpenedInEditor } from '../ObjectEditor/ObjectsOpenedInEditor';
import {
  loadSimpleTileMapAtlasGrid,
  type AtlasGrid,
} from './SimpleTileMapAtlasGrid';

const gd: libGDevelop = global.gd;

const SIMPLE_TILE_MAP_TYPE = 'TileMap::SimpleTileMap';
const RAW_JSON_KEYS = [
  'numberProperties',
  'stringProperties',
  'flippedX',
  'flippedY',
  'flippedZ',
];
const TILE_MAP_KEYS = ['tileWidth', 'tileHeight', 'dimX', 'dimY', 'layers'];
const TILE_MAP_LAYER_KEYS = ['id', 'alpha', 'tiles'];
// The top bits of a tile of a tile map are its flips (`TileMapHelper`).
const TILE_ID_MASK = 0x1fffffff;
// The length of the instance ids given by `describe_instances`.
const INSTANCE_ID_LENGTH = 10;
const MAX_LISTED_ERRORS = 5;

type NamedValue<T> = {| name: string, value: T |};
type InstanceRawJson = {|
  numberProperties: Array<NamedValue<number>>,
  stringProperties: Array<NamedValue<string>>,
  flippedX: boolean,
  flippedY: boolean,
  flippedZ: boolean,
|};
type TileMapDimensions = {| dimX: number, dimY: number |};
type TileMapResize = {|
  oldDimensions: TileMapDimensions | null,
  newDimensions: TileMapDimensions,
|};
type TileMapAtlas = {|
  tileSize: number,
  grid: AtlasGrid,
  storedGrid: AtlasGrid,
|};
type PlannedInstanceChange = {|
  object: gdObject,
  instance: gdInitialInstance,
  instanceId: string,
  rawJson: InstanceRawJson,
  tileMapResize: TileMapResize | null,
|};

export type InstancesRawJsonChangeResult =
  | {| success: true, changes: Array<string>, haveObjectsChanged: boolean |}
  | {| success: false, message: string |};

const isPlainObject = (value: any): boolean =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPositiveInteger = (value: any): boolean =>
  Number.isInteger(value) && value > 0;

const isPositiveNumber = (value: any): boolean =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

/**
 * The data of an instance that `put_2d_instances`/`put_3d_instances` don't
 * set: its custom properties (starting animation, tile map, text input
 * values...) and flips.
 */
export const getInstanceRawJson = (
  instance: gdInitialInstance
): InstanceRawJson => {
  const serializedInstance = serializeToJSObject(instance);
  return {
    numberProperties: serializedInstance.numberProperties || [],
    stringProperties: serializedInstance.stringProperties || [],
    flippedX: instance.isFlippedX(),
    flippedY: instance.isFlippedY(),
    flippedZ: instance.isFlippedZ(),
  };
};

const getNamedValuesError = (
  values: any,
  key: string,
  valueType: 'number' | 'string'
): ?string => {
  if (
    !Array.isArray(values) ||
    !values.every(
      item =>
        isPlainObject(item) &&
        Object.keys(item).length === 2 &&
        typeof item.name === 'string' &&
        (valueType === 'number'
          ? typeof item.value === 'number' && Number.isFinite(item.value)
          : typeof item.value === 'string')
    )
  ) {
    return `\`${key}\` must be a list of {name, value} with ${valueType} values`;
  }
  const names = values.map(item => item.name);
  const duplicatedName = names.find(
    (name, index) => names.indexOf(name) !== index
  );
  return duplicatedName !== undefined
    ? `\`${key}\` has "${duplicatedName}" twice`
    : null;
};

// Keys an agent may try to set here, while they are set by `put_2d_instances`
// and `put_3d_instances`.
const PLACEMENT_KEY_REGEX = /^(x|y|z|angle|rotation[XYZ]?|width|height|depth|scale[XYZ]?|keepRatio|customSize|layer|zOrder|opacity|hidden)$/;
const PLACEMENT_HINT =
  'The position, size, angle, rotation, layer, Z order and visibility of instances are set with `put_2d_instances`/`put_3d_instances`, their opacity with `put_2d_instances`';

const getRawJsonShapeError = (rawJson: any): ?string => {
  if (!isPlainObject(rawJson)) return 'it must be a JSON object';
  const keys = Object.keys(rawJson);
  const missingKeys = RAW_JSON_KEYS.filter(key => !keys.includes(key));
  const unknownKeys = keys.filter(key => !RAW_JSON_KEYS.includes(key));
  if (missingKeys.length > 0 || unknownKeys.length > 0) {
    const hasPlacementKeys = unknownKeys.some(key =>
      PLACEMENT_KEY_REGEX.test(key)
    );
    return `it must have exactly the keys ${RAW_JSON_KEYS.join(', ')}${
      missingKeys.length > 0 ? ` (missing ${missingKeys.join(', ')})` : ''
    }${unknownKeys.length > 0 ? ` (unknown ${unknownKeys.join(', ')})` : ''}${
      unknownKeys.includes('animation')
        ? '. The starting animation is the `animation` number property, in `numberProperties`'
        : ''
    }${hasPlacementKeys ? `. ${PLACEMENT_HINT}` : ''}`;
  }
  if (
    typeof rawJson.flippedX !== 'boolean' ||
    typeof rawJson.flippedY !== 'boolean' ||
    typeof rawJson.flippedZ !== 'boolean'
  ) {
    return '`flippedX`, `flippedY` and `flippedZ` must be booleans';
  }
  return (
    getNamedValuesError(
      rawJson.numberProperties,
      'numberProperties',
      'number'
    ) ||
    getNamedValuesError(rawJson.stringProperties, 'stringProperties', 'string')
  );
};

/** The dimensions of a tile map JSON, or null if it has none (never painted). */
const getTileMapDimensions = (
  tileMapJson: string
): TileMapDimensions | null => {
  try {
    const tileMap = JSON.parse(tileMapJson);
    return isPlainObject(tileMap) &&
      isPositiveInteger(tileMap.dimX) &&
      isPositiveInteger(tileMap.dimY)
      ? { dimX: tileMap.dimX, dimY: tileMap.dimY }
      : null;
  } catch (error) {
    return null;
  }
};

/**
 * The tile size and grid of the atlas of a simple tile map: the grid is
 * computed from the atlas image when it loads, else the stored one is used.
 */
const loadTileMapAtlas = async (
  project: gdProject,
  object: gdObject,
  PixiResourcesLoader: any
): Promise<TileMapAtlas> => {
  const { tileSize, columnCount, rowCount, atlasImage } =
    serializeToJSObject(object.getConfiguration()).content || {};
  const storedGrid = { columnCount, rowCount };
  const resourcesManager = project.getResourcesManager();
  if (
    !isPositiveNumber(tileSize) ||
    typeof atlasImage !== 'string' ||
    !resourcesManager.hasResource(atlasImage) ||
    resourcesManager.getResource(atlasImage).getKind() !== 'image'
  ) {
    return { tileSize, grid: storedGrid, storedGrid };
  }
  const atlasGrid = await loadSimpleTileMapAtlasGrid({
    project,
    atlasImage,
    tileSize,
    PixiResourcesLoader,
  });
  return {
    tileSize,
    grid: atlasGrid.success ? atlasGrid.grid : storedGrid,
    storedGrid,
  };
};

const isStoredGridOutdated = ({ grid, storedGrid }: TileMapAtlas): boolean =>
  grid.columnCount !== storedGrid.columnCount ||
  grid.rowCount !== storedGrid.rowCount;

/**
 * A tile map as the editor paints it: one layer (id 0, the one painted by the
 * editor and changed by the events), tiles from the atlas of the object. Its
 * tile size is not read (the object's is used).
 */
const getTileMapError = (tileMap: any, atlas: TileMapAtlas): ?string => {
  const {
    tileSize,
    grid: { columnCount, rowCount },
  } = atlas;
  const tilesCount = columnCount * rowCount;
  if (!isPositiveNumber(tileSize) || !isPositiveInteger(tilesCount)) {
    return 'the tile map object has no atlas grid: set its `atlasImage` and `tileSize` first (`change_object_properties_effects` with `raw_json`).';
  }
  if (!isPlainObject(tileMap)) return '`tilemap` must be a JSON object.';
  const unknownKeys = Object.keys(tileMap).filter(
    key => !TILE_MAP_KEYS.includes(key)
  );
  if (unknownKeys.length > 0) {
    return `\`tilemap\` has unknown keys: ${unknownKeys.join(', ')}.`;
  }
  const { tileWidth, tileHeight, dimX, dimY, layers } = tileMap;
  if (!isPositiveNumber(tileWidth) || !isPositiveNumber(tileHeight)) {
    return '`tilemap` `tileWidth` and `tileHeight` must be positive numbers.';
  }
  if (!isPositiveInteger(dimX) || !isPositiveInteger(dimY)) {
    return '`tilemap` `dimX` and `dimY` must be positive integers.';
  }
  const layer = Array.isArray(layers) && layers.length === 1 ? layers[0] : null;
  if (
    !layer ||
    !isPlainObject(layer) ||
    Object.keys(layer).some(key => !TILE_MAP_LAYER_KEYS.includes(key)) ||
    layer.id !== 0 ||
    typeof layer.alpha !== 'number' ||
    !(layer.alpha >= 0 && layer.alpha <= 1) ||
    !Array.isArray(layer.tiles) ||
    layer.tiles.length !== dimY ||
    !layer.tiles.every(row => Array.isArray(row) && row.length === dimX)
  ) {
    return `\`tilemap\` \`layers\` must be one layer {id: 0, alpha (0 to 1), tiles}, with \`tiles\` being ${dimY} rows of ${dimX} tiles.`;
  }
  for (const row of layer.tiles) {
    for (const tile of row) {
      // -1 is an empty cell: checked before reading the id without the flips,
      // which would turn it into a tile id.
      if (tile === -1) continue;
      // A tile is 32 bits: the editor stores the flipped ones signed.
      if (
        !Number.isInteger(tile) ||
        tile < -0x80000000 ||
        tile > 0xffffffff ||
        (tile & TILE_ID_MASK) >= tilesCount
      ) {
        return `\`tilemap\` has the tile ${String(
          tile
        )}: tiles are -1 (empty) or a tile id of the atlas of ${columnCount} columns and ${rowCount} rows (0 to ${tilesCount -
          1}, row * ${columnCount} + column), with optional flip bits.`;
      }
    }
  }
  return null;
};

/**
 * The error of a property added or changed on an instance: it must be declared
 * by its object with this type, and hold a value the object can use.
 */
const getPropertyValueError = ({
  object,
  tileMapAtlas,
  instance,
  name,
  value,
  valueType,
}: {|
  object: gdObject,
  tileMapAtlas: TileMapAtlas | null,
  instance: gdInitialInstance,
  name: string,
  value: number | string,
  valueType: 'number' | 'string',
|}): ?string => {
  const configuration = object.getConfiguration();
  const supportedProperties = configuration.getInitialInstanceProperties(
    instance
  );
  const propertyType = supportedProperties.has(name)
    ? supportedProperties
        .get(name)
        .getType()
        .toLowerCase()
    : null;
  if (
    propertyType === null ||
    (propertyType === 'number') !== (valueType === 'number')
  ) {
    return `"${name}" is not a ${valueType} property of this object (properties: ${supportedProperties
      .keys()
      .toJSArray()
      .join(', ') || 'none'}).${
      PLACEMENT_KEY_REGEX.test(name)
        ? ` ${PLACEMENT_HINT}.`
        : propertyType === null
        ? ' Instance variables are set with `add_or_edit_variable` (`variable_scope: "instance"`).'
        : ''
    }`;
  }
  if (name === 'animation') {
    const animationsCount = configuration.getAnimationsCount();
    if (animationsCount === 0) return 'this object has no animations.';
    if (!Number.isInteger(value) || value < 0 || value >= animationsCount) {
      return `the starting animation must be an animation index, from 0 to ${animationsCount -
        1}.`;
    }
  }
  if (name === 'tilemap' && tileMapAtlas) {
    let tileMap;
    try {
      tileMap = JSON.parse(String(value));
    } catch (error) {
      return `\`tilemap\` is not valid JSON: ${error.message}`;
    }
    return getTileMapError(tileMap, tileMapAtlas);
  }
  return null;
};

/** The flips offered by the instance panel of the editor. */
const getFlipsError = (
  project: gdProject,
  object: gdObject,
  currentRawJson: InstanceRawJson,
  rawJson: InstanceRawJson
): ?string => {
  const objectMetadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    object.getType()
  );
  const isFlippable = objectMetadata.hasDefaultBehavior(
    'FlippableCapability::FlippableBehavior'
  );
  const isFlipAdded = (key: 'flippedX' | 'flippedY' | 'flippedZ') =>
    rawJson[key] && !currentRawJson[key];
  if ((isFlipAdded('flippedX') || isFlipAdded('flippedY')) && !isFlippable) {
    return 'this object has no flip (`flippedX`/`flippedY`).';
  }
  if (
    isFlipAdded('flippedZ') &&
    !(
      isFlippable &&
      objectMetadata.hasDefaultBehavior('Scene3D::Base3DBehavior')
    )
  ) {
    return '`flippedZ` is only for flippable 3D objects.';
  }
  return null;
};

const planInstanceChange = ({
  project,
  object,
  tileMapAtlas,
  instance,
  instanceId,
  rawJson,
}: {|
  project: gdProject,
  object: gdObject,
  tileMapAtlas: TileMapAtlas | null,
  instance: gdInitialInstance,
  instanceId: string,
  rawJson: InstanceRawJson,
|}): PlannedInstanceChange | Array<string> => {
  const currentRawJson = getInstanceRawJson(instance);
  const errors = [];
  let tileMapResize = null;
  const propertyLists: Array<{|
    key: string,
    valueType: 'number' | 'string',
    currentValues: $ReadOnlyArray<{ +name: string, +value: number | string }>,
    newValues: $ReadOnlyArray<{ +name: string, +value: number | string }>,
  |}> = [
    {
      key: 'numberProperties',
      valueType: 'number',
      currentValues: currentRawJson.numberProperties,
      newValues: rawJson.numberProperties,
    },
    {
      key: 'stringProperties',
      valueType: 'string',
      currentValues: currentRawJson.stringProperties,
      newValues: rawJson.stringProperties,
    },
  ];
  propertyLists.forEach(({ key, valueType, currentValues, newValues }) => {
    currentValues.forEach(({ name }) => {
      if (!newValues.some(newValue => newValue.name === name)) {
        errors.push(`\`${key}\` "${name}" can't be removed.`);
      }
    });
    newValues.forEach(({ name, value }) => {
      const currentValue = currentValues.find(
        currentValue => currentValue.name === name
      );
      if (currentValue && currentValue.value === value) return;
      const propertyError = getPropertyValueError({
        object,
        tileMapAtlas,
        instance,
        name,
        value,
        valueType,
      });
      if (propertyError) {
        errors.push(propertyError);
      } else if (name === 'tilemap' && tileMapAtlas) {
        const { dimX, dimY } = JSON.parse(String(value));
        tileMapResize = {
          oldDimensions: currentValue
            ? getTileMapDimensions(String(currentValue.value))
            : null,
          newDimensions: { dimX, dimY },
        };
      }
    });
  });
  const flipsError = getFlipsError(project, object, currentRawJson, rawJson);
  if (flipsError) errors.push(flipsError);
  return errors.length > 0
    ? errors.map(
        error =>
          `Instance "${instanceId}" (object "${object.getName()}"): ${error}`
      )
    : { object, instance, instanceId, rawJson, tileMapResize };
};

/**
 * A tile map instance with a custom size keeps its scale when its grid
 * changes, and its position (the top-left corner of an unrotated map). A map
 * painted for the first time takes the size of its grid.
 */
const resizeTileMapInstance = (
  instance: gdInitialInstance,
  { oldDimensions, newDimensions }: TileMapResize
) => {
  if (!instance.hasCustomSize()) return;
  if (!oldDimensions) {
    instance.setHasCustomSize(false);
    return;
  }
  instance.setCustomWidth(
    (instance.getCustomWidth() * newDimensions.dimX) / oldDimensions.dimX
  );
  instance.setCustomHeight(
    (instance.getCustomHeight() * newDimensions.dimY) / oldDimensions.dimY
  );
};

/**
 * Stores the grid computed from the atlas image in the object, as the object
 * editor does when the image loads: the game draws only the tiles of the
 * stored grid.
 */
const updateStoredAtlasGrid = (
  project: gdProject,
  object: gdObject,
  { grid: { columnCount, rowCount }, storedGrid }: TileMapAtlas
): string => {
  const configuration = object.getConfiguration();
  const configurationJson = serializeToJSObject(configuration);
  const { tilesWithHitBox } = configurationJson.content;
  const lastTileId = columnCount * rowCount - 1;
  unserializeFromJSObject(
    configuration,
    {
      ...configurationJson,
      content: {
        ...configurationJson.content,
        columnCount,
        rowCount,
        tilesWithHitBox: String(tilesWithHitBox || '')
          .split(',')
          .filter(
            tileId => tileId.trim() !== '' && Number(tileId) <= lastTileId
          )
          .join(','),
      },
    },
    'unserializeFrom',
    project
  );
  return `Updated the atlas grid of "${object.getName()}" from ${String(
    storedGrid.columnCount
  )}x${String(
    storedGrid.rowCount
  )} to ${columnCount} columns and ${rowCount} rows, as computed from its atlas image: the tiles already painted on its instances are read with it too (tile id = row * ${columnCount} + column).`;
};

/** Applies a planned change, returning whether the instance changed. */
const applyInstanceChange = ({
  instance,
  rawJson,
  tileMapResize,
}: PlannedInstanceChange): boolean => {
  const serializedInstance = JSON.stringify(serializeToJSObject(instance));
  rawJson.numberProperties.forEach(({ name, value }) =>
    instance.setRawDoubleProperty(name, value)
  );
  rawJson.stringProperties.forEach(({ name, value }) =>
    instance.setRawStringProperty(name, value)
  );
  instance.setFlippedX(rawJson.flippedX);
  instance.setFlippedY(rawJson.flippedY);
  instance.setFlippedZ(rawJson.flippedZ);
  if (tileMapResize) resizeTileMapInstance(instance, tileMapResize);
  return JSON.stringify(serializeToJSObject(instance)) !== serializedInstance;
};

/** The objects of the instances that `changes` target. */
export const getChangedInstancesObjectNames = (
  instances: Array<gdInitialInstance>,
  changes: Array<any>
): Array<string> => {
  const instanceIds = changes
    .filter(
      change =>
        isPlainObject(change) &&
        typeof change.instance_id === 'string' &&
        change.instance_id.length >= INSTANCE_ID_LENGTH
    )
    .map(change => change.instance_id);
  return instances
    .filter(instance =>
      instanceIds.some(instanceId =>
        instance.getPersistentUuid().startsWith(instanceId)
      )
    )
    .map(instance => instance.getObjectName());
};

export const loadTileMapAtlases = async ({
  project,
  objectsContainer,
  globalObjectsContainer,
  objectNames,
  PixiResourcesLoader,
}: {|
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  objectNames: Array<string>,
  PixiResourcesLoader: any,
|}): Promise<Map<string, TileMapAtlas>> => {
  const tileMapAtlases: Map<string, TileMapAtlas> = new Map();
  for (const objectName of new Set(objectNames)) {
    const object = getObjectByName(
      globalObjectsContainer,
      objectsContainer,
      objectName
    );
    if (object && object.getType() === SIMPLE_TILE_MAP_TYPE) {
      tileMapAtlases.set(
        objectName,
        await loadTileMapAtlas(project, object, PixiResourcesLoader)
      );
    }
  }
  return tileMapAtlases;
};

/**
 * Replaces the raw data of instances (see `getInstanceRawJson`). Every change
 * is validated first: on any error, no instance changes. The tile map atlases
 * are loaded before (`loadTileMapAtlases`), so that nothing else can change
 * the instances between their validation and the commit.
 */
export const applyInstancesRawJson = ({
  project,
  objectsContainer,
  globalObjectsContainer,
  instances,
  changes,
  tileMapAtlases,
}: {|
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  instances: Array<gdInitialInstance>,
  changes: Array<any>,
  tileMapAtlases: Map<string, TileMapAtlas>,
|}): InstancesRawJsonChangeResult => {
  const changedInstanceUuids: Array<string> = [];
  const plannedChanges = [];
  const errors = [];
  for (const change of changes) {
    if (
      !isPlainObject(change) ||
      typeof change.instance_id !== 'string' ||
      typeof change.raw_json !== 'string'
    ) {
      return {
        success: false,
        message:
          'Each change must be {instance_id, raw_json}, with `raw_json` being a string: pass `JSON.stringify(rawJson)`.',
      };
    }
    const instanceId = change.instance_id;
    const matchingInstances =
      instanceId.length >= INSTANCE_ID_LENGTH
        ? instances.filter(instance =>
            instance.getPersistentUuid().startsWith(instanceId)
          )
        : [];
    if (matchingInstances.length !== 1) {
      errors.push(
        matchingInstances.length === 0
          ? `No instance has the id "${instanceId}" (use the \`id\` of the instance in \`describe_instances\`).`
          : `Several instances start with the id "${instanceId}": use their full id.`
      );
      continue;
    }
    const instance = matchingInstances[0];
    if (changedInstanceUuids.includes(instance.getPersistentUuid())) {
      return {
        success: false,
        message: `Instance "${instanceId}" is changed twice.`,
      };
    }
    changedInstanceUuids.push(instance.getPersistentUuid());
    const object = getObjectByName(
      globalObjectsContainer,
      objectsContainer,
      instance.getObjectName()
    );
    if (!object) {
      errors.push(
        `Instance "${instanceId}" has no object "${instance.getObjectName()}".`
      );
      continue;
    }
    let rawJson;
    try {
      rawJson = JSON.parse(change.raw_json);
    } catch (error) {
      errors.push(
        `The \`raw_json\` of instance "${instanceId}" is not valid JSON: ${
          error.message
        }`
      );
      continue;
    }
    const shapeError = getRawJsonShapeError(rawJson);
    if (shapeError) {
      errors.push(
        `The \`raw_json\` of instance "${instanceId}" is not a \`rawJson\` of \`describe_instances\`: ${shapeError}.`
      );
      continue;
    }
    const plannedChange = planInstanceChange({
      project,
      object,
      tileMapAtlas:
        object.getType() === SIMPLE_TILE_MAP_TYPE
          ? tileMapAtlases.get(object.getName()) || null
          : null,
      instance,
      instanceId,
      rawJson,
    });
    if (Array.isArray(plannedChange)) errors.push(...plannedChange);
    else plannedChanges.push(plannedChange);
  }
  const outdatedGridObjects = [
    ...new Map(
      plannedChanges
        .filter(({ tileMapResize }) => tileMapResize)
        .map(({ object }) => [object.getName(), object])
    ).values(),
  ].filter(object => {
    const tileMapAtlas = tileMapAtlases.get(object.getName());
    return tileMapAtlas && isStoredGridOutdated(tileMapAtlas);
  });
  outdatedGridObjects.filter(isObjectOpenedInEditor).forEach(object => {
    errors.push(
      `"${object.getName()}" is open in the object editor, which will update its atlas grid: ask the user to close it, then retry.`
    );
  });
  if (errors.length > 0) {
    return {
      success: false,
      message: errors.slice(0, MAX_LISTED_ERRORS).join(' '),
    };
  }

  const changedInstanceIds = plannedChanges
    .filter(applyInstanceChange)
    .map(({ instanceId }) => `"${instanceId}"`);
  const gridChanges = outdatedGridObjects.map(object => {
    const tileMapAtlas = tileMapAtlases.get(object.getName());
    return tileMapAtlas
      ? updateStoredAtlasGrid(project, object, tileMapAtlas)
      : '';
  });
  return {
    success: true,
    changes: [
      ...(changedInstanceIds.length > 0
        ? [
            `Changed the data of ${
              changedInstanceIds.length
            } instance(s): ${changedInstanceIds.join(', ')}.`,
          ]
        : []),
      ...gridChanges,
    ],
    haveObjectsChanged: gridChanges.length > 0,
  };
};
