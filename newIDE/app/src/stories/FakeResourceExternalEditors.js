// @flow
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';

/**
 * Fake "external editors" to be used in Storybook.
 */
const fakeResourceExternalEditors: Array<ResourceExternalEditor> = [
  {
    name: 'fake-image-editor',
    createDisplayName: 'Create with Super Image Editor',
    editDisplayName: 'Edit with Super Image Editor',
    kind: 'image',
    edit: options => {
      console.log('Open the image editor with these options:', options);
    },
  },
  {
    name: 'fake-audio-editor',
    createDisplayName: 'Create a Sound effect with Super Audio Editor',
    editDisplayName: 'Edit the Sound effect with Super Audio Editor',
    kind: 'audio',
    edit: options => {
      console.log('Open the audio editor with these options:', options);
    },
  },
  {
    name: 'fake-json-editor',
    createDisplayName: 'Create a Dialogue Tree with Super JSON Dialogue Editor',
    editDisplayName: 'Edit the Dialogue Tree with Super JSON Dialogue Editor',
    kind: 'json',
    edit: options => {
      console.log('Open the json editor with these options:', options);
    },
  },
];

export default fakeResourceExternalEditors;
