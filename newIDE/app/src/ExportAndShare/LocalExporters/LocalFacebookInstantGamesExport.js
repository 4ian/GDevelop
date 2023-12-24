// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import { Column, Line } from '../../UI/Grid';
import { findGDJS } from '../../GameEngineFinder/LocalGDJSFinder';
import LocalFileSystem, { type UrlFileDescriptor } from './LocalFileSystem';
import assignIn from 'lodash/assignIn';
import optionalRequire from '../../Utils/OptionalRequire';
import {
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
import LocalFilePicker from '../../UI/LocalFilePicker';
import { archiveLocalFolder } from '../../Utils/LocalArchiver';
import {
  ExplanationHeader,
  DoneFooter,
} from '../GenericExporters/FacebookInstantGamesExport';
import { downloadUrlsToLocalFiles } from '../../Utils/LocalFileDownloader';
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;
const shell = electron ? electron.shell : null;

const gd: libGDevelop = global.gd;

type ExportState = {
  archiveOutputFilename: string,
};

type PreparedExporter = {|
  exporter: gdjsExporter,
  localFileSystem: LocalFileSystem,
  temporaryOutputDir: string,
|};

type ExportOutput = {|
  temporaryOutputDir: string,
  urlFiles: Array<UrlFileDescriptor>,
|};

type ResourcesDownloadOutput = {|
  temporaryOutputDir: string,
|};

type CompressionOutput = string;

export const localFacebookInstantGamesExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: 'local-facebook-instant-games',

  getInitialExportState: (project: gdProject) => ({
    archiveOutputFilename: app
      ? path.join(app.getPath('documents'), 'fb-instant-game.zip')
      : '',
  }),

  canLaunchBuild: exportState => !!exportState.archiveOutputFilename,

  isNavigationDisabled: () => false,

  renderHeader: ({ project, exportState, updateExportState }) => (
    <Column noMargin expand>
      <Line>
        <ExplanationHeader />
      </Line>
      <Line>
        <LocalFilePicker
          title={'Facebook Instant Games export zip file'}
          message={
            'Choose where to save the exported file for Facebook Instant Games'
          }
          filters={[
            {
              name: 'Compressed file for Facebook Instant Games',
              extensions: ['zip'],
            },
          ]}
          value={exportState.archiveOutputFilename}
          defaultPath={app ? app.getPath('documents') : ''}
          onChange={value =>
            updateExportState(() => ({ archiveOutputFilename: value }))
          }
          fullWidth
        />
      </Line>
    </Column>
  ),

  renderLaunchButtonLabel: () => <Trans>Package game files</Trans>,

  prepareExporter: (
    context: ExportPipelineContext<ExportState>
  ): Promise<PreparedExporter> => {
    return findGDJS().then(({ gdjsRoot }) => {
      console.info('GDJS found in ', gdjsRoot);

      // TODO: Memory leak? Check for other exporters too.
      const localFileSystem = new LocalFileSystem({
        downloadUrlsToLocalFiles: true,
      });
      const fileSystem = assignIn(
        new gd.AbstractFileSystemJS(),
        localFileSystem
      );
      const exporter = new gd.Exporter(fileSystem, gdjsRoot);
      const temporaryOutputDir = path.join(
        fileSystem.getTempDir(),
        'FacebookInstantGamesExport'
      );
      fileSystem.mkDir(temporaryOutputDir);
      fileSystem.clearDir(temporaryOutputDir);

      return {
        exporter,
        localFileSystem,
        temporaryOutputDir,
      };
    });
  },

  launchExport: async (
    context: ExportPipelineContext<ExportState>,
    { exporter, localFileSystem, temporaryOutputDir }: PreparedExporter,
    fallbackAuthor: ?{ id: string, username: string }
  ): Promise<ExportOutput> => {
    const exportOptions = new gd.ExportOptions(
      context.project,
      temporaryOutputDir
    );
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

    return {
      temporaryOutputDir,
      urlFiles: localFileSystem.getAllUrlFilesIn(temporaryOutputDir),
    };
  },

  launchResourcesDownload: async (
    context: ExportPipelineContext<ExportState>,
    { temporaryOutputDir, urlFiles }: ExportOutput
  ): Promise<ResourcesDownloadOutput> => {
    await downloadUrlsToLocalFiles({
      urlContainers: urlFiles,
      onProgress: context.updateStepProgress,
      throwIfAnyError: true,
    });

    return { temporaryOutputDir };
  },

  launchCompression: (
    context: ExportPipelineContext<ExportState>,
    { temporaryOutputDir }: ResourcesDownloadOutput
  ): Promise<CompressionOutput> => {
    return archiveLocalFolder({
      path: temporaryOutputDir,
      outputFilename: context.exportState.archiveOutputFilename,
    });
  },

  renderDoneFooter: ({ exportState, onClose }) => {
    const openExportFolder = () => {
      if (shell && path)
        shell.openPath(path.dirname(exportState.archiveOutputFilename));
    };

    return (
      <DoneFooter
        renderGameButton={() => (
          <RaisedButton
            key="open"
            label={<Trans>Open folder</Trans>}
            primary={true}
            onClick={openExportFolder}
          />
        )}
      />
    );
  },
};
