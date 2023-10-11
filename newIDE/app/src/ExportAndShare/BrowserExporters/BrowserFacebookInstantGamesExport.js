// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import assignIn from 'lodash/assignIn';
import { findGDJS } from '../../GameEngineFinder/BrowserS3GDJSFinder';
import BrowserFileSystem from './BrowserFileSystem';
import {
  type UrlFileDescriptor,
  type TextFileDescriptor,
  type BlobFileDescriptor,
  downloadUrlFilesToBlobFiles,
  archiveFiles,
} from '../../Utils/BrowserArchiver';
import {
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
import RaisedButton from '../../UI/RaisedButton';
import {
  BlobDownloadUrlHolder,
  openBlobDownloadUrl,
} from '../../Utils/BlobDownloadUrlHolder';
import {
  ExplanationHeader,
  DoneFooter,
} from '../GenericExporters/FacebookInstantGamesExport';
const gd: libGDevelop = global.gd;

type ExportState = null;

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

export const browserFacebookInstantGamesExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: 'browser-facebook-instant-games',

  getInitialExportState: () => null,

  canLaunchBuild: () => true,

  isNavigationDisabled: () => false,

  renderHeader: () => <ExplanationHeader />,

  renderLaunchButtonLabel: () => <Trans>Package game files</Trans>,

  prepareExporter: (
    context: ExportPipelineContext<ExportState>
  ): Promise<PreparedExporter> => {
    return findGDJS('facebook-instant-games').then(
      ({ gdjsRoot, filesContent }) => {
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
      }
    );
  },

  launchExport: (
    context: ExportPipelineContext<ExportState>,
    { exporter, outputDir, abstractFileSystem }: PreparedExporter,
    fallbackAuthor: ?{ id: string, username: string }
  ): Promise<ExportOutput> => {
    const { project } = context;
    const exportOptions = new gd.ExportOptions(project, outputDir);
    exportOptions.setTarget('facebookInstantGames');
    if (fallbackAuthor) {
      exportOptions.setFallbackAuthor(
        fallbackAuthor.id,
        fallbackAuthor.username
      );
    }
    exporter.exportWholePixiProject(exportOptions);
    exportOptions.delete();
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
    return downloadUrlFilesToBlobFiles({
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
                primary
                onClick={() =>
                  openBlobDownloadUrl(blobDownloadUrl, 'fb-instant-game.zip')
                }
                label={<Trans>Download the Instant Game archive</Trans>}
              />
            )}
          </BlobDownloadUrlHolder>
        )}
      />
    );
  },
};
