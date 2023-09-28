// @flow
import * as React from 'react';
import { type Build } from '../Utils/GDevelopServices/Build';
import { type AuthenticatedUser } from '../Profile/AuthenticatedUserContext';
import {
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportAndShare/ExportPipeline.flow';
import {
  type UrlFileDescriptor,
  type TextFileDescriptor,
  type BlobFileDescriptor,
} from '../Utils/BrowserArchiver';
import BrowserFileSystem from '../ExportAndShare/BrowserExporters/BrowserFileSystem';
import { completeWebBuild } from '../fixtures/GDevelopServicesTestData';
import {
  ExplanationHeader,
  OnlineGameLink,
} from '../ExportAndShare/GenericExporters/OnlineWebExport';
import { delay } from '../Utils/Delay';
import assignIn from 'lodash/assignIn';
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

export const fakeBrowserOnlineWebExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: 'browser-online-web',
  onlineBuildType: 'web-build',

  getInitialExportState: () => null,

  // Build can be launched if just opened the dialog or build errored, re-enabled when done.
  canLaunchBuild: (exportState, errored, exportStep) =>
    errored || exportStep === '' || exportStep === 'done',

  // Navigation is enabled when the build is errored or if the build is not done.
  isNavigationDisabled: (exportStep, errored) =>
    !errored && !['', 'done'].includes(exportStep),

  renderHeader: ({ game }) => <ExplanationHeader game={game} />,

  renderLaunchButtonLabel: () => 'Generate link',

  renderCustomStepsProgress: ({
    build,
    project,
    onSaveProject,
    isSavingProject,
    errored,
    exportStep,
  }) => (
    <OnlineGameLink
      build={build}
      project={project}
      onSaveProject={onSaveProject}
      isSavingProject={isSavingProject}
      errored={errored}
      exportStep={exportStep}
    />
  ),

  prepareExporter: async (
    context: ExportPipelineContext<ExportState>
  ): Promise<PreparedExporter> => {
    await delay(1000);

    const abstractFileSystem = new BrowserFileSystem({
      textFiles: [],
    });
    const fileSystem = assignIn(
      new gd.AbstractFileSystemJS(),
      abstractFileSystem
    );
    const exporter = new gd.Exporter(fileSystem, null);

    return {
      exporter,
      outputDir: '/export/',
      abstractFileSystem,
    };
  },

  launchExport: async (
    context: ExportPipelineContext<ExportState>,
    { exporter, outputDir, abstractFileSystem }: PreparedExporter,
    fallbackAuthor: ?{ id: string, username: string }
  ): Promise<ExportOutput> => {
    await delay(1000);
    return { urlFiles: [], textFiles: [] };
  },

  launchResourcesDownload: async (
    context: ExportPipelineContext<ExportState>,
    { textFiles, urlFiles }: ExportOutput
  ): Promise<ResourcesDownloadOutput> => {
    await delay(1000);
    return { blobFiles: [], textFiles: [] };
  },

  launchCompression: async (
    context: ExportPipelineContext<ExportState>,
    { textFiles, blobFiles }: ResourcesDownloadOutput
  ): Promise<Blob> => {
    await delay(1000);
    return new Blob();
  },

  launchUpload: async (
    context: ExportPipelineContext<ExportState>,
    blobFile: Blob
  ): Promise<string> => {
    await delay(1000);
    return 'uploadKey';
  },

  launchOnlineBuild: async (
    exportState: ExportState,
    authenticatedUser: AuthenticatedUser,
    uploadBucketKey: string,
    gameId: string,
    options: {|
      gameName: string,
      gameVersion: string,
    |}
  ): Promise<Build> => {
    await delay(1000);

    return completeWebBuild;
  },
};
