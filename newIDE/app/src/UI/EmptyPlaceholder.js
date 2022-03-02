// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Line, Column } from './Grid';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';
import Add from '@material-ui/icons/Add';
import RaisedButton from '../UI/RaisedButton';
import Container from '@material-ui/core/Container';

type Props = {|
  title: React.Node,
  description: React.Node,
  actionLabel: React.Node,
  helpPagePath: string,
  onAdd: () => void,
|};

/**
 * A placeholder for when there is no content to display.
 * Also take a look at EmptyMessage for a less visible message.
 */
export const EmptyPlaceholder = (props: Props) => (
  <Column alignItems="center">
    <Container
      style={{
        maxWidth: '480px',
        whiteSpace: 'normal',
      }}
    >
      <Column>
        <Text size="title" align="center">
          {props.title}
        </Text>
        <Text align="center">{props.description}</Text>
        <Line justifyContent="center" expand>
          <RaisedButton
            key="add-behavior-line"
            label={props.actionLabel}
            primary
            onClick={props.onAdd}
            icon={<Add />}
            id="add-behavior-button"
          />
        </Line>
        <Line expand justifyContent="center">
          <HelpButton
            label={<Trans>Read the doc</Trans>}
            helpPagePath={props.helpPagePath}
          />
        </Line>
      </Column>
    </Container>
  </Column>
);
