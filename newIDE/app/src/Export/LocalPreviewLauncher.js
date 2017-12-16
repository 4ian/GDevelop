// @flow

import localFileSystem from './LocalFileSystem';
import optionalRequire from '../Utils/OptionalRequire';
import { timeFunction } from '../Utils/TimeFunction';
import { findGDJS } from './LocalGDJSFinder';
import assignIn from 'lodash/assignIn';
const electron = optionalRequire('electron');
const path = optionalRequire('path');
const BrowserWindow = electron ? electron.remote.BrowserWindow : null;
const gd = global.gd;

export default class LocalPreviewLauncher {
  static _openPreviewWindow = (project: gdProject, gamePath: string): void => {
    if (!BrowserWindow) return;

    const win = new BrowserWindow({
      width: project.getMainWindowDefaultWidth(),
      height: project.getMainWindowDefaultHeight(),
      title: `Preview of ${project.getName()}`,
    });
    win.loadURL(`file://${gamePath}/index.html`);
  };

  static _prepareExporter = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      findGDJS(gdjsRoot => {
        if (!gdjsRoot) {
          //TODO
          console.error('Could not find GDJS');
          return reject();
        }
        console.info('GDJS found in ', gdjsRoot);

        const fileSystem = assignIn(
          new gd.AbstractFileSystemJS(),
          localFileSystem
        );
        const outputDir = path.join(fileSystem.getTempDir(), 'preview');
        const exporter = new gd.Exporter(fileSystem, gdjsRoot);

        resolve({
          outputDir,
          exporter,
        });
      });
    });
  };

  static launchLayoutPreview = (
    project: gdProject,
    layout: gdLayout
  ): Promise<any> => {
    if (!project || !layout) return Promise.reject();

    return LocalPreviewLauncher._prepareExporter().then(
      ({ outputDir, exporter }) => {
        timeFunction(
          () => {
            exporter.exportLayoutForPixiPreview(project, layout, outputDir);
            exporter.delete();
            LocalPreviewLauncher._openPreviewWindow(project, outputDir);
          },
          time => console.info(`Preview took ${time}ms`)
        );
      }
    );
  };

  static launchExternalLayoutPreview = (
    project: gdProject,
    layout: gdLayout,
    externalLayout: gdExternalLayout
  ): Promise<any> => {
    if (!project || !externalLayout) return Promise.reject();

    return LocalPreviewLauncher._prepareExporter().then(
      ({ outputDir, exporter }) => {
        timeFunction(
          () => {
            exporter.exportExternalLayoutForPixiPreview(
              project,
              layout,
              externalLayout,
              outputDir
            );
            exporter.delete();
            LocalPreviewLauncher._openPreviewWindow(project, outputDir);
          },
          time => console.info(`Preview took ${time}ms`)
        );
      }
    );
  };
}
