//@flow
import { diff } from 'semver/functions/diff';
import { enumerateEventsFunctionsExtensions } from '../../ProjectManager/EnumerateProjectItems';
import { ExtensionStoreContext } from './ExtensionStoreContext';
import { useContext } from 'react';

type UpdateMetadata = {|
  type: 'patch' | 'minor' | 'major',
  currentVersion: string,
  newestVersion: string,
|};
type ExtensionUpdates = Map<string, UpdateMetadata>;

export const useExtensionUpdates = (project: gdProject): ExtensionUpdates => {
  const { extensionShortHeadersByName } = useContext(ExtensionStoreContext);
  const installedExtensions = enumerateEventsFunctionsExtensions(project);

  const extensionUpdates = new Map<string, UpdateMetadata>();

  for (const localExtension of installedExtensions) {
    const localExtensionName = localExtension.getName();
    const extensionHeader = extensionShortHeadersByName[localExtensionName];

    // No header, this is not an extension that exists on the store. Skip it.
    if (!extensionHeader) continue;

    const currentVersion = localExtension.getVersion();
    const newestVersion = extensionHeader.version;

    try {
      const versionDiff = diff(currentVersion, newestVersion);
      if (['patch', 'minor', 'major'].includes(versionDiff)) {
        extensionUpdates.set(localExtensionName, {
          type: versionDiff,
          currentVersion,
          newestVersion,
        });
      }
    } catch {
      // An error will be thrown here only if the version is not in semver.
      // Simply compare the strings for such extensions.
      // Note that this is an edge case, the extension repository enforces semver, so this
      // is only for local extensions that do not respect the best practices.
      if (currentVersion !== newestVersion)
        extensionUpdates.set(localExtensionName, {
          // Use minor as it is the most neutral option
          type: 'minor',
          currentVersion,
          newestVersion,
        });
    }
  }

  return extensionUpdates;
};
