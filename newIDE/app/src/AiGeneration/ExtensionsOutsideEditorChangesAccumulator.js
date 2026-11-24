// @flow
import { type ExtensionsOutsideEditorChanges } from '../EditorFunctions/OutsideEditorChanges';

export type ExtensionsOutsideEditorChangesAccumulator = {|
  /** Mark the extensions of these changes as dirty. */
  add: (changes: ExtensionsOutsideEditorChanges) => void,
  isEmpty: () => boolean,
  /** Return the merged changes of everything accumulated so far, and reset. */
  flush: () => ExtensionsOutsideEditorChanges,
|};

/**
 * Accumulates the extension changes made by a batch of AI function calls,
 * keyed by extension name, so the extensions are regenerated and the editors
 * refreshed once for the whole batch instead of once per call.
 */
export const makeExtensionsOutsideEditorChangesAccumulator = (): ExtensionsOutsideEditorChangesAccumulator => {
  const changesByExtensionName: Map<
    string,
    {| needsCodeRegeneration: boolean, deleted: boolean |}
  > = new Map();

  return {
    add: (changes: ExtensionsOutsideEditorChanges) => {
      changes.extensionNames.forEach(extensionName => {
        const existingChanges = changesByExtensionName.get(extensionName);
        changesByExtensionName.set(extensionName, {
          needsCodeRegeneration:
            (existingChanges ? existingChanges.needsCodeRegeneration : false) ||
            changes.needsCodeRegeneration,
          deleted:
            (existingChanges ? existingChanges.deleted : false) ||
            !!changes.deleted,
        });
      });
    },
    isEmpty: () => changesByExtensionName.size === 0,
    flush: () => {
      const extensionNames = [];
      let needsCodeRegeneration = false;
      let deleted = false;
      changesByExtensionName.forEach((changes, extensionName) => {
        extensionNames.push(extensionName);
        needsCodeRegeneration =
          needsCodeRegeneration || changes.needsCodeRegeneration;
        deleted = deleted || changes.deleted;
      });
      changesByExtensionName.clear();
      return { extensionNames, needsCodeRegeneration, deleted };
    },
  };
};

/**
 * True when the extensions must be entirely regenerated (declarations or
 * children changed, or one was removed). Otherwise only the metadata of the
 * changed extensions (names, descriptions, sentences...) must be reloaded.
 */
export const doExtensionChangesNeedCodeRegeneration = (
  changes: ExtensionsOutsideEditorChanges
): boolean => changes.needsCodeRegeneration || !!changes.deleted;
