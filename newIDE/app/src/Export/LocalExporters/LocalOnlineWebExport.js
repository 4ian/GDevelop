// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import assignIn from 'lodash/assignIn';
import {
  type Build,
  buildWeb,
  getBuildFileUploadOptions,
} from '../../Utils/GDevelopServices/Build';
import { uploadLocalFile } from './LocalFileUploader';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { findGDJS } from '../../GameEngineFinder/LocalGDJSFinder';
import { archiveLocalFolder } from '../../Utils/LocalArchiver';
import optionalRequire from '../../Utils/OptionalRequire.js';
import localFileSystem from './LocalFileSystem';
import {
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
import { ExplanationHeader } from '../GenericExporters/OnlineWebExport';
const path = optionalRequire('path');
const os = optionalRequire('os');
const gd: libGDevelop = global.gd;

type ExportState = null;

type PreparedExporter = {|
  exporter: gdjsExporter,
  temporaryOutputDir: string,
|};

type ExportOutput = {|
  temporaryOutputDir: string,
|};

type ResourcesDownloadOutput = {|
  temporaryOutputDir: string,
|};

type CompressionOutput = string;

export const localOnlineWebExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: 'local-online-web',
  onlineBuildType: 'web-build',

  getInitialExportState: () => null,

  canLaunchBuild: () => true,

  renderHeader: () => <ExplanationHeader />,

  renderLaunchButtonLabel: () => <Trans>Publish online</Trans>,

  prepareExporter: (
    context: ExportPipelineContext<ExportState>
  ): Promise<PreparedExporter> => {
    return findGDJS().then(({ gdjsRoot }) => {
      console.info('GDJS found in ', gdjsRoot);

      const fileSystem = assignIn(
        new gd.AbstractFileSystemJS(),
        localFileSystem
      );
      const exporter = new gd.Exporter(fileSystem, gdjsRoot);
      const temporaryOutputDir = path.join(
        fileSystem.getTempDir(),
        'OnlineWebExport'
      );
      fileSystem.mkDir(temporaryOutputDir);
      fileSystem.clearDir(temporaryOutputDir);

      return {
        exporter,
        temporaryOutputDir,
      };
    });
  },

  launchExport: (
    context: ExportPipelineContext<ExportState>,
    { exporter, temporaryOutputDir }: PreparedExporter
  ): Promise<ExportOutput> => {
    const exportOptions = new gd.MapStringBoolean();
    exporter.exportWholePixiProject(
      context.project,
      temporaryOutputDir,
      exportOptions
    );
    exportOptions.delete();
    exporter.delete();

    return Promise.resolve({ temporaryOutputDir });
  },

  launchResourcesDownload: (
    context: ExportPipelineContext<ExportState>,
    { temporaryOutputDir }: ExportOutput
  ): Promise<ResourcesDownloadOutput> => {
    return Promise.resolve({ temporaryOutputDir });
  },

  launchCompression: (
    context: ExportPipelineContext<ExportState>,
    { temporaryOutputDir }: ResourcesDownloadOutput
  ): Promise<CompressionOutput> => {
    const archiveOutputDir = os.tmpdir();
    return archiveLocalFolder({
      path: temporaryOutputDir,
      outputFilename: path.join(archiveOutputDir, 'game-archive.zip'),
    });
  },

  launchUpload: (
    context: ExportPipelineContext<ExportState>,
    outputFile: CompressionOutput
  ): Promise<string> => {
    return getBuildFileUploadOptions().then(uploadOptions => {
      return uploadLocalFile(
        outputFile,
        uploadOptions,
        context.updateStepProgress
      ).then(() => uploadOptions.key);
    });
  },

  launchOnlineBuild: (
    exportState: ExportState,
    authenticatedUser: AuthenticatedUser,
    uploadBucketKey: string
  ): Promise<Build> => {
    const { getAuthorizationHeader, profile } = authenticatedUser;
    if (!profile) return Promise.reject(new Error('User is not authenticated'));

    return buildWeb(getAuthorizationHeader, profile.id, uploadBucketKey);
  },
};
