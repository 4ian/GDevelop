// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type ExportFlowProps } from '../../ExportPipeline.flow';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import FlatButton from '../../../UI/FlatButton';
import RaisedButton from '../../../UI/RaisedButton';
import { Line } from '../../../UI/Grid';
import OnlineGameLink from './OnlineGameLink';

type OnlineWebExportFlowProps = {|
  ...ExportFlowProps,
  exportPipelineName: string,
|};

const OnlineWebExportFlow = ({
  project,
  game,
  builds,
  build,
  onSaveProject,
  isSavingProject,
  errored,
  exportStep,
  disabled,
  launchExport,
  exportPipelineName,
  isExporting,
  onGameUpdated,
}: OnlineWebExportFlowProps) => {
  const hasGameExistingBuilds =
    game && builds
      ? !!builds.filter(build => build.gameId === game.id).length
      : false;
  const isPublishedOnGdgames = !!game && !!game.publicWebBuildId;
  const [
    automaticallyOpenGameProperties,
    setAutomaticallyOpenGameProperties,
  ] = React.useState(false);

  const isExportPending = exportStep !== '' && exportStep !== 'done';

  const Buttons = isExportPending ? null : hasGameExistingBuilds ? (
    isPublishedOnGdgames ? (
      <ResponsiveLineStackLayout justifyContent="center">
        <FlatButton
          label={<Trans>Generate new link</Trans>}
          primary
          id={`launch-export-${exportPipelineName}-web-button`}
          onClick={async () => {
            setAutomaticallyOpenGameProperties(false);
            await launchExport();
          }}
          disabled={disabled}
        />
        <RaisedButton
          label={<Trans>Update my current page</Trans>}
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
      </ResponsiveLineStackLayout>
    ) : (
      <Line justifyContent="center">
        <RaisedButton
          label={<Trans>Generate new link</Trans>}
          primary
          id={`launch-export-${exportPipelineName}-web-button`}
          onClick={async () => {
            setAutomaticallyOpenGameProperties(false);
            await launchExport();
          }}
          disabled={disabled}
        />
      </Line>
    )
  ) : (
    <Line justifyContent="center">
      <RaisedButton
        label={<Trans>Generate link</Trans>}
        primary
        id={`launch-export-${exportPipelineName}-web-button`}
        onClick={async () => {
          setAutomaticallyOpenGameProperties(false);
          await launchExport();
        }}
        disabled={disabled}
      />
    </Line>
  );

  return (
    <ColumnStackLayout noMargin>
      {Buttons}
      <OnlineGameLink
        build={build}
        project={project}
        onSaveProject={onSaveProject}
        isSavingProject={isSavingProject}
        errored={errored}
        exportStep={exportStep}
        automaticallyOpenGameProperties={automaticallyOpenGameProperties}
        onGameUpdated={onGameUpdated}
        game={game}
      />
    </ColumnStackLayout>
  );
};

export default OnlineWebExportFlow;
