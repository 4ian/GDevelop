// @flow
import semverSatisfies from 'semver/functions/satisfies';
import semverGreaterThan from 'semver/functions/gt';
import {
  type ExtensionShortHeader,
  type BehaviorShortHeader,
} from '../GDevelopServices/Extension';

export type ExtensionChange = { version: string, changes: string };

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
  if (!extension.changelog) {
    return [];
  }
  const breakingChanges = [];
  for (const { version, breaking } of extension.changelog) {
    if (breaking && semverGreaterThan(version, installedVersion)) {
      breakingChanges.push({ version, changes: breaking });
    }
  }
  return breakingChanges;
};

export const formatExtensionsBreakingChanges = (
  extensionsBreakingChanges: Map<ExtensionShortHeader, Array<ExtensionChange>>
): string => {
  let formattedChanges = '';
  for (const [extension, breakingChanges] of extensionsBreakingChanges) {
    formattedChanges += '- ' + extension.fullName + '\n';
    formattedChanges += formatBreakingChanges(breakingChanges, '  ');
  }
  return formattedChanges;
};

export const formatBreakingChanges = (
  extensionChange: Array<ExtensionChange>,
  indentation: string = ''
): string => {
  let formattedChanges = '';
  for (const breakingChange of extensionChange) {
    formattedChanges += formatChange(breakingChange.changes, indentation);
  }
  return formattedChanges;
};

const formatChange = (change: string, indentation) =>
  indentation + change.replace(/\n/g, '\n' + indentation) + '\n';

export const formatOldBreakingChanges = (
  installedVersion: string,
  extension: ExtensionShortHeader | BehaviorShortHeader
): string => {
  if (!extension.changelog) {
    return '';
  }
  const extensionsBreakingChanges: Array<ExtensionChange> = [];
  for (const { version, breaking } of extension.changelog) {
    if (breaking && !semverGreaterThan(version, installedVersion)) {
      extensionsBreakingChanges.push({ version, changes: breaking });
    }
  }
  let formattedChanges = '';
  for (const { version, changes } of extensionsBreakingChanges) {
    formattedChanges += '- ' + version + '\n';
    formattedChanges += formatChange(changes, '  ');
  }
  return formattedChanges;
};
