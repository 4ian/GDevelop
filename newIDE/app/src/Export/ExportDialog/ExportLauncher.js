// @flow

import React, { Component } from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import RaisedButton from '../../UI/RaisedButton';
import { sendExportLaunched } from '../../Utils/Analytics/EventSender';
import { type Build } from '../../Utils/GDevelopServices/Build';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { Column, Line, Spacer } from '../../UI/Grid';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import CreateProfile from '../../Profile/CreateProfile';
import CurrentUsageDisplayer from '../../Profile/CurrentUsageDisplayer';
import {
  displayProjectErrorsBox,
  getProjectPropertiesErrors,
} from '../../Utils/ProjectErrorsChecker';
import { type CurrentUsage } from '../../Utils/GDevelopServices/Usage';
import BuildsWatcher from '../Builds/BuildsWatcher';
import BuildStepsProgress, {
  type BuildStep,
} from '../Builds/BuildStepsProgress';
import {
  registerGame,
  getGame,
  type Game,
  setGameUserAcls,
  getAclsFromUserIds,
} from '../../Utils/GDevelopServices/Game';
import { type ExportPipeline } from '../ExportPipeline.flow';
import { GameRegistration } from '../../GameDashboard/GameRegistration';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import {
  addCreateBadgePreHookIfNotClaimed,
  TRIVIAL_FIRST_WEB_EXPORT,
} from '../../Utils/GDevelopServices/Badge';

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
  onSaveProject: () => Promise<void>,
  onChangeSubscription: () => void,
  authenticatedUser: AuthenticatedUser,
  exportPipeline: ExportPipeline<any, any, any, any, any>,
  setIsNavigationDisabled: (isNavigationDisabled: boolean) => void,
  onGameUpdated: (game: Game) => void,
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
  launchWholeExport: () => Promise<void>;

  componentWillUnmount() {
    this.buildsWatcher.stop();
  }

  constructor(props: Props) {
    super(props);
    this._setupAchievementHook();
  }
  componentDidUpdate(prevProps: Props, prevState: State) {
    this._setupAchievementHook();
    if (
      prevState.exportStep !== this.state.exportStep ||
      prevState.errored !== this.state.errored
    ) {
      this.props.setIsNavigationDisabled(
        this.props.exportPipeline.isNavigationDisabled(
          this.state.exportStep,
          this.state.errored
        )
      );
    }
  }

  _setupAchievementHook = () => {
    if (this.props.exportPipeline.name.includes('web')) {
      this.launchWholeExport = addCreateBadgePreHookIfNotClaimed(
        this.props.authenticatedUser,
        TRIVIAL_FIRST_WEB_EXPORT,
        this._launchWholeExport
      );
    } else {
      this.launchWholeExport = this._launchWholeExport;
    }
  };

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
      onBuildUpdated: (build: Build) => {
        this.setState({ build });
        if (build.status !== 'pending') {
          authenticatedUser.onRefreshUserProfile();
        }
      },
    });
  };

  tryUpdateAuthors = async () => {
    const profile = this.props.authenticatedUser.profile;
    if (profile) {
      const authorAcls = getAclsFromUserIds(
        this.props.project.getAuthorIds().toJSArray()
      );

      try {
        await setGameUserAcls(
          this.props.authenticatedUser.getAuthorizationHeader,
          profile.id,
          this.props.project.getProjectUuid(),
          { author: authorAcls }
        );
      } catch (e) {
        // Best effort call, do not prevent exporting the game.
        console.error(e);
      }
    }
  };

  registerGameIfNot = async () => {
    const profile = this.props.authenticatedUser.profile;
    const getAuthorizationHeader = this.props.authenticatedUser
      .getAuthorizationHeader;
    const gameId = this.props.project.getProjectUuid();
    if (profile) {
      const userId = profile.id;
      try {
        // Try to fetch the game to see if it's registered but do not do anything with it.
        await getGame(getAuthorizationHeader, userId, gameId);
      } catch (err) {
        if (err.response.status === 404) {
          // If the game is not registered, register it before launching the export.
          const authorName =
            this.props.project.getAuthor() || 'Unspecified publisher';
          const templateSlug = this.props.project.getTemplateSlug();
          const gameName = this.props.project.getName() || 'Untitled game';
          const game = await registerGame(getAuthorizationHeader, userId, {
            gameId,
            authorName,
            gameName,
            templateSlug,
          });
          // We don't await for the authors update, as it is not required for publishing.
          this.tryUpdateAuthors();
          this.props.onGameUpdated(game);
        }
      }
    }
  };

  _launchWholeExport = async () => {
    const t = str => str; //TODO;
    const { project, exportPipeline, authenticatedUser } = this.props;
    sendExportLaunched(exportPipeline.name);

    if (!displayProjectErrorsBox(t, getProjectPropertiesErrors(t, project)))
      return;

    const getErrorMessage = () => {
      switch (this.state.exportStep) {
        case 'export':
          return t('Error while exporting the game.');
        case 'resources-download':
          return t(
            'Error while downloading the game resources. Check your internet connection and that all resources of the game are valid in the Resources editor.'
          );
        case 'compress':
          return t('Error while compressing the game.');
        case 'upload':
          return t(
            'Error while uploading the game. Check your internet connection or try again later.'
          );
        case 'waiting-for-build':
          return t(
            'Error while building the game. Check the logs of the build for more details.'
          );
        case 'build':
          return t(
            'Error while building of the game. Check the logs of the build for more details.'
          );
        default:
          return t(
            'Error while building the game. Try again later. Your internet connection may be slow or one of your resources may be corrupted.'
          );
      }
    };

    const handleError = (err: Error) => {
      if (!this.state.errored) {
        this.setState({
          errored: true,
        });
        showErrorBox({
          message:
            getErrorMessage() + (err.message ? `\n\n${err.message}` : ''),
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
      setStep('register');
      // We await for this call, allowing to link the build to the game just registered.
      await this.registerGameIfNot();
    } catch {
      // But if it fails, we don't prevent building the game.
      console.warn('Error while registering the game - ignoring it.');
    }

    try {
      const exportPipelineContext = {
        project,
        updateStepProgress: this._updateStepProgress,
        exportState: this.state.exportState,
      };
      setStep('export');
      this.setState({
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
          uploadBucketKey,
          project.getProjectUuid(),
          {
            gameName: project.getName(),
            gameVersion: project.getVersion(),
          }
        );
        setStep('build');
        this.setState({ build }, () => {
          this._startBuildWatch(authenticatedUser);
        });
      }
      setStep('done');
      this.setState({
        compressionOutput,
        doneFooterOpen: true,
      });
    } catch (error) {
      console.error('An error happened during export:', error);
      handleError(error);
    }
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
    const {
      project,
      authenticatedUser,
      exportPipeline,
      onSaveProject,
    } = this.props;
    if (!project) return null;
    const getBuildCurrentUsage = (
      authenticatedUser: AuthenticatedUser
    ): ?CurrentUsage =>
      authenticatedUser.limits && exportPipeline.onlineBuildType
        ? authenticatedUser.limits.limits[exportPipeline.onlineBuildType]
        : null;

    const canLaunchBuild = (authenticatedUser: AuthenticatedUser) => {
      const currentUsage: ?CurrentUsage = getBuildCurrentUsage(
        authenticatedUser
      );
      if (currentUsage && currentUsage.limitReached) return false;

      return exportPipeline.canLaunchBuild(exportState, errored, exportStep);
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
        <Spacer />
        {!!exportPipeline.onlineBuildType &&
          !authenticatedUser.authenticated && (
            <CreateProfile
              onLogin={authenticatedUser.onLogin}
              onCreateAccount={authenticatedUser.onCreateAccount}
              message={
                <Trans>
                  Create an account or login first to publish your game.
                </Trans>
              }
              justifyContent="center"
            />
          )}
        {authenticatedUser.authenticated &&
          (exportPipeline.renderCustomStepsProgress ? (
            exportPipeline.renderCustomStepsProgress({
              build,
              project,
              onSaveProject,
              errored,
              exportStep,
            })
          ) : (
            <Line expand>
              <BuildStepsProgress
                exportStep={exportStep}
                hasBuildStep={!!exportPipeline.onlineBuildType}
                build={build}
                stepMaxProgress={stepMaxProgress}
                stepCurrentProgress={stepCurrentProgress}
                errored={errored}
              />
            </Line>
          ))}
        {!!exportPipeline.limitedBuilds && authenticatedUser.authenticated && (
          <CurrentUsageDisplayer
            subscription={authenticatedUser.subscription}
            currentUsage={getBuildCurrentUsage(authenticatedUser)}
            onChangeSubscription={this.props.onChangeSubscription}
          />
        )}
        {doneFooterOpen &&
          exportPipeline.renderDoneFooter &&
          exportPipeline.renderDoneFooter({
            compressionOutput,
            exportState,
            onClose: this._closeDoneFooter,
          })}
        {doneFooterOpen && (
          <Line justifyContent="center">
            <GameRegistration project={project} hideIfSubscribed hideLoader />
          </Line>
        )}
      </Column>
    );
  }
}
