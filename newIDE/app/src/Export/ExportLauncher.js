// @flow

import type { Node } from 'React';
import React, { Component } from 'react';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import RaisedButton from '../UI/RaisedButton';
import { sendExportLaunched } from '../Utils/Analytics/EventSender';
import {
  type Build,
  type BuildArtifactKeyName,
  getBuildArtifactUrl,
} from '../Utils/GDevelopServices/Build';
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
import { GameRegistration } from '../GameDashboard/GameRegistration';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';

type State = {|
  exportStep: BuildStep,
  compressionOutput: any,
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
  state: State = {
    exportStep: '',
    build: null,
    compressionOutput: null,
    stepCurrentProgress: 0,
    stepMaxProgress: 0,
    doneFooterOpen: false,
    errored: false,
    exportState: this.props.exportPipeline.getInitialExportState(
      this.props.project
    ),
  };
  buildsWatcher: BuildsWatcher = new BuildsWatcher();

  componentWillUnmount() {
    this.buildsWatcher.stop();
  }

  _updateStepProgress: (
    stepCurrentProgress: number,
    stepMaxProgress: number
  ) => void = (stepCurrentProgress: number, stepMaxProgress: number) =>
    this.setState({
      stepCurrentProgress,
      stepMaxProgress,
    });

  _startBuildWatch: (userProfile: UserProfile) => void = (
    userProfile: UserProfile
  ) => {
    if (!this.state.build) return;

    this.buildsWatcher.start({
      userProfile,
      builds: [this.state.build],
      onBuildUpdated: (build: Build) => this.setState({ build }),
    });
  };

  launchWholeExport: (userProfile: UserProfile) => void = (
    userProfile: UserProfile
  ) => {
    const t = str => str; //TODO;
    const { project, exportPipeline } = this.props;
    sendExportLaunched(exportPipeline.name);

    if (!displayProjectErrorsBox(t, getErrors(t, project))) return;

    const handleError = (message: string) => (err: Error) => {
      if (!this.state.errored) {
        this.setState({
          errored: true,
        });
        showErrorBox({
          message:
            message +
            (err.message ? `\n\nDetails of the error: ${err.message}` : ''),
          rawError: {
            exportStep: this.state.exportStep,
            rawError: err,
          },
          errorId: 'export-error',
        });
      }

      throw err;
    };

    const exportPipelineContext = {
      project,
      updateStepProgress: this._updateStepProgress,
      exportState: this.state.exportState,
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
      }, handleError(t('Error while downloading the game resources. Check your internet connection and that all resources of the game are valid in the Resources editor.')))
      .then(compressionOutput => {
        const { launchUpload, launchOnlineBuild } = exportPipeline;
        if (!!launchUpload && !!launchOnlineBuild) {
          this.setState({
            exportStep: 'upload',
          });
          return launchUpload(exportPipelineContext, compressionOutput)
            .then((uploadBucketKey: string) => {
              this.setState({
                exportStep: 'waiting-for-build',
              });
              return launchOnlineBuild(
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

              return { compressionOutput };
            }, handleError(t('Error while lauching the build of the game.')));
        }

        return { compressionOutput };
      }, handleError(t('Error while compressing the game.')))
      .then(({ compressionOutput }) => {
        this.setState({
          compressionOutput,
          doneFooterOpen: true,
          exportStep: 'done',
        });
      })
      .catch(error => {
        console.error('An error happened during export:', error);
        /* Error handled previously */
      });
  };

  _downloadBuild: (key: BuildArtifactKeyName) => void = (
    key: BuildArtifactKeyName
  ) => {
    const url = getBuildArtifactUrl(this.state.build, key);
    if (url) Window.openExternalURL(url);
  };

  _closeDoneFooter: () => void = () =>
    this.setState({
      doneFooterOpen: false,
    });

  _updateExportState: (updater: (any) => any) => void = (
    updater: any => any
  ) => {
    this.setState(prevState => ({
      ...prevState,
      exportState: updater(prevState.exportState),
    }));
  };

  render(): null | Node {
    const {
      exportStep,
      compressionOutput,
      build,
      stepMaxProgress,
      stepCurrentProgress,
      errored,
      doneFooterOpen,
      exportState,
    } = this.state;
    const { project, userProfile, exportPipeline } = this.props;
    if (!project) return null;

    const getBuildLimit = (userProfile: UserProfile): ?Limit =>
      userProfile.limits && exportPipeline.onlineBuildType
        ? userProfile.limits[exportPipeline.onlineBuildType]
        : null;
    const canLaunchBuild = (userProfile: UserProfile) => {
      if (!errored && exportStep !== '' && exportStep !== 'done') return false;

      const limit: ?Limit = getBuildLimit(userProfile);
      if (limit && limit.limitReached) return false;

      return exportPipeline.canLaunchBuild(exportState);
    };

    return (
      <Column noMargin>
        {!!exportPipeline.packageNameWarningType &&
          project.getPackageName().indexOf('com.example') !== -1 && (
            <Line>
              <DismissableAlertMessage
                identifier="project-should-have-unique-package-name"
                kind="warning"
              >
                <I18n>
                  {({ i18n }) =>
                    i18n._(
                      exportPipeline.packageNameWarningType === 'mobile'
                        ? t`The package name begins with com.example, make sure you replace it with an unique one to be able to publish your game on app stores.`
                        : t`The package name begins with com.example, make sure you replace it with an unique one, else installing your game might overwrite other games.`
                    )
                  }
                </I18n>
              </DismissableAlertMessage>
            </Line>
          )}
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
            onLogin={userProfile.onLogin}
            onCreateAccount={userProfile.onCreateAccount}
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
            compressionOutput,
            exportState,
            onClose: this._closeDoneFooter,
          })}
        {doneFooterOpen && (
          <Line>
            <GameRegistration project={project} />
          </Line>
        )}
      </Column>
    );
  }
}
