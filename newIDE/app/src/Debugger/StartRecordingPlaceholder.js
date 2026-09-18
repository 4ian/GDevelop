// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Background from '../UI/Background';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import RaisedButton from '../UI/RaisedButton';
import RecordIcon from '../UI/CustomSvgIcons/Record';

type Props = {|
  /** What this panel will show once something has been recorded. */
  description: React.Node,
  canRecord: boolean,
  onStartRecording: () => void,
|};

/**
 * What a panel of the debugger shows while nothing has been recorded yet: the
 * very button of the toolbar that starts a recording, so that it does not have
 * to be hunted for.
 */
const StartRecordingPlaceholder = ({
  description,
  canRecord,
  onStartRecording,
}: Props): React.Node => (
  <Background>
    <Line expand justifyContent="center" alignItems="center">
      <Column alignItems="center">
        <Text align="center" color="secondary">
          {description}
        </Text>
        <RaisedButton
          primary
          icon={<RecordIcon />}
          label={<Trans>Record</Trans>}
          disabled={!canRecord}
          onClick={onStartRecording}
        />
        <Text align="center" size="body-small" color="secondary">
          <Trans>
            This button is also in the toolbar, at the top of the debugger.
          </Trans>
        </Text>
      </Column>
    </Line>
  </Background>
);

export default StartRecordingPlaceholder;
