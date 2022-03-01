// @flow
import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { Line, Column } from './Grid';

type Props = {|
  children: React.Node,
  renderButtons: () => React.Node,
|};

/**
 * A placeholder for when there is no content to display.
 * Also take a look at EmptyMessage for a less visible message.
 */
export const EmptyPlaceholder = (props: Props) => (
  <Column alignItems="center">
    <Paper
      elevation={0}
      style={{
        maxWidth: '450px',
        whiteSpace: 'normal',
      }}
    >
      <Column>
        {props.children}
        <Line expand justifyContent="center">
          {props.renderButtons()}
        </Line>
      </Column>
    </Paper>
  </Column>
);
