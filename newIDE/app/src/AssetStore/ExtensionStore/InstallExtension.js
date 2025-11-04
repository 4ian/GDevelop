// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import {
  getExtension,
  type ExtensionShortHeader,
  type BehaviorShortHeader,
  type SerializedExtension,
  type ExtensionDependency,
} from '../../Utils/GDevelopServices/Extension';
import { type EventsFunctionsExtensionsState } from '../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { t } from '@lingui/macro';
import { mapVector } from '../../Utils/MapFor';
import { type ObjectAsset } from '../../Utils/GDevelopServices/Asset';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import EventsFunctionsExtensionsContext from '../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import uniqBy from 'lodash/uniqBy';
import flatten from 'lodash/flatten';
import { ExtensionStoreContext } from './ExtensionStoreContext';

import { getIDEVersion } from '../../Version';
import uniq from 'lodash/uniq';
import {
  getBreakingChanges,
  isCompatibleWithGDevelopVersion,
  formatExtensionsBreakingChanges,
  type ExtensionChange,
} from '../../Utils/Extension/ExtensionCompatibilityChecker.js';
import InAppTutorialContext from '../../InAppTutorial/InAppTutorialContext';
import PromisePool from '@supercharge/promise-pool';

const gd: libGDevelop = global.gd;

export type RequiredExtensionInstallation = {|
  requiredExtensionShortHeaders: Array<ExtensionShortHeader>,
  missingExtensionShortHeaders: Array<ExtensionShortHeader>,
  outOfDateExtensionShortHeaders: Array<ExtensionShortHeader>,
  breakingChangesExtensionShortHeaders: Array<ExtensionShortHeader>,
  incompatibleWithIdeExtensionShortHeaders: Array<ExtensionShortHeader>,
  safeToUpdateExtensions: Array<ExtensionShortHeader>,
  isGDevelopUpdateNeeded: boolean,
|};

export const getExtensionHeader = (
  extensionShortHeadersByName: {
    [name: string]: ExtensionShortHeader,
  },
  extensionName: string
) => {
  const extensionShortHeader = extensionShortHeadersByName[extensionName];
  if (!extensionShortHeader) {
    throw new Error(
      'Unable to find extension ' + extensionName + ' in the registry.'
    );
  }
  return extensionShortHeader;
};

type CheckRequiredExtensionsArgs = {|
  requiredExtensions: Array<ExtensionDependency>,
  project: gdProject,
  extensionShortHeadersByName: {
    [name: string]: ExtensionShortHeader,
  },
|};

export const checkRequiredExtensionsUpdate = async ({
  requiredExtensions,
  project,
  extensionShortHeadersByName,
}: CheckRequiredExtensionsArgs): Promise<RequiredExtensionInstallation> => {
  if (requiredExtensions.length === 0) {
    return {
      requiredExtensionShortHeaders: [],
      missingExtensionShortHeaders: [],
      outOfDateExtensionShortHeaders: [],
      breakingChangesExtensionShortHeaders: [],
      incompatibleWithIdeExtensionShortHeaders: [],
      safeToUpdateExtensions: [],
      isGDevelopUpdateNeeded: false,
    };
  }

  const requiredExtensionShortHeaders = requiredExtensions.map(
    requiredExtension =>
      getExtensionHeader(
        extensionShortHeadersByName,
        requiredExtension.extensionName
      )
  );

  // Add extensions dependencies
  for (let i = 0; i < requiredExtensionShortHeaders.length; i++) {
    const requiredExtensionShortHeader = requiredExtensionShortHeaders[i];
    let { requiredExtensions } = requiredExtensionShortHeader;
    if (!requiredExtensions) {
      continue;
    }
    requiredExtensions = requiredExtensions.filter(
      ({ extensionName }) =>
        !requiredExtensionShortHeaders.some(
          extensionShortHeader => extensionShortHeader.name === extensionName
        )
    );
    for (const requiredExtension of requiredExtensions) {
      const extensionShortHeader = getExtensionHeader(
        extensionShortHeadersByName,
        requiredExtension.extensionName
      );
      requiredExtensionShortHeaders.push(extensionShortHeader);
    }
  }

  const incompatibleWithIdeExtensionShortHeaders = requiredExtensionShortHeaders.filter(
    requiredExtensionShortHeader =>
      !isCompatibleWithGDevelopVersion(
        getIDEVersion(),
        requiredExtensionShortHeader.gdevelopVersion
      )
  );

  const outOfDateExtensionShortHeaders = requiredExtensionShortHeaders.filter(
    requiredExtensionShortHeader =>
      project.hasEventsFunctionsExtensionNamed(
        requiredExtensionShortHeader.name
      ) &&
      project
        .getEventsFunctionsExtension(requiredExtensionShortHeader.name)
        .getVersion() !== requiredExtensionShortHeader.version
  );

  const breakingChangesExtensionShortHeaders = outOfDateExtensionShortHeaders.filter(
    requiredExtensionShortHeader =>
      project.hasEventsFunctionsExtensionNamed(
        requiredExtensionShortHeader.name
      ) &&
      getBreakingChanges(
        project
          .getEventsFunctionsExtension(requiredExtensionShortHeader.name)
          .getVersion(),
        requiredExtensionShortHeader
      ).length > 0
  );

  const missingExtensionShortHeaders = filterMissingExtensions(
    gd,
    requiredExtensionShortHeaders
  );

  const safeToUpdateExtensions = outOfDateExtensionShortHeaders.filter(
    extension =>
      !incompatibleWithIdeExtensionShortHeaders.includes(extension) &&
      !breakingChangesExtensionShortHeaders.includes(extension)
  );

  // Overridden by `checkRequiredExtensionsUpdateForAssets`
  const isGDevelopUpdateNeeded = incompatibleWithIdeExtensionShortHeaders.some(
    extension => missingExtensionShortHeaders.includes(extension)
  );

  return {
    requiredExtensionShortHeaders,
    missingExtensionShortHeaders,
    outOfDateExtensionShortHeaders,
    breakingChangesExtensionShortHeaders,
    incompatibleWithIdeExtensionShortHeaders,
    safeToUpdateExtensions,
    isGDevelopUpdateNeeded,
  };
};

export const useExtensionUpdateAlertDialog = () => {
  const { showConfirmation, showDeleteConfirmation } = useAlertDialog();
  const { currentlyRunningInAppTutorial } = React.useContext(
    InAppTutorialContext
  );
  return async ({
    project,
    outOfDateExtensionShortHeaders,
    userSelectedExtensionNames,
  }: {|
    project: gdProject,
    outOfDateExtensionShortHeaders: Array<ExtensionShortHeader>,
    userSelectedExtensionNames: Array<string>,
  |}): Promise<string> => {
    if (currentlyRunningInAppTutorial) {
      return 'skip';
    }
    const breakingChanges = new Map<
      ExtensionShortHeader,
      Array<ExtensionChange>
    >();
    for (const extension of outOfDateExtensionShortHeaders) {
      if (!project.hasEventsFunctionsExtensionNamed(extension.name)) {
        continue;
      }
      const installedVersion = project
        .getEventsFunctionsExtension(extension.name)
        .getVersion();
      const extensionBreakingChanges = getBreakingChanges(
        installedVersion,
        extension
      );
      if (extensionBreakingChanges.length > 0) {
        breakingChanges.set(extension, extensionBreakingChanges);
      }
    }
    const notBreakingExtensions = outOfDateExtensionShortHeaders.filter(
      extension =>
        !breakingChanges.has(extension) &&
        !userSelectedExtensionNames.includes(extension.name)
    );
    if (breakingChanges.size > 0) {
      // Extensions without breaking changes are not listed since it would make
      // the message more confusing.
      return (await showDeleteConfirmation({
        title: t`Breaking changes`,
        message: t`This asset requires updates to extensions that have breaking changes${'\n\n' +
          formatExtensionsBreakingChanges(breakingChanges) +
          '\n'}Do you want to update them now?`,
        confirmButtonLabel: t`Update the extension`,
        dismissButtonLabel: t`Abort`,
      }))
        ? 'update'
        : // Avoid to install assets which wouldn't work with the installed version.
          'abort';
    } else if (notBreakingExtensions.length > 0) {
      return (await showConfirmation({
        title: t`Extension update`,
        message: t`Before installing this asset, it's strongly recommended to update these extensions${'\n\n - ' +
          notBreakingExtensions
            .map(extension => extension.fullName)
            .join('\n - ') +
          '\n\n'}Do you want to update them now?`,
        confirmButtonLabel: t`Update the extension`,
        dismissButtonLabel: t`Skip the update`,
      }))
        ? 'update'
        : 'skip';
    } else {
      // The only extensions to update are the one chosen by users
      // and there is no breaking change.
      return 'update';
    }
  };
};

export type RequiredExtensionOwners =
  | Array<ObjectAsset>
  | Array<ExtensionShortHeader>
  | Array<BehaviorShortHeader>
  | Array<SerializedExtension>;

export const getRequiredExtensions = (
  requiredExtensionOwners: RequiredExtensionOwners
): Array<ExtensionDependency> => {
  return uniqBy(
    flatten(
      requiredExtensionOwners.map(owner => owner.requiredExtensions || [])
    ),
    ({ extensionName }) => extensionName
  );
};

export const useInstallExtension = () => {
  const showExtensionUpdateConfirmation = useExtensionUpdateAlertDialog();
  const { showAlert } = useAlertDialog();
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  return async ({
    project,
    requiredExtensionInstallation,
    userSelectedExtensionNames,
    importedSerializedExtensions,
    onExtensionInstalled,
    updateMode,
  }: {|
    project: gdProject,
    requiredExtensionInstallation: RequiredExtensionInstallation,
    userSelectedExtensionNames: Array<string>,
    importedSerializedExtensions: Array<SerializedExtension>,
    onExtensionInstalled: (extensionNames: Array<string>) => void,
    updateMode: 'all' | 'safeOnly',
  |}): Promise<boolean> => {
    if (requiredExtensionInstallation.isGDevelopUpdateNeeded) {
      showAlert({
        title: t`Could not install the extension`,
        message: t`Please upgrade the editor to the latest version.`,
      });
      return false;
    }
    const {
      outOfDateExtensionShortHeaders,
      safeToUpdateExtensions,
    } = requiredExtensionInstallation;
    const extensionUpdateAction =
      outOfDateExtensionShortHeaders.length === 0
        ? 'skip'
        : await showExtensionUpdateConfirmation({
            project,
            outOfDateExtensionShortHeaders:
              updateMode === 'all'
                ? outOfDateExtensionShortHeaders
                : safeToUpdateExtensions,
            userSelectedExtensionNames,
          });
    if (extensionUpdateAction === 'abort') {
      return false;
    }
    await installRequiredExtensions({
      requiredExtensionInstallation,
      shouldUpdateExtension: extensionUpdateAction === 'update',
      eventsFunctionsExtensionsState,
      project,
      onExtensionInstalled,
      importedSerializedExtensions,
    });
    return true;
  };
};

const filterMissingExtensions = (
  gd: libGDevelop,
  requiredExtensions: Array<ExtensionShortHeader>
): Array<ExtensionShortHeader> => {
  const loadedExtensionNames = mapVector(
    gd.asPlatform(gd.JsPlatform.get()).getAllPlatformExtensions(),
    extension => {
      return extension.getName();
    }
  );

  return requiredExtensions.filter(extension => {
    return !loadedExtensionNames.includes(extension.name);
  });
};

export type InstallRequiredExtensionsArgs = {|
  requiredExtensionInstallation: RequiredExtensionInstallation,
  shouldUpdateExtension: boolean,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  importedSerializedExtensions: Array<SerializedExtension>,
|};

export const installRequiredExtensions = async ({
  requiredExtensionInstallation,
  shouldUpdateExtension,
  eventsFunctionsExtensionsState,
  project,
  onExtensionInstalled,
  importedSerializedExtensions,
}: InstallRequiredExtensionsArgs): Promise<void> => {
  const {
    requiredExtensionShortHeaders,
    missingExtensionShortHeaders,
    outOfDateExtensionShortHeaders,
  } = requiredExtensionInstallation;

  if (
    missingExtensionShortHeaders.length === 0 &&
    outOfDateExtensionShortHeaders.length === 0
  ) {
    return;
  }

  const neededExtensions = uniq(
    shouldUpdateExtension
      ? [...missingExtensionShortHeaders, ...outOfDateExtensionShortHeaders]
      : missingExtensionShortHeaders
  ).filter(
    extensionShortHeader =>
      !importedSerializedExtensions.some(
        extension => extension.name === extensionShortHeader.name
      )
  );

  const downloadedSerializedExtensions = await Promise.all(
    neededExtensions.map(extensionShortHeader =>
      getExtension(extensionShortHeader)
    )
  );

  await addSerializedExtensionsToProject(
    eventsFunctionsExtensionsState,
    project,
    [...importedSerializedExtensions, ...downloadedSerializedExtensions]
  );
  onExtensionInstalled(
    neededExtensions.map(extensionShortHeader => extensionShortHeader.name)
  );

  const stillMissingExtensions = filterMissingExtensions(
    gd,
    requiredExtensionShortHeaders
  );
  if (stillMissingExtensions.length) {
    throw new Error(
      'These extensions could not be installed: ' +
        missingExtensionShortHeaders.map(extension => extension.name).join(', ')
    );
  }
};

/**
 * Add a serialized (JS object) events function extension to the project,
 * triggering reload of extensions.
 */
export const addSerializedExtensionsToProject = async (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  serializedExtensions: Array<SerializedExtension>,
  fromExtensionStore: boolean = true
): Promise<void> => {
  const extensionNames = serializedExtensions.map(serializedExtension => {
    const { name } = serializedExtension;
    if (!name) throw new Error('Malformed extension (missing name).');

    return name;
  });

  // Unserialize the extensions in the project. Let the project do it
  // (rather than adding extensions one by one) to allow dependencies between extensions.
  const serializedExtensionsElement = gd.Serializer.fromJSObject(
    serializedExtensions
  );
  project.unserializeAndInsertExtensionsFrom(serializedExtensionsElement);
  serializedExtensionsElement.delete();

  // Keep track of extensions added from the extension store.
  if (fromExtensionStore) {
    extensionNames.forEach(extensionName => {
      if (!project.hasEventsFunctionsExtensionNamed(extensionName)) {
        return;
      }

      const eventsFunctionsExtension = project.getEventsFunctionsExtension(
        extensionName
      );
      eventsFunctionsExtension.setOrigin(
        'gdevelop-extension-store',
        extensionName
      );
    });
  }

  return eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
    project
  );
};

/**
 * Open a dialog to choose an extension and install it in the project.
 */
export const useImportExtension = () => {
  const { showConfirmation, showAlert } = useAlertDialog();
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const installExtension = useInstallExtension();
  const {
    translatedExtensionShortHeadersByName: extensionShortHeadersByName,
  } = React.useContext(ExtensionStoreContext);

  return async ({
    i18n,
    project,
    onWillInstallExtension,
    onExtensionInstalled,
  }: {|
    i18n: I18nType,
    project: gdProject,
    onWillInstallExtension: (extensionName: string) => void,
    onExtensionInstalled: (extensionNames: Array<string>) => void,
  |}): Promise<Array<string>> => {
    const eventsFunctionsExtensionOpener = eventsFunctionsExtensionsState.getEventsFunctionsExtensionOpener();
    if (!eventsFunctionsExtensionOpener) {
      return [];
    }
    try {
      const pathOrUrls = await eventsFunctionsExtensionOpener.chooseEventsFunctionExtensionFile();
      if (pathOrUrls.length === 0) {
        return [];
      }
      /*</string>
      const {
        results: importedSerializedExtensions
      } = 
       */
      const {
        results: importedSerializedExtensions,
      }: {
        results: Array<SerializedExtension>,
        errors: Array<any>,
      } = await PromisePool.withConcurrency(6)
        .for(pathOrUrls)
        .process<SerializedExtension>(async pathOrUrl => {
          return await eventsFunctionsExtensionOpener.readEventsFunctionExtensionFile(
            pathOrUrl
          );
        });
      const importedExtensionNames = importedSerializedExtensions.map(
        extension => extension.name
      );

      if (
        importedExtensionNames.includes(extensionName =>
          project.hasEventsFunctionsExtensionNamed(extensionName)
        )
      ) {
        const answer = await showConfirmation({
          title: t`Replace existing extension`,
          message: t`An extension with this name already exists in the project. Importing this extension will replace it.`,
          confirmButtonLabel: `Replace`,
        });
        if (!answer) {
          return [];
        }
      } else {
        let hasConflictWithBuiltInExtension = false;
        const allExtensions = gd
          .asPlatform(gd.JsPlatform.get())
          .getAllPlatformExtensions();
        mapVector(allExtensions, extension => {
          if (
            importedExtensionNames.includes(
              extensionName => extensionName === extension.getName()
            )
          ) {
            hasConflictWithBuiltInExtension = true;
          }
        });
        if (hasConflictWithBuiltInExtension) {
          await showAlert({
            title: t`Invalid name`,
            message: t`The extension can't be imported because it has the same name as a built-in extension.`,
          });
          return [];
        }
      }
      // TODO make it an array
      onWillInstallExtension(importedExtensionNames[0]);

      const requiredExtensionInstallation = await checkRequiredExtensionsUpdate(
        {
          requiredExtensions: getRequiredExtensions(
            importedSerializedExtensions
          ),
          project,
          extensionShortHeadersByName,
        }
      );
      const isImportedExtension = (
        extensionShortHeader: ExtensionShortHeader
      ) =>
        importedSerializedExtensions.some(
          extension => extension.name === extensionShortHeader.name
        );
      // When users import an extension with its dependencies,
      // we should not try to get them from the extension store.
      requiredExtensionInstallation.outOfDateExtensionShortHeaders = requiredExtensionInstallation.outOfDateExtensionShortHeaders.filter(
        isImportedExtension
      );
      requiredExtensionInstallation.safeToUpdateExtensions = requiredExtensionInstallation.safeToUpdateExtensions.filter(
        isImportedExtension
      );
      requiredExtensionInstallation.breakingChangesExtensionShortHeaders = requiredExtensionInstallation.breakingChangesExtensionShortHeaders.filter(
        isImportedExtension
      );
      requiredExtensionInstallation.missingExtensionShortHeaders = requiredExtensionInstallation.missingExtensionShortHeaders.filter(
        isImportedExtension
      );
      requiredExtensionInstallation.incompatibleWithIdeExtensionShortHeaders = requiredExtensionInstallation.incompatibleWithIdeExtensionShortHeaders.filter(
        isImportedExtension
      );

      const wasExtensionInstalled = await installExtension({
        project,
        requiredExtensionInstallation,
        userSelectedExtensionNames: [],
        importedSerializedExtensions,
        onExtensionInstalled,
        updateMode: 'all',
      });
      if (!wasExtensionInstalled) {
        return [];
      }
      return importedExtensionNames;
    } catch (rawError) {
      showErrorBox({
        message: i18n._(
          t`An error happened while loading this extension. Please check that it is a proper extension file and compatible with this version of GDevelop`
        ),
        rawError,
        errorId: 'extension-loading-error',
      });
      return [];
    }
  };
};
