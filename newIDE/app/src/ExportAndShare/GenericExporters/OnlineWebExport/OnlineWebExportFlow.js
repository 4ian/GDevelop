// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type ExportFlowProps } from '../../ExportPipeline.flow';
import { ColumnStackLayout } from '../../../UI/Layout';
import RaisedButton from '../../../UI/RaisedButton';
import { Column, Line } from '../../../UI/Grid';
import OnlineGameLink from './OnlineGameLink';
import Toggle from '../../../UI/Toggle';

type OnlineWebExportFlowProps = {|
  ...ExportFlowProps,
  exportPipelineName: string,
|};

const OnlineWebExportFlow = ({
  project,
  gameAndBuildsManager,
  build,
  onSaveProject,
  isSavingProject,
  errored,
  exportStep,
  disabled,
  launchExport,
  exportPipelineName,
  isExporting,
  uiMode,
}: OnlineWebExportFlowProps) => {
  const {
    game,
    builds,
    refreshGame,
    setGame,
    gameAvailabilityError,
  } = gameAndBuildsManager;
  const isGameOwnedByCurrentUser =
    !gameAvailabilityError || gameAvailabilityError !== 'not-owned';
  const hasGameExistingWebBuilds =
    game && builds
      ? !!builds.filter(
          build => build.gameId === game.id && build.type === 'web-build'
        ).length
      : false;
  const isPublishedOnGdGames = !!game && !!game.publicWebBuildId;

  const [
    automaticallyPublishNewBuild,
    setAutomaticallyPublishNewBuild,
  ] = React.useState(
    isGameOwnedByCurrentUser &&
      (!hasGameExistingWebBuilds || // Never built for web? Let's publish automatically.
        isPublishedOnGdGames) // Already published on GDevelop games? Let's update automatically.
  );

  // Only show the buttons when the export is not started or when it's done.
  const shouldShowButtons =
    uiMode === 'minimal'
      ? exportStep === ''
      : exportStep === '' || exportStep === 'done';

  const exportButtons = (
    <ColumnStackLayout>
      <Line
        justifyContent={uiMode === 'minimal' ? 'stretch' : 'center'}
        noMargin
      >
        <RaisedButton
          label={
            !isGameOwnedByCurrentUser ? (
              <Trans>Generate a link</Trans>
            ) : !hasGameExistingWebBuilds ? (
              <Trans>Publish game</Trans>
            ) : automaticallyPublishNewBuild ? (
              <Trans>Publish new version</Trans>
            ) : (
              <Trans>Generate a new link</Trans>
            )
          }
          primary
          id={`launch-export-${exportPipelineName}-button`}
          onClick={launchExport}
          disabled={disabled}
        />
      </Line>
      {hasGameExistingWebBuilds && (
        <Line justifyContent="center">
          <Toggle
            toggled={automaticallyPublishNewBuild}
            onToggle={(_, newValue) =>
              setAutomaticallyPublishNewBuild(newValue)
            }
            label={<Trans>Update game page</Trans>}
            labelPosition="right"
            disabled={disabled}
          />
        </Line>
      )}
    </ColumnStackLayout>
  );
  return (
    <Column noMargin alignItems={uiMode === 'minimal' ? 'stretch' : 'center'}>
      {shouldShowButtons ? exportButtons : null}
      <OnlineGameLink
        build={build}
        project={project}
        onSaveProject={onSaveProject}
        isSavingProject={isSavingProject}
        errored={errored}
        exportStep={exportStep}
        automaticallyPublishNewBuild={automaticallyPublishNewBuild}
        onRefreshGame={refreshGame}
        onGameUpdated={setGame}
        game={game}
        shouldShowShareDialog={uiMode === 'full'}
      />
    </Column>
  );
};

export default OnlineWebExportFlow;
