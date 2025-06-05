// @flow
import semverSatisfies from 'semver/functions/satisfies';
import semverGreaterThan from 'semver/functions/gt';
import {
  type ExtensionShortHeader,
  type BehaviorShortHeader,
} from '../GDevelopServices/Extension';

export type ExtensionChange = { version: string, changes: Array<string> };

/**
 * Check if the IDE version satisfies the version required by the asset.
 */
export const isCompatibleWithGDevelopVersion = (
  ideVersion: string,
  requiredGDevelopVersion: ?string
): boolean =>
  requiredGDevelopVersion
    ? semverSatisfies(ideVersion, requiredGDevelopVersion, {
        includePrerelease: true,
      })
    : true;

export const getBreakingChanges = (
  installedVersion: string,
  extension: ExtensionShortHeader | BehaviorShortHeader
): Array<ExtensionChange> => {
  const breakingChanges = [];
  for (const version in extension.changelog) {
    const changes = extension.changelog[version];
    if (semverGreaterThan(version, installedVersion)) {
      breakingChanges.push({ version, changes: changes.breaking });
    }
  }
  return breakingChanges;
};

export const formatBreakingChanges = (
  extensionsBreakingChanges: Map<ExtensionShortHeader, Array<ExtensionChange>>
): string => {
  let formattedChanges = '';
  for (const [extension, breakingChanges] of extensionsBreakingChanges) {
    formattedChanges += '- ' + extension.fullName + '\n';
    for (const breakingChange of breakingChanges) {
      formattedChanges +=
        '  ' + breakingChange.changes.replace(/\n/g, '\n  ') + '\n';
    }
  }
  return formattedChanges;
};
