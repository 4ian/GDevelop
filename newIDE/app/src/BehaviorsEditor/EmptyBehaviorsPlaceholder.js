// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';
import Paper from '@material-ui/core/Paper';
import { Line, Column } from '../UI/Grid';

const EmptyBehaviorsPlaceholder = () => (
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
          <Trans>There are no behaviors here.</Trans>
        </Text>
        <Text>
          <Trans>
            Behaviors are predefined actions that are assigned to objects.
            Behaviors can have no or multiple parameters.
          </Trans>
        </Text>
        <Text>
          <Trans>
            Add your first behavior using the button "Add a behavior to the
            object".
          </Trans>
        </Text>
        <Line expand justifyContent="flex-end">
          <HelpButton helpPagePath="/behaviors" />
        </Line>
      </Column>
    </Paper>
  </Column>
);

export default EmptyBehaviorsPlaceholder;
