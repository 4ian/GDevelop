// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import type { ResourceKind } from './ResourceSource.flow';
import { type ResourceSourceComponentProps } from './ResourceSource.flow';
import { Component } from 'react';
import {
  isPathInProjectFolder,
  copyAllToProjectFolder,
} from './ResourceUtils.js';
import optionalRequire from '../Utils/OptionalRequire.js';
import Window from '../Utils/Window';
const electron = optionalRequire('electron');
const dialog = electron ? electron.remote.dialog : null;
const path = optionalRequire('path');

const gd: libGDevelop = global.gd;

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
        const { i18n, getLastUsedPath, setLastUsedPath } = this.props;
        const options = {
          multiSelections,
          title: i18n._(t`Choose an audio file`),
          name: i18n._(t`Audio files`),
          extensions: ['aac', 'wav', 'mp3', 'ogg'],
        };
        return selectLocalResourcePath(
          i18n,
          project,
          options,
          getLastUsedPath,
          setLastUsedPath,
          'audio'
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
        const { i18n, getLastUsedPath, setLastUsedPath } = this.props;
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
          getLastUsedPath,
          setLastUsedPath,
          'image'
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
        const { i18n, getLastUsedPath, setLastUsedPath } = this.props;
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
          getLastUsedPath,
          setLastUsedPath,
          'font'
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
        const { i18n, getLastUsedPath, setLastUsedPath } = this.props;
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
          getLastUsedPath,
          setLastUsedPath,
          'video'
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
        const { i18n, getLastUsedPath, setLastUsedPath } = this.props;
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
          getLastUsedPath,
          setLastUsedPath,
          'json'
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
  getLastUsedPath: (project: gdProject, kind: ResourceKind) => string,
  setLastUsedPath: (
    project: gdProject,
    kind: ResourceKind,
    path: string
  ) => void,
  kind: ResourceKind
): Promise<Array<string>> => {
  if (!dialog) return Promise.reject('Not supported');

  const properties = ['openFile'];
  if (options.multiSelections) properties.push('multiSelections');
  const projectPath = path.dirname(project.getProjectFile());

  const latestPath = getLastUsedPath(project, kind) || projectPath;

  const browserWindow = electron.remote.getCurrentWindow();

  return dialog
    .showOpenDialog(browserWindow, {
      title: options.title,
      properties,
      filters: [{ name: options.name, extensions: options.extensions }],
      defaultPath: latestPath,
    })
    .then(({ filePaths }) => {
      if (!filePaths || !filePaths.length) return [];

      const lastUsedPath = path.parse(filePaths[0]).dir;
      setLastUsedPath(project, kind, lastUsedPath);

      const outsideProjectFolderPaths = filePaths.filter(
        path => !isPathInProjectFolder(project, path)
      );

      if (outsideProjectFolderPaths.length) {
        const answer = Window.showConfirmDialog(
          i18n._(
            t`This/these file(s) are outside the project folder. Would you like to make a copy of them in your project folder first (recommended)?`
          )
        );

        if (answer) {
          return copyAllToProjectFolder(project, filePaths);
        }
      }

      return filePaths;
    });
};
