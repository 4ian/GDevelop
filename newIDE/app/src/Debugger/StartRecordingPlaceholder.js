// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Background from '../UI/Background';
import { Line } from '../UI/Grid';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
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
      <EmptyPlaceholder
        title={<Trans>Nothing recorded yet</Trans>}
        description={
          <>
            {description}{' '}
            <Trans>
              This button is also in the toolbar, at the top of the debugger.
            </Trans>
          </>
        }
        multilineDescription
        actionLabel={<Trans>Record</Trans>}
        actionIcon={<RecordIcon />}
        actionDisabled={!canRecord}
        onAction={onStartRecording}
      />
    </Line>
  </Background>
);

export default StartRecordingPlaceholder;
