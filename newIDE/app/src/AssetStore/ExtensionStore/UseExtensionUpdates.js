//@flow
import getVersionUpdateType from 'semver/functions/diff';
import versionGreaterThan from 'semver/functions/gt';
import { useMemo } from 'react';
import type {
  ExtensionShortHeader,
  BehaviorShortHeader,
} from '../../Utils/GDevelopServices/Extension';

type UpdateType = 'patch' | 'minor' | 'major' | 'unknown';
type UpdateMetadata = {|
  type: UpdateType,
  currentVersion: string,
  newestVersion: string,
  isDowngrade: boolean,
|};

const getUpdateMetadataFromVersions = (
  currentVersion: string,
  newestVersion: string
): UpdateMetadata | null => {
  try {
    const versionDiff: UpdateType = getVersionUpdateType(
      currentVersion,
      newestVersion
    );
    const isDowngrade = versionGreaterThan(currentVersion, newestVersion);
    if (['patch', 'minor', 'major'].includes(versionDiff)) {
      return {
        type: versionDiff,
        currentVersion,
        newestVersion,
        isDowngrade,
      };
    }
  } catch {
    // An error will be thrown here only if the version is not in semver.
    // Simply compare the strings for such extensions.
    // Note that this is an edge case, the extension repository enforces semver, so this
    // is only for local extensions that do not respect the best practices.
    if (currentVersion !== newestVersion) {
      return {
        type: 'unknown',
        currentVersion,
        newestVersion,
        isDowngrade: false,
      };
    }
  }

  return null;
};

export const useExtensionUpdate = (
  project: gdProject,
  extension: ExtensionShortHeader | BehaviorShortHeader
): UpdateMetadata | null => {
  const installedVersionOrUndefined =
    project.hasEventsFunctionsExtensionNamed(extension.name) &&
    project.getEventsFunctionsExtension(extension.name).getVersion();
  return useMemo<UpdateMetadata | null>(
    () => {
      const extensionName = extension.extensionName || extension.name;
      return project.hasEventsFunctionsExtensionNamed(extensionName)
        ? getUpdateMetadataFromVersions(
            project.getEventsFunctionsExtension(extensionName).getVersion(),
            extension.version
          )
        : null;
    },
    // installedVersionOrNull is unused inside the function, but necessary to make
    // the UpdateMetadata be reprocessed whenever the extension version has changed.
    [project, extension, installedVersionOrUndefined] // eslint-disable-line react-hooks/exhaustive-deps
  );
};
