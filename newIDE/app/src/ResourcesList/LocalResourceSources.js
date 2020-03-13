// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { type ResourceSourceComponentProps } from './ResourceSource.flow';
import { Component } from 'react';
import {
  copyAllToProjectFolder,
  isPathInProjectFolder,
} from './ResourceUtils.js';
import optionalRequire from '../Utils/OptionalRequire.js';
import type { PreferencesValues } from '../MainFrame/Preferences/PreferencesContext';

const electron = optionalRequire('electron');
const dialog = electron ? electron.remote.dialog : null;
const path = optionalRequire('path');

const gd = global.gd;

export default [
  {
    name: 'localAudioFileOpener',
    displayName: 'Choose a new audio file',
    kind: 'audio',
    component: class LocalAudioFileOpener extends Component<ResourceSourceComponentProps> {
      chooseResources = (
        project: gdProject,
        multiSelections: boolean = true
      ): Promise<Array<any>> => {
        const {
          i18n,
          loadPreferencesValues,
          savePreferencesValues,
        } = this.props;
        const options = {
          multiSelections,
          title: i18n._(t`Choose an audio file`),
          name: i18n._(t`Audio files`),
          extensions: ['wav', 'mp3', 'ogg'],
        };
        return selectLocalResourcePath(
          i18n,
          project,
          options,
          loadPreferencesValues,
          savePreferencesValues
        ).then(resources => {
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
    component: class LocalFileOpener extends Component<ResourceSourceComponentProps> {
      chooseResources = (
        project: gdProject,
        multiSelections: boolean = true
      ): Promise<Array<any>> => {
        const {
          i18n,
          loadPreferencesValues,
          savePreferencesValues,
        } = this.props;
        const options = {
          multiSelections,
          title: i18n._(t`Choose an image`),
          name: i18n._(t`Image files`),
          extensions: ['png', 'jpg'],
        };
        return selectLocalResourcePath(
          i18n,
          project,
          options,
          loadPreferencesValues,
          savePreferencesValues
        ).then(resources => {
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
    component: class LocalFontFileOpener extends Component<ResourceSourceComponentProps> {
      chooseResources = (
        project: gdProject,
        multiSelections: boolean = true
      ): Promise<Array<any>> => {
        const {
          i18n,
          loadPreferencesValues,
          savePreferencesValues,
        } = this.props;
        const options = {
          multiSelections,
          title: i18n._(t`Choose a font file`),
          name: i18n._(t`Font files`),
          extensions: ['ttf', 'otf'],
        };
        return selectLocalResourcePath(
          i18n,
          project,
          options,
          loadPreferencesValues,
          savePreferencesValues
        ).then(resources => {
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
    component: class LocalVideoFileOpener extends Component<ResourceSourceComponentProps> {
      chooseResources = (
        project: gdProject,
        multiSelections: boolean = true
      ): Promise<Array<any>> => {
        const {
          i18n,
          loadPreferencesValues,
          savePreferencesValues,
        } = this.props;
        const options = {
          multiSelections,
          title: i18n._(t`Choose a video file`),
          name: i18n._(t`Video files`),
          extensions: ['mp4'],
        };
        return selectLocalResourcePath(
          i18n,
          project,
          options,
          loadPreferencesValues,
          savePreferencesValues
        ).then(resources => {
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
    component: class LocalJsonFileOpener extends Component<ResourceSourceComponentProps> {
      chooseResources = (
        project: gdProject,
        multiSelections: boolean = true
      ): Promise<Array<any>> => {
        const {
          i18n,
          loadPreferencesValues,
          savePreferencesValues,
        } = this.props;
        const options = {
          multiSelections,
          title: i18n._(t`Choose a json file`),
          name: i18n._(t`JSON file`),
          extensions: ['json'],
        };
        return selectLocalResourcePath(
          i18n,
          project,
          options,
          loadPreferencesValues,
          savePreferencesValues
        ).then(resources => {
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
  i18n: I18nType,
  project: gdProject,
  options: {
    multiSelections: boolean,
    title: string,
    name: string,
    extensions: Array<string>,
  },
  loadPreferencesValues: () => ?PreferencesValues,
  savePreferencesValues: (values: PreferencesValues) => void
): Promise<Array<string>> => {
  return new Promise((resolve, reject) => {
    if (!dialog) return reject('Not supported');

    const properties = ['openFile'];
    if (options.multiSelections) properties.push('multiSelections');
    let projectPath = path.dirname(project.getProjectFile());

    // Load lastOpenedPath and update projectPath if not undefined
    let values = loadPreferencesValues();
    if (values) {
      projectPath = values.lastOpenedPath;
    }

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

        // Update stored preferences values
        if (paths[0] !== projectPath) {
          if (values) {
            values.lastOpenedPath = paths[0];
            savePreferencesValues(values);
          }
        }

        const outsideProjectFolderPaths = paths.filter(
          path => !isPathInProjectFolder(project, path)
        );

        if (outsideProjectFolderPaths.length) {
          // eslint-disable-next-line
          const answer = confirm(
            i18n._(
              t`This/these file(s) are outside the project folder. Would you like to make a copy of them in your project folder first (recommended)?`
            )
          );

          if (answer) {
            return resolve(copyAllToProjectFolder(project, paths));
          }
        }

        return resolve(paths);
      }
    );
  });
};
