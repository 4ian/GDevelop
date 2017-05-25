// @flow

import localFileSystem from './LocalFileSystem';
import optionalRequire from '../Utils/OptionalRequire';
import { findGDJS } from './LocalGDJSFinder';
import assignIn from 'lodash/assignIn';
import path from 'path';
const electron = optionalRequire('electron');
const BrowserWindow = electron ? electron.remote.BrowserWindow : null;
const gd = global.gd;

export default class LocalPreviewLauncher {
  static _openPreviewWindow = (project, gamePath): void => {
    if (!BrowserWindow) return;

    const win = new BrowserWindow({
      width: project.getMainWindowDefaultWidth(),
      height: project.getMainWindowDefaultHeight(),
      title: `Preview of ${project.getName()}`,
    });
    win.loadURL(`file://${gamePath}/index.html`);
  };

  static launchLayoutPreview = (project, layout): Promise<any> => {
    if (!project || !layout) return Promise.reject();

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

        var t0 = performance.now();

        exporter.exportLayoutForPixiPreview(project, layout, outputDir);
        exporter.delete();

        var t1 = performance.now();
        console.log(
          'Call to exporter.exportLayoutForPixiPreview took ' +
            (t1 - t0) +
            ' milliseconds.'
        );

        LocalPreviewLauncher._openPreviewWindow(project, outputDir);
        resolve();
      });
    });
  };

  static launchExternalLayoutPreview = (): Promise<any> => {
    throw new Error('todo');
  };
}
