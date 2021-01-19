// @flow
import { showErrorBox } from '../UI/Messages/MessageBox';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

export default function verifyProjectContent(
  i18n: I18nType,
  content: Object
): boolean {
  if (!content.gdVersion && content.eventsFunctions) {
    showErrorBox({
      message: [
        i18n._(t`Unable to open this file.`),
        i18n._(
          t`This file is an extension file for GDevelop 5. You should instead import it, using the window to add a new extension to your project.`
        ),
      ].join('\n'),
      rawError: undefined,
      errorId: 'extension-opened-as-project-error',
      doNotReport: true,
    });
    return false;
  }

  if (!content.gdVersion && !content.eventsFunctions) {
    showErrorBox({
      message: [
        i18n._(t`Unable to open this file.`),
        i18n._(
          t`This file is not recognized as a GDevelop 5 project. Be sure to open a file that was saved using GDevelop.`
        ),
      ].join('\n'),
      rawError: undefined,
      errorId: 'malformed-project-error',
      doNotReport: true,
    });
    return false;
  }
  return true;
}
