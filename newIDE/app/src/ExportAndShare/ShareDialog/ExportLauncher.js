// @flow

import React, { Component } from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t, Trans } from '@lingui/macro';
import { sendExportLaunched } from '../../Utils/Analytics/EventSender';
import { type Build } from '../../Utils/GDevelopServices/Build';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { Column, Line } from '../../UI/Grid';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import CreateProfile from '../../Profile/CreateProfile';
import CurrentUsageDisplayer from '../../Profile/CurrentUsageDisplayer';
import {
  displayProjectErrorsBox,
  getProjectPropertiesErrors,
} from '../../Utils/ProjectErrorsChecker';
import { type Quota } from '../../Utils/GDevelopServices/Usage';
import BuildsWatcher from '../Builds/BuildsWatcher';
import { type BuildStep } from '../Builds/BuildStepsProgress';
import {
  registerGame,
  getGame,
  type Game,
  setGameUserAcls,
  getAclsFromUserIds,
} from '../../Utils/GDevelopServices/Game';
import { type ExportPipeline } from '../ExportPipeline.flow';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import {
  addCreateBadgePreHookIfNotClaimed,
  TRIVIAL_FIRST_WEB_EXPORT,
} from '../../Utils/GDevelopServices/Badge';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';
import { type EventsFunctionsExtensionsState } from '../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import inc from 'semver/functions/inc';
import Toggle from '../../UI/Toggle';
import PlaceholderLoader from '../../UI/PlaceholderLoader';

type State = {|
  exportStep: BuildStep,
  compressionOutput: any,
  build: ?Build,
  stepCurrentProgress: number,
  stepMaxProgress: number,
  errored: boolean,
  shouldBumpVersionNumber: boolean,
  exportState: any,
  doneFooterOpen: boolean,
|};

type Props = {|
  project: gdProject,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  onChangeSubscription: () => void,
  authenticatedUser: AuthenticatedUser,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  exportPipeline: ExportPipeline<any, any, any, any, any>,
  setIsNavigationDisabled: (isNavigationDisabled: boolean) => void,
  onGameUpdated: () => Promise<void>,
  game: ?Game,
  builds: ?Array<Build>,
  onRefreshBuilds: () => Promise<void>,
|};

const getIncrementedVersionNumber = (project: gdProject) => {
  return inc(project.getVersion(), 'patch', { loose: true });
};

const getBuildQuota = (
  authenticatedUser: AuthenticatedUser,
  onlineBuildType: ?string
): ?Quota =>
  authenticatedUser.limits && onlineBuildType
    ? authenticatedUser.limits.quotas[onlineBuildType]
    : null;

/**
 * A generic UI to launch, monitor the progress and get the result
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
    shouldBumpVersionNumber: true,
    exportState: this.props.exportPipeline.getInitialExportState(
      this.props.project
    ),
  };
  _candidateBumpedVersionNumber = '';
  buildsWatcher = new BuildsWatcher();
  launchWholeExport: (i18n: I18nType) => Promise<void>;

  componentWillMount() {
    // Fetch limits when the export launcher is opened, to ensure we display the
    // latest limits.
    this.props.authenticatedUser.onRefreshLimits();
  }

  componentWillUnmount() {
    this.buildsWatcher.stop();
  }

  constructor(props: Props) {
    super(props);
    this._setupAchievementHook();

    this._candidateBumpedVersionNumber = getIncrementedVersionNumber(
      props.project
    );
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
        if (build.status === 'pending') {
          this.setState({ build });
        } else {
          // Give a bit of delay to ensure the limits are updated on the server,
          // then update everything.
          setTimeout(() => {
            this.setState({ build });
            authenticatedUser.onRefreshLimits();
            this.props.onRefreshBuilds();
          }, 3000);
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
      } catch (error) {
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (extractedStatusAndCode && extractedStatusAndCode.code === 404) {
          // If the game is not registered, register it before launching the export.
          const authorName =
            this.props.project.getAuthor() || 'Unspecified publisher';
          const templateSlug = this.props.project.getTemplateSlug();
          const gameName = this.props.project.getName() || 'Untitled game';
          await registerGame(getAuthorizationHeader, userId, {
            gameId,
            authorName,
            gameName,
            templateSlug,
          });
          // We don't await for the authors update, as it is not required for publishing.
          this.tryUpdateAuthors();
          this.props.onGameUpdated();
        }
      }
    }
  };

  _launchWholeExport = async (i18n: I18nType): Promise<void> => {
    const {
      project,
      exportPipeline,
      eventsFunctionsExtensionsState,
      authenticatedUser,
    } = this.props;
    console.log('launching export');
    sendExportLaunched(exportPipeline.name);

    if (
      !displayProjectErrorsBox(i18n, getProjectPropertiesErrors(i18n, project))
    )
      return;

    const getErrorMessage = () => {
      switch (this.state.exportStep) {
        case 'export':
          return i18n._(t`Error while exporting the game.`);
        case 'resources-download':
          return i18n._(
            t`Error while downloading the game resources. Check your internet connection and that all resources of the game are valid in the Resources editor.`
          );
        case 'compress':
          return i18n._(t`Error while compressing the game.`);
        case 'upload':
          return i18n._(
            t`Error while uploading the game. Check your internet connection or try again later.`
          );
        case 'waiting-for-build':
          return i18n._(
            t`Error while building the game. Check the logs of the build for more details.`
          );
        case 'build':
          return i18n._(
            t`Error while building of the game. Check the logs of the build for more details.`
          );
        default:
          return i18n._(
            t`Error while building the game. Try again later. Your internet connection may be slow or one of your resources may be corrupted.`
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
    } catch (registerError) {
      // But if it fails, we don't prevent building the game.
      console.warn('Error while registering the game.');
      const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
        registerError
      );
      if (extractedStatusAndCode && extractedStatusAndCode.status === 403) {
        if (extractedStatusAndCode.code === 'game-creation/existing-game') {
          showErrorBox({
            message: [
              i18n._(
                t`A game with this ID already exists and you are not the owner.`
              ),
              i18n._(
                t`A link or file will be created but the game will not be registered.`
              ),
            ].join('\n\n'),
            rawError: registerError,
            errorId: 'existing-game-register',
          });
        } else if (
          extractedStatusAndCode.code === 'game-creation/too-many-games'
        ) {
          showErrorBox({
            message: [
              i18n._(
                t`You have reached the maximum number of games you can register! You can unregister games in your Games Dashboard.`
              ),
              i18n._(
                t`A link or file will be created but the game will not be registered.`
              ),
            ].join('\n\n'),
            rawError: registerError,
            errorId: 'too-many-games-register',
          });
        }
      }
    }

    try {
      const exportPipelineContext = {
        project,
        updateStepProgress: this._updateStepProgress,
        exportState: this.state.exportState,
      };
      const quota = getBuildQuota(
        authenticatedUser,
        exportPipeline.onlineBuildType
      );

      if (
        exportPipeline.shouldSuggestBumpingVersionNumber &&
        exportPipeline.shouldSuggestBumpingVersionNumber({
          quota,
        }) &&
        this.state.shouldBumpVersionNumber
      ) {
        project.setVersion(this._candidateBumpedVersionNumber);
      }

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
      const { profile } = authenticatedUser;

      const fallbackAuthor = profile
        ? {
            username: profile.username || '',
            id: profile.id,
          }
        : undefined;

      await eventsFunctionsExtensionsState.ensureLoadFinished();

      const exportOutput = await exportPipeline.launchExport(
        exportPipelineContext,
        preparedExporter,
        fallbackAuthor
      );
      setStep('resources-download');
      // TODO: use a GenericRetryableProcessWithProgressDialog to show errors
      // and allow to try again?
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
        this.props.onRefreshBuilds();
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
      isSavingProject,
      builds,
      game,
      onGameUpdated,
    } = this.props;
    if (!project) return null;
    const buildQuota = getBuildQuota(
      authenticatedUser,
      exportPipeline.onlineBuildType
    );

    const getNumberOfBuildsCurrentlyRunning = () => {
      if (!builds) return 0;

      // We check pending builds that are not more than 10 minutes old,
      // to avoid counting builds that may be stuck.
      return builds.filter(
        build =>
          build.status === 'pending' &&
          build.type === exportPipeline.onlineBuildType &&
          build.createdAt &&
          build.createdAt > Date.now() - 10 * 60 * 1000
      ).length;
    };

    const canLaunchBuild = (authenticatedUser: AuthenticatedUser) => {
      if (buildQuota) {
        const buildsCurrentlyRunning = getNumberOfBuildsCurrentlyRunning();
        const buildsRemaining = buildQuota
          ? buildQuota.max - (buildQuota.current + buildsCurrentlyRunning)
          : 0;
        if (!buildsRemaining) return false;
      }

      return exportPipeline.canLaunchBuild(exportState, errored, exportStep);
    };

    if (!builds && authenticatedUser.authenticated) {
      // Still loading
      return <PlaceholderLoader />;
    }

    const isExporting =
      (!!exportStep && exportStep !== 'done') ||
      (!!build && build.status === 'pending');
    const isUsingOnlineBuildNonAuthenticated =
      !!exportPipeline.onlineBuildType && !authenticatedUser.authenticated;

    return (
      <I18n>
        {({ i18n }) => (
          <Column noMargin expand justifyContent="center">
            {!isUsingOnlineBuildNonAuthenticated && (
              <Column noMargin>
                {!!exportPipeline.packageNameWarningType &&
                  project.getPackageName().indexOf('com.example') !== -1 && (
                    <Line>
                      <DismissableAlertMessage
                        identifier="project-should-have-unique-package-name"
                        kind="warning"
                      >
                        {i18n._(
                          exportPipeline.packageNameWarningType === 'mobile'
                            ? t`The package name begins with com.example, make sure you
                    replace it with an unique one to be able to publish your
                    game on app stores.`
                            : t`The package name begins with
                    com.example, make sure you replace it with an unique one,
                    else installing your game might overwrite other games.`
                        )}
                      </DismissableAlertMessage>
                    </Line>
                  )}
                {exportPipeline.renderTutorial &&
                  exportPipeline.renderTutorial()}
              </Column>
            )}
            <Column noMargin expand justifyContent="center">
              {!isUsingOnlineBuildNonAuthenticated && (
                <Line alignItems="center" justifyContent="center">
                  {exportPipeline.renderHeader({
                    project,
                    authenticatedUser,
                    exportState,
                    updateExportState: this._updateExportState,
                    isExporting,
                    exportStep,
                    build,
                    quota: buildQuota,
                  })}
                </Line>
              )}
              {!isUsingOnlineBuildNonAuthenticated &&
                exportPipeline.shouldSuggestBumpingVersionNumber &&
                exportPipeline.shouldSuggestBumpingVersionNumber({
                  quota: buildQuota,
                }) && (
                  <Line noMargin>
                    <Toggle
                      labelPosition="right"
                      toggled={this.state.shouldBumpVersionNumber}
                      label={
                        <Trans>
                          Increase version number to{' '}
                          {this._candidateBumpedVersionNumber}
                        </Trans>
                      }
                      onToggle={(e, toggled) => {
                        this.setState({
                          shouldBumpVersionNumber: toggled,
                        });
                      }}
                      disabled={isExporting}
                    />
                  </Line>
                )}
              {!!exportPipeline.limitedBuilds &&
                authenticatedUser.authenticated && (
                  <Line>
                    <Column noMargin expand>
                      <CurrentUsageDisplayer
                        subscription={authenticatedUser.subscription}
                        quota={buildQuota}
                        onChangeSubscription={this.props.onChangeSubscription}
                        numberOfPendingBuilds={getNumberOfBuildsCurrentlyRunning()}
                      />
                    </Column>
                  </Line>
                )}
              {isUsingOnlineBuildNonAuthenticated && (
                <CreateProfile
                  onOpenLoginDialog={authenticatedUser.onOpenLoginDialog}
                  onOpenCreateAccountDialog={
                    authenticatedUser.onOpenCreateAccountDialog
                  }
                  message={
                    <Trans>
                      Create an account or login first to export your game using
                      online services.
                    </Trans>
                  }
                  justifyContent="center"
                />
              )}
              {!isUsingOnlineBuildNonAuthenticated &&
                exportPipeline.renderExportFlow({
                  project,
                  game,
                  builds,
                  disabled: !canLaunchBuild(authenticatedUser),
                  launchExport: async () => this.launchWholeExport(i18n),
                  build,
                  errored,
                  exportStep,
                  isSavingProject,
                  onSaveProject,
                  isExporting,
                  stepCurrentProgress,
                  stepMaxProgress,
                  onGameUpdated,
                })}
              {doneFooterOpen &&
                exportPipeline.renderDoneFooter &&
                exportPipeline.renderDoneFooter({
                  compressionOutput,
                  exportState,
                  onClose: this._closeDoneFooter,
                })}
            </Column>
          </Column>
        )}
      </I18n>
    );
  }
}
