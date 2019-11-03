// @flow
import * as React from 'react';
import { type Build } from '../Utils/GDevelopServices/Build';
import { type UserProfile } from '../Profile/UserProfileContext';

export type ExportPipelineContext<ExportState> = {|
  project: gdProject,
  exportState: ExportState,
  updateStepProgress: (count: number, total: number) => void,
|};

export type ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {|
  name: string,
  onlineBuildType?: string,

  getInitialExportState: (project: gdProject) => ExportState,

  renderHeader: ({|
    project: gdProject,
    exportState: ExportState,
    updateExportState: (
      updater: (prevExportState: ExportState) => ExportState
    ) => void,
  |}) => React.Node,
  renderLaunchButtonLabel: () => React.Node,

  canLaunchBuild: (exportState: ExportState) => boolean,

  prepareExporter: (
    context: ExportPipelineContext<ExportState>
  ) => Promise<PreparedExporter>,

  launchExport: (
    context: ExportPipelineContext<ExportState>,
    preparedExporter: PreparedExporter
  ) => Promise<ExportOutput>,

  launchResourcesDownload: (
    context: ExportPipelineContext<ExportState>,
    exportOutput: ExportOutput
  ) => Promise<ResourcesDownloadOutput>,

  launchCompression: (
    context: ExportPipelineContext<ExportState>,
    resourcesDownloadOutput: ResourcesDownloadOutput
  ) => Promise<CompressionOutput>,

  launchUpload?: (
    context: ExportPipelineContext<ExportState>,
    compressionOutput: CompressionOutput
  ) => Promise<string>,

  launchOnlineBuild?: (
    exportState: ExportState,
    userProfile: UserProfile,
    uploadBucketKey: string
  ) => Promise<Build>,

  renderDoneFooter?: ({|
    exportState: ExportState,
    onClose: () => void,
  |}) => React.Node,
|};
