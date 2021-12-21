// @flow

import React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import RaisedButton from '../../UI/RaisedButton';
import { sendExportLaunched } from '../../Utils/Analytics/EventSender';
import {
  type Build,
  type BuildArtifactKeyName,
  getBuildArtifactUrl,
} from '../../Utils/GDevelopServices/Build';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { Column, Line, Spacer } from '../../UI/Grid';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import Window from '../../Utils/Window';
import CreateProfile from '../../Profile/CreateProfile';
import LimitDisplayer from '../../Profile/LimitDisplayer';
import {
  displayProjectErrorsBox,
  getProjectPropertiesErrors,
} from '../../Utils/ProjectErrorsChecker';
import {
  startWatchingBuilds,
  stopWatchingBuilds,
} from '../Builds/BuildsWatcherNew';
import BuildStepsProgress, {
  type BuildStep,
} from '../Builds/BuildStepsProgress';
import {
  registerGame,
  getGame,
  updateGame,
} from '../../Utils/GDevelopServices/Game';
import { type ExportPipeline } from '../ExportPipeline.flow';
import { GameRegistration } from '../../GameDashboard/GameRegistration';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import {
  ACHIEVEMENT_FEATURE_FLAG,
  addCreateBadgePreHookIfNotClaimed,
  TRIVIAL_FIRST_WEB_EXPORT,
} from '../../Utils/GDevelopServices/Badge';

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
export default function ExportLauncher({
  project,
  onChangeSubscription,
  authenticatedUser,
  exportPipeline,
}: Props) {
  const [exportStep, setExportStep] = React.useState<BuildStep>('');
  const [build, setBuild] = React.useState<?Build>(null);
  const [compressionOutput, setCompressionOutput] = React.useState(null);
  const [stepCurrentProgress, setStepCurrentProgress] = React.useState(0);
  const [stepMaxProgress, setStepMaxProgress] = React.useState(0);
  const [errored, setErrored] = React.useState(false);
  const [exportState, setExportState] = React.useState(
    exportPipeline.getInitialExportState(project)
  );
  const [doneFooterOpen, setDoneFooterOpen] = React.useState(false);
  const [buildWatchers, setBuildWatchers] = React.useState({});

  // Cleanup
  React.useEffect(() => {
    return () => stopWatchingBuilds(setBuildWatchers);
  });

  const buildLimit = React.useMemo(
    () =>
      authenticatedUser.limits && exportPipeline.onlineBuildType
        ? authenticatedUser.limits[exportPipeline.onlineBuildType]
        : null,
    [authenticatedUser, exportPipeline.onlineBuildType]
  );

  const canLaunchBuild = React.useMemo(
    () => {
      const buildPending =
        !errored && exportStep !== '' && exportStep !== 'done';
      const buildFinished = !errored && exportStep === 'done';
      if (buildPending || buildFinished) return false;

      if (buildLimit && buildLimit.limitReached) return false;

      return exportPipeline.canLaunchBuild(exportState);
    },
    [errored, exportStep, exportState, buildLimit, exportPipeline]
  );

  const updateStepProgress = (
    stepCurrentProgress: number,
    stepMaxProgress: number
  ) => {
    setStepCurrentProgress(stepCurrentProgress);
    setStepMaxProgress(stepMaxProgress);
  };

  const startBuildWatch = React.useCallback(
    () => {
      console.log('starting build watch', build);
      // Build is finished or already being watched.
      if (!build || build.status !== 'pending' || buildWatchers[build.id])
        return;
      console.log(build, buildWatchers);

      console.log('properly starting build watch', build);

      startWatchingBuilds(
        authenticatedUser,
        [build],
        build => {
          setBuild(build);
          if (build.status !== 'pending') {
            // Refresh user limits.
            authenticatedUser.onRefreshUserProfile();
          }
        },
        buildWatchers,
        setBuildWatchers
      );
    },
    [authenticatedUser, build, buildWatchers]
  );

  React.useEffect(
    () => {
      if (!build) return;
      startBuildWatch();
    },
    [build, startBuildWatch]
  );

  const registerAndUpdateGame = async () => {
    const profile = authenticatedUser.profile;
    const getAuthorizationHeader = authenticatedUser.getAuthorizationHeader;
    const gameId = project.getProjectUuid();
    const authorName = project.getAuthor() || 'Unspecified author';
    const gameName = project.getName() || 'Untitled game';
    if (profile) {
      const userId = profile.id;
      try {
        await getGame(getAuthorizationHeader, userId, gameId);
        // Update the game details to ensure that it is up to date in GDevelop services.
        await updateGame(getAuthorizationHeader, userId, {
          gameId,
          authorName,
          gameName,
        });
      } catch (err) {
        if (err.response.status === 404) {
          // If the game is not registered, register it before launching the export.
          await registerGame(getAuthorizationHeader, userId, {
            gameId,
            authorName,
            gameName,
          });
        }
      }
    }
  };

  const _launchWholeExport = async () => {
    const t = str => str; //TODO;
    sendExportLaunched(exportPipeline.name);

    if (!displayProjectErrorsBox(t, getProjectPropertiesErrors(t, project)))
      return;

    const getErrorMessage = () => {
      switch (exportStep) {
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
          return t(
            'Error while building the game. Try again later. Your internet connection may be slow or one of your resources may be corrupted.'
          );
      }
    };

    const handleError = (err: Error) => {
      if (!errored) {
        setErrored(true);
        showErrorBox({
          message:
            getErrorMessage() +
            (err.message ? `\n\nDetails of the error: ${err.message}` : ''),
          rawError: {
            exportStep: exportStep,
            rawError: err,
          },
          errorId: 'export-error',
        });
      }
    };

    try {
      // We do not await for this call, allowing to start building the game in parallel.
      registerAndUpdateGame();
    } catch {
      // Best effort call, we don't prevent building the game.
      console.warn('Error while registering the game - ignoring it.');
    }

    try {
      const exportPipelineContext = {
        project,
        updateStepProgress,
        exportState: exportState,
      };
      setExportStep('export');
      setStepCurrentProgress(0);
      setStepMaxProgress(0);
      setErrored(false);
      setBuild(null);
      const preparedExporter = await exportPipeline.prepareExporter(
        exportPipelineContext
      );
      const exportOutput = await exportPipeline.launchExport(
        exportPipelineContext,
        preparedExporter
      );
      setExportStep('resources-download');
      const resourcesDownloadOutput = await exportPipeline.launchResourcesDownload(
        exportPipelineContext,
        exportOutput
      );
      setExportStep('compress');
      const compressionOutput = await exportPipeline.launchCompression(
        exportPipelineContext,
        resourcesDownloadOutput
      );
      const { launchUpload, launchOnlineBuild } = exportPipeline;
      if (!!launchUpload && !!launchOnlineBuild) {
        setExportStep('upload');
        const uploadBucketKey = await launchUpload(
          exportPipelineContext,
          compressionOutput
        );
        setExportStep('waiting-for-build');
        const build = await launchOnlineBuild(
          exportState,
          authenticatedUser,
          uploadBucketKey
        );
        setExportStep('build');
        setBuild(build);
      }
      setExportStep('done');
      setDoneFooterOpen(true);
      setCompressionOutput(compressionOutput);
    } catch (error) {
      console.error('An error happened during export:', error);
      handleError(error);
    }
  };

  const launchWholeExport =
    ACHIEVEMENT_FEATURE_FLAG && exportPipeline.name.includes('web')
      ? addCreateBadgePreHookIfNotClaimed(
          authenticatedUser,
          TRIVIAL_FIRST_WEB_EXPORT,
          _launchWholeExport
        )
      : _launchWholeExport;

  const downloadBuild = (key: BuildArtifactKeyName) => {
    const url = getBuildArtifactUrl(build, key);
    if (url) Window.openExternalURL(url);
  };

  const updateExportState = (updater: any => any) => {
    setExportState(updater(exportState));
  };

  if (!project) return null;

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
          updateExportState,
        })}
      </Line>
      {(!exportPipeline.onlineBuildType || authenticatedUser.authenticated) && (
        <Line justifyContent="center">
          <RaisedButton
            label={exportPipeline.renderLaunchButtonLabel()}
            primary
            onClick={launchWholeExport}
            disabled={!canLaunchBuild}
          />
        </Line>
      )}
      <Spacer />
      {!!exportPipeline.onlineBuildType && !authenticatedUser.authenticated && (
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
          exportPipeline.renderCustomStepsProgress(
            build,
            !!exportStep && exportStep !== 'done'
          )
        ) : (
          <Line expand>
            <BuildStepsProgress
              exportStep={exportStep}
              hasBuildStep={!!exportPipeline.onlineBuildType}
              build={build}
              onDownload={downloadBuild}
              stepMaxProgress={stepMaxProgress}
              stepCurrentProgress={stepCurrentProgress}
              errored={errored}
            />
          </Line>
        ))}
      {!!exportPipeline.limitedBuilds && authenticatedUser.authenticated && (
        <LimitDisplayer
          subscription={authenticatedUser.subscription}
          limit={buildLimit}
          onChangeSubscription={onChangeSubscription}
        />
      )}
      {doneFooterOpen &&
        exportPipeline.renderDoneFooter &&
        exportPipeline.renderDoneFooter({
          compressionOutput,
          exportState,
          onClose: () => setDoneFooterOpen(false),
        })}
      {doneFooterOpen && (
        <Line justifyContent="center">
          <GameRegistration project={project} hideIfSubscribed hideLoader />
        </Line>
      )}
    </Column>
  );
}
