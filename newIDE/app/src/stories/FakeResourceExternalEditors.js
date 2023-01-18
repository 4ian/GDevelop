// @flow
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor';

/**
 * Fake "external editors" to be used in Storybook.
 */
const fakeResourceExternalEditors: Array<ResourceExternalEditor> = [
  {
    name: 'fake-image-editor',
    createDisplayName: 'Create with Super Image Editor',
    editDisplayName: 'Edit with Super Image Editor',
    kind: 'image',
    edit: async options => {
      console.log('Open the image editor with these options:', options);
      return null;
    },
  },
  {
    name: 'fake-audio-editor',
    createDisplayName: 'Create a Sound effect with Super Audio Editor',
    editDisplayName: 'Edit the Sound effect with Super Audio Editor',
    kind: 'audio',
    edit: async options => {
      console.log('Open the audio editor with these options:', options);
      return null;
    },
  },
  {
    name: 'fake-json-editor',
    createDisplayName: 'Create a Dialogue Tree with Super JSON Dialogue Editor',
    editDisplayName: 'Edit the Dialogue Tree with Super JSON Dialogue Editor',
    kind: 'json',
    edit: async options => {
      console.log('Open the json editor with these options:', options);
      return null;
    },
  },
];

export default fakeResourceExternalEditors;
