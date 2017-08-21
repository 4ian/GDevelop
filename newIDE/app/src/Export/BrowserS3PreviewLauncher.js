// @flow

import { makeBrowserS3FileSystem } from './BrowserS3FileSystem';
import { timeFunction } from '../Utils/TimeFunction';
import { findGDJS } from './BrowserS3GDJSFinder';
import assignIn from 'lodash/assignIn';
const gd = global.gd;

export default class BrowserS3PreviewLauncher {
  static _openPreviewWindow = (project, gamePath): void => {
    console.log("TODO: Open " + gamePath);
  };

  static _prepareExporter = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      findGDJS(({gdjsRoot, filesContent}) => {
        if (!gdjsRoot) {
          //TODO
          console.error('Could not find GDJS');
          return reject();
        }
        console.info('GDJS found in ', gdjsRoot);

        const fileSystem = assignIn(
          new gd.AbstractFileSystemJS(),
          makeBrowserS3FileSystem(filesContent)
        );
        const outputDir = '/virtual-output-dir';
        const exporter = new gd.Exporter(fileSystem, gdjsRoot);
        exporter.setCodeOutputDirectory('http://buckets3.com/unique-id/');

        resolve({
          outputDir,
          exporter,
        });
      });
    });
  };

  static launchLayoutPreview = (project, layout): Promise<any> => {
    if (!project || !layout) return Promise.reject();

    return BrowserS3PreviewLauncher._prepareExporter().then(({
      outputDir,
      exporter,
    }) => {
      timeFunction(
        () => {
          exporter.exportLayoutForPixiPreview(project, layout, outputDir);
          exporter.delete();
          BrowserS3PreviewLauncher._openPreviewWindow(project, outputDir);
        },
        time => console.info(`Preview files generation took ${time}ms`)
      );
    });
  };

  static launchExternalLayoutPreview = (
    project,
    layout,
    externalLayout
  ): Promise<any> => {
    return Promise.reject("Not implemented");
  };
}
