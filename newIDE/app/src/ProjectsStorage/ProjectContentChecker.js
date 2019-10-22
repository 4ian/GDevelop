// @flow
import { showErrorBox } from '../UI/Messages/MessageBox';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

const gd = global.gd;

export default function verifyProjectContent(i18n, content) {
  const serializedProject = gd.Serializer.fromJSObject(content);
  if (!content.gdVersion && content.eventsFunctions) {
    showErrorBox(
      [
        i18n._(t`Unable to open this file.`),
        i18n._(t`This file is an extension file for GDevelop 5.`),
      ].join('\n')
    );
    return false;
  }

  if (!content.gdVersion && !content.eventsFunctions) {
    showErrorBox(
      [
        i18n._(t`Unable to open this file.`),
        i18n._(t`This file not a file openable in GDevelop 5.`),
      ].join('\n')
    );
    return false;
  }
  serializedProject.delete();
}
