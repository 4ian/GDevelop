import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import { Spacer, Line } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import difference_in_minutes from 'date-fns/difference_in_minutes';

const buildTypesConfig = {
  'cordova-build': {
    estimatedTimeInMinutes: 3,
    completeDescription:
      'You can download it on your Android phone and install it.',
  },
  'electron-build': {
    estimatedTimeInMinutes: 8,
    completeDescription: 'You can download the game for each platform.',
  },
};

type Props = {|
  build: Build,
  onDownload: (key: string) => void,
|};

export default ({ build, onDownload }: Props) => {
  const buttons = [
    {
      displayName: 'Download',
      key: 'apkKey',
    },
    {
      displayName: 'Windows (zip)',
      key: 'windowsZip',
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
  const minutesSinceLastUpdate = Math.abs(difference_in_minutes(
    build.updatedAt,
    Date.now()
  ));
  const estimatedRemainingTime = Math.max(
    config ? config.estimatedTimeInMinutes - minutesSinceLastUpdate : 0,
    0
  );

  return build.status === 'error' ? (
    <React.Fragment>
      <Line alignItems="center">
        <p>Something wrong happened :(</p>
        <Spacer />
        <RaisedButton label="See logs" onClick={() => onDownload('logsKey')} />
      </Line>
      <Line alignItems="center">
        <EmptyMessage>
          Check the logs to see if there is an explanation about what went
          wrong, or try again later.
        </EmptyMessage>
      </Line>
    </React.Fragment>
  ) : build.status === 'pending' ? (
    <Line alignItems="center" expand>
      <CircularProgress size={20} />
      <Spacer />
      {estimatedRemainingTime > 0 ? (
        <p>
          Build in progress... Estimated time is ~{estimatedRemainingTime}{' '}
          minutes.
        </p>
      ) : (
        <p>Build in progress... Should finish soon.</p>
      )}
    </Line>
  ) : build.status === 'complete' ? (
    <React.Fragment>
      <Line expand>
        {buttons.filter(button => !!build[button.key]).map((button, index) => (
          <React.Fragment key={button.key}>
            {index !== 0 && <Spacer />}
            <RaisedButton
              label={button.displayName}
              primary
              onClick={() => onDownload(button.key)}
            />
          </React.Fragment>
        ))}
        <FlatButton label="See logs" onClick={() => onDownload('logsKey')} />
      </Line>
      <Line expand>{config && config.completeDescription}</Line>
    </React.Fragment>
  ) : (
    <Line>Unknown status</Line>
  );
};
