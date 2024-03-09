// @flow
import * as React from 'react';
import { type Build, type BuildType } from '../Utils/GDevelopServices/Build';
import { type Game } from '../Utils/GDevelopServices/Game';
import { type AuthenticatedUser } from '../Profile/AuthenticatedUserContext';
import { type BuildStep } from './Builds/BuildStepsProgress';
import { type Quota } from '../Utils/GDevelopServices/Usage';

export type ExportPipelineContext<ExportState> = {|
  project: gdProject,
  exportState: ExportState,
  updateStepProgress: (count: number, total: number) => void,
|};

export type HeaderProps<ExportState> = {|
  project: gdProject,
  authenticatedUser: AuthenticatedUser,
  exportState: ExportState,
  updateExportState: (
    updater: (prevExportState: ExportState) => ExportState
  ) => void,
  isExporting: boolean,
  build: ?Build,
  exportStep: BuildStep,
  quota: ?Quota,
|};

export type ExportFlowProps = {|
  project: gdProject,
  game: ?Game,
  builds: ?Array<Build>,
  build: ?Build,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  errored: boolean,
  exportStep: BuildStep,
  disabled: boolean,
  launchExport: () => Promise<void>,
  isExporting: boolean,
  stepMaxProgress: number,
  stepCurrentProgress: number,
  onGameUpdated: () => Promise<void>,
|};

/**
 * An export pipeline describing how to export and build a game.
 */
export type ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {|
  name: string,
  onlineBuildType?: BuildType,
  limitedBuilds?: boolean,
  packageNameWarningType?: 'mobile' | 'desktop',

  getInitialExportState: (project: gdProject) => ExportState,

  renderTutorial?: () => React.Node,

  renderHeader: (HeaderProps<ExportState>) => React.Node,

  shouldSuggestBumpingVersionNumber?: () => boolean,

  renderExportFlow: (props: ExportFlowProps) => React.Node,

  canLaunchBuild: (
    exportState: ExportState,
    errored: boolean,
    exportStep: BuildStep
  ) => boolean,

  isNavigationDisabled: (exportStep: BuildStep, errored: boolean) => boolean,

  prepareExporter: (
    context: ExportPipelineContext<ExportState>
  ) => Promise<PreparedExporter>,

  launchExport: (
    context: ExportPipelineContext<ExportState>,
    preparedExporter: PreparedExporter,
    fallbackAuthor: ?{ id: string, username: string }
  ) => Promise<ExportOutput>,

  launchResourcesDownload: (
    context: ExportPipelineContext<ExportState>,
    exportOutput: ExportOutput
  ) => Promise<ResourcesDownloadOutput>,

  launchCompression: (
    context: ExportPipelineContext<ExportState>,
    resourcesDownloadOutput: ResourcesDownloadOutput
  ) => Promise<CompressionOutput>,

  /**
   * Launch the upload of the archive to the online build service.
   * This step is only done if `launchUpload` and `launchOnlineBuild`
   * are defined.
   */
  launchUpload?: (
    context: ExportPipelineContext<ExportState>,
    compressionOutput: CompressionOutput
  ) => Promise<string>,

  /**
   * Launch the online build of the uploaded archive.
   * This step is only done if `launchUpload` and `launchOnlineBuild`
   * are defined.
   */
  launchOnlineBuild?: (
    exportState: ExportState,
    authenticatedUser: AuthenticatedUser,
    uploadBucketKey: string,
    gameId: string,
    options: {|
      gameName: string,
      gameVersion: string,
    |},
    payWithCredits: boolean
  ) => Promise<Build>,

  /**
   * Render the footer when the whole export (+ online build if any) is done.
   */
  renderDoneFooter?: ({|
    compressionOutput: CompressionOutput,
    exportState: ExportState,
  |}) => React.Node,
|};
