// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import { Column, Line } from '../../UI/Grid';
import { findGDJS } from '../../GameEngineFinder/LocalGDJSFinder';
import localFileSystem from './LocalFileSystem';
import LocalFolderPicker from '../../UI/LocalFolderPicker';
import assignIn from 'lodash/assignIn';
import optionalRequire from '../../Utils/OptionalRequire';
import {
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
import {
  ExplanationHeader,
  DoneFooter,
} from '../GenericExporters/CordovaExport';
const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;

const gd: libGDevelop = global.gd;

type ExportState = {
  outputDir: string,
};

type PreparedExporter = {|
  exporter: gdjsExporter,
|};

type ExportOutput = null;

type ResourcesDownloadOutput = null;

type CompressionOutput = null;

export const localCordovaExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: 'local-cordova',
  packageNameWarningType: 'mobile',

  getInitialExportState: (project: gdProject) => ({
    outputDir: project.getLastCompilationDirectory(),
  }),

  canLaunchBuild: exportState => !!exportState.outputDir,

  isNavigationDisabled: () => false,

  renderHeader: ({ project, exportState, updateExportState }) => (
    <Column noMargin>
      <Line>
        <Column noMargin>
          <ExplanationHeader />
        </Column>
      </Line>
      <Line>
        <LocalFolderPicker
          type="export"
          value={exportState.outputDir}
          defaultPath={project.getLastCompilationDirectory()}
          onChange={outputDir => {
            updateExportState(() => ({ outputDir }));
            project.setLastCompilationDirectory(outputDir);
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
    exportOptions.set('exportForCordova', true);
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
      if (shell) shell.openPath(exportState.outputDir);
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
