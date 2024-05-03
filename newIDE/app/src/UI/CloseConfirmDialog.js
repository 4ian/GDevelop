// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import optionalRequire from '../Utils/OptionalRequire';
import Window from '../Utils/Window';
import { isNativeMobileApp } from '../Utils/Platform';
const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');

type Props = {|
  shouldPrompt: boolean,
  i18n: I18nType,
  language: string, // Should be i18n.language.
  hasUnsavedChanges: boolean,
|};

export default React.memo<Props>(function CloseConfirmDialog({
  shouldPrompt,
  i18n,
  language,
  hasUnsavedChanges,
}: Props) {
  const delayElectronClose = React.useRef(true);

  React.useEffect(
    () => {
      if (Window.isDev()) return; // Don't prevent live-reload in development

      const quitMessage = i18n._(t`Are you sure you want to quit GDevelop?`);
      const unsavedChangesMessage = hasUnsavedChanges
        ? i18n._(t`Any unsaved changes in the project will be lost.`)
        : '';
      const message = [quitMessage, unsavedChangesMessage]
        .filter(Boolean)
        .join('\n');

      if (electron) {
        window.onbeforeunload = e => {
          if (delayElectronClose.current && shouldPrompt) {
            // Use setTimeout to avoiding blocking the thread with the "confirm" dialog,
            // which would make Electron to close the window for some weird reason.
            // See https://github.com/electron/electron/issues/7977
            setTimeout(() => {
              const answer = Window.showConfirmDialog(message);
              if (answer) {
                // If answer is positive, re-trigger the close
                delayElectronClose.current = false;
                remote.getCurrentWindow().close();
              }
            }, 10);

            // Prevents closing the window immediately. See https://github.com/electron/electron/blob/master/docs/api/browser-window.md#event-close
            e.returnValue = true; //"It is recommended to always set the event.returnValue explicitly, instead of only returning a value, as the former works more consistently within Electron.""
            return false; //"In Electron, returning any value other than undefined would cancel the close"
          } else {
            // Returning undefined will let the window close
          }
        };
      } else if (window && !isNativeMobileApp()) {
        if (shouldPrompt) {
          window.onbeforeunload = () => message;
        } else {
          window.onbeforeunload = null;
        }
      }
    },
    [shouldPrompt, i18n, language, hasUnsavedChanges]
  );

  return null;
});
