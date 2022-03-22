// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Container from '@material-ui/core/Container';
import { CircularProgress } from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import { ColumnStackLayout } from './Layout';
import RaisedButton from '../UI/RaisedButton';
import { Column, LargeSpacer } from './Grid';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';

type Props = {|
  title: React.Node,
  description: React.Node,
  actionLabel: React.Node,
  helpPagePath?: string,
  actionButtonId?: string,
  onAdd: () => void,
  isLoading?: boolean,
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
        <Text align="center" noMargin>
          {props.description}
        </Text>
        <LargeSpacer />
        <ColumnStackLayout alignItems="center" noMargin>
          <RaisedButton
            label={props.actionLabel}
            primary
            onClick={props.onAdd}
            disabled={!!props.isLoading}
            icon={props.isLoading ? <CircularProgress size={24} /> : <Add />}
            id={props.actionButtonId}
          />
          <HelpButton
            label={<Trans>Read the doc</Trans>}
            helpPagePath={props.helpPagePath}
          />
        </ColumnStackLayout>
      </Column>
    </Container>
  </Column>
);
