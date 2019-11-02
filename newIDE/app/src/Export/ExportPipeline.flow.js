// @flow
import * as React from 'react';
import { type Build } from '../Utils/GDevelopServices/Build';
import { type UserProfile } from '../Profile/UserProfileContext';

export type ExportPipelineContext = {|
  project: gdProject,
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

  renderHeader: ({|
    project: gdProject,
    exportState: ExportState,
    updateExportState: (
      updater: (prevExportState: ExportState) => ExportState
    ) => void,
  |}) => React.Node,
  renderLaunchButtonLabel: () => React.Node,

  prepareExporter: (
    context: ExportPipelineContext
  ) => Promise<PreparedExporter>,

  launchExport: (
    context: ExportPipelineContext,
    preparedExporter: PreparedExporter
  ) => Promise<ExportOutput>,

  launchResourcesDownload: (
    context: ExportPipelineContext,
    exportOutput: ExportOutput
  ) => Promise<ResourcesDownloadOutput>,

  launchCompression: (
    context: ExportPipelineContext,
    resourcesDownloadOutput: ResourcesDownloadOutput
  ) => Promise<CompressionOutput>,

  launchUpload: (
    context: ExportPipelineContext,
    compressionOutput: CompressionOutput
  ) => Promise<string>,

  launchOnlineBuild: (
    exportState: ExportState,
    userProfile: UserProfile,
    uploadBucketKey: string
  ) => Promise<Build>,

  renderDoneFooter?: ({|
    exportState: ExportState,
    onClose: () => void,
  |}) => React.Node,
|};
