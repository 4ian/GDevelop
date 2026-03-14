// @flow

const gd: libGDevelop = global.gd;

type BundledSerializedExtension = {
  name: string,
  version?: string,
};

const bundledSerializedExtensions: Array<BundledSerializedExtension> = [];

const shouldInstallBundledExtension = (
  project: gdProject,
  bundledExtension: BundledSerializedExtension
): boolean => {
  if (!project.hasEventsFunctionsExtensionNamed(bundledExtension.name)) {
    return true;
  }

  // If no version is provided, keep the project extension as-is.
  if (!bundledExtension.version) {
    return false;
  }

  const installedExtension = project.getEventsFunctionsExtension(
    bundledExtension.name
  );
  return installedExtension.getVersion() !== bundledExtension.version;
};

/**
 * Ensure bundled events-based extensions are available in all projects.
 *
 * Returns true when extensions were inserted or updated.
 */
export const ensureBundledEventsFunctionsExtensions = (
  project: gdProject
): boolean => {
  const extensionsToInstall = bundledSerializedExtensions.filter(
    bundledExtension => shouldInstallBundledExtension(project, bundledExtension)
  );

  if (extensionsToInstall.length === 0) {
    return false;
  }

  const serializedExtensionsElement = gd.Serializer.fromJSObject(
    extensionsToInstall
  );
  project.unserializeAndInsertExtensionsFrom(serializedExtensionsElement);
  serializedExtensionsElement.delete();

  extensionsToInstall.forEach(({ name }) => {
    if (!project.hasEventsFunctionsExtensionNamed(name)) {
      return;
    }

    project
      .getEventsFunctionsExtension(name)
      .setOrigin('gdevelop-builtin-extension', name);
  });

  return true;
};
