// @flow
import { openPiskel } from './LocalPiskelBridge';
import { openJsfx } from './LocalJsfxBridge';
import { type ResourceExternalEditor } from './ResourceExternalEditor.flow';
import { sendExternalEditorOpened } from '../Utils/Analytics/EventSender';

/**
 * This is the list of editors that can be used to edit resources
 * on Electron runtime.
 */
const editors: Array<ResourceExternalEditor> = [
  {
    name: 'piskel-app',
    displayName: 'Edit with Piskel',
    kind: 'image',
    edit: (options) => {
      sendExternalEditorOpened('piskel');
      return openPiskel(options);
    },
  },
  {
    name: 'Jsfx',
    displayName: 'Create a New Sound effect with Jsxf (*.wav)',
    kind: 'audio',
    edit: (options) => {
      sendExternalEditorOpened('jsfx');
      return openJsfx(options);
    },
  },
];

export default editors;