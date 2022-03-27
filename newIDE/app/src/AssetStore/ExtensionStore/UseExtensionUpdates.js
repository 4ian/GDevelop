//@flow
import { diff } from 'semver/functions/diff';
import { enumerateEventsFunctionsExtensions } from '../../ProjectManager/EnumerateProjectItems';
import { ExtensionStoreContext } from './ExtensionStoreContext';
import { useContext, useMemo } from 'react';
import type { ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';

type UpdateType = 'patch' | 'minor' | 'major';
type UpdateMetadata = {|
  type: UpdateType,
  currentVersion: string,
  newestVersion: string,
|};
type ExtensionUpdates = Map<string, UpdateMetadata>;

const getUpdateMetadataFromVersions = (
  currentVersion: string,
  newestVersion: string
): UpdateMetadata | null => {
  try {
    const versionDiff: UpdateType = diff(currentVersion, newestVersion);
    if (['patch', 'minor', 'major'].includes(versionDiff)) {
      return {
        type: versionDiff,
        currentVersion,
        newestVersion,
      };
    }
  } catch {
    // An error will be thrown here only if the version is not in semver.
    // Simply compare the strings for such extensions.
    // Note that this is an edge case, the extension repository enforces semver, so this
    // is only for local extensions that do not respect the best practices.
    if (currentVersion !== newestVersion) {
      return {
        // Use minor as it is the most neutral option
        type: 'minor',
        currentVersion,
        newestVersion,
      };
    }
  }

  return null;
};

export const useExtensionUpdate = (
  project: gdProject,
  extension: ExtensionShortHeader
): UpdateMetadata | null => {
  return useMemo<UpdateMetadata | null>(
    () =>
      project.hasEventsFunctionsExtensionNamed(extension.name)
        ? getUpdateMetadataFromVersions(
            project.getEventsFunctionsExtension(extension.name).getVersion(),
            extension.version
          )
        : null,
    [project, extension]
  );
};

// TODO: Use this hook to display a visual hint when an installed extension can be updated
export const useAllExtensionUpdates = (
  project: gdProject
): ExtensionUpdates => {
  const { extensionShortHeadersByName } = useContext(ExtensionStoreContext);
  return useMemo(
    () => {
      const installedExtensions = enumerateEventsFunctionsExtensions(project);
      const extensionUpdates = new Map<string, UpdateMetadata>();

      for (const localExtension of installedExtensions) {
        const localExtensionName = localExtension.getName();
        const extensionHeader = extensionShortHeadersByName[localExtensionName];

        // No header, this is not an extension that exists on the store. Skip it.
        if (!extensionHeader) continue;

        const currentVersion = localExtension.getVersion();
        const newestVersion = extensionHeader.version;
        const updateMetadata = getUpdateMetadataFromVersions(
          currentVersion,
          newestVersion
        );
        if (updateMetadata)
          extensionUpdates.set(localExtensionName, updateMetadata);
      }

      return extensionUpdates;
    },
    [project]
  );
};
