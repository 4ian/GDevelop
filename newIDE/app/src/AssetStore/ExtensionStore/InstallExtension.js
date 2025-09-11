// @flow
import { type I18n as I18nType } from '@lingui/core';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import {
  getExtension,
  type ExtensionShortHeader,
  type BehaviorShortHeader,
} from '../../Utils/GDevelopServices/Extension';
import { addSerializedExtensionsToProject } from '../InstallAsset';
import { type EventsFunctionsExtensionsState } from '../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { t } from '@lingui/macro';
import { retryIfFailed } from '../../Utils/RetryIfFailed';
import { mapVector } from '../../Utils/MapFor';
import {
  type ShowAlertDialogOptions,
  type ShowConfirmDialogOptions,
} from './AlertContext';

const gd: libGDevelop = global.gd;

/**
 * Download and add the extension in the project.
 */
export const installExtension = async (
  i18n: I18nType,
  project: gdProject,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  extensionShortHeader: ExtensionShortHeader | BehaviorShortHeader
): Promise<boolean> => {
  try {
    const serializedExtension = await retryIfFailed({ times: 2 }, () =>
      getExtension(extensionShortHeader)
    );
    await addSerializedExtensionsToProject(
      eventsFunctionsExtensionsState,
      project,
      [serializedExtension]
    );

    return true;
  } catch (rawError) {
    showErrorBox({
      message: i18n._(
        t`Unable to download and install the extension. Verify that your internet connection is working or try again later.`
      ),
      rawError,
      errorId: 'download-extension-error',
    });
    return false;
  }
};

/**
 * Open a dialog to choose an extension and install it in the project.
 */
export const importExtension = async (
  i18n: I18nType,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  onWillInstallExtension: (extensionName: string) => void,
  showConfirmation: ShowConfirmDialogOptions => Promise<boolean>,
  showAlert: ShowAlertDialogOptions => Promise<void>
): Promise<string | null> => {
  const eventsFunctionsExtensionOpener = eventsFunctionsExtensionsState.getEventsFunctionsExtensionOpener();
  if (!eventsFunctionsExtensionOpener) return null;

  try {
    const pathOrUrl = await eventsFunctionsExtensionOpener.chooseEventsFunctionExtensionFile();
    if (!pathOrUrl) return null;

    const serializedExtension = await eventsFunctionsExtensionOpener.readEventsFunctionExtensionFile(
      pathOrUrl
    );

    if (project.hasEventsFunctionsExtensionNamed(serializedExtension.name)) {
      const answer = await showConfirmation({
        title: t`Replace existing extension`,
        message: t`An extension with this name already exists in the project. Importing this extension will replace it.`,
        confirmButtonLabel: `Replace`,
      });
      if (!answer) return null;
    } else {
      let hasConflictWithBuiltInExtension = false;
      const allExtensions = gd
        .asPlatform(gd.JsPlatform.get())
        .getAllPlatformExtensions();
      mapVector(allExtensions, extension => {
        if (extension.getName() === serializedExtension.name) {
          hasConflictWithBuiltInExtension = true;
        }
      });
      if (hasConflictWithBuiltInExtension) {
        await showAlert({
          title: t`Invalid name`,
          message: t`The extension can't be imported because it has the same name as a built-in extension.`,
        });
        return null;
      }
    }

    onWillInstallExtension(serializedExtension.name);

    await addSerializedExtensionsToProject(
      eventsFunctionsExtensionsState,
      project,
      [serializedExtension],
      false
    );
    return serializedExtension.name;
  } catch (rawError) {
    showErrorBox({
      message: i18n._(
        t`An error happened while loading this extension. Please check that it is a proper extension file and compatible with this version of GDevelop`
      ),
      rawError,
      errorId: 'extension-loading-error',
    });
    return null;
  }
};
