// @flow

// Queries to the in-game editor, the game shown by the scene editors. Kept
// apart from \`EmbeddedGameFrame\` (which answers them) so that the editor
// functions can use them without importing the user interface.

/** A segment, in the scene coordinates, along which surfaces are searched. */
export type InGameEditorRay = {|
  from: [number, number, number],
  to: [number, number, number],
  // An instance this ray goes through (in addition to the excluded ones).
  excludedInstanceUuid?: string,
|};

export type InGameEditorRaycastRequest = {|
  rays: Array<InGameEditorRay>,
  // `3d` finds the meshes of 3D objects, `2d` the hitboxes of 2D objects.
  mode: '3d' | '2d',
  // The only objects that can be hit, or null for all of them.
  includedObjectNames: Array<string> | null,
  excludedObjectNames: Array<string>,
  excludedInstanceUuids: Array<string>,
|};

export type InGameEditorRaycastHit = {|
  x: number,
  y: number,
  z: number,
  objectName: string,
  instanceUuid: string | null,
|};

/** What the in-game editor shows: a scene, an external layout or a variant. */
export type InGameEditorEditedLocation = {|
  sceneName: string | null,
  externalLayoutName: string | null,
  eventsBasedObjectType: string | null,
  eventsBasedObjectVariantName: string | null,
|};

export type InGameEditorRaycastResult = {|
  // Null while the in-game editor switches to another scene.
  editedLocation: InGameEditorEditedLocation | null,
  hits: Array<InGameEditorRaycastHit | null>,
|};

/**
 * - `disabled`: the scene editors use the 2D instances editor.
 * - `updating`: the game shown by the in-game editor is (or must be) reloaded
 * to get the last changes of the project.
 */
export type InGameEditorStatus = 'disabled' | 'updating' | 'up-to-date';

type InGameEditorQueryHandlers = {|
  update: () => InGameEditorStatus,
  enable: () => void,
  raycast: (
    request: InGameEditorRaycastRequest
  ) => Promise<InGameEditorRaycastResult>,
|};

let inGameEditorQueryHandlers: InGameEditorQueryHandlers | null = null;

export const registerInGameEditorQueryHandlers = (
  handlers: InGameEditorQueryHandlers | null
) => {
  inGameEditorQueryHandlers = handlers;
};

/**
 * Send the changes of the project waiting to be applied to the game shown by
 * the in-game editor, and tell if this game has all the changes.
 */
export const updateInGameEditor = (): InGameEditorStatus =>
  inGameEditorQueryHandlers ? inGameEditorQueryHandlers.update() : 'disabled';

/** Switch the scene editors to the in-game editor, if it is not used. */
export const enableInGameEditor = () => {
  if (inGameEditorQueryHandlers) inGameEditorQueryHandlers.enable();
};

/**
 * Find the instances hit by rays in the scene shown by the in-game editor.
 * Rejected when the in-game editor does not answer.
 */
export const raycastInGameEditor = (
  request: InGameEditorRaycastRequest
): Promise<InGameEditorRaycastResult> =>
  inGameEditorQueryHandlers
    ? inGameEditorQueryHandlers.raycast(request)
    : Promise.reject(new Error('No in-game editor is registered.'));
