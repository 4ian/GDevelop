// @flow

import React, { Component } from 'react';
import RaisedButton from '../UI/RaisedButton';
import { sendExportLaunched } from '../Utils/Analytics/EventSender';
import { type Build, getBuildUrl } from '../Utils/GDevelopServices/Build';
import { type UserProfile } from '../Profile/UserProfileContext';
import { Column, Line } from '../UI/Grid';
import { showErrorBox } from '../UI/Messages/MessageBox';
import Window from '../Utils/Window';
import CreateProfile from '../Profile/CreateProfile';
import LimitDisplayer from '../Profile/LimitDisplayer';
import {
  displayProjectErrorsBox,
  getErrors,
} from '../ProjectManager/ProjectErrorsChecker';
import { type Limit } from '../Utils/GDevelopServices/Usage';
import BuildsWatcher from './Builds/BuildsWatcher';
import BuildStepsProgress, {
  type BuildStep,
} from './Builds/BuildStepsProgress';
import { type ExportPipeline } from './ExportPipeline.flow';

type State = {|
  exportStep: BuildStep,
  build: ?Build,
  stepCurrentProgress: number,
  stepMaxProgress: number,
  errored: boolean,
  exportState: any,
  doneFooterOpen: boolean,
|};

type Props = {|
  project: gdProject,
  onChangeSubscription: () => void,
  userProfile: UserProfile,
  exportPipeline: ExportPipeline<any, any, any, any, any>,
|};

/**
 * A generic UI to launch, monitor the progres and get the result
 * of an export.
 */
export default class ExportLauncher extends Component<Props, State> {
  state = {
    exportStep: '',
    build: null,
    stepCurrentProgress: 0,
    stepMaxProgress: 0,
    doneFooterOpen: false,
    errored: false,
    exportState: this.props.exportPipeline.getInitialExportState(),
  };
  buildsWatcher = new BuildsWatcher();

  componentWillUnmount() {
    this.buildsWatcher.stop();
  }

  _updateStepProgress = (
    stepCurrentProgress: number,
    stepMaxProgress: number
  ) =>
    this.setState({
      stepCurrentProgress,
      stepMaxProgress,
    });

  _startBuildWatch = (userProfile: UserProfile) => {
    if (!this.state.build) return;

    this.buildsWatcher.start({
      userProfile,
      builds: [this.state.build],
      onBuildUpdated: (build: Build) => this.setState({ build }),
    });
  };

  launchWholeExport = (userProfile: UserProfile) => {
    const t = str => str; //TODO;
    const { project, exportPipeline } = this.props;
    sendExportLaunched(exportPipeline.name);

    if (!displayProjectErrorsBox(t, getErrors(t, project))) return;

    const handleError = (message: string) => (err: Error) => {
      if (!this.state.errored) {
        this.setState({
          errored: true,
        });
        showErrorBox(message + (err.message ? `\n${err.message}` : ''), {
          exportStep: this.state.exportStep,
          rawError: err,
        });
      }

      throw err;
    };

    const exportPipelineContext = {
      project,
      updateStepProgress: this._updateStepProgress,
    };

    this.setState({
      exportStep: 'export',
      stepCurrentProgress: 0,
      stepMaxProgress: 0,
      errored: false,
      build: null,
    });
    exportPipeline
      .prepareExporter(exportPipelineContext)
      .then(preparedExporter => {
        return exportPipeline.launchExport(
          exportPipelineContext,
          preparedExporter
        );
      }, handleError(t('Error while preparing the exporter.')))
      .then(exportOutput => {
        this.setState({
          exportStep: 'resources-download',
        });
        return exportPipeline.launchResourcesDownload(
          exportPipelineContext,
          exportOutput
        );
      }, handleError(t('Error while exporting the game.')))
      .then(resourcesDownloadOutput => {
        this.setState({
          exportStep: 'compress',
        });
        return exportPipeline.launchCompression(
          exportPipelineContext,
          resourcesDownloadOutput
        );
      }, handleError(t('Error while exporting the game.')))
      .then(compressionOutput => {
        if (!!exportPipeline.onlineBuildType) {
          this.setState({
            exportStep: 'upload',
          });
          return exportPipeline
            .launchUpload(exportPipelineContext, compressionOutput)
            .then((uploadBucketKey: string) => {
              this.setState({
                exportStep: 'waiting-for-build',
              });
              return exportPipeline.launchOnlineBuild(
                this.state.exportState,
                userProfile,
                uploadBucketKey
              );
            }, handleError(t('Error while uploading the game. Check your internet connection or try again later.')))
            .then(build => {
              this.setState(
                {
                  build,
                  exportStep: 'build',
                },
                () => {
                  this._startBuildWatch(userProfile);
                }
              );
            }, handleError(t('Error while lauching the build of the game.')));
        }
      }, handleError(t('Error while compressing the game.')))
      .then(() => {
        this.setState({
          doneFooterOpen: true,
          exportStep: 'done',
        });
      })
      .catch(() => {
        /* Error handled previously */
      });
  };

  _downloadBuild = (key: string) => {
    if (!this.state.build || !this.state.build[key]) return;

    Window.openExternalURL(getBuildUrl(this.state.build[key]));
  };

  _closeDoneFooter = () =>
    this.setState({
      doneFooterOpen: false,
    });

  _updateExportState = (updater: any => any) => {
    this.setState(prevState => ({
      ...prevState,
      exportState: updater(prevState.exportState),
    }));
  };

  render() {
    const {
      exportStep,
      build,
      stepMaxProgress,
      stepCurrentProgress,
      errored,
      doneFooterOpen,
      exportState,
    } = this.state;
    const t = str => str; //TODO;
    const { project, userProfile, exportPipeline } = this.props;
    if (!project) return null;

    const getBuildLimit = (userProfile: UserProfile): ?Limit =>
      userProfile.limits && exportPipeline.onlineBuildType
        ? userProfile.limits[exportPipeline.onlineBuildType]
        : null;
    const canLaunchBuild = (userProfile: UserProfile) => {
      if (!errored && exportStep !== '' && exportStep !== 'build') return false;

      const limit: ?Limit = getBuildLimit(userProfile);
      if (limit && limit.limitReached) return false;

      return true;
    };

    return (
      <Column noMargin>
        <Line>
          {exportPipeline.renderHeader({
            project,
            exportState,
            updateExportState: this._updateExportState,
          })}
        </Line>
        {(!exportPipeline.onlineBuildType || userProfile.authenticated) && (
          <Line justifyContent="center">
            <RaisedButton
              label={exportPipeline.renderLaunchButtonLabel()}
              primary
              onClick={() => this.launchWholeExport(userProfile)}
              disabled={!canLaunchBuild(userProfile)}
            />
          </Line>
        )}
        {!!exportPipeline.onlineBuildType && userProfile.authenticated && (
          <LimitDisplayer
            subscription={userProfile.subscription}
            limit={getBuildLimit(userProfile)}
            onChangeSubscription={this.props.onChangeSubscription}
          />
        )}
        {!!exportPipeline.onlineBuildType && !userProfile.authenticated && (
          <CreateProfile
            message={t(
              // TODO
              'Create an account to build your game for Android in one-click:'
            )}
            onLogin={userProfile.onLogin}
          />
        )}
        <Line expand>
          <BuildStepsProgress
            exportStep={exportStep}
            hasBuildStep={!!exportPipeline.onlineBuildType}
            build={build}
            onDownload={this._downloadBuild}
            stepMaxProgress={stepMaxProgress}
            stepCurrentProgress={stepCurrentProgress}
            errored={errored}
          />
        </Line>
        {doneFooterOpen &&
          exportPipeline.renderDoneFooter &&
          exportPipeline.renderDoneFooter({
            exportState,
            onClose: this._closeDoneFooter,
          })}
      </Column>
    );
  }
}
