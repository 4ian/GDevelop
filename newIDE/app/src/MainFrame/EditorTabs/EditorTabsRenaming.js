// @flow
import { type EditorKind } from './EditorTabsHandler';
import {
  parseCustomObjectEditorTabName,
  makeCustomObjectEditorTabName,
} from '../../Utils/CustomObjectEditorTabName';

/**
 * The subset of an editor tab read to decide how a rename affects it, so these
 * helpers can be unit-tested with plain objects.
 */
export type RenamableTab = {| +kind: EditorKind, +projectItemName: ?string |};

/**
 * Each helper returns the new `projectItemName` a tab should take after a rename,
 * or null when the rename does not affect that tab.
 */

export const getRenamedLayoutTabProjectItemName = (
  tab: RenamableTab,
  oldName: string,
  newName: string
): ?string =>
  (tab.kind === 'layout' || tab.kind === 'layout events') &&
  tab.projectItemName === oldName
    ? newName
    : null;

export const getRenamedExternalLayoutTabProjectItemName = (
  tab: RenamableTab,
  oldName: string,
  newName: string
): ?string =>
  tab.kind === 'external layout' && tab.projectItemName === oldName
    ? newName
    : null;

export const getRenamedExternalEventsTabProjectItemName = (
  tab: RenamableTab,
  oldName: string,
  newName: string
): ?string =>
  tab.kind === 'external events' && tab.projectItemName === oldName
    ? newName
    : null;

/**
 * Renaming an extension affects its extension tab and every custom-object tab
 * whose name starts with that extension (`extension::object[::variant]`).
 */
export const getRenamedExtensionTabProjectItemName = (
  tab: RenamableTab,
  oldExtensionName: string,
  newExtensionName: string
): ?string => {
  const { projectItemName } = tab;
  if (!projectItemName) return null;
  if (tab.kind === 'events functions extension')
    return projectItemName === oldExtensionName ? newExtensionName : null;
  if (tab.kind === 'custom object') {
    const parsed = parseCustomObjectEditorTabName(projectItemName);
    return parsed.extensionName === oldExtensionName
      ? makeCustomObjectEditorTabName({
          ...parsed,
          extensionName: newExtensionName,
        })
      : null;
  }
  return null;
};

/**
 * Renaming an events-based object affects the custom-object tabs of that object
 * (matched by extension + object name, keeping any variant).
 */
export const getRenamedEventsBasedObjectTabProjectItemName = (
  tab: RenamableTab,
  extensionName: string,
  oldObjectName: string,
  newObjectName: string
): ?string => {
  const { projectItemName } = tab;
  if (tab.kind !== 'custom object' || !projectItemName) return null;
  const parsed = parseCustomObjectEditorTabName(projectItemName);
  return parsed.extensionName === extensionName &&
    parsed.objectName === oldObjectName
    ? makeCustomObjectEditorTabName({ ...parsed, objectName: newObjectName })
    : null;
};
