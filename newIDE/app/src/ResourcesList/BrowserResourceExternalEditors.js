// @flow
import Window from '../Utils/Window';
import { type ResourceExternalEditor } from './ResourceExternalEditor.flow';
import { sendExternalEditorOpened } from '../Utils/Analytics/EventSender';
import { t } from '@lingui/macro';

/**
 * This is the list of editors that can be used to edit resources
 * when running in a browser.
 */
const editors: Array<ResourceExternalEditor> = [
  {
    name: 'piskel-app',
    createDisplayName: t`Create with Piskel`,
    editDisplayName: t`Edit with Piskel`,
    kind: 'image',
    edit: async () => {
      sendExternalEditorOpened('piskel');
      Window.showMessageBox(
        'This feature is only supported in the desktop version for now!\nDownload it from GDevelop website.'
      );

      return null;
    },
  },
  {
    name: 'jfxr-app',
    createDisplayName: t`Create with Jfxr`,
    editDisplayName: t`Edit with Jfxr`,
    kind: 'audio',
    edit: async () => {
      sendExternalEditorOpened('jfxr');
      Window.showMessageBox(
        'This feature is only supported in the desktop version for now!\nDownload it from GDevelop website.'
      );

      return null;
    },
  },
  {
    name: 'yarn-app',
    createDisplayName: t`Create with Yarn`,
    editDisplayName: t`Edit with Yarn`,
    kind: 'json',
    edit: async () => {
      sendExternalEditorOpened('yarn');
      Window.showMessageBox(
        'This feature is only supported in the desktop version for now!\nDownload it from GDevelop website.'
      );

      return null;
    },
  },
];

export default editors;
