// @flow
import { openPiskel } from './LocalPiskelBridge';
import { openJfxr } from './LocalJfxrBridge';
import { openYarn } from './LocalYarnBridge';
import { type ResourceExternalEditor } from './ResourceExternalEditor.flow';
import { sendExternalEditorOpened } from '../Utils/Analytics/EventSender';
import { t } from '@lingui/macro';
import Window from '../Utils/Window';

/**
 * This is the list of editors that can be used to edit resources
 * on Electron runtime.
 */
const editors: Array<ResourceExternalEditor> = [
  {
    name: 'piskel-app',
    createDisplayName: t`Create with Piskel`,
    editDisplayName: t`Edit with Piskel`,
    kind: 'image',
    edit: options => {
      const storageProvider = options.getStorageProvider();
      if (storageProvider.internalName !== 'LocalFile') {
        Window.showMessageBox(
          'Piskel is only supported when your project is saved locally. It will be available for Cloud projects in a future version. To use Piskel, save your project on your computer first.'
        );
        return;
      }

      sendExternalEditorOpened('piskel');
      return openPiskel(options);
    },
  },
  {
    name: 'Jfxr',
    createDisplayName: t`Create with Jfxr`,
    editDisplayName: t`Edit with Jfxr`,
    kind: 'audio',
    edit: options => {
      const storageProvider = options.getStorageProvider();
      if (storageProvider.internalName !== 'LocalFile') {
        Window.showMessageBox(
          'Jfxr is only supported when your project is saved locally. It will be available for Cloud projects in a future version. To use Jfxr, save your project on your computer first.'
        );
        return;
      }

      sendExternalEditorOpened('jfxr');
      return openJfxr(options);
    },
  },
  {
    name: 'Yarn',
    createDisplayName: t`Create with Yarn`,
    editDisplayName: t`Edit with Yarn`,
    kind: 'json',
    edit: options => {
      const storageProvider = options.getStorageProvider();
      if (storageProvider.internalName !== 'LocalFile') {
        Window.showMessageBox(
          'Yarn is only supported when your project is saved locally. It will be available for Cloud projects in a future version. To use Yarn, save your project on your computer first.'
        );
        return;
      }

      sendExternalEditorOpened('yarn');
      return openYarn(options);
    },
  },
];

export default editors;
