// @flow

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
import { type AuthenticatedUser } from '../Profile/AuthenticatedUserContext';
import { Column, Line } from '../UI/Grid';
import { showErrorBox } from '../UI/Messages/MessageBox';
import Window from '../Utils/Window';
import CreateProfile from '../Profile/CreateProfile';
import LimitDisplayer from '../Profile/LimitDisplayer';
import {
  displayProjectErrorsBox,
  getProjectPropertiesErrors,
} from '../Utils/ProjectErrorsChecker';
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
  authenticatedUser: AuthenticatedUser,
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
    compressionOutput: null,
    stepCurrentProgress: 0,
    stepMaxProgress: 0,
    doneFooterOpen: false,
    errored: false,
    exportState: this.props.exportPipeline.getInitialExportState(
      this.props.project
    ),
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

  _startBuildWatch = (authenticatedUser: AuthenticatedUser) => {
    if (!this.state.build) return;

    this.buildsWatcher.start({
      authenticatedUser,
      builds: [this.state.build],
      onBuildUpdated: (build: Build) => this.setState({ build }),
    });
  };

  launchWholeExport = async () => {
    const t = str => str; //TODO;
    const { project, exportPipeline, authenticatedUser } = this.props;
    sendExportLaunched(exportPipeline.name);

    if (!displayProjectErrorsBox(t, getProjectPropertiesErrors(t, project)))
      return;

    const getErrorMessage = () => {
      switch (this.state.exportStep) {
        case 'export':
          return t('Error while preparing the exporter.');
        case 'resources-download':
          return t('Error while exporting the game.');
        case 'compress':
          return t(
            'Error while downloading the game resources. Check your internet connection and that all resources of the game are valid in the Resources editor.'
          );
        case 'upload':
          return t('Error while compressing the game.');
        case 'waiting-for-build':
          return t(
            'Error while uploading the game. Check your internet connection or try again later.'
          );
        case 'build':
          return t('Error while lauching the build of the game.');
        default:
          return t('Error while building the game.');
      }
    };

    const handleError = (err: Error) => {
      if (!this.state.errored) {
        this.setState({
          errored: true,
        });
        showErrorBox({
          message:
            getErrorMessage() +
            (err.message ? `\n\nDetails of the error: ${err.message}` : ''),
          rawError: {
            exportStep: this.state.exportStep,
            rawError: err,
          },
          errorId: 'export-error',
        });
      }
    };

    const setStep = (step: BuildStep) => this.setState({ exportStep: step });

    try {
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
      const preparedExporter = await exportPipeline.prepareExporter(
        exportPipelineContext
      );
      const exportOutput = await exportPipeline.launchExport(
        exportPipelineContext,
        preparedExporter
      );
      setStep('resources-download');
      const resourcesDownloadOutput = await exportPipeline.launchResourcesDownload(
        exportPipelineContext,
        exportOutput
      );
      setStep('compress');
      const compressionOutput = await exportPipeline.launchCompression(
        exportPipelineContext,
        resourcesDownloadOutput
      );
      const { launchUpload, launchOnlineBuild } = exportPipeline;
      if (!!launchUpload && !!launchOnlineBuild) {
        setStep('upload');
        const uploadBucketKey = await launchUpload(
          exportPipelineContext,
          compressionOutput
        );
        setStep('waiting-for-build');
        const build = await launchOnlineBuild(
          this.state.exportState,
          authenticatedUser,
          uploadBucketKey
        );
        this.setState(
          {
            build,
            exportStep: 'build',
          },
          () => {
            this._startBuildWatch(authenticatedUser);
          }
        );
      }
      this.setState({
        compressionOutput,
        doneFooterOpen: true,
        exportStep: 'done',
      });
    } catch (error) {
      console.error('An error happened during export:', error);
      handleError(error);
    }
  };

  _downloadBuild = (key: BuildArtifactKeyName) => {
    const url = getBuildArtifactUrl(this.state.build, key);
    if (url) Window.openExternalURL(url);
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
      compressionOutput,
      build,
      stepMaxProgress,
      stepCurrentProgress,
      errored,
      doneFooterOpen,
      exportState,
    } = this.state;
    const { project, authenticatedUser, exportPipeline } = this.props;
    if (!project) return null;

    const getBuildLimit = (authenticatedUser: AuthenticatedUser): ?Limit =>
      authenticatedUser.limits && exportPipeline.onlineBuildType
        ? authenticatedUser.limits[exportPipeline.onlineBuildType]
        : null;
    const canLaunchBuild = (authenticatedUser: AuthenticatedUser) => {
      if (!errored && exportStep !== '' && exportStep !== 'done') return false;

      const limit: ?Limit = getBuildLimit(authenticatedUser);
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
        {(!exportPipeline.onlineBuildType ||
          authenticatedUser.authenticated) && (
          <Line justifyContent="center">
            <RaisedButton
              label={exportPipeline.renderLaunchButtonLabel()}
              primary
              onClick={this.launchWholeExport}
              disabled={!canLaunchBuild(authenticatedUser)}
            />
          </Line>
        )}
        {!!exportPipeline.onlineBuildType &&
          authenticatedUser.authenticated && (
            <LimitDisplayer
              subscription={authenticatedUser.subscription}
              limit={getBuildLimit(authenticatedUser)}
              onChangeSubscription={this.props.onChangeSubscription}
            />
          )}
        {!!exportPipeline.onlineBuildType &&
          !authenticatedUser.authenticated && (
            <CreateProfile
              onLogin={authenticatedUser.onLogin}
              onCreateAccount={authenticatedUser.onCreateAccount}
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
