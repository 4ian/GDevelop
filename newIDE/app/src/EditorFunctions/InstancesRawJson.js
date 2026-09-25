// @flow
import { serializeToJSObject } from '../Utils/Serializer';
import getObjectByName from '../Utils/GetObjectByName';

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
type PlannedInstanceChange = {|
  instance: gdInitialInstance,
  instanceId: string,
  rawJson: InstanceRawJson,
  tileMapResize: TileMapResize | null,
|};

export type InstancesRawJsonChangeResult =
  | {| success: true, changes: Array<string> |}
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

const getRawJsonShapeError = (rawJson: any): ?string => {
  if (!isPlainObject(rawJson)) return 'it must be a JSON object';
  const keys = Object.keys(rawJson);
  const missingKeys = RAW_JSON_KEYS.filter(key => !keys.includes(key));
  const unknownKeys = keys.filter(key => !RAW_JSON_KEYS.includes(key));
  if (missingKeys.length > 0 || unknownKeys.length > 0) {
    return `it must have exactly the keys ${RAW_JSON_KEYS.join(', ')}${
      missingKeys.length > 0 ? ` (missing ${missingKeys.join(', ')})` : ''
    }${unknownKeys.length > 0 ? ` (unknown ${unknownKeys.join(', ')})` : ''}`;
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
 * A tile map as the editor paints it: one layer (id 0, the one painted by the
 * editor and changed by the events), tiles from the atlas of the object. Its
 * tile size is not read (the object's is used).
 */
const getTileMapError = (tileMap: any, objectContent: Object): ?string => {
  const { tileSize, columnCount, rowCount } = objectContent;
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
        )}: tiles are -1 (empty) or a tile id of the atlas (0 to ${tilesCount -
          1}, row * columnCount + column), with optional flip bits.`;
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
  instance,
  name,
  value,
  valueType,
}: {|
  object: gdObject,
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
      .join(', ') || 'none'}).`;
  }
  if (name === 'animation') {
    const animationsCount = configuration.getAnimationsCount();
    if (animationsCount === 0) return 'this object has no animations.';
    if (!Number.isInteger(value) || value < 0 || value >= animationsCount) {
      return `the starting animation must be an animation index, from 0 to ${animationsCount -
        1}.`;
    }
  }
  if (name === 'tilemap' && object.getType() === SIMPLE_TILE_MAP_TYPE) {
    let tileMap;
    try {
      tileMap = JSON.parse(String(value));
    } catch (error) {
      return `\`tilemap\` is not valid JSON: ${error.message}`;
    }
    return getTileMapError(
      tileMap,
      serializeToJSObject(configuration).content || {}
    );
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
  instance,
  instanceId,
  rawJson,
}: {|
  project: gdProject,
  object: gdObject,
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
        instance,
        name,
        value,
        valueType,
      });
      if (propertyError) {
        errors.push(propertyError);
      } else if (
        name === 'tilemap' &&
        object.getType() === SIMPLE_TILE_MAP_TYPE
      ) {
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
    : { instance, instanceId, rawJson, tileMapResize };
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

/**
 * Replaces the raw data of instances (see `getInstanceRawJson`). Every change
 * is validated first: on any error, no instance changes.
 */
export const applyInstancesRawJson = ({
  project,
  objectsContainer,
  globalObjectsContainer,
  instances,
  changes,
}: {|
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  instances: Array<gdInitialInstance>,
  changes: Array<any>,
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
      instance,
      instanceId,
      rawJson,
    });
    if (Array.isArray(plannedChange)) errors.push(...plannedChange);
    else plannedChanges.push(plannedChange);
  }
  if (errors.length > 0) {
    return {
      success: false,
      message: errors.slice(0, MAX_LISTED_ERRORS).join(' '),
    };
  }

  const changedInstanceIds = plannedChanges
    .filter(applyInstanceChange)
    .map(({ instanceId }) => `"${instanceId}"`);
  return {
    success: true,
    changes:
      changedInstanceIds.length > 0
        ? [
            `Changed the data of ${
              changedInstanceIds.length
            } instance(s): ${changedInstanceIds.join(', ')}.`,
          ]
        : [],
  };
};
