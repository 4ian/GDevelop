// @flow
import { Trans, t } from '@lingui/macro';

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
  PackResourcesField,
} from '../GenericExporters/HTML5Export';
import { downloadUrlsToLocalFiles } from '../../Utils/LocalFileDownloader';
import { packResourcesInFolder } from '../ResourcePacking/LocalResourcePacker';
import DismissableTutorialMessage from '../../Hints/DismissableTutorialMessage';

// It's important to use remote and not electron for folder actions,
// otherwise they will be opened in the background.
// See https://github.com/electron/electron/issues/4349#issuecomment-777475765
const remote = optionalRequire('@electron/remote');
const shell = remote ? remote.shell : null;

const gd: libGDevelop = global.gd;

type ExportState = {
  outputDir: string,
  packResources: boolean,
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
    packResources: true,
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
              updateExportState(prevExportState => ({
                ...prevExportState,
                outputDir,
              }));
              project.setLastCompilationDirectory(outputDir);
            }}
            fullWidth
          />
        </Line>
        <Line noMargin>
          <PackResourcesField
            packResources={exportState.packResources}
            onChange={packResources =>
              updateExportState(prevExportState => ({
                ...prevExportState,
                packResources,
              }))
            }
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

  launchCompression: async (
    context: ExportPipelineContext<ExportState>,
    exportOutput: ResourcesDownloadOutput
  ): Promise<CompressionOutput> => {
    // The export is a folder, so there is nothing to compress. This is where
    // the resources are gathered into a few ".gdpak" archives instead, now
    // that the ones stored as URLs have been downloaded.
    if (context.exportState.packResources) {
      await packResourcesInFolder({
        exportDir: context.exportState.outputDir,
        onProgress: context.updateStepProgress,
      });
    }

    return null;
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
