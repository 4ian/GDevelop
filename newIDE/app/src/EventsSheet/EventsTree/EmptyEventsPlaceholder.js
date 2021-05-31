// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import HelpButton from '../../UI/HelpButton';
import Text from '../../UI/Text';
import Paper from '@material-ui/core/Paper';
import { Line, Column } from '../../UI/Grid';

const EmptyEventsPlaceholder = (): React.Node => (
  <Column alignItems="center">
    <Paper
      variant="outlined"
      style={{
        maxWidth: '450px',
        whiteSpace: 'normal',
      }}
    >
      <Column>
        <Text>
          <Trans>There are no events here.</Trans>
        </Text>
        <Text>
          <Trans>
            Events are composed of conditions (on the left of an event) and
            actions (on the right). When conditions are fulfilled, the actions
            are executed.
          </Trans>
        </Text>
        <Text>
          <Trans>
            Add your first event using the button "Add a new event".
          </Trans>
        </Text>
        <Line expand justifyContent="flex-end">
          <HelpButton helpPagePath="/events" />
        </Line>
      </Column>
    </Paper>
  </Column>
);

export default EmptyEventsPlaceholder;
