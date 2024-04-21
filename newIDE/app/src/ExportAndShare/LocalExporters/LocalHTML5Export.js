// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import { Column, Line } from '../../UI/Grid';
import { findGDJS } from '../../GameEngineFinder/LocalGDJSFinder';
import LocalFileSystem, { type UrlFileDescriptor } from './LocalFileSystem';
import LocalFolderPicker from '../../UI/LocalFolderPicker';
import assignIn from 'lodash/assignIn';
import {
  type ExportFlowProps,
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
import optionalRequire from '../../Utils/OptionalRequire';
import {
  ExplanationHeader,
  DoneFooter,
  ExportFlow,
} from '../GenericExporters/HTML5Export';
import { downloadUrlsToLocalFiles } from '../../Utils/LocalFileDownloader';
import DismissableTutorialMessage from '../../Hints/DismissableTutorialMessage';

const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;

const gd: libGDevelop = global.gd;

type ExportState = {
  outputDir: string,
};

type PreparedExporter = {|
  exporter: gdjsExporter,
  localFileSystem: LocalFileSystem,
|};

type ExportOutput = {|
  urlFiles: Array<UrlFileDescriptor>,
|};

type ResourcesDownloadOutput = null;

type CompressionOutput = null;

const exportPipelineName = 'local-html5';

export const localHTML5ExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: exportPipelineName,

  getInitialExportState: (project: gdProject) => ({
    outputDir: project.getLastCompilationDirectory(),
  }),

  canLaunchBuild: exportState => !!exportState.outputDir,

  isNavigationDisabled: () => false,

  renderTutorial: () => (
    <DismissableTutorialMessage tutorialId="export-to-itch" />
  ),

  renderHeader: ({ project, exportState, updateExportState, exportStep }) =>
    exportStep !== 'done' ? (
      <Column noMargin expand>
        <Line>
          <ExplanationHeader />
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
    ) : null,

  renderExportFlow: (props: ExportFlowProps) => (
    <ExportFlow {...props} exportPipelineName={exportPipelineName} />
  ),

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

      return {
        exporter,
        localFileSystem,
      };
    });
  },

  launchExport: async (
    context: ExportPipelineContext<ExportState>,
    { exporter, localFileSystem }: PreparedExporter,
    fallbackAuthor: ?{ id: string, username: string }
  ): Promise<ExportOutput> => {
    const exportOptions = new gd.ExportOptions(
      context.project,
      context.exportState.outputDir
    );
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
      urlFiles: localFileSystem.getAllUrlFilesIn(context.exportState.outputDir),
    };
  },

  launchResourcesDownload: async (
    context: ExportPipelineContext<ExportState>,
    { urlFiles }: ExportOutput
  ): Promise<ResourcesDownloadOutput> => {
    await downloadUrlsToLocalFiles({
      urlContainers: urlFiles,
      onProgress: context.updateStepProgress,
      throwIfAnyError: true,
    });

    return null;
  },

  launchCompression: (
    context: ExportPipelineContext<ExportState>,
    exportOutput: ResourcesDownloadOutput
  ): Promise<CompressionOutput> => {
    return Promise.resolve(null);
  },

  renderDoneFooter: ({ exportState }) => {
    const openExportFolder = () => {
      if (shell) shell.openPath(exportState.outputDir);
    };

    return (
      <DoneFooter
        renderGameButton={() => (
          <RaisedButton
            primary
            onClick={() => openExportFolder()}
            label={<Trans>Open the exported game folder</Trans>}
          />
        )}
      />
    );
  },
};
