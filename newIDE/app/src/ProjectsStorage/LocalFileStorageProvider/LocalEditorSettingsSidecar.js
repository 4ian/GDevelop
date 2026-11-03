// @flow
import optionalRequire from '../../Utils/OptionalRequire';

const path = optionalRequire('path');

// The editor (IDE) settings of a project (scene zoom, grid settings, window mask...)
// are user specific: they should not be shared with other people working on the
// project, nor shipped with the game. They are stored "inside" the project when
// it is serialized, but the local file storage moves them to a sidecar file, stored
// next to the project file (in a `.gdevelop` folder, that can be gitignored), so
// that the project file itself stays free of user specific data.

export const editorSettingsFolderName = '.gdevelop';
export const editorSettingsFileSuffix = '.editor-settings.json';

/**
 * Editor settings of a custom object (an events based object of an extension).
 * The default variant editor settings are serialized directly on the events
 * based object, the other variants in its `variants` property.
 */
export type CustomObjectEditorSettings = {|
  defaultVariant: ?Object,
  variants: { [variantName: string]: Object },
|};

/**
 * Editor settings of a project, indexed the same way as they are stored
 * in the serialized project (see the search functions below), with arrays
 * turned into maps keyed by name.
 */
export type ProjectEditorSettings = {|
  layouts: { [layoutName: string]: Object },
  externalLayouts: { [externalLayoutName: string]: Object },
  customObjects: {
    [extensionName: string]: {
      [customObjectName: string]: CustomObjectEditorSettings,
    },
  },
|};

/**
 * Get the path of the file storing the editor settings of a project
 * saved locally at `projectFilePath`.
 */
export const getEditorSettingsSidecarPath = (
  projectFilePath: string
): string => {
  if (!path) {
    throw new Error('Filesystem paths are not supported.');
  }

  return path.join(
    path.dirname(projectFilePath),
    editorSettingsFolderName,
    path.basename(projectFilePath, path.extname(projectFilePath)) +
      editorSettingsFileSuffix
  );
};

const hasOwnProperty = (object: Object, propertyName: string): boolean =>
  object.hasOwnProperty(propertyName);

const isNamedObject = (object: Object): boolean =>
  !!object && typeof object.name === 'string';

/**
 * Get (or create) the editor settings container of a custom object, i.e. an
 * events based object of an extension, identified by its extension and name.
 */
const getOrMakeCustomObjectSettings = (
  editorSettings: ProjectEditorSettings,
  extensionName: string,
  customObjectName: string
): CustomObjectEditorSettings => {
  const extensionCustomObjects = editorSettings.customObjects[extensionName];
  if (extensionCustomObjects && extensionCustomObjects[customObjectName]) {
    return extensionCustomObjects[customObjectName];
  }

  const customObjectSettings: CustomObjectEditorSettings = {
    defaultVariant: null,
    variants: {},
  };
  if (extensionCustomObjects) {
    extensionCustomObjects[customObjectName] = customObjectSettings;
  } else {
    editorSettings.customObjects[extensionName] = {
      [customObjectName]: customObjectSettings,
    };
  }
  return customObjectSettings;
};

/**
 * Search for editor settings in a serialized project and remove them from it,
 * returning them so that they can be stored separately (in a sidecar file).
 *
 * Returns null if there is nothing to store.
 */
export const extractProjectEditorSettings = (
  serializedProject: Object
): ?ProjectEditorSettings => {
  const editorSettings: ProjectEditorSettings = {
    layouts: {},
    externalLayouts: {},
    customObjects: {},
  };

  if (Array.isArray(serializedProject.layouts)) {
    serializedProject.layouts.forEach(layout => {
      if (isNamedObject(layout) && hasOwnProperty(layout, 'uiSettings')) {
        editorSettings.layouts[layout.name] = layout.uiSettings;
        delete layout.uiSettings;
      }
    });
  }

  if (Array.isArray(serializedProject.externalLayouts)) {
    serializedProject.externalLayouts.forEach(externalLayout => {
      if (
        isNamedObject(externalLayout) &&
        hasOwnProperty(externalLayout, 'editionSettings')
      ) {
        editorSettings.externalLayouts[externalLayout.name] =
          externalLayout.editionSettings;
        delete externalLayout.editionSettings;
      }
    });
  }

  if (Array.isArray(serializedProject.eventsFunctionsExtensions)) {
    serializedProject.eventsFunctionsExtensions.forEach(extension => {
      if (!isNamedObject(extension)) return;
      if (!Array.isArray(extension.eventsBasedObjects)) return;

      extension.eventsBasedObjects.forEach(eventsBasedObject => {
        if (!isNamedObject(eventsBasedObject)) return;

        if (hasOwnProperty(eventsBasedObject, 'editionSettings')) {
          getOrMakeCustomObjectSettings(
            editorSettings,
            extension.name,
            eventsBasedObject.name
          ).defaultVariant = eventsBasedObject.editionSettings;
          delete eventsBasedObject.editionSettings;
        }

        if (Array.isArray(eventsBasedObject.variants)) {
          eventsBasedObject.variants.forEach(variant => {
            if (
              isNamedObject(variant) &&
              hasOwnProperty(variant, 'editionSettings')
            ) {
              getOrMakeCustomObjectSettings(
                editorSettings,
                extension.name,
                eventsBasedObject.name
              ).variants[variant.name] = variant.editionSettings;
              delete variant.editionSettings;
            }
          });
        }
      });
    });
  }

  const nothingToStore =
    Object.keys(editorSettings.layouts).length === 0 &&
    Object.keys(editorSettings.externalLayouts).length === 0 &&
    Object.keys(editorSettings.customObjects).length === 0;
  if (nothingToStore) return null;

  return editorSettings;
};

/**
 * Fill a serialized project with editor settings that were stored separately
 * (in a sidecar file).
 *
 * Settings already present in the serialized project (for example, in a project
 * last saved by an older version, or in an autosave) are kept as they are,
 * so that the freshest data always wins. They'll be moved to the sidecar file
 * the next time the project is saved.
 */
export const applyProjectEditorSettings = (
  serializedProject: Object,
  editorSettings: ?ProjectEditorSettings
): void => {
  if (!editorSettings) return;

  const { layouts } = editorSettings;
  if (layouts && Array.isArray(serializedProject.layouts)) {
    serializedProject.layouts.forEach(layout => {
      if (
        isNamedObject(layout) &&
        !hasOwnProperty(layout, 'uiSettings') &&
        hasOwnProperty(layouts, layout.name)
      ) {
        layout.uiSettings = layouts[layout.name];
      }
    });
  }

  const { externalLayouts } = editorSettings;
  if (externalLayouts && Array.isArray(serializedProject.externalLayouts)) {
    serializedProject.externalLayouts.forEach(externalLayout => {
      if (
        isNamedObject(externalLayout) &&
        !hasOwnProperty(externalLayout, 'editionSettings') &&
        hasOwnProperty(externalLayouts, externalLayout.name)
      ) {
        externalLayout.editionSettings = externalLayouts[externalLayout.name];
      }
    });
  }

  const { customObjects } = editorSettings;
  if (
    customObjects &&
    Array.isArray(serializedProject.eventsFunctionsExtensions)
  ) {
    serializedProject.eventsFunctionsExtensions.forEach(extension => {
      if (!isNamedObject(extension)) return;
      const extensionCustomObjects = customObjects[extension.name];
      if (!extensionCustomObjects) return;
      if (!Array.isArray(extension.eventsBasedObjects)) return;

      extension.eventsBasedObjects.forEach(eventsBasedObject => {
        if (!isNamedObject(eventsBasedObject)) return;
        const customObjectSettings =
          extensionCustomObjects[eventsBasedObject.name];
        if (!customObjectSettings) return;

        if (
          !hasOwnProperty(eventsBasedObject, 'editionSettings') &&
          customObjectSettings.defaultVariant
        ) {
          eventsBasedObject.editionSettings =
            customObjectSettings.defaultVariant;
        }

        const { variants } = customObjectSettings;
        if (variants && Array.isArray(eventsBasedObject.variants)) {
          eventsBasedObject.variants.forEach(variant => {
            if (
              isNamedObject(variant) &&
              !hasOwnProperty(variant, 'editionSettings') &&
              hasOwnProperty(variants, variant.name)
            ) {
              variant.editionSettings = variants[variant.name];
            }
          });
        }
      });
    });
  }
};
