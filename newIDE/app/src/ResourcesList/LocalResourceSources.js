import { Component } from 'react';
import optionalRequire from '../Utils/OptionalRequire.js';
import {selectLocalResourcePath} from './ResourceUtils.js';
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const dialog = electron ? electron.remote.dialog : null;
const gd = global.gd;

export default [
  {
    name: 'localAudioFileOpener',
    displayName: 'Choose a new audio file',
    kind: 'audio',
    component: class LocalAudioFileOpener extends Component {
      chooseResources = (
        project,
        multiSelections = true
      ): Promise<Array<any>> => {

        const options = {
          multiSelections,
          title: 'Choose an audio file',
          name: 'Audio files',
          extensions: ['wav', 'mp3', 'ogg'],
          forEachPath: resourcePath => {
            const audioResource = new gd.AudioResource();
            const projectPath = path.dirname(project.getProjectFile());
            audioResource.setFile(path.relative(projectPath, resourcePath));
            audioResource.setName(path.relative(projectPath, resourcePath));

            return audioResource;
          }
        };
        return selectLocalResourcePath(project, options)
      };

      render() {
        return null;
      }
    },
  },
  {
    name: 'localFileOpener',
    displayName: 'Choose a new image',
    kind: 'image',
    component: class LocalFileOpener extends Component {
      chooseResources = (
        project,
        multiSelections = true
      ): Promise<Array<any>> => {

        const options = {
          multiSelections,
          title: 'Choose an image',
          name: 'Image files',
          extensions: ['png', 'jpg'],
          forEachPath: resourcePath => {
            const imageResource = new gd.ImageResource();
            const projectPath = path.dirname(project.getProjectFile());
            imageResource.setFile(path.relative(projectPath, resourcePath));
            imageResource.setName(path.relative(projectPath, resourcePath));

            return imageResource;
          }
        };
        return selectLocalResourcePath(project, options)
      };

      render() {
        return null;
      }
    },
  },
  {
    name: 'localFontFileOpener',
    displayName: 'Choose a new font file',
    kind: 'font',
    component: class LocalFontFileOpener extends Component {
      chooseResources = (
        project,
        multiSelections = true
      ): Promise<Array<any>> => {

        const options = {
          multiSelections,
          title: 'Choose a font file',
          name: 'Font files',
          extensions: ['ttf'],
          forEachPath: resourcePath => {
            const fontResource = new gd.FontResource();
            const projectPath = path.dirname(project.getProjectFile());
            fontResource.setFile(path.relative(projectPath, resourcePath));
            fontResource.setName(path.relative(projectPath, resourcePath));

            return fontResource;
          }
        };
        return selectLocalResourcePath(project, options)
      };

      render() {
        return null;
      }
    },
  },
];
