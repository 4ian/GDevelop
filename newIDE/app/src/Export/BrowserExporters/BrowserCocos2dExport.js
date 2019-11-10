// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import assignIn from 'lodash/assignIn';
import { findGDJS } from './BrowserS3GDJSFinder';
import BrowserFileSystem from './BrowserFileSystem';
import {
  type UrlFileDescriptor,
  type TextFileDescriptor,
  type BlobFileDescriptor,
  downloadUrlsToBlobs,
  archiveFiles,
} from '../../Utils/BrowserArchiver';
import {
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
import RaisedButton from '../../UI/RaisedButton';
import { BlobDownloadUrlHolder } from '../../Utils/BlobDownloadUrlHolder';
import {
  ExplanationHeader,
  DoneFooter,
} from '../GenericExporters/Cocos2dExport';
import { openBlobDownloadUrl } from '.';
import { Column, Line } from '../../UI/Grid';
import Toggle from '../../UI/Toggle';
const gd = global.gd;

type ExportState = {
  debugMode: boolean,
};

type PreparedExporter = {|
  exporter: gdjsExporter,
  abstractFileSystem: BrowserFileSystem,
  outputDir: string,
|};

type ExportOutput = {|
  textFiles: Array<TextFileDescriptor>,
  urlFiles: Array<UrlFileDescriptor>,
|};

type ResourcesDownloadOutput = {|
  textFiles: Array<TextFileDescriptor>,
  blobFiles: Array<BlobFileDescriptor>,
|};

type CompressionOutput = Blob;

export const browserCocos2dExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: 'browser-cocos2d',

  getInitialExportState: () => ({
    debugMode: false,
  }),

  canLaunchBuild: () => true,

  renderHeader: ({ project, exportState, updateExportState }) => (
    <Column noMargin>
      <Line>
        <ExplanationHeader />
      </Line>
      <Line>
        <Toggle
          onToggle={(e, check) =>
            updateExportState(prevState => ({
              ...prevState,
              debugMode: check,
            }))
          }
          toggled={exportState.debugMode}
          labelPosition="right"
          label={
            <Trans>
              Debug mode (show FPS counter and stats in the bottom left)
            </Trans>
          }
        />
      </Line>
    </Column>
  ),

  renderLaunchButtonLabel: () => <Trans>Package</Trans>,

  prepareExporter: (
    context: ExportPipelineContext<ExportState>
  ): Promise<PreparedExporter> => {
    return findGDJS('cocos2d-js').then(({ gdjsRoot, filesContent }) => {
      console.info('GDJS found in ', gdjsRoot);

      const outputDir = '/export/';
      const abstractFileSystem = new BrowserFileSystem({
        textFiles: filesContent,
      });
      // TODO: Memory leak? Check for other exporters too.
      const fileSystem = assignIn(
        new gd.AbstractFileSystemJS(),
        abstractFileSystem
      );
      const exporter = new gd.Exporter(fileSystem, gdjsRoot);

      return {
        exporter,
        outputDir,
        abstractFileSystem,
      };
    });
  },

  launchExport: (
    context: ExportPipelineContext<ExportState>,
    { exporter, outputDir, abstractFileSystem }: PreparedExporter
  ): Promise<ExportOutput> => {
    exporter.exportWholeCocos2dProject(
      context.project,
      context.exportState.debugMode,
      outputDir
    );
    exporter.delete();

    return Promise.resolve({
      textFiles: abstractFileSystem.getAllTextFilesIn(outputDir),
      urlFiles: abstractFileSystem.getAllUrlFilesIn(outputDir),
    });
  },

  launchResourcesDownload: (
    context: ExportPipelineContext<ExportState>,
    { textFiles, urlFiles }: ExportOutput
  ): Promise<ResourcesDownloadOutput> => {
    return downloadUrlsToBlobs({
      urlFiles,
      onProgress: context.updateStepProgress,
    }).then(blobFiles => ({
      blobFiles,
      textFiles,
    }));
  },

  launchCompression: (
    context: ExportPipelineContext<ExportState>,
    { textFiles, blobFiles }: ResourcesDownloadOutput
  ): Promise<Blob> => {
    return archiveFiles({
      blobFiles,
      textFiles,
      basePath: '/export/',
      onProgress: context.updateStepProgress,
    });
  },

  renderDoneFooter: ({ compressionOutput, exportState, onClose }) => {
    return (
      <DoneFooter
        renderGameButton={() => (
          <BlobDownloadUrlHolder blob={compressionOutput}>
            {blobDownloadUrl => (
              <RaisedButton
                fullWidth
                primary
                onClick={() => openBlobDownloadUrl(blobDownloadUrl, 'game.zip')}
                label={<Trans>Download the exported game</Trans>}
              />
            )}
          </BlobDownloadUrlHolder>
        )}
      />
    );
  },
};
