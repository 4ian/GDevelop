// @flow
import semverSatisfies from 'semver/functions/satisfies';
import semverGreaterThan from 'semver/functions/gt';
import {
  type ExtensionShortHeader,
  type BehaviorShortHeader,
} from '../GDevelopServices/Extension';

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
): Array<{ version: string, changes: Array<string> }> => {
  const breakingChanges = [];
  for (const version in extension.changelog) {
    const changes = extension.changelog[version];
    if (semverGreaterThan(version, installedVersion)) {
      breakingChanges.push.apply({ version, changes: changes.breaking });
    }
  }
  return breakingChanges;
};
