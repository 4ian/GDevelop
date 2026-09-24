// @flow
import { mapFor } from '../Utils/MapFor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  renameObjectAnimationReferences,
  renameObjectPointReferences,
  getInstancesWithStartingAnimation,
  remapStartingAnimations,
  type ObjectReferencesContext,
} from '../Utils/ObjectAnimationsRefactoring';
import { isObjectOpenedInEditor } from '../ObjectEditor/ObjectsOpenedInEditor';
import { type ResolvedScope } from './Scope';

export type RawObjectChangeResult =
  | {|
      success: true,
      changes: Array<string>,
      warnings: Array<string>,
      haveInstancesChanged: boolean,
    |}
  | {| success: false, message: string |};

type RenameRequest = {|
  oldName: string,
  newName: string,
  index: number | null,
|};

// Names the events use for the origin and center of every frame.
const RESERVED_POINT_NAMES = ['Origin', 'Center'];
const SIMPLE_TILE_MAP_TYPE = 'TileMap::SimpleTileMap';
const MAX_LISTED_ERRORS = 5;

const isPlainObject = (value: any): boolean =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: any): boolean =>
  typeof value === 'number' && Number.isFinite(value);

const failure = (message: string): RawObjectChangeResult => ({
  success: false,
  message,
});

const listNames = (names: Array<string>): string =>
  names.map(name => `"${name}"`).join(', ');

const getOpenedInEditorFailure = (
  objects: Array<gdObject>
): RawObjectChangeResult | null => {
  const openedObject = objects.find(isObjectOpenedInEditor);
  return openedObject
    ? failure(
        `"${openedObject.getName()}" is open in the object editor. Ask the user to close it, then retry.`
      )
    : null;
};

/**
 * The animations of a configuration JSON, where the object type stores them:
 * in `animatable` (custom object), at the top level (Sprite) or in `content`
 * (3D model, Spine).
 */
const getAnimationsJson = (configurationJson: Object): Array<Object> => {
  const candidates = [
    isPlainObject(configurationJson.animatable)
      ? configurationJson.animatable.animations
      : null,
    configurationJson.animations,
    isPlainObject(configurationJson.content)
      ? configurationJson.content.animations
      : null,
  ];
  const animations = candidates.find(candidate => Array.isArray(candidate));
  return animations ? animations.filter(isPlainObject) : [];
};

const getAnimationNames = (configurationJson: Object): Array<string> =>
  getAnimationsJson(configurationJson).map(animation => String(animation.name));

type FrameJson = {| animationName: string, frame: Object |};

/** The frames of the animations made of images (Sprite, custom object). */
const getFramesJson = (configurationJson: Object): Array<FrameJson> =>
  getAnimationsJson(configurationJson).flatMap(animation =>
    (Array.isArray(animation.directions) ? animation.directions : [])
      .filter(isPlainObject)
      .flatMap(direction =>
        (Array.isArray(direction.sprites) ? direction.sprites : [])
          .filter(isPlainObject)
          .map(frame => ({ animationName: String(animation.name), frame }))
      )
  );

const getPointNames = (configurationJson: Object): Set<string> =>
  new Set(
    getFramesJson(configurationJson).flatMap(({ frame }) =>
      Array.isArray(frame.points)
        ? frame.points.filter(isPlainObject).map(point => String(point.name))
        : []
    )
  );

/**
 * Every turn goes the same way, and the turns make exactly one revolution (a
 * star also always turns the same way, but twice).
 */
const isConvexPolygon = (vertices: Array<{ x: number, y: number }>) => {
  let turnSign = 0;
  let totalTurn = 0;
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const c = vertices[(i + 2) % vertices.length];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    const dot = (b.x - a.x) * (c.x - b.x) + (b.y - a.y) * (c.y - b.y);
    totalTurn += Math.atan2(cross, dot);
    if (cross === 0) continue;
    if (turnSign === 0) turnSign = Math.sign(cross);
    else if (Math.sign(cross) !== turnSign) return false;
  }
  return turnSign !== 0 && Math.abs(Math.abs(totalTurn) - 2 * Math.PI) < 1e-6;
};

const isImageResource = (project: gdProject, name: any): boolean => {
  const resourcesManager = project.getResourcesManager();
  return (
    typeof name === 'string' &&
    name !== '' &&
    resourcesManager.hasResource(name) &&
    resourcesManager.getResource(name).getKind() === 'image'
  );
};

/**
 * The frames of a configuration and of its overridden children, as JSON
 * strings: frames written back unchanged are not validated again, so invalid
 * data in a frame only refuses an edit changing that frame.
 */
const getFrameKeys = (configurationJson: Object): Set<string> =>
  new Set(
    [
      configurationJson,
      ...(isPlainObject(configurationJson.childrenContent)
        ? Object.values(configurationJson.childrenContent).filter(isPlainObject)
        : []),
    ].flatMap(json =>
      getFramesJson(json).map(({ frame }) => JSON.stringify(frame))
    )
  );

const getFramesErrors = (
  project: gdProject,
  configurationJson: Object,
  location: string,
  unchangedFrameKeys: Set<string>
): Array<string> =>
  getFramesJson(configurationJson).flatMap(({ animationName, frame }) => {
    if (unchangedFrameKeys.has(JSON.stringify(frame))) return [];
    const frameLabel = `A frame of animation "${animationName}"${location}`;
    const errors = [];
    if (!isImageResource(project, frame.image)) {
      errors.push(
        `${frameLabel} uses "${String(
          frame.image
        )}", which is not an image resource of the project.`
      );
    }
    (Array.isArray(frame.customCollisionMask)
      ? frame.customCollisionMask
      : []
    ).forEach(polygon => {
      if (!Array.isArray(polygon) || polygon.length < 3) {
        errors.push(
          `${frameLabel} has a collision polygon with less than 3 vertices.`
        );
      } else if (!isConvexPolygon(polygon)) {
        errors.push(
          `${frameLabel} has a collision polygon that is not convex (split it into convex polygons).`
        );
      }
    });
    (Array.isArray(frame.points) ? frame.points : []).forEach(point => {
      if (point.name === '' || RESERVED_POINT_NAMES.includes(point.name)) {
        errors.push(
          `${frameLabel} has a point named "${
            point.name
          }": use a non-empty name other than ${listNames(
            RESERVED_POINT_NAMES
          )} (\`originPoint\`/\`centerPoint\` are these).`
        );
      }
    });
    return errors;
  });

/**
 * The JSON parser accepts what the configurations can't store: numbers
 * overflowing to Infinity (`1e999`) and keys shadowing object methods.
 */
const getUnsupportedJsonValuePath = (value: any, path: string): ?string => {
  if (typeof value === 'number') return Number.isFinite(value) ? null : path;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const unsupportedPath = getUnsupportedJsonValuePath(
        value[i],
        `${path}[${i}]`
      );
      if (unsupportedPath) return unsupportedPath;
    }
    return null;
  }
  if (!isPlainObject(value)) return null;
  for (const key of Object.keys(value)) {
    if (key in Object.prototype) return `${path}.${key}`;
    const unsupportedPath = getUnsupportedJsonValuePath(
      value[key],
      `${path}.${key}`
    );
    if (unsupportedPath) return unsupportedPath;
  }
  return null;
};

/**
 * The children and variant of a custom object, checked before the
 * configuration is read by the engine (which would create an unknown child).
 */
const getCustomObjectErrors = (
  project: gdProject,
  objectType: string,
  configurationJson: Object
): Array<string> => {
  if (!project.hasEventsBasedObject(objectType)) return [];
  const eventsBasedObject = project.getEventsBasedObject(objectType);
  const errors = [];
  const { childrenContent, variant } = configurationJson;
  if (childrenContent !== undefined && !isPlainObject(childrenContent)) {
    errors.push('`childrenContent` must be an object.');
  }
  if (isPlainObject(childrenContent)) {
    Object.keys(childrenContent).forEach(childName => {
      if (!eventsBasedObject.getObjects().hasObjectNamed(childName)) {
        errors.push(
          `\`childrenContent\` has "${childName}", which is not a child of "${objectType}".`
        );
      } else if (!isPlainObject(childrenContent[childName])) {
        errors.push(
          `\`childrenContent.${childName}\` must be the configuration of the child.`
        );
      }
    });
  }
  if (
    variant !== undefined &&
    variant !== '' &&
    (typeof variant !== 'string' ||
      !eventsBasedObject.getVariants().hasVariantNamed(variant))
  ) {
    errors.push(
      `\`variant\` must be "" (the default variant) or the name of a variant of "${objectType}".`
    );
  }
  return errors;
};

/**
 * Checks the settings of a simple tile map and, when it has an atlas image,
 * computes its grid from it like its editor does (the grid of the JSON can be
 * stale).
 */
const prepareSimpleTileMapContent = async ({
  project,
  content,
  PixiResourcesLoader,
}: {|
  project: gdProject,
  content: Object,
  PixiResourcesLoader: any,
|}): Promise<Array<string>> => {
  const { tileSize, atlasImage } = content;
  if (!isFiniteNumber(tileSize) || tileSize <= 0) {
    return ['`content.tileSize` must be a positive number.'];
  }
  if (atlasImage !== '') {
    if (!isImageResource(project, atlasImage)) {
      return [
        `\`content.atlasImage\` "${String(
          atlasImage
        )}" is not an image resource of the project.`,
      ];
    }
    try {
      await PixiResourcesLoader.loadTextures(project, [atlasImage]);
    } catch (error) {
      return [`The atlas image "${atlasImage}" could not be loaded.`];
    }
    const texture = PixiResourcesLoader.getPIXITexture(project, atlasImage);
    if (!texture || !texture.valid) {
      return [`The atlas image "${atlasImage}" could not be loaded.`];
    }
    content.columnCount = Math.floor(texture.width / tileSize);
    content.rowCount = Math.floor(texture.height / tileSize);
    if (content.columnCount === 0 || content.rowCount === 0) {
      return [
        `The tile size ${tileSize} is larger than the atlas image (${
          texture.width
        }x${texture.height}).`,
      ];
    }
  }
  const { columnCount, rowCount, tilesWithHitBox } = content;
  if (
    !Number.isInteger(columnCount) ||
    !Number.isInteger(rowCount) ||
    columnCount < 0 ||
    rowCount < 0
  ) {
    return [
      '`content.columnCount` and `content.rowCount` must be non-negative integers.',
    ];
  }
  if (typeof tilesWithHitBox !== 'string') {
    return [
      '`content.tilesWithHitBox` must be a string of tile ids separated by commas.',
    ];
  }
  const tilesCount = columnCount * rowCount;
  const wrongTileIds = tilesWithHitBox
    .split(',')
    .map(tileId => tileId.trim())
    .filter(tileId => tileId !== '')
    .filter(tileId => !/^\d+$/.test(tileId) || Number(tileId) >= tilesCount);
  return wrongTileIds.length > 0
    ? [
        `\`content.tilesWithHitBox\` has ids that are not tiles of the atlas (0 to ${tilesCount -
          1}): ${wrongTileIds.slice(0, MAX_LISTED_ERRORS).join(', ')}.`,
      ]
    : [];
};

/**
 * Animations and points are identified by their names: a raw write can't tell
 * a rename from a removal plus an addition, so it refuses both at once.
 */
const getRemovedAndAddedNamesError = ({
  label,
  renameParameter,
  oldNames,
  newNames,
}: {|
  label: string,
  renameParameter: string,
  oldNames: Array<string>,
  newNames: Array<string>,
|}): string | null => {
  const removedNames = oldNames.filter(name => !newNames.includes(name));
  const addedNames = newNames.filter(name => !oldNames.includes(name));
  return removedNames.length > 0 && addedNames.length > 0
    ? `${label} ${listNames(removedNames)} were removed and ${listNames(
        addedNames
      )} added in the same call: to rename, use \`${renameParameter}\` (it updates the events); otherwise remove and add in separate calls.`
    : null;
};

const areSameNames = (names: Array<string>, otherNames: Array<string>) =>
  names.length === otherNames.length &&
  names.every((name, index) => name === otherNames[index]);

const getAnimationNamesChangeError = ({
  oldNames,
  newNames,
  structureLockedReason,
}: {|
  oldNames: Array<string>,
  newNames: Array<string>,
  structureLockedReason: ?string,
|}): string | null => {
  if (areSameNames(oldNames, newNames)) return null;
  if (structureLockedReason) {
    return `Animation names and order can't change ${structureLockedReason} (only their content).`;
  }
  const areUniqueAndNamed = (names: Array<string>) =>
    names.every(name => name !== '') && new Set(names).size === names.length;
  if (!areUniqueAndNamed(oldNames) || !areUniqueAndNamed(newNames)) {
    return 'To reorder, remove or add animations, every animation must have a unique non-empty name: name them first with `renamed_animations` (use `index` for unnamed or same-named animations).';
  }
  return getRemovedAndAddedNamesError({
    label: 'Animations',
    renameParameter: 'renamed_animations',
    oldNames,
    newNames,
  });
};

const getPointNamesChangeError = ({
  oldNames,
  newNames,
  structureLockedReason,
}: {|
  oldNames: Set<string>,
  newNames: Set<string>,
  structureLockedReason: ?string,
|}): string | null => {
  const oldNamesList = [...oldNames];
  if (
    oldNames.size === newNames.size &&
    oldNamesList.every(name => newNames.has(name))
  ) {
    return null;
  }
  if (structureLockedReason) {
    return `Point names can't change ${structureLockedReason} (only their coordinates).`;
  }
  return getRemovedAndAddedNamesError({
    label: 'Points',
    renameParameter: 'renamed_points',
    oldNames: oldNamesList,
    newNames: [...newNames],
  });
};

const getNamedVariantLockedReason = (resolvedScope: ResolvedScope): ?string =>
  resolvedScope.variant && !resolvedScope.isDefaultVariant
    ? 'in a named variant (the events of the custom object are shared by its variants)'
    : null;

/**
 * The configuration of a child as the custom object uses it: its override, or
 * the child of the variant of the custom object (or of the default variant).
 */
const getChildConfigurationJson = (
  project: gdProject,
  objectType: string,
  configurationJson: Object,
  childName: string
): Object => {
  const { childrenContent, variant } = configurationJson;
  if (
    isPlainObject(childrenContent) &&
    isPlainObject(childrenContent[childName])
  ) {
    return childrenContent[childName];
  }
  const eventsBasedObject = project.getEventsBasedObject(objectType);
  const variants = eventsBasedObject.getVariants();
  const variantChildren =
    typeof variant === 'string' && variants.hasVariantNamed(variant)
      ? variants.getVariant(variant).getObjects()
      : null;
  const children =
    variantChildren && variantChildren.hasObjectNamed(childName)
      ? variantChildren
      : eventsBasedObject.getObjects();
  return serializeToJSObject(children.getObject(childName).getConfiguration());
};

/** Overridden children: their names are read by the shared events. */
const getChildrenContentNamesErrors = ({
  project,
  objectType,
  currentJson,
  savedJson,
}: {|
  project: gdProject,
  objectType: string,
  currentJson: Object,
  savedJson: Object,
|}): Array<string> => {
  if (
    !project.hasEventsBasedObject(objectType) ||
    !isPlainObject(savedJson.childrenContent)
  ) {
    return [];
  }
  return Object.keys(savedJson.childrenContent).flatMap(childName => {
    const childJson = getChildConfigurationJson(
      project,
      objectType,
      currentJson,
      childName
    );
    const savedChildJson = savedJson.childrenContent[childName];
    const structureLockedReason = `in \`childrenContent.${childName}\` (the events of the custom object use the child's names)`;
    const nestedOverridesError =
      JSON.stringify(savedChildJson.childrenContent) !==
      JSON.stringify(childJson.childrenContent)
        ? `\`childrenContent.${childName}.childrenContent\` can't change here: change the configuration of the child custom object itself.`
        : null;
    return [
      nestedOverridesError,
      getAnimationNamesChangeError({
        oldNames: getAnimationNames(childJson),
        newNames: getAnimationNames(savedChildJson),
        structureLockedReason,
      }),
      getPointNamesChangeError({
        oldNames: getPointNames(childJson),
        newNames: getPointNames(savedChildJson),
        structureLockedReason,
      }),
    ].filter(Boolean);
  });
};

/** The keys of a JSON (top level and `content`) absent from another one. */
const getKeysAbsentFrom = (json: Object, otherJson: Object): Array<string> => {
  const absentKeys = Object.keys(json).filter(key => !(key in otherJson));
  if (isPlainObject(json.content)) {
    const otherContent = isPlainObject(otherJson.content)
      ? otherJson.content
      : {};
    absentKeys.push(
      ...Object.keys(json.content)
        .filter(key => !(key in otherContent))
        .map(key => `content.${key}`)
    );
  }
  return absentKeys;
};

const getValueKind = (value: mixed): string => {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
};

/** The values the engine kept with another type than the one written. */
const getChangedTypePaths = (
  json: any,
  savedJson: any,
  path: string
): Array<string> => {
  if (getValueKind(json) !== getValueKind(savedJson)) {
    return [
      `${path} (written as ${getValueKind(json)}, kept as ${getValueKind(
        savedJson
      )})`,
    ];
  }
  if (Array.isArray(json)) {
    return json.flatMap((item, index) =>
      index < savedJson.length
        ? getChangedTypePaths(item, savedJson[index], `${path}[${index}]`)
        : []
    );
  }
  if (isPlainObject(json)) {
    return Object.keys(json)
      .filter(key => key in savedJson)
      .flatMap(key =>
        getChangedTypePaths(
          json[key],
          savedJson[key],
          path ? `${path}.${key}` : key
        )
      );
  }
  return [];
};

const makeReferencesContext = (
  project: gdProject,
  resolvedScope: ResolvedScope,
  object: gdObject
): ObjectReferencesContext => ({
  project,
  object,
  layout: resolvedScope.layout,
  eventsFunctionsExtension: resolvedScope.eventsFunctionsExtension,
  eventsBasedObject: resolvedScope.eventsBasedObject,
});

/**
 * Replaces the configuration of an object by a complete configuration JSON
 * (as returned by `inspect_object_properties_effects` with `include_raw_json`).
 * The JSON is read by the engine into a copy first; what the engine kept is
 * what is validated and committed. On any error, nothing changes.
 */
export const applyRawObjectConfiguration = async ({
  project,
  resolvedScope,
  object,
  rawJson,
  PixiResourcesLoader,
}: {|
  project: gdProject,
  resolvedScope: ResolvedScope,
  object: gdObject,
  rawJson: string,
  PixiResourcesLoader: any,
|}): Promise<RawObjectChangeResult> => {
  const objectName = object.getName();
  const objectType = object.getType();
  let configurationJson;
  try {
    configurationJson = JSON.parse(rawJson);
  } catch (error) {
    return failure(`\`raw_json\` is not valid JSON: ${error.message}`);
  }
  if (!isPlainObject(configurationJson)) {
    return failure('`raw_json` must be a JSON object.');
  }
  const unsupportedValuePath = getUnsupportedJsonValuePath(
    configurationJson,
    'raw_json'
  );
  if (unsupportedValuePath) {
    return failure(
      `\`${unsupportedValuePath}\` can't be stored (a number too large, or a reserved key).`
    );
  }
  const missingKeys = getKeysAbsentFrom(
    serializeToJSObject(object.getConfiguration()),
    configurationJson
  );
  if (missingKeys.length > 0) {
    return failure(
      `\`raw_json\` must be the complete configuration of "${objectName}" (read it with \`include_raw_json\` and edit it): missing ${missingKeys.join(
        ', '
      )}.`
    );
  }
  const errors = getCustomObjectErrors(project, objectType, configurationJson);
  if (
    objectType === SIMPLE_TILE_MAP_TYPE &&
    isPlainObject(configurationJson.content)
  ) {
    errors.push(
      ...(await prepareSimpleTileMapContent({
        project,
        content: configurationJson.content,
        PixiResourcesLoader,
      }))
    );
  }
  if (errors.length > 0) {
    return failure(errors.slice(0, MAX_LISTED_ERRORS).join(' '));
  }

  // From here, everything is synchronous: nothing else can change the object
  // between its validation and the commit.
  const openedInEditorFailure = getOpenedInEditorFailure([object]);
  if (openedInEditorFailure) return openedInEditorFailure;
  const configuration = object.getConfiguration();
  const currentJson = serializeToJSObject(configuration);

  const stagedConfiguration = configuration.clone().release();
  let savedJson;
  try {
    unserializeFromJSObject(
      stagedConfiguration,
      configurationJson,
      'unserializeFrom',
      project
    );
    savedJson = serializeToJSObject(stagedConfiguration);
  } catch (error) {
    return failure(`\`raw_json\` could not be read: ${error.message}`);
  } finally {
    stagedConfiguration.delete();
  }

  const structureLockedReason = getNamedVariantLockedReason(resolvedScope);
  const oldAnimationNames = getAnimationNames(currentJson);
  const newAnimationNames = getAnimationNames(savedJson);
  const oldPointNames = getPointNames(currentJson);
  const newPointNames = getPointNames(savedJson);
  const { childrenContent } = savedJson;
  // A child overridden for the first time starts from the child it overrides.
  const unchangedFrameKeys = new Set([
    ...getFrameKeys(currentJson),
    ...(isPlainObject(childrenContent) &&
    project.hasEventsBasedObject(objectType)
      ? Object.keys(childrenContent).flatMap(childName => [
          ...getFrameKeys(
            getChildConfigurationJson(
              project,
              objectType,
              currentJson,
              childName
            )
          ),
        ])
      : []),
  ]);
  const validationErrors = [
    ...getFramesErrors(project, savedJson, '', unchangedFrameKeys),
    ...(isPlainObject(childrenContent)
      ? Object.keys(childrenContent).flatMap(childName =>
          getFramesErrors(
            project,
            childrenContent[childName],
            ` of child "${childName}"`,
            unchangedFrameKeys
          )
        )
      : []),
    getAnimationNamesChangeError({
      oldNames: oldAnimationNames,
      newNames: newAnimationNames,
      structureLockedReason,
    }),
    getPointNamesChangeError({
      oldNames: oldPointNames,
      newNames: newPointNames,
      structureLockedReason,
    }),
    ...getChildrenContentNamesErrors({
      project,
      objectType,
      currentJson,
      savedJson,
    }),
  ].filter(Boolean);
  if (validationErrors.length > 0) {
    return failure(validationErrors.slice(0, MAX_LISTED_ERRORS).join(' '));
  }

  const warnings = [];
  const ignoredKeys = getKeysAbsentFrom(configurationJson, savedJson);
  if (ignoredKeys.length > 0) {
    warnings.push(
      `Ignored keys: ${ignoredKeys.join(
        ', '
      )} (unknown for this object type, or equal to their default).`
    );
  }
  if (isPlainObject(childrenContent)) {
    const writtenChildrenContent = isPlainObject(
      configurationJson.childrenContent
    )
      ? configurationJson.childrenContent
      : {};
    const keptOverrides = Object.keys(childrenContent).filter(
      childName => !(childName in writtenChildrenContent)
    );
    if (keptOverrides.length > 0) {
      warnings.push(
        `The overrides of ${listNames(
          keptOverrides
        )} in \`childrenContent\` are kept: they can't be removed.`
      );
    }
  }
  const changedTypePaths = getChangedTypePaths(
    configurationJson,
    savedJson,
    ''
  );
  if (changedTypePaths.length > 0) {
    warnings.push(
      `Values kept with another type: ${changedTypePaths
        .slice(0, MAX_LISTED_ERRORS)
        .join(', ')}.`
    );
  }
  if (JSON.stringify(savedJson) === JSON.stringify(currentJson)) {
    return {
      success: true,
      changes: [],
      warnings,
      haveInstancesChanged: false,
    };
  }

  const areAnimationsReordered = !areSameNames(
    oldAnimationNames,
    newAnimationNames
  );
  const instancesWithStartingAnimation = areAnimationsReordered
    ? getInstancesWithStartingAnimation(
        makeReferencesContext(project, resolvedScope, object),
        resolvedScope.variant
      )
    : [];
  unserializeFromJSObject(configuration, savedJson, 'unserializeFrom', project);

  const changes = [`Replaced the configuration of "${objectName}".`];
  const removedAnimationNames = oldAnimationNames.filter(
    name => !newAnimationNames.includes(name)
  );
  if (removedAnimationNames.length > 0) {
    warnings.push(
      `Removed animations ${listNames(
        removedAnimationNames
      )}: events referring to them were not changed.`
    );
  }
  const removedPointNames = [...oldPointNames].filter(
    name => !newPointNames.has(name)
  );
  if (removedPointNames.length > 0) {
    warnings.push(
      `Removed points ${listNames(
        removedPointNames
      )}: events referring to them were not changed.`
    );
  }
  if (!areAnimationsReordered) {
    return { success: true, changes, warnings, haveInstancesChanged: false };
  }
  const {
    remappedInstancesCount,
    resetInstancesCount,
  } = remapStartingAnimations(
    instancesWithStartingAnimation,
    oldAnimationNames,
    newAnimationNames
  );
  if (remappedInstancesCount > 0) {
    changes.push(
      `${remappedInstancesCount} instance(s) keep their starting animation at its new position.`
    );
  }
  if (resetInstancesCount > 0) {
    warnings.push(
      `${resetInstancesCount} instance(s) started with a removed animation and now start with the first one.`
    );
  }
  if (
    oldAnimationNames.some((name, index) => newAnimationNames[index] !== name)
  ) {
    warnings.push(
      'Events using animation numbers instead of names were not changed.'
    );
  }
  return {
    success: true,
    changes,
    warnings,
    haveInstancesChanged: remappedInstancesCount + resetInstancesCount > 0,
  };
};

const parseRenameRequests = (
  items: Array<any>,
  withIndex: boolean
): Array<RenameRequest> | null => {
  const requests = [];
  for (const item of items) {
    if (
      !isPlainObject(item) ||
      typeof item.old_name !== 'string' ||
      typeof item.new_name !== 'string' ||
      (item.index !== undefined &&
        item.index !== null &&
        (!withIndex || !Number.isInteger(item.index)))
    ) {
      return null;
    }
    requests.push({
      oldName: item.old_name,
      newName: item.new_name,
      index: typeof item.index === 'number' ? item.index : null,
    });
  }
  return requests;
};

const getRenameRequestsError = (
  label: string,
  requests: Array<RenameRequest>
): ?string => {
  const oldNames = requests.map(request => request.oldName);
  for (const { oldName, newName } of requests) {
    if (newName === '') return `A new ${label} name must not be empty.`;
    if (newName === oldName) return `"${oldName}" is renamed to itself.`;
    if (oldNames.includes(newName)) {
      return `"${newName}" is both renamed and a new name in the same call: rename in separate calls (through a temporary name for a swap).`;
    }
  }
  return null;
};

type PlannedAnimationRename = {|
  index: number,
  oldName: string,
  newName: string,
  // Only a unique, non-empty name can be referred to by events.
  hasReferences: boolean,
|};

const planAnimationRenames = (
  animationNames: Array<string>,
  requests: Array<RenameRequest>
): Array<PlannedAnimationRename> | string => {
  const planned = [];
  for (const { oldName, newName, index } of requests) {
    let animationIndex = index;
    if (animationIndex === null) {
      const matchingIndexes = animationNames
        .map((name, i) => (name === oldName ? i : -1))
        .filter(i => i !== -1);
      if (matchingIndexes.length !== 1) {
        return matchingIndexes.length === 0
          ? `No animation is named "${oldName}" (animations: ${listNames(
              animationNames
            )}).`
          : `Several animations are named "${oldName}": pass the \`index\` of the one to rename.`;
      }
      animationIndex = matchingIndexes[0];
    } else if (animationNames[animationIndex] !== oldName) {
      return `The animation at index ${animationIndex} is not named "${oldName}" (animations: ${listNames(
        animationNames
      )}).`;
    }
    if (planned.some(rename => rename.index === animationIndex)) {
      return `The animation at index ${animationIndex} is renamed twice.`;
    }
    planned.push({
      index: animationIndex,
      oldName,
      newName,
      hasReferences:
        oldName !== '' &&
        animationNames.filter(name => name === oldName).length === 1,
    });
  }
  const finalNames = [...animationNames];
  planned.forEach(rename => {
    finalNames[rename.index] = rename.newName;
  });
  const conflictingRename = planned.find(
    rename => finalNames.filter(name => name === rename.newName).length > 1
  );
  return conflictingRename
    ? `Two animations would be named "${conflictingRename.newName}".`
    : planned;
};

const getPointRenamesError = (
  pointNames: Set<string>,
  requests: Array<RenameRequest>
): ?string => {
  const oldNames = requests.map(request => request.oldName);
  const newNames = requests.map(request => request.newName);
  for (const { oldName, newName } of requests) {
    if (!pointNames.has(oldName)) {
      return `No point is named "${oldName}" (points: ${listNames([
        ...pointNames,
      ])}).`;
    }
    if (oldNames.indexOf(oldName) !== oldNames.lastIndexOf(oldName)) {
      return `Point "${oldName}" is renamed twice.`;
    }
    if (RESERVED_POINT_NAMES.includes(newName)) {
      return `A point can't be named "${newName}".`;
    }
    if (
      pointNames.has(newName) ||
      newNames.indexOf(newName) !== newNames.lastIndexOf(newName)
    ) {
      return `Two points would be named "${newName}".`;
    }
  }
  return null;
};

/**
 * A configuration where animations and points are renamed: the object itself,
 * the same child in a variant, or the override of the child in a custom
 * object (`childrenContent`).
 */
type ConfigurationRename = {|
  object: gdObject,
  configuration: gdObjectConfiguration,
  configurationJson: Object,
  // Where the animations are: `configurationJson` or one of its
  // `childrenContent`.
  renamedJson: Object,
  animationRenames: Array<PlannedAnimationRename>,
  pointRenames: Array<RenameRequest>,
|};

const applyConfigurationRename = (
  project: gdProject,
  {
    configuration,
    configurationJson,
    renamedJson,
    animationRenames,
    pointRenames,
  }: ConfigurationRename
) => {
  const animationsJson = getAnimationsJson(renamedJson);
  animationRenames.forEach(({ index, newName }) => {
    animationsJson[index].name = newName;
  });
  getFramesJson(renamedJson).forEach(({ frame }) => {
    (Array.isArray(frame.points) ? frame.points : []).forEach(point => {
      const pointRename = pointRenames.find(
        rename => rename.oldName === point.name
      );
      if (pointRename) point.name = pointRename.newName;
    });
  });
  unserializeFromJSObject(
    configuration,
    configurationJson,
    'unserializeFrom',
    project
  );
};

/**
 * Plans, in another configuration of the same child (the child of a variant,
 * or its override in a custom object), the renames referred to by the shared
 * events. Returns an error for a conflict.
 */
const planSharedChildRename = ({
  label,
  animationRenames,
  pointRenames,
  ...configurationRename
}: {|
  object: gdObject,
  configuration: gdObjectConfiguration,
  configurationJson: Object,
  renamedJson: Object,
  label: string,
  animationRenames: Array<PlannedAnimationRename>,
  pointRenames: Array<RenameRequest>,
|}): ConfigurationRename | string | null => {
  const animationNames = getAnimationNames(configurationRename.renamedJson);
  const pointNames = getPointNames(configurationRename.renamedJson);
  const sharedAnimationRenames = [];
  for (const rename of animationRenames) {
    if (!rename.hasReferences) continue;
    const indexes = animationNames
      .map((name, index) => (name === rename.oldName ? index : -1))
      .filter(index => index !== -1);
    if (indexes.length === 0) continue;
    if (indexes.length > 1 || animationNames.includes(rename.newName)) {
      return `${label} has several animations named "${
        rename.oldName
      }", or one already named "${rename.newName}".`;
    }
    sharedAnimationRenames.push({ ...rename, index: indexes[0] });
  }
  const sharedPointRenames = pointRenames.filter(rename =>
    pointNames.has(rename.oldName)
  );
  const conflictingPointRename = sharedPointRenames.find(rename =>
    pointNames.has(rename.newName)
  );
  if (conflictingPointRename) {
    return `${label} already has a point named "${
      conflictingPointRename.newName
    }".`;
  }
  return sharedAnimationRenames.length > 0 || sharedPointRenames.length > 0
    ? {
        ...configurationRename,
        animationRenames: sharedAnimationRenames,
        pointRenames: sharedPointRenames,
      }
    : null;
};

/** Every object of the project: global, of scenes and of custom objects. */
const getAllObjects = (project: gdProject): Array<gdObject> => {
  const objectsContainers = [
    project.getObjects(),
    ...mapFor(0, project.getLayoutsCount(), i =>
      project.getLayoutAt(i).getObjects()
    ),
  ];
  mapFor(0, project.getEventsFunctionsExtensionsCount(), i => {
    const eventsBasedObjects = project
      .getEventsFunctionsExtensionAt(i)
      .getEventsBasedObjects();
    mapFor(0, eventsBasedObjects.getCount(), j => {
      const eventsBasedObject = eventsBasedObjects.getAt(j);
      const variants = eventsBasedObject.getVariants();
      objectsContainers.push(
        eventsBasedObject.getObjects(),
        ...mapFor(0, variants.getVariantsCount(), k =>
          variants.getVariantAt(k).getObjects()
        )
      );
    });
  });
  return objectsContainers.flatMap(objectsContainer =>
    mapFor(0, objectsContainer.getObjectsCount(), i =>
      objectsContainer.getObjectAt(i)
    )
  );
};

/**
 * The events of a custom object are shared by its variants and read the
 * overrides of its children: the renames of a child of the default variant
 * are also applied to the same child in every variant and in its overrides.
 */
const planSharedChildRenames = ({
  project,
  eventsFunctionsExtension,
  eventsBasedObject,
  childName,
  animationRenames,
  pointRenames,
}: {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  childName: string,
  animationRenames: Array<PlannedAnimationRename>,
  pointRenames: Array<RenameRequest>,
|}): Array<ConfigurationRename> | string => {
  const candidates = [];
  const variants = eventsBasedObject.getVariants();
  mapFor(0, variants.getVariantsCount(), i => {
    const variant = variants.getVariantAt(i);
    if (!variant.getObjects().hasObjectNamed(childName)) return;
    const object = variant.getObjects().getObject(childName);
    const configurationJson = serializeToJSObject(object.getConfiguration());
    candidates.push({
      object,
      configurationJson,
      renamedJson: configurationJson,
      label: `The child "${childName}" of variant "${variant.getName()}"`,
    });
  });
  const customObjectType = `${eventsFunctionsExtension.getName()}::${eventsBasedObject.getName()}`;
  getAllObjects(project)
    .filter(object => object.getType() === customObjectType)
    .forEach(object => {
      const configurationJson = serializeToJSObject(object.getConfiguration());
      const { childrenContent } = configurationJson;
      if (
        isPlainObject(childrenContent) &&
        isPlainObject(childrenContent[childName])
      ) {
        candidates.push({
          object,
          configurationJson,
          renamedJson: childrenContent[childName],
          label: `The override of child "${childName}" in "${object.getName()}"`,
        });
      }
    });

  const plannedRenames = [];
  for (const { object, configurationJson, renamedJson, label } of candidates) {
    const plannedRename = planSharedChildRename({
      object,
      configuration: object.getConfiguration(),
      configurationJson,
      renamedJson,
      label,
      animationRenames,
      pointRenames,
    });
    if (typeof plannedRename === 'string') return plannedRename;
    if (plannedRename) plannedRenames.push(plannedRename);
  }
  return plannedRenames;
};

/**
 * Renames animations (keeping their index) and points (in every frame), and
 * updates the events referring to them. Everything is validated first.
 */
export const renameObjectAnimationsAndPoints = ({
  project,
  resolvedScope,
  object,
  renamedAnimations,
  renamedPoints,
}: {|
  project: gdProject,
  resolvedScope: ResolvedScope,
  object: gdObject,
  renamedAnimations: Array<any>,
  renamedPoints: Array<any>,
|}): RawObjectChangeResult => {
  const objectName = object.getName();
  const structureLockedReason = getNamedVariantLockedReason(resolvedScope);
  if (structureLockedReason) {
    return failure(
      `Animations and points can't be renamed ${structureLockedReason}: rename them on the default variant.`
    );
  }
  const animationRequests = parseRenameRequests(renamedAnimations, true);
  const pointRequests = parseRenameRequests(renamedPoints, false);
  if (!animationRequests || !pointRequests) {
    return failure(
      'Each rename must be {old_name, new_name} with strings (and an optional integer `index` for animations).'
    );
  }

  const configuration = object.getConfiguration();
  const configurationJson = serializeToJSObject(configuration);
  const animationNames = getAnimationNames(configurationJson);
  if (animationRequests.length > 0 && animationNames.length === 0) {
    return failure(`"${objectName}" has no animations to rename.`);
  }
  if (
    pointRequests.length > 0 &&
    getFramesJson(configurationJson).length === 0
  ) {
    return failure(
      `"${objectName}" has no points to rename (only Sprites and custom objects with animations have points).`
    );
  }
  const requestsError =
    getRenameRequestsError('animation', animationRequests) ||
    getRenameRequestsError('point', pointRequests) ||
    getPointRenamesError(getPointNames(configurationJson), pointRequests);
  if (requestsError) return failure(requestsError);
  const animationRenames = planAnimationRenames(
    animationNames,
    animationRequests
  );
  if (typeof animationRenames === 'string') return failure(animationRenames);

  const { eventsFunctionsExtension, eventsBasedObject } = resolvedScope;
  const sharedChildRenames =
    eventsFunctionsExtension && eventsBasedObject
      ? planSharedChildRenames({
          project,
          eventsFunctionsExtension,
          eventsBasedObject,
          childName: objectName,
          animationRenames,
          pointRenames: pointRequests,
        })
      : [];
  if (typeof sharedChildRenames === 'string') {
    return failure(sharedChildRenames);
  }
  const configurationRenames = [
    {
      object,
      configuration,
      configurationJson,
      renamedJson: configurationJson,
      animationRenames,
      pointRenames: pointRequests,
    },
    ...sharedChildRenames,
  ];
  const openedInEditorFailure = getOpenedInEditorFailure(
    configurationRenames.map(configurationRename => configurationRename.object)
  );
  if (openedInEditorFailure) return openedInEditorFailure;

  configurationRenames.forEach(configurationRename =>
    applyConfigurationRename(project, configurationRename)
  );
  const referencesContext = makeReferencesContext(
    project,
    resolvedScope,
    object
  );
  const changes = [];
  const warnings = [];
  animationRenames.forEach(({ oldName, newName, hasReferences, index }) => {
    if (hasReferences) {
      renameObjectAnimationReferences(referencesContext, oldName, newName);
      changes.push(
        `Renamed animation "${oldName}" to "${newName}" (events updated).`
      );
    } else {
      changes.push(`Named the animation at index ${index} "${newName}".`);
      if (oldName !== '') {
        warnings.push(
          `Several animations were named "${oldName}": events referring to "${oldName}" were not changed.`
        );
      }
    }
  });
  pointRequests.forEach(({ oldName, newName }) => {
    renameObjectPointReferences(referencesContext, oldName, newName);
    changes.push(
      `Renamed point "${oldName}" to "${newName}" (events updated).`
    );
  });
  if (sharedChildRenames.length > 0) {
    changes.push(
      `Also renamed in ${
        sharedChildRenames.length
      } variant(s) or override(s) of the child "${objectName}".`
    );
  }
  return { success: true, changes, warnings, haveInstancesChanged: false };
};

/** The size of each image used by the frames, for points and collision masks. */
export const getFrameImageSizes = async (
  project: gdProject,
  configurationJson: Object,
  PixiResourcesLoader: any
): Promise<{
  [imageName: string]: {| width: number, height: number |},
} | null> => {
  const imageNames = [
    ...new Set(
      getFramesJson(configurationJson)
        .map(({ frame }) => frame.image)
        .filter(imageName => isImageResource(project, imageName))
    ),
  ];
  if (imageNames.length === 0) return null;
  try {
    await PixiResourcesLoader.loadTextures(project, imageNames);
  } catch (error) {
    return null;
  }
  const frameImageSizes = {};
  imageNames.forEach(imageName => {
    const texture = PixiResourcesLoader.getPIXITexture(project, imageName);
    if (texture && texture.valid) {
      frameImageSizes[imageName] = {
        width: texture.width,
        height: texture.height,
      };
    }
  });
  return frameImageSizes;
};

export const getRawJsonNote = (
  object: gdObject,
  configurationJson: Object
): string => {
  const usage = `\`rawJson\` is the configuration of "${object.getName()}" (not its name, behaviors, variables or effects): edit it and pass it complete, as a string, in \`raw_json\` of \`change_object_properties_effects\`.`;
  if (getFramesJson(configurationJson).length > 0) {
    return `${usage} Frame coordinates are in image pixels (\`frameImageSizes\`); a custom collision mask needs \`hasCustomCollisionMask: true\` and \`adaptCollisionMaskAutomatically: false\`, with convex polygons. Rename animations or points with \`renamed_animations\`/\`renamed_points\` (they update the events).`;
  }
  if (object.getType() === 'Sprite') {
    return `${usage} An animation is \`{ name, directions: [{ looping, timeBetweenFrames, sprites: [{ image }] }] }\`, \`image\` being the name of an image resource (the other fields of a frame get their default values).`;
  }
  if (object.getType() === SIMPLE_TILE_MAP_TYPE) {
    return `${usage} \`tilesWithHitBox\` lists the ids (row * columnCount + column in the atlas) of the tiles with a full-tile hit box. The painted tiles are stored on each instance (\`describe_instances\` with \`include_raw_json\`).`;
  }
  if (getAnimationsJson(configurationJson).length > 0) {
    return `${usage} Rename animations with \`renamed_animations\` (it updates the events).`;
  }
  return usage;
};
