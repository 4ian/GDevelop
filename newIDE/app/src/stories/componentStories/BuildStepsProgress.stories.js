// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../GDevelopJsInitializerDecorator';
import paperDecorator from '../PaperDecorator';
import BuildStepsProgress from '../../ExportAndShare/Builds/BuildStepsProgress';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'BuildStepsProgress',
  decorators: [paperDecorator],
};

export const BuildStepsProgressNotStarted = (): React.Node => (
  <BuildStepsProgress
    exportStep={''}
    build={null}
    stepMaxProgress={0}
    stepCurrentProgress={0}
    errored={false}
    hasBuildStep
  />
);
BuildStepsProgressNotStarted.storyName = 'BuildStepsProgress (not started)';

export const BuildStepsProgressNotStartedWithoutBuildStep = (): React.Node => (
  <BuildStepsProgress
    exportStep={''}
    build={null}
    stepMaxProgress={0}
    stepCurrentProgress={0}
    errored={false}
    hasBuildStep={false}
  />
);
BuildStepsProgressNotStartedWithoutBuildStep.storyName =
  'BuildStepsProgress (not started) (without build step)';

export const BuildStepsProgressExport = (): React.Node => (
  <BuildStepsProgress
    exportStep={'export'}
    build={null}
    stepMaxProgress={0}
    stepCurrentProgress={0}
    errored={false}
    hasBuildStep
  />
);
BuildStepsProgressExport.storyName = 'BuildStepsProgress (export)';

export const BuildStepsProgressResourcesDownload = (): React.Node => (
  <BuildStepsProgress
    exportStep={'resources-download'}
    build={null}
    stepMaxProgress={27}
    stepCurrentProgress={16}
    errored={false}
    hasBuildStep
  />
);
BuildStepsProgressResourcesDownload.storyName =
  'BuildStepsProgress (resources-download)';

export const BuildStepsProgressExportErrored = (): React.Node => (
  <BuildStepsProgress
    exportStep={'export'}
    build={null}
    stepMaxProgress={0}
    stepCurrentProgress={0}
    errored={true}
    hasBuildStep
  />
);
BuildStepsProgressExportErrored.storyName =
  'BuildStepsProgress (export) (errored)';

export const BuildStepsProgressCompress = (): React.Node => (
  <BuildStepsProgress
    exportStep={'compress'}
    build={null}
    stepMaxProgress={0}
    stepCurrentProgress={0}
    errored={false}
    hasBuildStep
  />
);
BuildStepsProgressCompress.storyName = 'BuildStepsProgress (compress)';

export const BuildStepsProgressUpload = (): React.Node => (
  <BuildStepsProgress
    exportStep={'upload'}
    build={null}
    stepMaxProgress={100}
    stepCurrentProgress={20}
    errored={false}
    hasBuildStep
  />
);
BuildStepsProgressUpload.storyName = 'BuildStepsProgress (upload)';

export const BuildStepsProgressUploadErrored = (): React.Node => (
  <BuildStepsProgress
    exportStep={'upload'}
    build={null}
    stepMaxProgress={100}
    stepCurrentProgress={20}
    errored
    hasBuildStep
  />
);
BuildStepsProgressUploadErrored.storyName =
  'BuildStepsProgress (upload) (errored)';

export const BuildStepsProgressWaitingForBuild = (): React.Node => (
  <BuildStepsProgress
    exportStep={'waiting-for-build'}
    build={null}
    stepMaxProgress={100}
    stepCurrentProgress={20}
    errored={false}
    hasBuildStep
  />
);
BuildStepsProgressWaitingForBuild.storyName =
  'BuildStepsProgress (waiting-for-build)';

export const BuildStepsProgressBuild = (): React.Node => (
  <BuildStepsProgress
    exportStep={'build'}
    build={{
      id: 'fake-build-id',
      gameId: 'game-id',
      userId: 'fake-user-id',
      type: 'electron-build',
      status: 'pending',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }}
    stepMaxProgress={100}
    stepCurrentProgress={20}
    errored={false}
    showSeeAllMyBuildsExplanation
    hasBuildStep
  />
);
BuildStepsProgressBuild.storyName = 'BuildStepsProgress (build)';

export const BuildStepsProgressBuildErrored = (): React.Node => (
  <BuildStepsProgress
    exportStep={'build'}
    build={{
      id: 'fake-build-id',
      gameId: 'game-id',
      userId: 'fake-user-id',
      type: 'cordova-build',
      status: 'error',
      logsKey: '/fake-error.log',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }}
    stepMaxProgress={100}
    stepCurrentProgress={20}
    errored
    hasBuildStep
  />
);
BuildStepsProgressBuildErrored.storyName =
  'BuildStepsProgress (build) (errored)';

export const BuildStepsProgressBuildComplete = (): React.Node => (
  <BuildStepsProgress
    exportStep={'done'}
    build={{
      id: 'fake-build-id',
      gameId: 'game-id',
      userId: 'fake-user-id',
      type: 'cordova-build',
      status: 'complete',
      logsKey: '/fake-error.log',
      apkKey: '/fake-game.apk',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }}
    stepMaxProgress={100}
    stepCurrentProgress={20}
    errored={false}
    hasBuildStep
  />
);
BuildStepsProgressBuildComplete.storyName =
  'BuildStepsProgress (build) (complete)';

export const BuildStepsProgressDoneWithoutBuildStep = (): React.Node => (
  <BuildStepsProgress
    exportStep={'done'}
    build={null}
    stepMaxProgress={100}
    stepCurrentProgress={20}
    errored={false}
    hasBuildStep={false}
  />
);
BuildStepsProgressDoneWithoutBuildStep.storyName =
  'BuildStepsProgress (done) (without build step)';
