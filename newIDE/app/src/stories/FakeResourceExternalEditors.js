// @flow
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';

/**
 * Fake "external editors" to be used in Storybook.
 */
const fakeResourceExternalEditors: Array<ResourceExternalEditor> = [
  {
    name: 'fake-image-editor',
    displayName: 'Edit with Super Image Editor',
    kind: 'image',
    edit: options => {
      console.log('Open the image editor with these options:', options);
    },
  },
  {
    name: 'fake-audio-editor',
    displayName: 'Create/Edit a Sound effect with Super Audio Editor',
    kind: 'audio',
    edit: options => {
      console.log('Open the audio editor with these options:', options);
    },
  },
  {
    name: 'fake-json-editor',
    displayName: 'Create/Edit a Dialogue Tree with Super JSON Dialogue Editor',
    kind: 'json',
    edit: options => {
      console.log('Open the json editor with these options:', options);
    },
  },
];

export default fakeResourceExternalEditors;
