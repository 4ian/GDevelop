// @flow
import {
  enableInGameEditor,
  raycastInGameEditor,
  updateInGameEditor,
  type InGameEditorEditedLocation,
  type InGameEditorRay,
  type InGameEditorRaycastHit,
} from '../EmbeddedGame/InGameEditorQueries';
import { type ResolvedScope } from './Scope';
import { type EditorCallbacks } from './index';
import { type ObjectSizeInfo } from './Utils';
import { getBoxPointOffset } from './InstanceAnchor';
import getObjectByName from '../Utils/GetObjectByName';
import { SafeExtractor } from '../Utils/SafeExtractor';

/**
 * The up direction of a scene: `z` for most 3D games, `-y` for side view
 * games (in 2D, it is always `-y`).
 */
type SurfaceUp = 'z' | '-y';

/** The surfaces to find, from `drop_to_surface` or `surface_beneath`. */
type SurfaceOptions = {|
  up: SurfaceUp,
  // The only objects that are surfaces, or null for all of them.
  includedObjectNames: Array<string> | null,
  excludedObjectNames: Array<string>,
|};

type SurfacesMode = '3d' | '2d';

// A distance, in pixels, beyond everything shown in a scene: rays start this
// far to find every surface below a position.
const BEYOND_EVERYTHING_DISTANCE = 1000000;

// The in-game editor must answer each message within a second, which it can
// miss while it loads or renders a scene for the first time: rays are sent
// again until it answers.
const RAYS_PER_MESSAGE = 100;
const RAYCAST_TIMEOUT_MS = 20000;
const IN_GAME_EDITOR_READY_TIMEOUT_MS = 20000;
const IN_GAME_EDITOR_POLLING_DELAY_MS = 200;

const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * The object names of a comma separated list of objects or groups.
 */
const getObjectNamesFromList = ({
  list,
  objectsContainer,
  globalObjectsContainer,
}: {|
  list: string,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
|}): {| objectNames: Array<string>, unknownNames: Array<string> |} => {
  const objectNames = [];
  const unknownNames = [];
  list
    .split(',')
    .map(name => name.trim())
    .filter(Boolean)
    .forEach(name => {
      if (getObjectByName(globalObjectsContainer, objectsContainer, name)) {
        objectNames.push(name);
        return;
      }
      const groups = [
        objectsContainer.getObjectGroups(),
        globalObjectsContainer
          ? globalObjectsContainer.getObjectGroups()
          : null,
      ].find(groups => groups && groups.has(name));
      if (!groups) {
        unknownNames.push(name);
        return;
      }
      objectNames.push(
        ...groups
          .get(name)
          .getAllObjectsNames()
          .toJSArray()
      );
    });
  return { objectNames, unknownNames };
};

/**
 * Read `drop_to_surface` or `surface_beneath` from the arguments of a call.
 * @returns `options: null` when the argument is not given.
 */
export const parseSurfaceOptions = ({
  args,
  argumentName,
  isUpAllowed,
  objectsContainer,
  globalObjectsContainer,
}: {|
  args: any,
  argumentName: 'drop_to_surface' | 'surface_beneath',
  // False in 2D, where the up direction is always `-y`.
  isUpAllowed: boolean,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
|}):
  | {| success: true, options: SurfaceOptions | null |}
  | {| success: false, message: string |} => {
  const value = args ? args[argumentName] : undefined;
  if (value === undefined || value === null) {
    return { success: true, options: null };
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    return {
      success: false,
      message: `\`${argumentName}\` must be an object (\`{}\` for the default options).`,
    };
  }

  const requestedUp = SafeExtractor.extractStringProperty(value, 'up');
  let up: SurfaceUp = isUpAllowed ? 'z' : '-y';
  if (requestedUp) {
    if (!isUpAllowed) {
      return {
        success: false,
        message: `\`${argumentName}.up\` is not used in 2D: instances always fall toward +Y.`,
      };
    }
    if (requestedUp !== 'z' && requestedUp !== '-y') {
      return {
        success: false,
        message: `\`${argumentName}.up\` must be "z" or "-y" (got "${requestedUp}").`,
      };
    }
    up = requestedUp;
  }

  const included = getObjectNamesFromList({
    list: SafeExtractor.extractStringProperty(value, 'include_objects') || '',
    objectsContainer,
    globalObjectsContainer,
  });
  const excluded = getObjectNamesFromList({
    list: SafeExtractor.extractStringProperty(value, 'exclude_objects') || '',
    objectsContainer,
    globalObjectsContainer,
  });
  const unknownNames = [...included.unknownNames, ...excluded.unknownNames];
  if (unknownNames.length > 0) {
    return {
      success: false,
      message: `No object or group named ${unknownNames
        .map(name => `"${name}"`)
        .join(', ')} (in \`${argumentName}\`).`,
    };
  }
  return {
    success: true,
    options: {
      up,
      includedObjectNames:
        included.objectNames.length > 0 ? included.objectNames : null,
      excludedObjectNames: excluded.objectNames,
    },
  };
};

/**
 * What the in-game editor shows for a scope (a scene, an external layout or a
 * variant of a custom object), and how to open its editor. Null for the other
 * scopes.
 */
const getScopeEditor = (
  resolvedScope: ResolvedScope
): {|
  location: InGameEditorEditedLocation,
  open: (editorCallbacks: EditorCallbacks) => void,
|} | null => {
  const {
    layout,
    externalLayout,
    eventsFunctionsExtension,
    eventsBasedObject,
    variant,
    isDefaultVariant,
  } = resolvedScope;
  if (eventsFunctionsExtension && eventsBasedObject && variant) {
    const extensionName = eventsFunctionsExtension.getName();
    const objectName = eventsBasedObject.getName();
    // The default variant is shown with an empty name.
    const variantName = isDefaultVariant ? '' : variant.getName();
    return {
      location: {
        sceneName: null,
        externalLayoutName: null,
        eventsBasedObjectType: `${extensionName}::${objectName}`,
        eventsBasedObjectVariantName: variantName,
      },
      open: editorCallbacks =>
        editorCallbacks.onOpenCustomObjectEditor(
          extensionName,
          objectName,
          variantName
        ),
    };
  }
  if (!layout) return null;
  return {
    location: {
      sceneName: layout.getName(),
      externalLayoutName: externalLayout ? externalLayout.getName() : null,
      eventsBasedObjectType: null,
      eventsBasedObjectVariantName: null,
    },
    open: editorCallbacks => {
      if (externalLayout) {
        editorCallbacks.onOpenExternalLayout(externalLayout.getName());
      } else {
        editorCallbacks.onOpenLayout(layout.getName(), {
          openEventsEditor: false,
          openSceneEditor: true,
          focusWhenOpened: 'scene',
        });
      }
    },
  };
};

const isShowingScope = (
  editedLocation: InGameEditorEditedLocation | null,
  resolvedScope: ResolvedScope
): boolean => {
  const scopeEditor = getScopeEditor(resolvedScope);
  if (!editedLocation || !scopeEditor) return false;
  const { location } = scopeEditor;
  return (
    editedLocation.sceneName === location.sceneName &&
    (editedLocation.externalLayoutName || null) ===
      location.externalLayoutName &&
    editedLocation.eventsBasedObjectType === location.eventsBasedObjectType &&
    editedLocation.eventsBasedObjectVariantName ===
      location.eventsBasedObjectVariantName
  );
};

/**
 * Open the scene, external layout or custom object variant of a scope in the
 * editor and wait for the in-game editor to show it with the last changes of
 * the project, as it is what finds the surfaces.
 * @returns What was done, to be told in the result of the call.
 */
const showScopeInInGameEditor = async ({
  resolvedScope,
  sendChangesToEditor,
  editorCallbacks,
}: {|
  resolvedScope: ResolvedScope,
  sendChangesToEditor: () => void,
  editorCallbacks: EditorCallbacks,
|}): Promise<
  {| success: true, message: string |} | {| success: false, message: string |}
> => {
  const { label } = resolvedScope;
  const scopeEditor = getScopeEditor(resolvedScope);
  if (!scopeEditor) {
    return {
      success: false,
      message: `Surfaces can only be found in a scene, an external layout or a custom object variant, not in ${label}: give the positions without \`drop_to_surface\`/\`surface_beneath\`.`,
    };
  }

  // The calls made before in the same batch may have changed the surfaces.
  sendChangesToEditor();
  const wasInGameEditorDisabled = updateInGameEditor() === 'disabled';
  if (wasInGameEditorDisabled) enableInGameEditor();
  scopeEditor.open(editorCallbacks);

  const deadline = Date.now() + IN_GAME_EDITOR_READY_TIMEOUT_MS;
  let lastError = null;
  while (Date.now() < deadline) {
    await delay(IN_GAME_EDITOR_POLLING_DELAY_MS);
    if (updateInGameEditor() !== 'up-to-date') continue;
    try {
      const { editedLocation } = await raycastInGameEditor({
        rays: [],
        mode: '3d',
        includedObjectNames: null,
        excludedObjectNames: [],
        excludedInstanceUuids: [],
      });
      if (isShowingScope(editedLocation, resolvedScope)) {
        return {
          success: true,
          message: `${
            wasInGameEditorDisabled
              ? 'Switched the scene editor to the 3D editor and opened'
              : 'Opened'
          } ${label} in the editor to find the surfaces.`,
        };
      }
    } catch (error) {
      lastError = error;
    }
  }
  return {
    success: false,
    message: `Surfaces could not be found: the 3D editor did not show ${label} in time${
      lastError ? ` (${lastError.message})` : ''
    }. Nothing was changed. Retry, or give the positions without \`drop_to_surface\`/\`surface_beneath\`.`,
  };
};

/**
 * Find the first instance hit by each ray in the scope shown by the in-game
 * editor (see `showScopeInInGameEditor`).
 */
const castRaysInScope = async ({
  resolvedScope,
  rays,
  mode,
  surfaceOptions,
  excludedInstanceUuids,
}: {|
  resolvedScope: ResolvedScope,
  rays: Array<InGameEditorRay>,
  mode: SurfacesMode,
  surfaceOptions: SurfaceOptions,
  excludedInstanceUuids: Array<string>,
|}): Promise<
  | {| success: true, hits: Array<InGameEditorRaycastHit | null> |}
  | {| success: false, message: string |}
> => {
  const deadline = Date.now() + RAYCAST_TIMEOUT_MS;
  const hits: Array<InGameEditorRaycastHit | null> = [];
  for (let index = 0; index < rays.length; index += RAYS_PER_MESSAGE) {
    let result = null;
    let lastError = null;
    while (!result) {
      if (Date.now() > deadline) {
        return {
          success: false,
          message: `Surfaces could not be found: the 3D editor did not answer${
            lastError ? ` (${lastError.message})` : ''
          }. Nothing was changed. Retry, or give the positions without \`drop_to_surface\`/\`surface_beneath\`.`,
        };
      }
      try {
        const answer = await raycastInGameEditor({
          rays: rays.slice(index, index + RAYS_PER_MESSAGE),
          mode,
          includedObjectNames: surfaceOptions.includedObjectNames,
          excludedObjectNames: surfaceOptions.excludedObjectNames,
          excludedInstanceUuids,
        });
        if (!answer.editedLocation) {
          // The in-game editor is loading a scene.
          await delay(IN_GAME_EDITOR_POLLING_DELAY_MS);
          continue;
        }
        if (!isShowingScope(answer.editedLocation, resolvedScope)) {
          return {
            success: false,
            message: `Surfaces could not be found: the 3D editor stopped showing ${
              resolvedScope.label
            } (another scene was opened). Nothing was changed. Retry.`,
          };
        }
        result = answer;
      } catch (error) {
        lastError = error;
        await delay(IN_GAME_EDITOR_POLLING_DELAY_MS);
      }
    }
    hits.push(...result.hits);
  }
  return { success: true, hits };
};

/**
 * The unrotated box of an instance, from its position (its origin) and its
 * size. Null when the origin of the object is unknown.
 */
export const getInstanceBox = ({
  position,
  size,
  objectSizeInfo,
}: {|
  position: $ReadOnlyArray<number>,
  size: $ReadOnlyArray<number>,
  objectSizeInfo: ObjectSizeInfo | null,
|}): {| min: Array<number>, max: Array<number> |} | null => {
  const offsets = getBoxPointOffset(size.map(() => 0), size, objectSizeInfo);
  if (!offsets) return null;
  const min = position.map((value, axis) => value - offsets[axis]);
  return { min, max: min.map((value, axis) => value + size[axis]) };
};

/**
 * A ray going down from `from` (up being `up`), until beyond everything.
 */
const makeDownwardRay = (
  from: $ReadOnlyArray<number>,
  up: SurfaceUp,
  length: number = BEYOND_EVERYTHING_DISTANCE * 2
): InGameEditorRay => {
  const [x, y, z = 0] = from;
  return up === 'z'
    ? { from: [x, y, z], to: [x, y, z - length] }
    : { from: [x, y, z], to: [x, y + length, z] };
};

/** How a hit is told in the results of a call. */
const describeHit = (
  hit: InGameEditorRaycastHit,
  up: SurfaceUp,
  mode: SurfacesMode
): string => {
  const roundedHeight =
    Math.round((up === 'z' && mode === '3d' ? hit.z : hit.y) * 100) / 100;
  return `"${hit.objectName}"${
    hit.instanceUuid ? ` (instance ${hit.instanceUuid.slice(0, 10)})` : ''
  } at ${up === 'z' && mode === '3d' ? 'Z' : 'Y'}=${roundedHeight}`;
};

// The instances listed one by one in the result of a drop.
const MAX_DESCRIBED_DROPPED_INSTANCES = 20;

/**
 * Drop instances down onto the first surface below them, shown by the
 * in-game editor: the middle of the bottom of their box is put on it.
 * - Instances just placed by a brush (their origin is the brush position)
 * fall from there, or from beyond everything with `isFromAboveEverything`.
 * - Instances kept in place fall from where they are: from above everything
 * in 3D, from the top of their box in 2D.
 * The instances are never a surface for each other.
 */
export const dropInstancesOnSurfaces = async ({
  resolvedScope,
  sendChangesToEditor,
  editorCallbacks,
  instances,
  mode,
  surfaceOptions,
  areInstancesPlacedByBrush,
  isFromAboveEverything,
  getInstanceSize,
  objectSizeInfo,
}: {|
  resolvedScope: ResolvedScope,
  sendChangesToEditor: () => void,
  editorCallbacks: EditorCallbacks,
  instances: Array<gdInitialInstance>,
  mode: SurfacesMode,
  surfaceOptions: SurfaceOptions,
  areInstancesPlacedByBrush: boolean,
  isFromAboveEverything: boolean,
  getInstanceSize: (instance: gdInitialInstance) => Array<number>,
  objectSizeInfo: ObjectSizeInfo | null,
|}): Promise<
  {| success: true, message: string |} | {| success: false, message: string |}
> => {
  const { up } = surfaceOptions;
  const axesCount = mode === '3d' ? 3 : 2;
  const getPosition = (instance: gdInitialInstance): Array<number> =>
    [instance.getX(), instance.getY(), instance.getZ()].slice(0, axesCount);

  const drops = [];
  for (const instance of instances) {
    const size = getInstanceSize(instance);
    // The point of the box that rests on the surface, as fractions of its size.
    const bottomCenterFractions = (up === 'z'
      ? [0.5, 0.5, 0]
      : [0.5, 1, 0.5]
    ).slice(0, axesCount);
    const bottomCenterOffset = getBoxPointOffset(
      bottomCenterFractions,
      size,
      objectSizeInfo
    );
    if (!bottomCenterOffset) {
      return {
        success: false,
        message: `\`drop_to_surface\` needs the box of the instances, which is unknown. Give them a size with \`instances_size\`. Nothing was changed.`,
      };
    }
    const origin = getPosition(instance);
    const brushPoint = areInstancesPlacedByBrush
      ? origin
      : origin.map((value, axis) => value - bottomCenterOffset[axis]);
    const rayStart = [...brushPoint];
    if (mode === '2d') {
      // Falls from where it is: the top of its box.
      if (!areInstancesPlacedByBrush) rayStart[1] -= size[1];
    } else if (!areInstancesPlacedByBrush || isFromAboveEverything) {
      if (up === 'z') rayStart[2] = BEYOND_EVERYTHING_DISTANCE;
      else rayStart[1] = -BEYOND_EVERYTHING_DISTANCE;
    }
    drops.push({ instance, brushPoint, rayStart, bottomCenterOffset });
  }

  const showScope = await showScopeInInGameEditor({
    resolvedScope,
    sendChangesToEditor,
    editorCallbacks,
  });
  if (!showScope.success) return showScope;
  const castRays = await castRaysInScope({
    resolvedScope,
    rays: drops.map(({ rayStart }) => makeDownwardRay(rayStart, up)),
    mode,
    surfaceOptions,
    excludedInstanceUuids: instances.map(instance =>
      instance.getPersistentUuid()
    ),
  });
  if (!castRays.success) return castRays;

  const descriptions = [];
  let instancesOnSurfacesCount = 0;
  drops.forEach(({ instance, brushPoint, bottomCenterOffset }, index) => {
    const hit = castRays.hits[index];
    const bottomCenter = [...brushPoint];
    if (hit) {
      bottomCenter[0] = hit.x;
      bottomCenter[1] = hit.y;
      if (mode === '3d') bottomCenter[2] = hit.z;
      instancesOnSurfacesCount++;
    } else if (
      areInstancesPlacedByBrush &&
      isFromAboveEverything &&
      up === 'z'
    ) {
      // No height was given: put it on the ground plane.
      bottomCenter[2] = 0;
    }
    instance.setX(bottomCenter[0] + bottomCenterOffset[0]);
    instance.setY(bottomCenter[1] + bottomCenterOffset[1]);
    if (mode === '3d') instance.setZ(bottomCenter[2] + bottomCenterOffset[2]);

    if (index < MAX_DESCRIBED_DROPPED_INSTANCES) {
      const id = instance.getPersistentUuid().slice(0, 10);
      descriptions.push(
        hit
          ? `${id} rests on ${describeHit(hit, up, mode)}`
          : `${id}: no surface found below, ${
              areInstancesPlacedByBrush
                ? 'left at the brush position'
                : 'not moved'
            }${
              areInstancesPlacedByBrush && isFromAboveEverything && up === 'z'
                ? ' with its bottom at Z=0'
                : ''
            }`
      );
    }
  });
  const notDescribedCount = drops.length - descriptions.length;
  return {
    success: true,
    message: `${
      showScope.message
    } Dropped onto surfaces (${instancesOnSurfacesCount} of ${
      drops.length
    } found one): ${descriptions.join('; ')}${
      notDescribedCount > 0 ? `; and ${notDescribedCount} more` : ''
    }.`,
  };
};

const roundHeight = (value: number): number => Math.round(value * 100) / 100;

/** An instance whose surfaces are described, with its unrotated box. */
export type InstanceWithBox = {|
  instance: gdInitialInstance,
  mode: SurfacesMode,
  box: {| min: Array<number>, max: Array<number> |},
|};

type SurfaceBeneath = {|
  z?: number,
  y?: number,
  objectName: string,
  id: string,
  gap: number,
|};

type SurfacePoint = {| x: number, y: number, z?: number |};

type SurfaceGrid = {|
  xs: Array<number>,
  ys?: Array<number>,
  z?: Array<Array<number | null>>,
  y?: Array<number | null>,
  highest: SurfacePoint | null,
  lowest: SurfacePoint | null,
|};

/**
 * The surface below each instance (the first one below the top of its box,
 * the instance ignored) and, with a `grid`, the heights of the surfaces in its
 * box (the instance included). 2D instances are seen from the side (up is
 * `-y`).
 */
export const getSurfacesOfInstances = async ({
  resolvedScope,
  sendChangesToEditor,
  editorCallbacks,
  instancesWithBox,
  surfaceOptions,
  grid,
}: {|
  resolvedScope: ResolvedScope,
  sendChangesToEditor: () => void,
  editorCallbacks: EditorCallbacks,
  instancesWithBox: Array<InstanceWithBox>,
  surfaceOptions: SurfaceOptions,
  grid: number | null,
|}): Promise<
  | {|
      success: true,
      message: string,
      surfaces: Array<{|
        surfaceBeneath: SurfaceBeneath | null,
        surfaceGrid?: SurfaceGrid,
      |}>,
    |}
  | {| success: false, message: string |}
> => {
  const getUp = (mode: SurfacesMode): SurfaceUp =>
    mode === '2d' ? '-y' : surfaceOptions.up;
  const getSteps = (min: number, max: number, count: number): Array<number> =>
    Array.from(
      { length: count },
      (_, index) => min + ((index + 0.5) * (max - min)) / count
    );

  const raysByMode: { [SurfacesMode]: Array<InGameEditorRay> } = {
    '3d': [],
    '2d': [],
  };
  const noSteps: Array<number> = [];
  const plannedRays = instancesWithBox.map(({ instance, mode, box }) => {
    const up = getUp(mode);
    const { min, max } = box;
    const center = min.map((value, axis) => (value + max[axis]) / 2);
    const rays = raysByMode[mode];
    const beneathRayIndex = rays.length;
    const top =
      up === 'z'
        ? [center[0], center[1], max[2]]
        : [center[0], min[1], center[2]];
    rays.push({
      ...makeDownwardRay(top, up),
      excludedInstanceUuid: instance.getPersistentUuid(),
    });

    if (!grid)
      return { beneathRayIndex, gridRayIndex: -1, xs: noSteps, ys: noSteps };
    const gridRayIndex = rays.length;
    const xs = getSteps(min[0], max[0], grid);
    if (up === 'z') {
      const ys = getSteps(min[1], max[1], grid);
      const height = max[2] - min[2] + 2;
      ys.forEach(y =>
        xs.forEach(x =>
          rays.push(makeDownwardRay([x, y, max[2] + 1], up, height))
        )
      );
      return { beneathRayIndex, gridRayIndex, xs, ys };
    }
    const height = max[1] - min[1] + 2;
    xs.forEach(x =>
      rays.push(makeDownwardRay([x, min[1] - 1, center[2] || 0], up, height))
    );
    return { beneathRayIndex, gridRayIndex, xs, ys: noSteps };
  });

  const showScope = await showScopeInInGameEditor({
    resolvedScope,
    sendChangesToEditor,
    editorCallbacks,
  });
  if (!showScope.success) return showScope;
  const hitsByMode: {
    [SurfacesMode]: Array<InGameEditorRaycastHit | null>,
  } = { '3d': [], '2d': [] };
  const modes: Array<SurfacesMode> = ['3d', '2d'];
  for (const mode of modes) {
    if (raysByMode[mode].length === 0) continue;
    const castRays = await castRaysInScope({
      resolvedScope,
      rays: raysByMode[mode],
      mode,
      surfaceOptions,
      excludedInstanceUuids: [],
    });
    if (!castRays.success) return castRays;
    hitsByMode[mode] = castRays.hits;
  }

  const surfaces = instancesWithBox.map(
    (
      { mode, box },
      index
    ): {|
      surfaceBeneath: SurfaceBeneath | null,
      surfaceGrid?: SurfaceGrid,
    |} => {
      const up = getUp(mode);
      const isZUp = up === 'z';
      const hits = hitsByMode[mode];
      const { beneathRayIndex, gridRayIndex, xs, ys } = plannedRays[index];
      const getHitHeight = (hit: InGameEditorRaycastHit): number =>
        isZUp ? hit.z : hit.y;

      const beneathHit = hits[beneathRayIndex];
      const surfaceBeneath: SurfaceBeneath | null = beneathHit
        ? {
            ...(isZUp
              ? { z: roundHeight(beneathHit.z) }
              : { y: roundHeight(beneathHit.y) }),
            objectName: beneathHit.objectName,
            id: (beneathHit.instanceUuid || '').slice(0, 10),
            gap: roundHeight(
              isZUp ? box.min[2] - beneathHit.z : beneathHit.y - box.max[1]
            ),
          }
        : null;
      if (gridRayIndex === -1) return { surfaceBeneath };

      const gridHits = hits.slice(
        gridRayIndex,
        gridRayIndex + (isZUp ? xs.length * ys.length : xs.length)
      );
      // The highest point has the greatest Z, or the smallest Y with `-y`.
      const getElevation = (hit: InGameEditorRaycastHit): number =>
        isZUp ? hit.z : -hit.y;
      const toPoint = (hit: InGameEditorRaycastHit): SurfacePoint =>
        isZUp
          ? {
              x: roundHeight(hit.x),
              y: roundHeight(hit.y),
              z: roundHeight(hit.z),
            }
          : { x: roundHeight(hit.x), y: roundHeight(hit.y) };
      const hitsFromHighest: Array<InGameEditorRaycastHit> = [];
      gridHits.forEach(hit => {
        if (hit) hitsFromHighest.push(hit);
      });
      hitsFromHighest.sort((a, b) => getElevation(b) - getElevation(a));
      const highest =
        hitsFromHighest.length > 0 ? toPoint(hitsFromHighest[0]) : null;
      const lowest =
        hitsFromHighest.length > 0
          ? toPoint(hitsFromHighest[hitsFromHighest.length - 1])
          : null;
      const heights = gridHits.map(hit =>
        hit ? roundHeight(getHitHeight(hit)) : null
      );
      const roundedXs = xs.map(roundHeight);
      const surfaceGrid: SurfaceGrid = isZUp
        ? {
            xs: roundedXs,
            ys: ys.map(roundHeight),
            z: ys.map((y, row) =>
              heights.slice(row * xs.length, (row + 1) * xs.length)
            ),
            highest,
            lowest,
          }
        : { xs: roundedXs, y: heights, highest, lowest };
      return { surfaceBeneath, surfaceGrid };
    }
  );
  return { success: true, message: showScope.message, surfaces };
};
