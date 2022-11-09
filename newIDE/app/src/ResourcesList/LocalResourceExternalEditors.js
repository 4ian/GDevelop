// @flow
import { openPiskel } from './LocalPiskelBridge';
import { openJfxr } from './LocalJfxrBridge';
import { openYarn } from './LocalYarnBridge';
import { type ResourceExternalEditor } from './ResourceExternalEditor.flow';
import { sendExternalEditorOpened } from '../Utils/Analytics/EventSender';
import { t } from '@lingui/macro';

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
      sendExternalEditorOpened('yarn');
      return openYarn(options);
    },
  },
];

export default editors;
