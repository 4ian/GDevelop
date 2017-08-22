// @flow

import { makeBrowserS3FileSystem } from './BrowserS3FileSystem';
import { timeFunction } from '../Utils/TimeFunction';
import { findGDJS } from './BrowserS3GDJSFinder';
import assignIn from 'lodash/assignIn';
const gd = global.gd;

const awsS3 = require('aws-sdk/clients/s3');
const destinationBucket = `gd-games-preview`;
const accessKeyId = 'AKIAIUKQZTOSCLA5NS3Q';
const secretAccessKey = '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';
const region = 'eu-west-1';
const destinationBucketBaseUrl = `https://s3-${region}.amazonaws.com/${destinationBucket}/`;

const awsS3Client = new awsS3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region,
});

export default class BrowserS3PreviewLauncher {
  static _openPreviewWindow = (project, gamePath): void => {
    console.log('TODO: Open ' + gamePath);
  };

  static _prepareExporter = (): Promise<any> => {
    awsS3Client.putObject(
      {
        Bucket: destinationBucket,
        Key: 'test.html',
        Body: 'testtest',
      },
      (err, data) => {
        if (err)
          console.log(err, err.stack); // an error occurred
        else
          console.log(data); // successful response
      }
    );

    return new Promise((resolve, reject) => {
      findGDJS(({ gdjsRoot, filesContent }) => {
        if (!gdjsRoot) {
          //TODO
          console.error('Could not find GDJS');
          return reject();
        }
        console.info('GDJS found in ', gdjsRoot);

        const prefix = '' + Date.now() + '-' + Math.floor(Math.random()*1000);

        const fileSystem = assignIn(
          new gd.AbstractFileSystemJS(),
          makeBrowserS3FileSystem({
            filesContent,
            awsS3Client,
            bucket: destinationBucket,
            prefix,
          })
        );
        const exporter = new gd.Exporter(fileSystem, gdjsRoot);
        exporter.setCodeOutputDirectory(destinationBucketBaseUrl);
        const outputDir = destinationBucketBaseUrl;

        resolve({
          outputDir,
          exporter,
          prefix,
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
    return Promise.reject('Not implemented');
  };
}
