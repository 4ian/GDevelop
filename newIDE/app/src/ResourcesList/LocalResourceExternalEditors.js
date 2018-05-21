// @flow
import { openPiskel } from './LocalPiskelBridge';
import { type ResourceExternalEditor } from './ResourceExternalEditor.flow';

/**
 * This is the list of editors that can be used to edit resources
 * on Electron runtime.
 */
const editors: Array<ResourceExternalEditor> = [
  {
    name: 'piskel-app',
    displayName: 'Edit with Piskel',
    kind: 'image',
    edit: openPiskel,
  },
];

export default editors;