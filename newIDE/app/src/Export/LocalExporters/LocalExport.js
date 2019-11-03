// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import { Column, Line, Spacer } from '../../UI/Grid';
import { findGDJS } from './LocalGDJSFinder';
import localFileSystem from './LocalFileSystem';
import LocalFolderPicker from '../../UI/LocalFolderPicker';
import assignIn from 'lodash/assignIn';
import Text from '../../UI/Text';
import {
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
import { getHelpLink } from '../../Utils/HelpLink';
import FlatButton from '../../UI/FlatButton';
import AlertMessage from '../../UI/AlertMessage';
import Window from '../../Utils/Window';

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

export const localExportPipeline: ExportPipeline<
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
          <Text>
            <Trans>
              This will export your game to a folder that you can then upload on
              a website or on game hosting like itch.io.
            </Trans>
          </Text>
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
    exporter.exportWholePixiProject(context.project, context.exportState.outputDir, exportOptions);
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
    return (
      <Column noMargin>
        <Text>
          <Trans>
            You can now upload the game to a web hosting to play to the game.
          </Trans>
        </Text>
        <AlertMessage kind="warning">
          <Trans>
            Your game won't work if you open index.html on your computer. You
            must upload it to a web hosting (Kongregate, Itch.io, etc...) or a
            web server to run it.
          </Trans>
        </AlertMessage>
        <Spacer />
        <RaisedButton
          fullWidth
          primary
          onClick={() =>
            Window.openExternalURL(
              getHelpLink('/publishing/publishing-to-gamejolt-store')
            )
          }
          label={<Trans>Publish your game on Game Jolt</Trans>}
        />
        <RaisedButton
          fullWidth
          primary
          onClick={() =>
            Window.openExternalURL(
              getHelpLink('/publishing/publishing-to-kongregate-store')
            )
          }
          label={<Trans>Publish your game on Kongregate</Trans>}
        />
        <RaisedButton
          fullWidth
          primary
          onClick={() =>
            Window.openExternalURL(
              getHelpLink('/publishing/publishing-to-itch-io')
            )
          }
          label={<Trans>Publish your game on Itch.io</Trans>}
        />
        <FlatButton
          fullWidth
          onClick={() => Window.openExternalURL(getHelpLink('/publishing'))}
          label={<Trans>Learn more about publishing</Trans>}
        />
      </Column>
    );
  },
};
