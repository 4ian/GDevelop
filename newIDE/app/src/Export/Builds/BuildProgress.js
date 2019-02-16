import { Trans } from '@lingui/macro';
import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { Spacer, Line } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import difference_in_seconds from 'date-fns/difference_in_seconds';
import LinearProgress from 'material-ui/LinearProgress';

const buildTypesConfig = {
  'cordova-build': {
    estimatedTimeInSeconds: () => 180,
    completeDescription:
      'You can download it on your Android phone and install it.',
  },
  'electron-build': {
    estimatedTimeInSeconds: (build: Build) =>
      150 * (build.targets ? build.targets.length : 0),
    completeDescription: '',
  },
};

type Props = {|
  build: Build,
  onDownload: (key: string) => void,
|};

/**
 * Show an estimate of the progress of a build or the button
 * to download the artifacts.
 */
export default ({ build, onDownload }: Props) => {
  const buttons = [
    {
      displayName: 'Download',
      key: 'apkKey',
    },
    {
      displayName: 'Windows (zip)',
      key: 'windowsZipKey',
    },
    {
      displayName: 'Windows (exe)',
      key: 'windowsExeKey',
    },
    {
      displayName: 'macOS (zip)',
      key: 'macosZipKey',
    },
    {
      displayName: 'Linux (AppImage)',
      key: 'linuxAppImageKey',
    },
  ];

  const config = buildTypesConfig[build.type];
  const secondsSinceLastUpdate = Math.abs(
    difference_in_seconds(build.updatedAt, Date.now())
  );
  const estimatedRemainingTime = Math.max(
    config ? config.estimatedTimeInSeconds(build) - secondsSinceLastUpdate : 0,
    0
  );

  return build.status === 'error' ? (
    <React.Fragment>
      <Line alignItems="center">
        <p>
          <Trans>Something wrong happened :(</Trans>
        </p>
        <Spacer />
        <RaisedButton
          label={<Trans>See logs</Trans>}
          onClick={() => onDownload('logsKey')}
        />
      </Line>
      <Line alignItems="center">
        <EmptyMessage>
          <Trans>
            Check the logs to see if there is an explanation about what went
            wrong, or try again later.
          </Trans>
        </EmptyMessage>
      </Line>
    </React.Fragment>
  ) : build.status === 'pending' ? (
    <Line alignItems="center" expand>
      <LinearProgress
        style={{ flex: 1 }}
        max={config.estimatedTimeInSeconds(build)}
        value={config.estimatedTimeInSeconds(build) - estimatedRemainingTime}
        mode={estimatedRemainingTime > 0 ? 'determinate' : 'indeterminate'}
      />
      <Spacer />
      {estimatedRemainingTime > 0 ? (
        <p>
          <Trans>~{Math.round(estimatedRemainingTime / 60)} minutes.</Trans>
        </p>
      ) : (
        <p>
          <Trans>Should finish soon.</Trans>
        </p>
      )}
    </Line>
  ) : build.status === 'complete' ? (
    <React.Fragment>
      <Line expand>
        {buttons
          .filter(button => !!build[button.key])
          .map((button, index) => (
            <React.Fragment key={button.key}>
              {index !== 0 && <Spacer />}
              <RaisedButton
                label={button.displayName}
                primary
                onClick={() => onDownload(button.key)}
              />
            </React.Fragment>
          ))}
        <FlatButton
          label={<Trans>See logs</Trans>}
          onClick={() => onDownload('logsKey')}
        />
      </Line>
      <Line expand>{config && config.completeDescription}</Line>
    </React.Fragment>
  ) : (
    <Line>
      <Trans>Unknown status</Trans>
    </Line>
  );
};
