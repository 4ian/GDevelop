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
import Toggle from '../../UI/Toggle';
const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;

const gd = global.gd;

type ExportState = {
  outputDir: string,
  debugMode: boolean,
};

type PreparedExporter = {|
  exporter: gdjsExporter,
|};

type ExportOutput = null;

type ResourcesDownloadOutput = null;

type CompressionOutput = null;

export const localCocos2dExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: 'local-cocos2d',

  getInitialExportState: (project: gdProject) => ({
    outputDir: project.getLastCompilationDirectory(),
    debugMode: false,
  }),

  canLaunchBuild: exportState => !!exportState.outputDir,

  renderHeader: ({ project, exportState, updateExportState }) => (
    <Column noMargin>
      <Line>
        <Column noMargin>
          <Text>
            This will export your game using Cocos2d-JS game engine. The game
            can be compiled for Android or iOS if you install Cocos2d-JS
            developer tools.
          </Text>
        </Column>
      </Line>
      <Line>
        <LocalFolderPicker
          type="export"
          value={exportState.outputDir}
          defaultPath={project.getLastCompilationDirectory()}
          onChange={outputDir => {
            updateExportState(prevState => ({ ...prevState, outputDir }));
          }}
          fullWidth
        />
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
    exporter.exportWholeCocos2dProject(
      context.project,
      context.exportState.debugMode,
      context.exportState.outputDir
    );
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
            You can now upload the game to a web hosting or use Cocos2d-JS
            command line tools to export it to other platforms like iOS (XCode
            is required) or Android (Android SDK is required).
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
