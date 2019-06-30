import { Component } from 'react';
import { confirmResourcePath } from './ResourceUtils.js';
import optionalRequire from '../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');
const dialog = electron ? electron.remote.dialog : null;
const path = optionalRequire('path');

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
        };
        return selectLocalResourcePath(project, options).then(resources => {
          return resources.map(resourcePath => {
            const audioResource = new gd.AudioResource();
            const projectPath = path.dirname(project.getProjectFile());
            audioResource.setFile(path.relative(projectPath, resourcePath));
            audioResource.setName(path.relative(projectPath, resourcePath));

            return audioResource;
          });
        });
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
        };
        return selectLocalResourcePath(project, options).then(resources => {
          return resources.map(resourcePath => {
            const imageResource = new gd.ImageResource();
            const projectPath = path.dirname(project.getProjectFile());
            imageResource.setFile(path.relative(projectPath, resourcePath));
            imageResource.setName(path.relative(projectPath, resourcePath));

            return imageResource;
          });
        });
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
          extensions: ['ttf', 'otf'],
        };
        return selectLocalResourcePath(project, options).then(resources => {
          return resources.map(resourcePath => {
            const fontResource = new gd.FontResource();
            const projectPath = path.dirname(project.getProjectFile());
            fontResource.setFile(path.relative(projectPath, resourcePath));
            fontResource.setName(path.relative(projectPath, resourcePath));

            return fontResource;
          });
        });
      };

      render() {
        return null;
      }
    },
  },
  {
    name: 'localVideoFileOpener',
    displayName: 'Choose a new video file',
    kind: 'video',
    component: class LocalVideoFileOpener extends Component {
      chooseResources = (
        project,
        multiSelections = true
      ): Promise<Array<any>> => {
        const options = {
          multiSelections,
          title: 'Choose a video file',
          name: 'Video files',
          extensions: ['mp4'],
        };
        return selectLocalResourcePath(project, options).then(resources => {
          return resources.map(resourcePath => {
            const videoResource = new gd.VideoResource();
            const projectPath = path.dirname(project.getProjectFile());
            videoResource.setFile(path.relative(projectPath, resourcePath));
            videoResource.setName(path.relative(projectPath, resourcePath));

            return videoResource;
          });
        });
      };

      render() {
        return null;
      }
    },
  },
  {
    name: 'localJsonFileOpener',
    displayName: 'Choose a new json file',
    kind: 'json',
    component: class LocalJsonFileOpener extends Component {
      chooseResources = (
        project,
        multiSelections = true
      ): Promise<Array<any>> => {
        const options = {
          multiSelections,
          title: 'Choose a json file',
          name: 'Json files',
          extensions: ['mp4'],
        };
        return selectLocalResourcePath(project, options).then(resources => {
          return resources.map(resourcePath => {
            const jsonResource = new gd.JsonResource();
            const projectPath = path.dirname(project.getProjectFile());
            jsonResource.setFile(path.relative(projectPath, resourcePath));
            jsonResource.setName(path.relative(projectPath, resourcePath));

            return jsonResource;
          });
        });
      };

      render() {
        return null;
      }
    },
  },
];

const selectLocalResourcePath = (
  project: gdProject,
  options: {
    multiSelections: boolean,
    title: string,
    name: string,
    extensions: Array<string>,
  }
): Promise<Array<string>> => {
  return new Promise((resolve, reject) => {
    if (!dialog) return reject('Not supported');

    const properties = ['openFile'];
    if (options.multiSelections) properties.push('multiSelections');
    const projectPath = path.dirname(project.getProjectFile());

    const browserWindow = electron.remote.getCurrentWindow();
    dialog.showOpenDialog(
      browserWindow,
      {
        title: options.title,
        properties,
        filters: [{ name: options.name, extensions: options.extensions }],
        defaultPath: projectPath,
      },
      paths => {
        if (!paths) return resolve([]);
        if (!confirmResourcePath(project, paths[0])) return resolve([]);

        return resolve(paths);
      }
    );
  });
};
