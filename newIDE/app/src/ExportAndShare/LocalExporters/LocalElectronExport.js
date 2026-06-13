// @flow
import { Trans, t } from '@lingui/macro';

import React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import { Column, Line } from '../../UI/Grid';
import { findGDJS } from '../../GameEngineFinder/LocalGDJSFinder';
import LocalFileSystem, { type UrlFileDescriptor } from './LocalFileSystem';
import LocalFolderPicker from '../../UI/LocalFolderPicker';
import assignIn from 'lodash/assignIn';
import optionalRequire from '../../Utils/OptionalRequire';
import {
  type ExportFlowProps,
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
import {
  type ElectronWindowOptions,
  ExplanationHeader,
  DoneFooter,
  ExportFlow,
  getDefaultElectronWindowOptions,
  ElectronWindowOptionsEditor,
  applyElectronWindowOptionsToExportOptions,
} from '../GenericExporters/ElectronExport';
import { downloadUrlsToLocalFiles } from '../../Utils/LocalFileDownloader';
// It's important to use remote and not electron for folder actions,
// otherwise they will be opened in the background.
// See https://github.com/electron/electron/issues/4349#issuecomment-777475765
const remote = optionalRequire('@electron/remote');
const shell = remote ? remote.shell : null;

const gd: libGDevelop = global.gd;

type ExportState = {|
  outputDir: string,
  electronWindowOptions: ElectronWindowOptions,
|};

type PreparedExporter = {|
  exporter: gdjsExporter,
  localFileSystem: LocalFileSystem,
|};

type ExportOutput = {|
  urlFiles: Array<UrlFileDescriptor>,
|};

type ResourcesDownloadOutput = null;

type CompressionOutput = null;

const exportPipelineName = 'local-electron';

export const localElectronExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: exportPipelineName,
  packageNameWarningType: 'desktop',

  getInitialExportState: (project: gdProject) => ({
    outputDir: project.getLastCompilationDirectory(),
    electronWindowOptions: getDefaultElectronWindowOptions(),
  }),

  canLaunchBuild: exportState => !!exportState.outputDir,

  isNavigationDisabled: () => false,

  renderHeader: ({
    project,
    exportState,
    updateExportState,
    exportStep,
    isExporting,
  }) =>
    exportStep !== 'done' ? (
      <Column noMargin expand>
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
              updateExportState(prevExportState => ({
                ...prevExportState,
                outputDir,
              }));
              project.setLastCompilationDirectory(outputDir);
            }}
            fullWidth
          />
        </Line>
        <Line>
          <ElectronWindowOptionsEditor
            electronWindowOptions={exportState.electronWindowOptions}
            onChange={electronWindowOptions => {
              updateExportState(prevExportState => ({
                ...prevExportState,
                electronWindowOptions,
              }));
            }}
            disabled={isExporting}
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
    exportOptions.setTarget('electron');
    applyElectronWindowOptionsToExportOptions(
      exportOptions,
      context.exportState.electronWindowOptions
    );
    if (fallbackAuthor) {
      exportOptions.setFallbackAuthor(
        fallbackAuthor.id,
        fallbackAuthor.username
      );
    }
    const exportSucceeded = exporter.exportWholePixiProject(exportOptions);
    exportOptions.delete();
    exporter.delete();

    if (!exportSucceeded) {
      throw new Error(
        context.i18n._(
          t`Export failed. Check that the output folder is accessible and that you have the necessary permissions.`
        )
      );
    }

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
