// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type ExportFlowProps } from '../../ExportPipeline.flow';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import FlatButton from '../../../UI/FlatButton';
import RaisedButton from '../../../UI/RaisedButton';
import { Column } from '../../../UI/Grid';
import OnlineGameLink from './OnlineGameLink';

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
  const { game, builds, refreshGame } = gameAndBuildsManager;
  const hasGameExistingBuilds =
    game && builds
      ? !!builds.filter(build => build.gameId === game.id).length
      : false;
  const isPublishedOnGdgames = !!game && !!game.publicWebBuildId;
  const [
    automaticallyOpenGameProperties,
    setAutomaticallyOpenGameProperties,
  ] = React.useState(false);

  // Only show the buttons when the export is not started or when it's done.
  const shouldShowButtons =
    uiMode === 'minimal'
      ? exportStep === ''
      : exportStep === '' || exportStep === 'done';

  const exportButtons =
    hasGameExistingBuilds && isPublishedOnGdgames ? (
      <ResponsiveLineStackLayout justifyContent="stretch" noMargin>
        <RaisedButton
          label={<Trans>Update the game page</Trans>}
          primary
          id={`launch-export-and-publish-${exportPipelineName}-web-button`}
          onClick={async () => {
            await launchExport();
            // Set to true after the export is done, so that the game properties
            // are automatically opened only when the build is finished.
            setAutomaticallyOpenGameProperties(true);
          }}
          disabled={disabled}
        />
        <FlatButton
          label={<Trans>Generate a new link</Trans>}
          primary
          id={`launch-export-${exportPipelineName}-web-button`}
          onClick={async () => {
            setAutomaticallyOpenGameProperties(false);
            await launchExport();
          }}
          disabled={disabled}
        />
      </ResponsiveLineStackLayout>
    ) : (
      <RaisedButton
        fullWidth
        label={
          hasGameExistingBuilds ? (
            <Trans>Generate a new link</Trans>
          ) : (
            <Trans>Generate link</Trans>
          )
        }
        primary
        id={`launch-export-${exportPipelineName}-web-button`}
        onClick={async () => {
          setAutomaticallyOpenGameProperties(false);
          await launchExport();
        }}
        disabled={disabled}
      />
    );

  return (
    <Column noMargin>
      {shouldShowButtons ? exportButtons : null}
      <OnlineGameLink
        build={build}
        project={project}
        onSaveProject={onSaveProject}
        isSavingProject={isSavingProject}
        errored={errored}
        exportStep={exportStep}
        automaticallyOpenGameProperties={automaticallyOpenGameProperties}
        onRefreshGame={refreshGame}
        game={game}
      />
    </Column>
  );
};

export default OnlineWebExportFlow;
