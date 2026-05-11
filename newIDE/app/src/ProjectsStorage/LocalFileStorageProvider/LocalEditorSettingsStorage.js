// @flow
import optionalRequire from '../../Utils/OptionalRequire';

const path = optionalRequire('path');

export const editorSettingsDirectoryName = '.gdevelop';
export const editorSettingsFileName = 'editor-settings.json';

export type ProjectEditorSettings = {|
  layoutSettings: { [layoutName: string]: Object },
  externalLayoutSettings: { [externalLayoutName: string]: Object },
  eventsBasedObjectVariantSettings: {
    [variantIdentifier: string]: Object,
  },
|};

export const getProjectEditorSettingsFilePath = (
  projectPath: string
): string => {
  if (!path) {
    throw new Error('Filesystem paths are not supported.');
  }

  return path.join(
    projectPath,
    editorSettingsDirectoryName,
    editorSettingsFileName
  );
};

const makeProjectEditorSettings = (): ProjectEditorSettings => ({
  layoutSettings: {},
  externalLayoutSettings: {},
  eventsBasedObjectVariantSettings: {},
});

const hasOwn = (object: Object, propertyName: string): boolean =>
  Object.prototype.hasOwnProperty.call(object, propertyName);

const isEmpty = (object: Object): boolean => Object.keys(object).length === 0;

const makeVariantIdentifier = (
  extensionName: string,
  objectName: string,
  variantName: string
): string => `${extensionName}::${objectName}::${variantName}`;

export const extractProjectEditorSettings = (
  serializedProjectObject: Object
): ?ProjectEditorSettings => {
  const projectEditorSettings = makeProjectEditorSettings();

  if (Array.isArray(serializedProjectObject.layouts)) {
    serializedProjectObject.layouts.forEach(layout => {
      if (
        layout &&
        typeof layout.name === 'string' &&
        hasOwn(layout, 'uiSettings')
      ) {
        projectEditorSettings.layoutSettings[layout.name] = layout.uiSettings;
        delete layout.uiSettings;
      }
    });
  }

  if (Array.isArray(serializedProjectObject.externalLayouts)) {
    serializedProjectObject.externalLayouts.forEach(externalLayout => {
      if (
        externalLayout &&
        typeof externalLayout.name === 'string' &&
        hasOwn(externalLayout, 'editionSettings')
      ) {
        projectEditorSettings.externalLayoutSettings[
          externalLayout.name
        ] = externalLayout.editionSettings;
        delete externalLayout.editionSettings;
      }
    });
  }

  if (Array.isArray(serializedProjectObject.eventsFunctionsExtensions)) {
    serializedProjectObject.eventsFunctionsExtensions.forEach(extension => {
      if (
        !extension ||
        typeof extension.name !== 'string' ||
        !Array.isArray(extension.eventsBasedObjects)
      ) {
        return;
      }

      extension.eventsBasedObjects.forEach(eventsBasedObject => {
        if (!eventsBasedObject || typeof eventsBasedObject.name !== 'string') {
          return;
        }

        if (hasOwn(eventsBasedObject, 'editionSettings')) {
          projectEditorSettings.eventsBasedObjectVariantSettings[
            makeVariantIdentifier(extension.name, eventsBasedObject.name, '')
          ] = eventsBasedObject.editionSettings;
          delete eventsBasedObject.editionSettings;
        }

        if (Array.isArray(eventsBasedObject.variants)) {
          eventsBasedObject.variants.forEach(variant => {
            if (
              variant &&
              typeof variant.name === 'string' &&
              hasOwn(variant, 'editionSettings')
            ) {
              projectEditorSettings.eventsBasedObjectVariantSettings[
                makeVariantIdentifier(
                  extension.name,
                  eventsBasedObject.name,
                  variant.name
                )
              ] = variant.editionSettings;
              delete variant.editionSettings;
            }
          });
        }
      });
    });
  }

  if (
    isEmpty(projectEditorSettings.layoutSettings) &&
    isEmpty(projectEditorSettings.externalLayoutSettings) &&
    isEmpty(projectEditorSettings.eventsBasedObjectVariantSettings)
  ) {
    return null;
  }

  return projectEditorSettings;
};

export const applyProjectEditorSettings = (
  serializedProjectObject: Object,
  projectEditorSettings: ?ProjectEditorSettings
) => {
  if (!projectEditorSettings) return;

  const { layoutSettings } = projectEditorSettings;
  if (layoutSettings && Array.isArray(serializedProjectObject.layouts)) {
    serializedProjectObject.layouts.forEach(layout => {
      if (
        layout &&
        typeof layout.name === 'string' &&
        layoutSettings[layout.name]
      ) {
        layout.uiSettings = layoutSettings[layout.name];
      }
    });
  }

  const { externalLayoutSettings } = projectEditorSettings;
  if (
    externalLayoutSettings &&
    Array.isArray(serializedProjectObject.externalLayouts)
  ) {
    serializedProjectObject.externalLayouts.forEach(externalLayout => {
      if (
        externalLayout &&
        typeof externalLayout.name === 'string' &&
        externalLayoutSettings[externalLayout.name]
      ) {
        externalLayout.editionSettings =
          externalLayoutSettings[externalLayout.name];
      }
    });
  }

  const { eventsBasedObjectVariantSettings } = projectEditorSettings;
  if (
    eventsBasedObjectVariantSettings &&
    Array.isArray(serializedProjectObject.eventsFunctionsExtensions)
  ) {
    serializedProjectObject.eventsFunctionsExtensions.forEach(extension => {
      if (
        !extension ||
        typeof extension.name !== 'string' ||
        !Array.isArray(extension.eventsBasedObjects)
      ) {
        return;
      }

      extension.eventsBasedObjects.forEach(eventsBasedObject => {
        if (!eventsBasedObject || typeof eventsBasedObject.name !== 'string') {
          return;
        }

        const defaultVariantSettings =
          eventsBasedObjectVariantSettings[
            makeVariantIdentifier(extension.name, eventsBasedObject.name, '')
          ];
        if (defaultVariantSettings) {
          eventsBasedObject.editionSettings = defaultVariantSettings;
        }

        if (Array.isArray(eventsBasedObject.variants)) {
          eventsBasedObject.variants.forEach(variant => {
            if (!variant || typeof variant.name !== 'string') return;

            const variantSettings =
              eventsBasedObjectVariantSettings[
                makeVariantIdentifier(
                  extension.name,
                  eventsBasedObject.name,
                  variant.name
                )
              ];
            if (variantSettings) {
              variant.editionSettings = variantSettings;
            }
          });
        }
      });
    });
  }
};
