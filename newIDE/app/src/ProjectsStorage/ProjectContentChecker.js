// @flow
import { showErrorBox } from '../UI/Messages/MessageBox';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

export default function verifyProjectContent(
  i18n: I18nType,
  content: Object
): boolean {
  if (!content.gdVersion && content.eventsFunctions) {
    showErrorBox(
      [
        i18n._(t`Unable to open this file.`),
        i18n._(
          t`This file is an extension file for GDevelop 5. You should instead import it, using the window to add a new extension to your project.`
        ),
      ].join('\n')
    );
    return false;
  }

  if (!content.gdVersion && !content.eventsFunctions) {
    showErrorBox(
      [
        i18n._(t`Unable to open this file.`),
        i18n._(
          t`This file is not recognized as a GDevelop 5 project. Be sure to open a file that was saved using GDevelop.`
        ),
      ].join('\n')
    );
    return false;
  }
  return true;
}
