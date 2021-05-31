// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import * as React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import FlatButton from '../../UI/FlatButton';
import { Spacer, Line } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import LinearProgress from '@material-ui/core/LinearProgress';
import Text from '../../UI/Text';
import {
  type Build,
  type BuildArtifactKeyName,
} from '../../Utils/GDevelopServices/Build';

const buildTypesConfig = {
  'cordova-build': {
    estimatedTimeInSeconds: (build: Build) => 300,
    completeDescription:
      'You can download it on your Android phone and install it.',
  },
  'electron-build': {
    estimatedTimeInSeconds: (build: Build) =>
      90 + 130 * (build.targets ? build.targets.length : 0),
    completeDescription: '',
  },
  'web-build': {
    estimatedTimeInSeconds: (build: Build) => 5,
    completeDescription: '',
  },
};

const buttons = [
  {
    displayName: t`Download`,
    key: 'apkKey',
  },
  {
    displayName: t`Windows (zip)`,
    key: 'windowsZipKey',
  },
  {
    displayName: t`Windows (exe)`,
    key: 'windowsExeKey',
  },
  {
    displayName: t`macOS (zip)`,
    key: 'macosZipKey',
  },
  {
    displayName: t`Linux (AppImage)`,
    key: 'linuxAppImageKey',
  },
  {
    displayName: t`Open`,
    key: 's3Key',
  },
];

type Props = {|
  build: Build,
  onDownload: (key: BuildArtifactKeyName) => void,
|};

/**
 * Show an estimate of the progress of a build or the button
 * to download the artifacts.
 */
export default ({ build, onDownload }: Props): React.Node => {
  const config = buildTypesConfig[build.type];
  const secondsSinceLastUpdate = Math.abs(
    differenceInSeconds(build.updatedAt, Date.now())
  );
  const estimatedRemainingTime = Math.max(
    config ? config.estimatedTimeInSeconds(build) - secondsSinceLastUpdate : 0,
    0
  );

  return (
    <I18n>
      {({ i18n }) =>
        build.status === 'error' ? (
          <React.Fragment>
            <Line alignItems="center">
              <Text>
                <Trans>Something wrong happened :(</Trans>
              </Text>
              <Spacer />
              <RaisedButton
                label={<Trans>See logs</Trans>}
                onClick={() => onDownload('logsKey')}
              />
            </Line>
            <Line alignItems="center">
              <EmptyMessage>
                <Trans>
                  Check the logs to see if there is an explanation about what
                  went wrong, or try again later.
                </Trans>
              </EmptyMessage>
            </Line>
          </React.Fragment>
        ) : build.status === 'pending' ? (
          <Line alignItems="center" expand>
            <LinearProgress
              style={{ flex: 1 }}
              value={
                config.estimatedTimeInSeconds(build) > 0
                  ? ((config.estimatedTimeInSeconds(build) -
                      estimatedRemainingTime) /
                      config.estimatedTimeInSeconds(build)) *
                    100
                  : 0
              }
              variant={
                estimatedRemainingTime > 0 ? 'determinate' : 'indeterminate'
              }
            />
            <Spacer />
            {estimatedRemainingTime > 0 ? (
              <Text>
                <Trans>
                  ~{Math.round(estimatedRemainingTime / 60)} minutes.
                </Trans>
              </Text>
            ) : (
              <Text>
                <Trans>Should finish soon.</Trans>
              </Text>
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
                      label={i18n._(button.displayName)}
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
            <Line expand>
              {config && <Text>{config.completeDescription}</Text>}
            </Line>
          </React.Fragment>
        ) : (
          <Line>
            <Trans>Unknown status</Trans>
          </Line>
        )
      }
    </I18n>
  );
};
