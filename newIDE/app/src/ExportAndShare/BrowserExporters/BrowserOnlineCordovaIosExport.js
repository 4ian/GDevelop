// @flow
import * as React from 'react';
import assignIn from 'lodash/assignIn';
import {
  type Build,
  buildCordovaIos,
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
  type ExportFlowProps,
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
import {
  type ExportState,
  SetupExportHeader,
  ExportFlow,
} from '../GenericExporters/OnlineCordovaIosExport';

const gd: libGDevelop = global.gd;

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

const exportPipelineName = 'browser-online-cordova-ios';

export const browserOnlineCordovaIosExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: exportPipelineName,
  onlineBuildType: 'cordova-ios-build',
  limitedBuilds: true,
  packageNameWarningType: 'mobile',

  getInitialExportState: () => ({
    targets: ['iosAppStore'],
    signing: null,
  }),

  // Build can be launched only if just opened the dialog or build errored.
  canLaunchBuild: (exportState, errored, exportStep) =>
    (errored || exportStep === '') && !!exportState.signing,

  // Navigation is enabled when the build is errored or whilst uploading.
  isNavigationDisabled: (exportStep, errored) =>
    !errored &&
    ['register', 'export', 'resources-download', 'compress', 'upload'].includes(
      exportStep
    ),

  renderHeader: props => <SetupExportHeader {...props} />,

  shouldSuggestBumpingVersionNumber: () => true,

  renderExportFlow: (props: ExportFlowProps) => (
    <ExportFlow {...props} exportPipelineName={exportPipelineName} />
  ),

  prepareExporter: (
    context: ExportPipelineContext<ExportState>
  ): Promise<PreparedExporter> => {
    return findGDJS('cordova').then(({ gdjsRoot, filesContent }) => {
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
    exportOptions.setTarget('cordova');
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
    const { getAuthorizationHeader, profile } = authenticatedUser;
    if (!profile) return Promise.reject(new Error('User is not authenticated'));
    if (!exportState.signing)
      return Promise.reject(new Error('Signing options not set up'));

    return buildCordovaIos(
      getAuthorizationHeader,
      profile.id,
      uploadBucketKey,
      exportState.targets,
      exportState.signing,
      gameId,
      options,
      payWithCredits
    );
  },
};
