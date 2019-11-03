// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import { Column, Line } from '../../UI/Grid';
import { findGDJS } from './LocalGDJSFinder';
import localFileSystem from './LocalFileSystem';
import LocalFolderPicker from '../../UI/LocalFolderPicker';
import assignIn from 'lodash/assignIn';
import optionalRequire from '../../Utils/OptionalRequire';
import Text from '../../UI/Text';
import {
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;

const gd = global.gd;

type ExportState = {
  outputDir: string,
};

type PreparedExporter = {|
  exporter: gdjsExporter,
|};

type ExportOutput = null;

type ResourcesDownloadOutput = null;

type CompressionOutput = null;

export const localElectronExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: 'local-electron',

  getInitialExportState: (project: gdProject) => ({
    outputDir: project.getLastCompilationDirectory(),
  }),

  canLaunchBuild: exportState => !!exportState.outputDir,

  renderHeader: ({ project, exportState, updateExportState }) => (
    <Column noMargin>
      <Line>
        <Column noMargin>
          <Text>
            This will export your game so that you can package it for Windows,
            macOS or Linux. You will need to install third-party tools (Node.js,
            Electron Builder) to package your game by yourself.
          </Text>
        </Column>
      </Line>
      <Line>
        <LocalFolderPicker
          type="export"
          value={exportState.outputDir}
          defaultPath={project.getLastCompilationDirectory()}
          onChange={outputDir => {
            updateExportState(() => ({ outputDir }));
          }}
          fullWidth
        />
      </Line>
    </Column>
  ),

  renderLaunchButtonLabel: () => <Trans>Package</Trans>,

  prepareExporter: (
    context: ExportPipelineContext<ExportState>
  ): Promise<PreparedExporter> => {
    return findGDJS().then(({ gdjsRoot }) => {
      console.info('GDJS found in ', gdjsRoot);

      // TODO: Memory leak? Check for other exporters too.
      const fileSystem = assignIn(
        new gd.AbstractFileSystemJS(),
        localFileSystem
      );
      const exporter = new gd.Exporter(fileSystem, gdjsRoot);

      return {
        exporter,
      };
    });
  },

  launchExport: (
    context: ExportPipelineContext<ExportState>,
    { exporter }: PreparedExporter
  ): Promise<ExportOutput> => {
    const exportOptions = new gd.MapStringBoolean();
    exportOptions.set('exportForElectron', true);
    exporter.exportWholePixiProject(
      context.project,
      context.exportState.outputDir,
      exportOptions
    );
    exportOptions.delete();
    exporter.delete();

    return Promise.resolve(null);
  },

  launchResourcesDownload: (
    context: ExportPipelineContext<ExportState>,
    exportOutput: ExportOutput
  ): Promise<ResourcesDownloadOutput> => {
    return Promise.resolve(null);
  },

  launchCompression: (
    context: ExportPipelineContext<ExportState>,
    exportOutput: ResourcesDownloadOutput
  ): Promise<CompressionOutput> => {
    return Promise.resolve(null);
  },

  renderDoneFooter: ({ exportState, onClose }) => {
    const openExportFolder = () => {
      if (shell) shell.openItem(exportState.outputDir);
    };

    return (
      <Column noMargin>
        <Text>
          <Trans>
            The game was properly exported. You can now use Electron Builder
            (you need Node.js installed and to use the command-line to run it)
            to create an executable.
          </Trans>
        </Text>
        <Line justifyContent="center">
          <RaisedButton
            key="open"
            label={<Trans>Open folder</Trans>}
            primary={true}
            onClick={openExportFolder}
          />
        </Line>
      </Column>
    );
  },
};
