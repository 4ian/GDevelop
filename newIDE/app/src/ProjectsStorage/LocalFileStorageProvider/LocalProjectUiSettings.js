// @flow

export const localProjectUiSettingsFolderName = '.gdevelop';
export const localProjectUiSettingsFileExtension = '.editor-settings.json';

export const getLocalProjectUiSettingsFilePath = (
  projectFilePath: string,
  pathModule: any
): string => {
  const projectFilePathWithoutAutoSaveSuffix = projectFilePath.endsWith(
    '.autosave'
  )
    ? projectFilePath.substring(0, projectFilePath.length - '.autosave'.length)
    : projectFilePath;
  const parsedProjectFilePath = pathModule.parse(
    projectFilePathWithoutAutoSaveSuffix
  );
  return pathModule.join(
    parsedProjectFilePath.dir,
    localProjectUiSettingsFolderName,
    parsedProjectFilePath.name + localProjectUiSettingsFileExtension
  );
};

export type LocalProjectUiSettings = {|
  version: 1,
  layouts?: { [string]: Object },
  externalLayouts?: { [string]: Object },
  eventsFunctionsExtensions?: { [string]: Object },
|};

const hasOwnProperty = (object: Object, propertyName: string) =>
  (Object.prototype: any).hasOwnProperty.call(object, propertyName);

const getName = (object: Object): ?string =>
  typeof object.name === 'string' ? object.name : null;

export const createEmptyLocalProjectUiSettings = (): LocalProjectUiSettings => ({
  version: 1,
});

export const hasLocalProjectUiSettings = (
  localProjectUiSettings: LocalProjectUiSettings
): boolean => {
  return (
    !!localProjectUiSettings.layouts ||
    !!localProjectUiSettings.externalLayouts ||
    !!localProjectUiSettings.eventsFunctionsExtensions
  );
};

export const extractLocalProjectUiSettings = (
  projectObject: Object
): LocalProjectUiSettings => {
  const localProjectUiSettings = createEmptyLocalProjectUiSettings();

  if (Array.isArray(projectObject.layouts)) {
    for (const layout of projectObject.layouts) {
      const layoutName = getName(layout);
      if (!layoutName || !hasOwnProperty(layout, 'uiSettings')) continue;

      let layoutsSettings = localProjectUiSettings.layouts;
      if (!layoutsSettings) {
        layoutsSettings = ({}: { [string]: Object });
        localProjectUiSettings.layouts = layoutsSettings;
      }
      layoutsSettings[layoutName] = {
        uiSettings: layout.uiSettings,
      };
      delete layout.uiSettings;
    }
  }

  if (Array.isArray(projectObject.externalLayouts)) {
    for (const externalLayout of projectObject.externalLayouts) {
      const externalLayoutName = getName(externalLayout);
      if (
        !externalLayoutName ||
        !hasOwnProperty(externalLayout, 'editionSettings')
      ) {
        continue;
      }

      let externalLayoutsSettings = localProjectUiSettings.externalLayouts;
      if (!externalLayoutsSettings) {
        externalLayoutsSettings = ({}: { [string]: Object });
        localProjectUiSettings.externalLayouts = externalLayoutsSettings;
      }
      externalLayoutsSettings[externalLayoutName] = {
        editionSettings: externalLayout.editionSettings,
      };
      delete externalLayout.editionSettings;
    }
  }

  if (Array.isArray(projectObject.eventsFunctionsExtensions)) {
    for (const extension of projectObject.eventsFunctionsExtensions) {
      const extensionName = getName(extension);
      if (!extensionName || !Array.isArray(extension.eventsBasedObjects)) {
        continue;
      }

      for (const eventsBasedObject of extension.eventsBasedObjects) {
        const eventsBasedObjectName = getName(eventsBasedObject);
        if (
          !eventsBasedObjectName ||
          !Array.isArray(eventsBasedObject.variants)
        ) {
          continue;
        }

        for (const variant of eventsBasedObject.variants) {
          const variantName = getName(variant);
          if (!variantName || !hasOwnProperty(variant, 'editionSettings')) {
            continue;
          }

          let extensionsSettings =
            localProjectUiSettings.eventsFunctionsExtensions;
          if (!extensionsSettings) {
            extensionsSettings = ({}: { [string]: Object });
            localProjectUiSettings.eventsFunctionsExtensions = extensionsSettings;
          }
          const extensionSettings = extensionsSettings[extensionName] || {};
          extensionsSettings[extensionName] = extensionSettings;

          const eventsBasedObjectsSettings =
            extensionSettings.eventsBasedObjects || ({}: { [string]: Object });
          extensionSettings.eventsBasedObjects = eventsBasedObjectsSettings;

          const eventsBasedObjectSettings =
            eventsBasedObjectsSettings[eventsBasedObjectName] || {};
          eventsBasedObjectsSettings[
            eventsBasedObjectName
          ] = eventsBasedObjectSettings;

          const variantsSettings =
            eventsBasedObjectSettings.variants || ({}: { [string]: Object });
          eventsBasedObjectSettings.variants = variantsSettings;

          variantsSettings[variantName] = {
            editionSettings: variant.editionSettings,
          };
          delete variant.editionSettings;
        }
      }
    }
  }

  return localProjectUiSettings;
};

export const applyLocalProjectUiSettings = (
  projectObject: Object,
  localProjectUiSettings: LocalProjectUiSettings
) => {
  const layoutsSettings = localProjectUiSettings.layouts;
  if (layoutsSettings && Array.isArray(projectObject.layouts)) {
    for (const layout of projectObject.layouts) {
      const layoutName = getName(layout);
      const layoutSettings = layoutName && layoutsSettings[layoutName];
      if (layoutSettings && hasOwnProperty(layoutSettings, 'uiSettings')) {
        layout.uiSettings = layoutSettings.uiSettings;
      }
    }
  }

  const externalLayoutsSettings = localProjectUiSettings.externalLayouts;
  if (externalLayoutsSettings && Array.isArray(projectObject.externalLayouts)) {
    for (const externalLayout of projectObject.externalLayouts) {
      const externalLayoutName = getName(externalLayout);
      const externalLayoutSettings =
        externalLayoutName && externalLayoutsSettings[externalLayoutName];
      if (
        externalLayoutSettings &&
        hasOwnProperty(externalLayoutSettings, 'editionSettings')
      ) {
        externalLayout.editionSettings = externalLayoutSettings.editionSettings;
      }
    }
  }

  const extensionsSettings = localProjectUiSettings.eventsFunctionsExtensions;
  if (Array.isArray(projectObject.eventsFunctionsExtensions)) {
    for (const extension of projectObject.eventsFunctionsExtensions) {
      const extensionName = getName(extension);
      const extensionSettings =
        extensionName &&
        extensionsSettings &&
        extensionsSettings[extensionName];
      if (
        !extensionSettings ||
        !extensionSettings.eventsBasedObjects ||
        !Array.isArray(extension.eventsBasedObjects)
      ) {
        continue;
      }

      for (const eventsBasedObject of extension.eventsBasedObjects) {
        const eventsBasedObjectName = getName(eventsBasedObject);
        const eventsBasedObjectsSettings = extensionSettings.eventsBasedObjects;
        const eventsBasedObjectSettings =
          eventsBasedObjectName &&
          eventsBasedObjectsSettings &&
          eventsBasedObjectsSettings[eventsBasedObjectName];
        if (
          !eventsBasedObjectSettings ||
          !eventsBasedObjectSettings.variants ||
          !Array.isArray(eventsBasedObject.variants)
        ) {
          continue;
        }

        for (const variant of eventsBasedObject.variants) {
          const variantName = getName(variant);
          const variantsSettings = eventsBasedObjectSettings.variants;
          const variantSettings =
            variantName && variantsSettings && variantsSettings[variantName];
          if (
            variantSettings &&
            hasOwnProperty(variantSettings, 'editionSettings')
          ) {
            variant.editionSettings = variantSettings.editionSettings;
          }
        }
      }
    }
  }
};
