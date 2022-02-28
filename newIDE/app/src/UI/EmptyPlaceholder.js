// @flow
import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { Line, Column } from './Grid';

type Props = {|
  children: React.Node,
  renderButtons: () => React.Node,
  buttonJustification?: string,
  outlined?: boolean,
|};

/**
 * A placeholder for when there is no content to display.
 * Also take a look at EmptyMessage for a less visible message.
 */
export const EmptyPlaceholder = (props: Props) => (
  <Column alignItems="center">
    {props.outlined || props.outlined === undefined ? (
      <Paper
        variant="outlined"
        style={{
          maxWidth: '450px',
          whiteSpace: 'normal',
        }}
      >
        <Column>
          {props.children}
          <Line expand justifyContent={props.buttonJustification || 'flex-end'}>
            {props.renderButtons()}
          </Line>
        </Column>
      </Paper>
    ) : (
      <Column
        style={{
          maxWidth: '450px',
          whiteSpace: 'normal',
        }}
      >
        {props.children}
        <Line expand justifyContent={props.buttonJustification || 'flex-end'}>
          {props.renderButtons()}
        </Line>
      </Column>
    )}
  </Column>
);
