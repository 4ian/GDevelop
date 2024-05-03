// @flow
import * as React from 'react';
import assignIn from 'lodash/assignIn';
import {
  type Build,
  buildWeb,
  getBuildFileUploadOptions,
} from '../../Utils/GDevelopServices/Build';
import { uploadBlobFile } from './BrowserFileUploader';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
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
  type ExportFlowProps,
} from '../ExportPipeline.flow';
import { ExplanationHeader } from '../GenericExporters/OnlineWebExport';
import OnlineWebExportFlow from '../GenericExporters/OnlineWebExport/OnlineWebExportFlow';

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

const exportPipelineName = 'browser-online-web';

export const browserOnlineWebExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: exportPipelineName,
  onlineBuildType: 'web-build',

  getInitialExportState: () => null,

  // Build can be launched if just opened the dialog or build errored, re-enabled when done.
  canLaunchBuild: (exportState, errored, exportStep) =>
    errored || exportStep === '' || exportStep === 'done',

  // Navigation is enabled when the build is errored or if the build is not done.
  isNavigationDisabled: (exportStep, errored) =>
    !errored && !['', 'done'].includes(exportStep),

  renderHeader: () => <ExplanationHeader />,

  renderExportFlow: (props: ExportFlowProps) => (
    <OnlineWebExportFlow {...props} exportPipelineName={exportPipelineName} />
  ),

  prepareExporter: (
    context: ExportPipelineContext<ExportState>
  ): Promise<PreparedExporter> => {
    return findGDJS('web').then(({ gdjsRoot, filesContent }) => {
      console.info('GDJS found in ', gdjsRoot);

      const outputDir = '/export/';
      const abstractFileSystem = new BrowserFileSystem({
        textFiles: filesContent,
      });
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
    });
  },

  launchExport: (
    context: ExportPipelineContext<ExportState>,
    { exporter, outputDir, abstractFileSystem }: PreparedExporter,
    fallbackAuthor: ?{ id: string, username: string }
  ): Promise<ExportOutput> => {
    const { project } = context;
    const exportOptions = new gd.ExportOptions(project, outputDir);
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
      sizeLimit: 250 * 1000 * 1000,
    });
  },

  launchUpload: (
    context: ExportPipelineContext<ExportState>,
    blobFile: Blob
  ): Promise<string> => {
    return getBuildFileUploadOptions().then(uploadOptions => {
      return uploadBlobFile(
        blobFile,
        uploadOptions,
        context.updateStepProgress
      ).then(() => uploadOptions.key);
    });
  },

  launchOnlineBuild: (
    exportState: ExportState,
    authenticatedUser: AuthenticatedUser,
    uploadBucketKey: string,
    gameId: string,
    options: {|
      gameName: string,
      gameVersion: string,
    |},
    payWithCredits: boolean
  ): Promise<Build> => {
    const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
    if (!firebaseUser)
      return Promise.reject(new Error('User is not authenticated'));

    return buildWeb(
      getAuthorizationHeader,
      firebaseUser.uid,
      uploadBucketKey,
      gameId,
      options,
      payWithCredits
    );
  },
};
