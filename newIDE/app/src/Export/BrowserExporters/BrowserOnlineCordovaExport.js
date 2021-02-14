// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import assignIn from 'lodash/assignIn';
import {
  type Build,
  buildCordovaAndroid,
  getBuildFileUploadOptions,
} from '../../Utils/GDevelopServices/Build';
import { uploadBlobFile } from './BrowserFileUploader';
import { type UserProfile } from '../../Profile/UserProfileContext';
import { findGDJS } from '../../GameEngineFinder/BrowserS3GDJSFinder';
import BrowserFileSystem from './BrowserFileSystem';
import {
  type UrlFileDescriptor,
  type TextFileDescriptor,
  type BlobFileDescriptor,
  downloadUrlsToBlobs,
  archiveFiles,
} from '../../Utils/BrowserArchiver';
import {
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
import { ExplanationHeader } from '../GenericExporters/OnlineCordovaExport';
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

export const browserOnlineCordovaExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: 'browser-online-cordova',
  onlineBuildType: 'cordova-build',
  shouldHaveUniquePackageName: t`The package name begins with com.example, make sure you replace it with an unique one to be able to publish your game on app stores.`,

  getInitialExportState: () => null,

  canLaunchBuild: () => true,

  renderHeader: () => <ExplanationHeader />,

  renderLaunchButtonLabel: () => <Trans>Packaging for Android</Trans>,

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
    { exporter, outputDir, abstractFileSystem }: PreparedExporter
  ): Promise<ExportOutput> => {
    const { project } = context;

    const exportOptions = new gd.MapStringBoolean();
    exportOptions.set('exportForCordova', true);
    exporter.exportWholePixiProject(project, outputDir, exportOptions);
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
    return downloadUrlsToBlobs({
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
    userProfile: UserProfile,
    uploadBucketKey: string
  ): Promise<Build> => {
    const { getAuthorizationHeader, profile } = userProfile;
    if (!profile) return Promise.reject(new Error('User is not authenticated'));

    return buildCordovaAndroid(
      getAuthorizationHeader,
      profile.uid,
      uploadBucketKey
    );
  },
};
